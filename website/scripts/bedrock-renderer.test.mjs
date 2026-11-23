import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {rotationMatrix, pivotMatrix, blockMatrix, transformPoint, multiply, inverseAffine, boxFaces, compileGeometry} from './bedrock-geometry.mjs';
import {renderGeometry, rasterize, fullBlock} from './bedrock-renderer.mjs';
import {parseJsonc, evaluateExpression, resolveVisual, loadResourcePacks, readJson, decodeTexture, digest} from './bedrock-pack.mjs';
import {generateMissingRenders, validImage, stableRenderKey, parseArguments} from './generate-bedrock-renders.mjs';
import {projectSourcePath} from './wiki-source-paths.mjs';

const close = (actual, expected) => actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) < 1e-8, `${actual} != ${expected}`));
const uv = {uv: [0, 0], uv_size: [4, 4]};
const allUV = Object.fromEntries(['up', 'down', 'north', 'south', 'east', 'west'].map(name => [name, uv]));
const cube = (overrides = {}) => ({origin: [-2, 0, -2], size: [4, 4, 4], uv: allUV, ...overrides});
const geometry = bones => ({description: {identifier: 'geometry.test', texture_width: 4, texture_height: 4}, bones});
const solidTexture = (color = [160, 90, 40, 255], method = 'opaque') => ({pixels: Buffer.from(Array(16).fill(color).flat()), width: 4, height: 4, method, digest: color.join(',')});
const input = (model, texture = solidTexture()) => ({geometry: model, materials: {'*': {texture: 'test'}}, textureFor: async () => texture});
const countAlpha = pixels => [...pixels].filter((v, i) => i % 4 === 3 && v).length;
const quiet = () => {};

test('Euler rotations apply X, then Y, then Z and preserve model-space pivots', () => {
  close(transformPoint(rotationMatrix([90, 90, 0]), [0, 1, 0]), [-1, 0, 0]);
  close(transformPoint(pivotMatrix([0, 0, 90], [2, 3, 0]), [3, 3, 0]), [2, 2, 0]);
  const matrix = multiply(blockMatrix({translation: [.5, 1, -.25], rotation: [0, 90, 0], scale: [2, 3, 4]}), pivotMatrix([30, 20, 10], [1, 2, 3]));
  close(transformPoint(inverseAffine(matrix), transformPoint(matrix, [1.25, 3.5, -4.25])), [1.25, 3.5, -4.25]);
});

test('block component uses block-center pivots and block units', () => {
  close(transformPoint(blockMatrix({rotation: [0, 0, 90]}), [1, 8, 0]), [0, 7, 0]);
  close(transformPoint(blockMatrix({scale: [2, 2, 2], translation: [1, 0, 0]}), [1, 9, 0]), [18, 10, 0]);
  close(transformPoint(blockMatrix({rotation: [0, 0, 90], rotation_pivot: [1, 0, 0]}), [17, 8, 0]), [16, 7, 0]);
});

test('cube + child bone + parent bone transforms inherit in order', async () => {
  const model = geometry([
    {name: 'child', parent: 'parent', pivot: [0, 0, 0], rotation: [90, 0, 0], cubes: [cube({pivot: [0, 0, 0], rotation: [0, 90, 0]})]},
    {name: 'parent', pivot: [0, 0, 0], rotation: [0, 0, 90]},
  ]);
  const {volumes, stats} = await compileGeometry(input(model));
  close(transformPoint(volumes[0].matrix, [1, 0, 0]), [-1, 0, 0]);
  assert.equal(stats.cubes, 1);
  assert.ok(countAlpha((await renderGeometry(input(model))).pixels) > 0);
});

test('missing parents, cycles, duplicate bones and unsupported meshes report errors', async () => {
  for (const bones of [[{name:'a', parent:'missing'}], [{name:'a', parent:'b'}, {name:'b', parent:'a'}],
    [{name:'a'}, {name:'a'}], [{name:'a', poly_mesh:{}}]]) await assert.rejects(compileGeometry(input(geometry(bones))));
});

test('visibility expressions hide descendants even when their parent is declared last', async () => {
  const model = geometry([{name:'child', parent:'parent', cubes:[cube()]}, {name:'parent'}]);
  const result = await compileGeometry({...input(model), visibility:{parent:"q.block_state('test:visible') == 1"},
    evaluate: v => evaluateExpression(v, {'test:visible':0})});
  assert.equal(result.faces.length, 0);
});

test('zero-thickness planes on every axis survive, including fractional rotated elements', async () => {
  for (const size of [[0, 4, 4], [4, 0, 4], [4, 4, 0]]) {
    const model = geometry([{name:'plane', rotation:[15, 25, 35], cubes:[cube({origin:[.25, 1.5, -.75], size})]}]);
    const result = await renderGeometry(input(model));
    assert.equal(result.stats.planes, 1);
    assert.equal(result.stats.faces, 1);
    assert.ok(countAlpha(result.pixels) > 0);
  }
});

test('a one-sided UV plane is visible from its reverse side with alpha_test', async () => {
  const model=geometry([{name:'crop',cubes:[cube({size:[4,4,0],uv:{north:uv}})]}]);
  const result=await renderGeometry(input(model,solidTexture([100,200,50,255],'alpha_test')));
  assert.equal(result.stats.faces,1);assert.ok(countAlpha(result.pixels));
  await assert.rejects(renderGeometry(input(model,solidTexture([100,200,50,255],'alpha_test_single_sided'))),/no visible/i);
});

test('mirrored box UVs swap side faces and negative scales transform normals', async () => {
  const model=geometry([{name:'box',mirror:true,cubes:[cube({uv:[0,0]})]}]);
  model.description.texture_width=model.description.texture_height=16;
  const compiled=await compileGeometry({...input(model),transformation:{scale:[-1,1,1]}});
  const face=compiled.faces.find(f=>f.name==='west');
  assert.ok(face.normal[0]>.99);assert.ok(face.uv.uv_size[0]<0);
  assert.ok(countAlpha((await renderGeometry({...input(model),transformation:{scale:[-1,1,1]}})).pixels));
});

test('inflation changes geometry extents without changing box-UV atlas regions', async () => {
  const model=geometry([{name:'box',inflate:1,cubes:[cube({uv:[0,0]})]}]);
  const {volumes,faces}=await compileGeometry(input(model));
  assert.deepEqual(volumes[0].size,[6,6,6]);
  assert.deepEqual(faces.find(f=>f.name==='south').uv.uv_size,[4,4]);
  assert.deepEqual(faces.find(f=>f.name==='south').uv.uv,[12,4]);
});

test('per-face, negative, default, box and rotated UVs are retained', () => {
  const faces = boxFaces(cube({uv:{south:{uv:[4, 4], uv_size:[-4, -4], uv_rotation:90}, north:{uv:[0,0]}}}));
  assert.deepEqual(faces.find(f=>f.name==='south').uv, {uv:[4,4], uv_size:[-4,-4], uv_rotation:90});
  assert.deepEqual(faces.find(f=>f.name==='north').uv.uv_size, [4,4]);
  const box = boxFaces(cube({uv:[2,3], size:[4,5,6]}));
  assert.equal(box.length, 6);
  assert.deepEqual(box.find(f=>f.name==='north').uv.uv, [8,9]);
  assert.throws(()=>boxFaces(cube({uv:{south:{...uv,uv_rotation:45}}})), /90/);
});

function screenFace(texture, {depth = 0, uvRect = uv, origin = [0, 0, 0], u = [4, 0, 0], v = [0, -4, 0]} = {}) {
  return {name:'south', origin: origin.map((value, i)=>value + depth), u, v, uv:uvRect,
    texture, shade:1, normal:[0,0,1], u0:0, u1:1, v0:0, v1:1};
}
const flatOptions = {size:32, camera:{direction:[0,0,1]}, shadows:false};
const centerPixel = pixels => [...pixels.subarray((16*32+16)*4, (16*32+16)*4+4)];

test('UV sampling uses nearest pixels, clockwise rotation and negative UV sizes', () => {
  const texture = solidTexture();
  for (let y=0; y<4; y++) for(let x=0; x<4; x++) texture.pixels.set([x*50+10,y*50+10,0,255],(y*4+x)*4);
  const render = uvRect => rasterize([screenFace(texture,{uvRect})],geometry([]),{},[],flatOptions);
  const normal=render(uv), rotated=render({...uv,uv_rotation:90}), flipped=render({uv:[4,4],uv_size:[-4,-4]});
  assert.notDeepEqual(normal,rotated); assert.notDeepEqual(normal,flipped);
  // A counter-clockwise turn followed by three clockwise turns is identical.
  assert.deepEqual(render({...uv,uv_rotation:-90}),render({...uv,uv_rotation:270}));
  const colors = new Set();
  for(let i=0;i<normal.length;i+=4) if(normal[i+3]) colors.add(normal[i]+','+normal[i+1]);
  assert.equal(colors.size,16);
});

test('atlas resolutions 16, 32 and 64 sample equivalent normalized UV coordinates', async () => {
  let baseline;
  for (const resolution of [16,32,64]) {
    const model = geometry([{name:'box', cubes:[cube()]}]);
    model.description.texture_width = model.description.texture_height = resolution;
    model.bones[0].cubes[0].uv = Object.fromEntries(Object.keys(allUV).map(k=>[k,{uv:[0,0],uv_size:[resolution,resolution]}]));
    const texture = {...solidTexture(), pixels:Buffer.from(Array(resolution**2).fill([160,90,40,255]).flat()),width:resolution,height:resolution};
    const result=await renderGeometry(input(model,texture));
    if(baseline) assert.deepEqual(result.pixels,baseline); baseline=result.pixels;
  }
});

test('per-pixel depth composes intersecting transparent faces independent of submission order', () => {
  const a=screenFace(solidTexture([220,0,0,128],'blend'), {origin:[-2,2,0],u:[4,0,4]}),
    b=screenFace(solidTexture([0,0,220,128],'blend'), {origin:[-2,2,4],u:[4,0,-4]});
  const first=rasterize([a,b],geometry([]),{},[],flatOptions), reversed=rasterize([b,a],geometry([]),{},[],flatOptions);
  assert.deepEqual(first,reversed);
  const alpha=[...first].filter((v,i)=>i%4===3&&v);
  assert.ok(alpha.length); assert.ok(alpha.every(a=>a===192));
  const at=(x,y)=>[...first.subarray((y*32+x)*4,(y*32+x)*4+3)];
  assert.ok(at(15,16)[2]>at(15,16)[0]); assert.ok(at(16,16)[0]>at(16,16)[2]);
});

test('opaque and alpha_test honor material alpha rules', () => {
  const render=(alpha,method)=>rasterize([screenFace(solidTexture([100,100,100,alpha],method))],geometry([]),{},[],flatOptions);
  assert.equal(centerPixel(render(0,'opaque'))[3],255);
  assert.equal(centerPixel(render(127,'alpha_test'))[3],0);
  assert.equal(centerPixel(render(128,'alpha_test'))[3],255);
  assert.equal(centerPixel(render(128,'blend'))[3],128);
});

test('internal opaque surfaces are hidden while open models do not occlude other parts', async () => {
  const model=geometry([{name:'parts',cubes:[cube({size:[8,8,8],origin:[-4,0,-4]}),cube({size:[2,2,2],origin:[-1,2,-1]})]}]);
  const union=await renderGeometry(input(model));
  model.bones[0].cubes.pop();
  assert.deepEqual(union.pixels,(await renderGeometry(input(model))).pixels);
  const model2=geometry([{name:'a',cubes:[cube({rotation:[20,30,40]}),cube({origin:[1,1,1],rotation:[-20,0,0]})]}]);
  const compiled=await compileGeometry(input(model2));
  assert.ok(compiled.volumes[0].blocks([10,10,10],[-1,-1,-1]));
  assert.ok(countAlpha((await renderGeometry(input(model2))).pixels));
});

test('automatic framing contains large rotated geometry and supports configurable output size', async () => {
  const model=geometry([{name:'huge',rotation:[40,35,20],cubes:[cube({origin:[-30,-30,-30],size:[60,70,80]})]}]);
  const result=await renderGeometry(input(model),{size:256});
  assert.equal(result.pixels.length,256*256*4);
  for(let x=0;x<256;x++) assert.equal(result.pixels[x*4+3],0);
  assert.ok(countAlpha(result.pixels)>10000);
  await assert.rejects(renderGeometry(input(model),{size:0}),/size/i);
  const partial=await renderGeometry(input(model),{lighting:{direction:[.2,1,.3]}});
  assert.ok(partial.pixels.some((v,i)=>i%4!==3&&v>0));
});

test('JSONC strings survive comments/trailing commas and Molang rejects arbitrary code', () => {
  assert.deepEqual(parseJsonc('\uFEFF{"a":"https://x/a,}",/*hello*/ "b":[1,2,],}'),{a:'https://x/a,}',b:[1,2]});
  assert.equal(evaluateExpression("q.block_state('x') == 2 && !(3 < 2) || false",{x:2}),true);
  assert.equal(evaluateExpression('1 + 2 * 3 == 7',{}),true);
  assert.throws(()=>evaluateExpression('process.exit()',{}),/Unsupported/);
  assert.throws(()=>evaluateExpression("q.block_state('missing')",{}),/Unknown/);
});

test('TGA decoding handles BGRA, bottom origin, RLE and tint', async () => {
  const header=Buffer.alloc(18);header[2]=2;header.writeUInt16LE(2,12);header.writeUInt16LE(2,14);header[16]=32;header[17]=8;
  const texture=await decodeTexture(Buffer.concat([header,Buffer.from([0,0,255,255,0,255,0,128,255,0,0,255,255,255,255,0])]));
  assert.deepEqual([...texture.pixels.subarray(0,4)],[0,0,255,255]);
  assert.deepEqual([...texture.pixels.subarray(8,12)],[255,0,0,255]);
  header[2]=10;header[17]=40;
  const rle=await decodeTexture(Buffer.concat([header,Buffer.from([131,40,80,160,128])]),'#808080');
  assert.deepEqual([...rle.pixels.subarray(0,4)],[80,40,20,128]);
  await assert.rejects(decodeTexture(Buffer.concat([header,Buffer.from([132,40,80,160,128])])),/packet/);
});

async function fixture(t) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'bedrock-render-test-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true,maxRetries:5,retryDelay:100}));
  const source=path.join(root,'project'), output=path.join(root,'assets'), manifest=path.join(root,'manifest.json');
  const write=async(relative,value)=>{const file=path.join(source,relative);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(value));};
  await write('RP/textures/terrain_texture.json',{texture_data:{test:{textures:'textures/test'}}});
  await sharp({create:{width:4,height:4,channels:4,background:'#a05020'}}).png().toFile(path.join(source,'RP/textures/test.png'));
  await write('RP/models/blocks/test.geo.json',{'minecraft:geometry':[geometry([{name:'box',cubes:[cube()]}])]});
  const block={'minecraft:block':{description:{identifier:'test:box'},components:{'minecraft:geometry':'geometry.test','minecraft:material_instances':{'*':{texture:'test',render_method:'opaque'}}}}};
  await write('BP/blocks/test.json',block);
  await fs.writeFile(manifest,JSON.stringify({content:{blocks:[{id:'box',identifier:'test:box',source:'BP/blocks/test.json'}]}}));
  return {root,source,output,manifest,write,blockDefinition:block};
}

test('generation, fast reuse, visual hash refresh, corruption recovery and settings invalidation', async t => {
  const f=await fixture(t), options={...f,log:quiet};
  let report=await generateMissingRenders(options);
  assert.equal(report.counts.generated,1);
  const relative=report.results[0].path;
  assert.equal((await readJson(f.manifest)).content.blocks[0].render,relative);
  const mtime=(await fs.stat(path.join(f.output,relative))).mtimeMs;
  report=await generateMissingRenders(options); assert.equal(report.counts.reused,1);
  assert.equal((await fs.stat(path.join(f.output,relative))).mtimeMs,mtime);
  report=await generateMissingRenders({...options,refresh:true}); assert.equal(report.counts.reused,1);
  await sharp({create:{width:4,height:4,channels:4,background:'#20a050'}}).png().toFile(path.join(f.source,'RP/textures/test.png'));
  report=await generateMissingRenders({...options,refresh:true}); assert.equal(report.counts.generated,1);
  assert.notEqual(report.results[0].path,relative);
  await fs.writeFile(path.join(f.output,report.results[0].path),'invalid PNG');
  report=await generateMissingRenders(options); assert.equal(report.counts.generated,1);
  report=await generateMissingRenders({...options,size:64}); assert.equal(report.counts.generated,1);
  assert.ok(await validImage(path.join(f.output,report.results[0].path),64));
  report=await generateMissingRenders({...options,size:64,lighting:{intensity:{east:1,south:1,up:1},contrast:1,shadowStrength:0}});
  assert.equal(report.counts.generated,1);
});

test('manual renders survive --force and preview produces a separate artifact', async t => {
  const f=await fixture(t);
  await fs.mkdir(path.join(f.source,'Assets/Renders'),{recursive:true});
  const manual=path.join(f.source,'Assets/Renders/box.png');
  await sharp({create:{width:16,height:16,channels:4,background:'#ff0000'}}).png().toFile(manual);
  const bytes=await fs.readFile(manual);
  const a=await generateMissingRenders({...f,log:quiet,force:true}); assert.equal(a.counts.ignored,1);
  const copied=path.join(f.output,a.results[0].path), copiedTime=(await fs.stat(copied)).mtimeMs;
  const b=await generateMissingRenders({...f,log:quiet,force:true,preview:true,block:'test:box'}); assert.equal(b.counts.generated,1);
  assert.deepEqual(await fs.readFile(manual),bytes); assert.deepEqual(await fs.readFile(copied),bytes);
  assert.equal((await fs.stat(copied)).mtimeMs,copiedTime);
  assert.equal((await readJson(f.manifest)).content.blocks[0].render,a.results[0].path);
});

test('one unsupported geometry does not stop other blocks, and failures are reported', async t => {
  const f=await fixture(t);
  const broken=structuredClone(f.blockDefinition);broken['minecraft:block'].description.identifier='test:bad';
  broken['minecraft:block'].components['minecraft:geometry']='geometry.missing';
  await f.write('BP/blocks/bad.json',broken);
  const report=await generateMissingRenders({...f,manifest:undefined,log:quiet});
  assert.equal(report.counts.generated,1);assert.equal(report.counts.error,1);
  assert.match(report.results.find(r=>r.status==='error').message,/geometry.missing/);
  assert.equal((await readJson(path.join(f.output,'auto-renders/report.json'))).counts.error,1);
});

test('geometry, UV, material and orientation changes invalidate the visual hash on refresh', async t => {
  const f=await fixture(t), hashes=new Set();
  const run=async options=>{const r=await generateMissingRenders({...f,log:quiet,refresh:true,...options});assert.equal(r.counts.error,0);hashes.add(r.results[0].path);};
  await run();
  const model=geometry([{name:'box',rotation:[10,20,30],cubes:[cube()]}]);
  await f.write('RP/models/blocks/test.geo.json',{'minecraft:geometry':[model]});await run();
  model.bones[0].cubes[0].uv={...allUV,south:{...uv,uv_rotation:90}};
  await f.write('RP/models/blocks/test.geo.json',{'minecraft:geometry':[model]});await run();
  f.blockDefinition['minecraft:block'].components['minecraft:material_instances']['*'].render_method='blend';
  await f.write('BP/blocks/test.json',f.blockDefinition);await run();
  f.blockDefinition['minecraft:block'].components['minecraft:transformation']={rotation:[0,90,0]};
  await f.write('BP/blocks/test.json',f.blockDefinition);await run();
  assert.equal(hashes.size,5);
});

test('legacy RP blocks.json declares cubes explicitly; missing custom geometries still fail', () => {
  const block={description:{identifier:'test:legacy'},components:{}};
  const visual=resolveVisual(block,{}, {legacy:{textures:'test'}});
  assert.equal(visual.descriptor.identifier,'minecraft:geometry.full_block');
  assert.equal(visual.materials['*'].texture,'test');
  assert.throws(()=>resolveVisual(block),/No declared geometry/);
  block.components['minecraft:geometry']='geometry.missing';
  assert.equal(resolveVisual(block,{}, {legacy:{textures:'test'}}).descriptor.identifier,'geometry.missing');
});

test('dependency and configured vanilla resource packs resolve real atlas textures and named face materials', async t => {
  const f=await fixture(t), dependency=path.join(f.root,'dependency');
  await fs.mkdir(dependency,{recursive:true});await fs.rename(path.join(f.source,'RP'),path.join(dependency,'RP'));
  for(const config of [{dependencies:[dependency]},{vanilla:path.join(dependency,'RP')}]) {
    const packs=await loadResourcePacks({source:f.source,...config});
    assert.ok(packs.geometries.has('geometry.test'));
    const result=await renderGeometry({geometry:packs.geometries.get('geometry.test'),materials:{'*':'shared',shared:{texture:'test'}},textureFor:packs.textureFor});
    assert.ok(countAlpha(result.pixels));
  }
  await fs.mkdir(path.join(f.source,'RP/textures'),{recursive:true});
  await sharp({create:{width:4,height:4,channels:4,background:'#ff0000'}}).png().toFile(path.join(f.source,'RP/textures/test.png'));
  const overriding=await loadResourcePacks({source:f.source,dependencies:[dependency]});
  assert.deepEqual([...(await overriding.textureFor({texture:'test'})).pixels.subarray(0,4)],[255,0,0,255]);
  const model=geometry([{name:'box',cubes:[cube({uv:{south:{...uv,material_instance:'accent'}}})]}]);
  let seen;
  await compileGeometry({geometry:model,materials:{'*':{texture:'base'},accent:{texture:'accent'}},textureFor:async m=>{seen=m.texture;return solidTexture();}});
  assert.equal(seen,'accent');
});

test('item_visual, permutation orientation and explicit variant states resolve deterministically', () => {
  const block={description:{traits:{'minecraft:placement_direction':{enabled_states:['minecraft:cardinal_direction']}}},components:{'minecraft:geometry':'base',
    'minecraft:item_visual':{geometry:{identifier:'item',bone_visibility:{a:false}},material_instances:{'*':{texture:'item'}}}},
    permutations:[{condition:"q.block_state('minecraft:cardinal_direction') == 'north'",components:{'minecraft:transformation':{rotation:[0,180,0]}}}]};
  const result=resolveVisual(block);assert.equal(result.descriptor.identifier,'item');assert.deepEqual(result.transformation.rotation,[0,180,0]);
  assert.equal(resolveVisual(block,{}, {itemVisual:false}).descriptor.identifier,'base');
  assert.equal(resolveVisual(block,{'minecraft:cardinal_direction':'east'}).transformation,undefined);
  assert.notEqual(stableRenderKey('a:b_c'),stableRenderKey('a_b:c'));
  assert.throws(()=>parseArguments(['--size','1']),/Size/);
});

test('mapper exports automatic render associations without changing React components', async t => {
  const f=await fixture(t);
  const run=spawnSync('python',['scripts/map_project_wiki.py',f.source,'--id','utilitycraft','--no-register','--output',f.manifest,'--assets-dir',f.output],{cwd:path.resolve(import.meta.dirname,'..'),encoding:'utf8'});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
  const manifest=await readJson(f.manifest), record=manifest.content.blocks.find(b=>b.identifier==='test:box');
  assert.match(record.render,/^auto-renders\//);assert.ok(await validImage(path.join(f.output,record.render),128));
});

test('mapper preserves a valid site-owned manual render when its addon source differs', async t => {
  const f=await fixture(t);
  await fs.mkdir(path.join(f.source,'Assets/Renders'),{recursive:true});await fs.mkdir(path.join(f.output,'renders'),{recursive:true});
  await sharp({create:{width:16,height:16,channels:4,background:'#ff0000'}}).png().toFile(path.join(f.source,'Assets/Renders/box.png'));
  const target=path.join(f.output,'renders/box.png');
  await sharp({create:{width:16,height:16,channels:4,background:'#0000ff'}}).png().toFile(target);
  const original=await fs.readFile(target);
  const run=spawnSync('python',['scripts/map_project_wiki.py',f.source,'--id','utilitycraft','--no-register','--output',f.manifest,'--assets-dir',f.output],{cwd:path.resolve(import.meta.dirname,'..'),encoding:'utf8'});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
  assert.deepEqual(await fs.readFile(target),original);
  assert.equal((await readJson(f.manifest)).content.blocks[0].render,'renders/box.png');
});

let utilitycraft=process.env.UTILITYCRAFT_RENDER_TEST_PATH ?? projectSourcePath('UtilityCraft');
try { await fs.access(path.join(utilitycraft,'BP/blocks/utility_blocks/workbench.json')); }
catch (error) {
  if (process.env.UTILITYCRAFT_RENDER_TEST_PATH) throw error;
  utilitycraft=path.join(import.meta.dirname,'fixtures/utilitycraft-workbench');
}
test('recorded Workbench fixture preserves the exact upstream block, geometry and texture bytes', async () => {
  const fixture=path.join(import.meta.dirname,'fixtures/utilitycraft-workbench');
  const provenance=await readJson(path.join(fixture,'source.json'));
  for(const record of provenance.files) assert.equal(digest(await fs.readFile(path.join(fixture,record.path))),record.sha256);
});
test('real UtilityCraft Workbench: complete 64x64 atlas, 18 cubes, 2 planes and all four orientations', async () => {
  const file=path.join(utilitycraft,'BP/blocks/utility_blocks/workbench.json');
  const block=(await readJson(file))['minecraft:block'];
  const packs=await loadResourcePacks({source:utilitycraft}), model=packs.geometries.get('geometry.utilitycraft_workbench');
  assert.equal(model.description.texture_width,64);assert.equal(model.description.texture_height,64);
  const atlas=await packs.textureFor(resolveVisual(block).materials['*']);
  assert.equal(atlas.width,64);assert.equal(atlas.height,64);
  const hashes=new Set();
  for(const [direction,rotation] of [['north',180],['south',0],['east',90],['west',-90]]) {
    const visual=resolveVisual(block,{'minecraft:facing_direction':direction});assert.equal(visual.transformation.rotation[1],rotation);
    const result=await renderGeometry({geometry:model,transformation:visual.transformation,materials:visual.materials,textureFor:packs.textureFor});
    assert.equal(result.stats.cubes,18);assert.equal(result.stats.planes,2);assert.ok(countAlpha(result.pixels)>1000);
    assert.equal(result.pixels[3],0); hashes.add(result.pixels.toString('base64'));
    if(direction==='north') {
      const withoutPlanes=structuredClone(model);
      for(const bone of withoutPlanes.bones) if(bone.cubes) bone.cubes=bone.cubes.filter(c=>!c.size.includes(0));
      const reduced=await renderGeometry({geometry:withoutPlanes,transformation:visual.transformation,materials:visual.materials,textureFor:packs.textureFor});
      assert.notDeepEqual(result.pixels,reduced.pixels,'Workbench planes must contribute visible pixels');
    }
  }
  assert.equal(hashes.size,4);
});
