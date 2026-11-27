import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {entityVisual,hasEntityVisuals,publicEntityEntries} from '../src/wiki/entityVisual.mjs';
import {readJson} from './bedrock-pack.mjs';

test('entity lists prefer actual faces and details prefer full bodies without showing source atlases', () => {
  const record={image:'textures/entity/zombie.png',render:'auto-entities/body.png',portrait:'auto-entities/portrait.png',face:'auto-entities/face.png'};
  assert.equal(entityVisual(record),record.render);
  assert.equal(entityVisual(record,{compact:true}),record.face);
  assert.equal(entityVisual({image:'images/manual.png'}),'images/manual.png');
  assert.equal(entityVisual({image:'/img/wiki/addon/textures/entity/atlas.png'}),undefined);
  assert.equal(entityVisual({image:'textures/blocks/crop.png'}),undefined);
  assert.equal(entityVisual({image:'images/atlas.png',imageKind:'texture'}),undefined);
  assert.equal(entityVisual({portrait:'portrait.png'},{compact:true}),'portrait.png');
  assert.equal(hasEntityVisuals({content:{entities:[{image:'textures/entity/test.png'}]}}),false);
  assert.equal(hasEntityVisuals({content:{entities:[record]}}),true);
  const verified = {...record, identifier:'test:mob', publicEntity:true};
  const manifest = {content:{entities:[
    verified,
    {...record, identifier:'test:machine_proxy'},
    {...record, identifier:'minecraft:player', publicEntity:true},
    {identifier:'test:atlas', image:'textures/entity/atlas.png', publicEntity:true},
  ]}};
  assert.deepEqual(publicEntityEntries('test', manifest), [verified]);
  assert.deepEqual(publicEntityEntries('utilitycraft', manifest), []);
});

test('mapper rescan preserves manual entity images, fills missing formats and tolerates a broken refresh', async t => {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'wiki-entity-mapper-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const source=path.join(root,'addon'),output=path.join(root,'output'),manifest=path.join(root,'manifest.json'),vanilla=path.join(root,'vanilla');
  const write=async(file,value)=>{await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(value));};
  await write(path.join(source,'BP/entities/test.json'),{'minecraft:entity':{description:{identifier:'test:creature'}}});
  await write(path.join(source,'RP/entity/test.json'),{'minecraft:client_entity':{description:{identifier:'test:creature',materials:{default:'entity_alphatest'},textures:{default:'textures/entity/test'},geometry:{default:'geometry.creature'},render_controllers:['controller.render.test']}}});
  const geometry=path.join(source,'RP/models/entity/test.geo.json');
  await write(geometry,{'minecraft:geometry':[{description:{identifier:'geometry.creature',texture_width:16,texture_height:16},bones:[{name:'body',cubes:[{origin:[-2,0,-2],size:[4,5,4],uv:[0,0]}]},{name:'head',parent:'body',pivot:[0,5,0],rotation:[0,15,0],cubes:[{origin:[-2,5,-2],size:[4,4,4],uv:[0,0]}]}]}]});
  await write(path.join(source,'RP/render_controllers/test.json'),{render_controllers:{'controller.render.test':{geometry:'Geometry.default',materials:[{'*':'Material.default'}],textures:['Texture.default']}}});
  await fs.mkdir(path.join(source,'RP/textures/entity'),{recursive:true});
  await sharp({create:{width:16,height:16,channels:4,background:'#66cc88'}}).png().toFile(path.join(source,'RP/textures/entity/test.png'));
  await fs.mkdir(path.join(output,'renders'),{recursive:true});await fs.mkdir(vanilla,{recursive:true});
  const manual=path.join(output,'renders/own.png');await sharp({create:{width:16,height:16,channels:4,background:'#8844cc'}}).png().toFile(manual);
  const original=await fs.readFile(manual);
  await write(manifest,{content:{entities:[{identifier:'test:creature',render:'renders/own.png'}]}});
  const website=path.resolve(import.meta.dirname,'..');
  const run=()=>spawnSync('python',['-m','addon_wiki_mapper',source,'--id','fixture','--output',manifest,'--assets-dir',output,'--vanilla-rp',vanilla],{cwd:website,env:{...process.env,PYTHONPATH:path.join(website,'scripts')},encoding:'utf8'});
  let result=run();assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
  let record=(await readJson(manifest)).content.entities[0];
  assert.equal(record.render,'renders/own.png');assert.ok(record.face.startsWith('auto-entities/'));assert.ok(record.portrait.startsWith('auto-entities/'));
  assert.equal(record.imageKind,'texture');assert.deepEqual(await fs.readFile(manual),original);
  const face=record.face;result=run();assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
  assert.equal((await readJson(manifest)).content.entities[0].face,face);
  await fs.unlink(geometry);result=run();assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
  record=(await readJson(manifest)).content.entities[0];assert.equal(record.face,face);assert.equal(record.render,'renders/own.png');
  const report=await readJson(path.join(output,'auto-entities/report.json'));assert.ok(report.counts.error>0);assert.deepEqual(await fs.readFile(manual),original);
});
