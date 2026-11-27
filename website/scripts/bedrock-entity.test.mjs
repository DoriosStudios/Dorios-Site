import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import {loadEntityPacks,resolveEntityVisual,renderEntity,entityExpression,entityVisualHash,headBones} from './bedrock-entity.mjs';
import {generateEntityRenders,parseEntityArguments} from './generate-bedrock-entity-renders.mjs';
import {readJson,validImage} from './bedrock-pack.mjs';

const model = (identifier='geometry.test',head='head') => ({description:{identifier,texture_width:32,texture_height:32},bones:[
  {name:'root',pivot:[0,0,0]},
  {name:'body',parent:'root',cubes:[{origin:[-4,8,-2],size:[8,12,4],uv:[0,0]}]},
  {name:head,parent:'root',pivot:[0,20,0],cubes:[{origin:[-4,20,-4],size:[8,8,8],uv:[0,0]}]},
  {name:'nose',parent:head,cubes:[{origin:[-1,22,-6],size:[2,2,2],uv:[0,0]}]},
  {name:'legs',parent:'root',cubes:[{origin:[-3,0,-2],size:[6,8,4],uv:[0,0]}]},
]});
const controller = {geometry:'Geometry.default',textures:['Texture.default'],materials:[{'*':'Material.default'}]};
const client = identifier => ({'minecraft:client_entity':{description:{identifier,geometry:{default:'geometry.test'},textures:{default:'textures/entity/test'},materials:{default:'entity_alphatest'},render_controllers:['controller.render.test']}}});
const alphaBounds = (pixels,size=128) => {
  const points=[]; for(let i=3;i<pixels.length;i+=4) if(pixels[i]) points.push([(i-3)/4%size,Math.floor((i-3)/4/size)]);
  assert.ok(points.length>0,'visible pixels');
  const bounds=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
  assert.ok(bounds[0]>=1&&bounds[1]>=1&&bounds[2]<size-1&&bounds[3]<size-1,'transparent frame'); return bounds;
};
async function fixture(t) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'entity-render-test-'));
  t.after(()=>fs.rm(root,{recursive:true,force:true,maxRetries:5,retryDelay:100}));
  const source=path.join(root,'project'), output=path.join(root,'assets'), vanilla=path.join(root,'vanilla'), dependency=path.join(root,'dependency');
  const write=async(relative,value,base=source)=>{const file=path.join(base,relative);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(value));};
  const texture=async(relative,color,base=source)=>{const file=path.join(base,relative);await fs.mkdir(path.dirname(file),{recursive:true});await sharp({create:{width:32,height:32,channels:4,background:color}}).png().toFile(file);};
  await write('BP/entities/test.json',{'minecraft:entity':{description:{identifier:'test:creature'},components:{'minecraft:variant':{value:0}}}});
  await write('RP/entity/test.json',client('test:creature'));
  await write('RP/models/entity/test.geo.json',{'minecraft:geometry':[model()]});
  await write('RP/render_controllers/test.json',{render_controllers:{'controller.render.test':controller}});
  await texture('RP/textures/entity/test.png',{r:190,g:90,b:50,alpha:1});
  const load=options=>loadEntityPacks({source,...options});
  const resolve=async(override={},options={})=>resolveEntityVisual({identifier:'test:creature',behavior:{components:{'minecraft:variant':{value:0}}},packs:await load(options),override});
  return {root,source,output,vanilla,dependency,write,texture,load,resolve};
}

test('full body, portrait and real frontal head geometry produce distinct, visible, framed PNG pixels',async t=>{
  const f=await fixture(t), visual=await f.resolve();
  const outputs=[];
  for(const format of ['fullBody','portrait','face']) { const result=await renderEntity(visual,{format}); const bounds=alphaBounds(result.pixels);assert.ok(bounds[2]-bounds[0]>40);outputs.push(result.pixels); }
  assert.notDeepEqual(outputs[0],outputs[1]); assert.notDeepEqual(outputs[1],outputs[2]);
  assert.equal((await renderEntity(visual,{format:'face'})).stats[0].cubes,2,'head plus child nose, excludes body/legs');
});

test('rotated cube, rotated parent, mirror, inflation, fractional geometry and optional visibility share block compiler',async t=>{
  const f=await fixture(t), geometry=model();
  geometry.bones[0].rotation=[0,20,12];
  geometry.bones[2].rotation=[10,-15,0];
  Object.assign(geometry.bones[1].cubes[0],{rotation:[0,0,18],pivot:[0,14,0],mirror:true,inflate:.125});
  await f.write('RP/models/entity/test.geo.json',{'minecraft:geometry':[geometry]});
  const visual=await f.resolve({visibility:{nose:false}}), rendered=await renderEntity(visual);
  alphaBounds(rendered.pixels);assert.equal(rendered.stats[0].cubes,3);
});

test('non-head names require explicit configuration and preserve selected descendants and ancestor transforms',async t=>{
  const f=await fixture(t);
  await f.write('RP/models/entity/test.geo.json',{'minecraft:geometry':[model('geometry.test','sensor')]});
  const visual=await f.resolve();
  await assert.rejects(renderEntity(visual,{format:'face'}),/headBones/);
  const face=await renderEntity(visual,{format:'face',head:['sensor']});alphaBounds(face.pixels);assert.equal(face.stats[0].cubes,2);
  assert.throws(()=>headBones(model(),['missing']),/Invalid headBones/);
});

test('full identifiers match client definitions from explicit dependency and vanilla geometry keeps addon texture',async t=>{
  const f=await fixture(t);
  await fs.rm(path.join(f.source,'RP/entity/test.json'));
  await fs.rm(path.join(f.source,'RP/models/entity/test.geo.json'));
  await f.write('RP/entity/test.json',client('test:creature'),f.dependency);
  await f.write('models/entity/test.geo.json',{'minecraft:geometry':[model()]},f.vanilla);
  await f.texture('textures/entity/test.png',{r:0,g:0,b:255,alpha:1},f.vanilla);
  const visual=await f.resolve({}, {dependencies:[f.dependency],vanilla:f.vanilla});
  assert.ok(visual.layers[0].materials.entity_head.decoded.file.startsWith(f.source));
  alphaBounds((await renderEntity(visual)).pixels);
  await assert.rejects(resolveEntityVisual({identifier:'other:creature',packs:await f.load({dependencies:[f.dependency]}),behavior:{}}),/full identifier/);
});

test('legacy vanilla geometry index and inherited material definitions resolve without generic models',async t=>{
  const f=await fixture(t), legacy=model();
  await fs.rm(path.join(f.source,'RP/models/entity/test.geo.json'));
  await f.write('models/entity/test.json',{'geometry.test':{texturewidth:32,textureheight:32,bones:legacy.bones}},f.vanilla);
  const definition=client('test:creature'); definition['minecraft:client_entity'].description.materials.default='custom_skin';
  await f.write('RP/entity/test.json',definition);
  await f.write('materials/test.material',{materials:{'custom_skin:entity_alphatest':{'+states':['DisableCulling']}}},f.vanilla);
  const visual=await f.resolve({}, {vanilla:f.vanilla});
  assert.equal(visual.layers[0].materials.entity_head.decoded.method,'alpha_test');
  assert.equal(visual.layers[0].materials.entity_head.decoded.doubleSided,true);alphaBounds((await renderEntity(visual)).pixels);
});

test('Enderman static pose aligns the legacy head with the neck and preserves the hat', async t => {
  const f = await fixture(t);
  const identifier = 'minecraft:enderman';
  const geometryId = 'geometry.enderman.v1.8';
  const definition = client(identifier);
  definition['minecraft:client_entity'].description.geometry.default = geometryId;
  await f.write('RP/entity/enderman.json', definition);
  const cube = (y, height) => ({origin: [-4, y, -4], size: [8, height, 8], uv: [0, 0]});
  const bones = [
    {name: 'body', pivot: [0, 38, 0], cubes: [cube(26, 12)]},
    {name: 'head', parent: 'body', pivot: [0, 24, 0], cubes: [cube(24, 8)]},
    {name: 'hat', parent: 'head', pivot: [0, 38, 0], cubes: [cube(37.5, 8)]},
  ];
  await f.write('models/entity/enderman.geo.json', {[geometryId]: {bones, texturewidth: 32, textureheight: 32}}, f.vanilla);
  const packs = await f.load({vanilla: f.vanilla});
  const visual = await resolveEntityVisual({identifier, packs});
  const [body, head, hat] = visual.layers[0].geometry.bones;
  assert.equal(head.cubes[0].origin[1], body.cubes[0].origin[1] + body.cubes[0].size[1]);
  assert.deepEqual(head.pivot, body.pivot);
  assert.equal(hat.cubes[0].origin[1], 37.5);
  assert.equal(packs.geometries.get(geometryId).value.bones[1].cubes[0].origin[1], 24);
  alphaBounds((await renderEntity(visual)).pixels);
});

test('controller arrays, ternaries, BP variant and properties select exact texture deterministically',async t=>{
  const f=await fixture(t), definition=client('test:creature'); definition['minecraft:client_entity'].description.textures.blue='textures/entity/blue';
  await f.write('RP/entity/test.json',definition);await f.texture('RP/textures/entity/blue.png',{r:0,g:0,b:255,alpha:1});
  await f.write('RP/render_controllers/test.json',{render_controllers:{'controller.render.test':{...controller,
    geometry:"q.property('test:visible') ? Geometry.default : Geometry.missing", textures:['Array.skins[query.variant]'],arrays:{textures:{'Array.skins':['Texture.default','Texture.blue']}}}}});
  const blue=await f.resolve({queries:{variant:1},properties:{'test:visible':true}});
  assert.equal(blue.layers[0].texturePath,'textures/entity/blue');
  await assert.rejects(f.resolve({queries:{variant:5},properties:{'test:visible':true}}),/outside declared range/);
});

test('multiple controllers and explicit texture layers compose transparency in a single depth pass',async t=>{
  const f=await fixture(t), definition=client('test:creature');
  definition['minecraft:client_entity'].description.render_controllers.push('controller.render.overlay');
  definition['minecraft:client_entity'].description.textures.overlay='textures/entity/overlay';
  definition['minecraft:client_entity'].description.materials.overlay='entity_alphablend';
  await f.write('RP/entity/test.json',definition);await f.texture('RP/textures/entity/overlay.png',{r:0,g:100,b:250,alpha:.5});
  await f.write('RP/render_controllers/test.json',{render_controllers:{'controller.render.test':controller,'controller.render.overlay':{
    ...controller,textures:['Texture.overlay'],materials:[{'*':'Material.overlay'}]}}});
  const visual=await f.resolve();assert.equal(visual.layers.length,2);
  const rendered=await renderEntity(visual); alphaBounds(rendered.pixels);
  assert.notDeepEqual(rendered.pixels,(await renderEntity({...visual,layers:[visual.layers[0]]})).pixels);
  const only=await f.resolve({layers:[{geometry:'Geometry.default',textures:['Texture.overlay'],materials:[{'*':'Material.overlay'}]}]});
  const translucent=await renderEntity(only);assert.ok(translucent.pixels.some((v,i)=>i%4===3&&v>0&&v<255));
});

test('unknown Molang, ambiguous multiple texture stages and missing assets are diagnosed, never guessed',async t=>{
  const f=await fixture(t);
  await f.write('RP/render_controllers/test.json',{render_controllers:{'controller.render.test':{...controller,textures:['Array.skins[math.random(0,1)]'],arrays:{textures:{'Array.skins':['Texture.default']}}}}});
  await assert.rejects(f.resolve(),/Unsupported Molang/);
  assert.throws(()=>entityExpression('process.exit(1)'),/Unsupported Molang/);
  await f.write('RP/render_controllers/test.json',{render_controllers:{'controller.render.test':{...controller,textures:['Texture.default','Texture.default']}}});
  await assert.rejects(f.resolve(),/texture stages/);
  await fs.rm(path.join(f.source,'RP/textures/entity/test.png'));
  await f.write('RP/render_controllers/test.json',{render_controllers:{'controller.render.test':controller}});
  await assert.rejects(f.resolve(),/Missing entity texture/);
});

test('zero-opacity bones and layers cannot affect their visible neighbours', async t => {
  const f = await fixture(t);
  const original = await f.resolve();
  const expected = structuredClone(original);
  expected.layers[0].geometry.bones.find(bone => bone.name === 'head').cubes = [];
  const hiddenHead = await f.resolve({boneOpacity: {HEAD: 0}});
  assert.deepEqual((await renderEntity(hiddenHead)).pixels, (await renderEntity(expected)).pixels);
  assert.equal((await renderEntity(hiddenHead)).stats[0].cubes, 3, 'the head still transforms its visible nose');

  const geometry = model();
  geometry.bones.find(bone => bone.name === 'head').opacity = 0;
  await f.write('RP/models/entity/test.geo.json', {'minecraft:geometry': [geometry]});
  assert.deepEqual((await renderEntity(await f.resolve())).pixels, (await renderEntity(expected)).pixels);
  await f.write('RP/models/entity/test.geo.json', {'minecraft:geometry': [model()]});

  const hiddenBranch = await f.resolve({visibility: {HEAD: 0}});
  assert.equal((await renderEntity(hiddenBranch)).stats[0].cubes, 2, 'visibility hides the branch');

  const transparentLayer = {...controller, geometry: 'geometry.intentionally_absent',
    color: {a: 'query.variant == 0 ? 0 : variable.runtime_alpha'}};
  const withTransparentLayer = await f.resolve({layers: [controller, transparentLayer]});
  assert.deepEqual((await renderEntity(withTransparentLayer)).pixels, (await renderEntity(original)).pixels);
});

test('controller alpha modulates the opacity of an opaque material', async t => {
  const f = await fixture(t);
  const layer = {...controller, renderMethod: 'opaque', color: {a: 'variable.layer_alpha'}};
  const resolve = opacity => f.resolve({layers: [layer], expressions: {'variable.layer_alpha': opacity}});
  const solid = await resolve(1);
  const faded = await resolve(0.25);
  const {pixels} = await renderEntity(faded);
  const alphas = new Set(pixels.filter((_, index) => index % 4 === 3));
  assert.ok(alphas.has(64), 'the opaque surface retains the controller alpha');
  assert.ok(!alphas.has(255));
  assert.notEqual(entityVisualHash(solid, {}), entityVisualHash(faded, {}));
});

test('static constant rotation animations and explicit pose are deterministic; advanced poses report limits',async t=>{
  const f=await fixture(t);
  await f.write('RP/animations/pose.json',{animations:{'animation.test.pose':{bones:{head:{rotation:[0,30,0]}}}}});
  const posed=await f.resolve({staticAnimation:'animation.test.pose'});alphaBounds((await renderEntity(posed)).pixels);
  assert.deepEqual(posed.layers[0].geometry.bones.find(b=>b.name==='head').rotation,[0,30,0]);
  const pose=await f.resolve({pose:{head:[0,15,0]}});assert.notEqual(entityVisualHash(posed,{}),entityVisualHash(pose,{}));
  await f.write('RP/animations/pose.json',{animations:{'animation.test.pose':{bones:{head:{position:[0,2,0]}}}}});
  await assert.rejects(f.resolve({staticAnimation:'animation.test.pose'}),/constant rotations only/);
});

test('content cache detects source changes, reuses images, repairs corrupt outputs and hashes camera/visibility/resolution',async t=>{
  const f=await fixture(t), options={source:f.source,output:f.output,log:()=>{}};
  let report=await generateEntityRenders(options);assert.equal(report.counts.generated,3);
  const original=report.results[0].path, mtime=(await fs.stat(path.join(f.output,original))).mtimeMs;
  report=await generateEntityRenders(options);assert.equal(report.counts.reused,3);assert.equal((await fs.stat(path.join(f.output,original))).mtimeMs,mtime);
  await fs.writeFile(path.join(f.output,original),'broken');report=await generateEntityRenders(options);assert.equal(report.counts.generated,1);
  await f.texture('RP/textures/entity/test.png',{r:30,g:230,b:80,alpha:1});report=await generateEntityRenders(options);assert.equal(report.counts.generated,3);assert.notEqual(report.results[0].path,original);
  report=await generateEntityRenders({...options,size:64,overrides:{defaults:{render:{camera:{direction:[1,.4,-1]}},visibility:{nose:false}}}});assert.equal(report.counts.generated,3);
  for(const result of report.results) assert.ok(await validImage(path.join(f.output,result.path),64));
});

test('manual images survive force, flat atlases stay image-only, and one incompatible entity never stops the others',async t=>{
  const f=await fixture(t), manual=path.join(f.output,'renders/manual.png');await fs.mkdir(path.dirname(manual),{recursive:true});await f.texture('renders/manual.png',{r:250,g:100,b:0,alpha:1},f.output);
  const before=await fs.readFile(manual), manifest=path.join(f.root,'manifest.json');
  await fs.writeFile(manifest,JSON.stringify({content:{entities:[{identifier:'test:creature',image:'textures/entity/test.png',render:'renders/manual.png'},{identifier:'test:missing'}]}}));
  const report=await generateEntityRenders({source:f.source,output:f.output,manifest,force:true,log:()=>{}});
  assert.equal(report.counts.ignored,1);assert.equal(report.counts.generated,2);assert.equal(report.counts.error,3);
  assert.deepEqual(await fs.readFile(manual),before);
  const records=(await readJson(manifest)).content.entities;assert.equal(records[0].image,'textures/entity/test.png');assert.equal(records[0].render,'renders/manual.png');assert.ok(records[0].face.startsWith('auto-entities/'));
});

test('named variants keep default associations, failed refresh retains valid image and namespaces avoid collisions',async t=>{
  const f=await fixture(t),manifest=path.join(f.root,'manifest.json');await fs.writeFile(manifest,JSON.stringify({content:{entities:[{identifier:'test:creature'}]}}));
  const options={source:f.source,output:f.output,manifest,log:()=>{}};
  await generateEntityRenders(options);const original=(await readJson(manifest)).content.entities[0].render;
  await generateEntityRenders({...options,overrides:{variant:'blue',defaults:{pose:{head:[0,20,0]}}}});
  const record=(await readJson(manifest)).content.entities[0];assert.equal(record.render,original);assert.ok(record.renderVariants.blue.face);
  await fs.rm(path.join(f.source,'RP/models/entity/test.geo.json'));
  const report=await generateEntityRenders(options);assert.equal(report.counts.error,3);assert.equal((await readJson(manifest)).content.entities[0].render,original);
  assert.notEqual(original,record.renderVariants.blue.render);
});

test('legacy non-atlas image and source manual copies retain precedence without rewriting site-owned files',async t=>{
  const f=await fixture(t),manifest=path.join(f.root,'manifest.json');
  await f.texture('images/pet.png',{r:240,g:150,b:20,alpha:1},f.output);
  await fs.writeFile(manifest,JSON.stringify({content:{entities:[{identifier:'test:creature',image:'images/pet.png'}]}}));
  let report=await generateEntityRenders({source:f.source,output:f.output,manifest,formats:['fullBody'],force:true,log:()=>{}});
  assert.equal(report.counts.ignored,1);assert.equal((await readJson(manifest)).content.entities[0].render,'images/pet.png');
  await fs.writeFile(manifest,JSON.stringify({content:{entities:[{identifier:'test:creature',image:'images/pet.png',imageKind:'texture'}]}}));
  report=await generateEntityRenders({source:f.source,output:f.output,manifest,formats:['fullBody'],log:()=>{}});
  assert.equal(report.counts.generated,1,'explicit texture marker prevents treating an atlas as a manual render');
  await f.texture('Assets/EntityRenders/creature/face.png',{r:30,g:190,b:220,alpha:1});
  report=await generateEntityRenders({source:f.source,output:f.output,formats:['face'],log:()=>{}});
  assert.equal(report.counts.ignored,1);
  const copied=path.join(f.output,report.results[0].path),before=await fs.readFile(copied);
  await f.texture('Assets/EntityRenders/creature/face.png',{r:255,g:0,b:0,alpha:1});
  report=await generateEntityRenders({source:f.source,output:f.output,formats:['face'],force:true,log:()=>{}});
  assert.equal(report.counts.ignored,1);assert.deepEqual(await fs.readFile(copied),before);
});

test('CLI format selection and required arguments reject invalid user options',async()=>{
  const options=parseEntityArguments(['--source','a','--output','b','--format','face,portrait','--dependency','c','--size','256']);
  assert.deepEqual(options.formats,['face','portrait']);assert.deepEqual(options.dependencies,['c']);
  assert.throws(()=>parseEntityArguments(['--entity']),/Missing value/);
  await assert.rejects(generateEntityRenders({source:'a',output:'b',formats:['wrong']}),/Formats/);
  await assert.rejects(generateEntityRenders({source:'a',output:'b',size:15}),/size/);
});
