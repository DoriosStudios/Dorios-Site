import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createCatalogIndex,findLocalCatalogEntry} from '../src/wiki/catalogIndex.mjs';
const require=createRequire(import.meta.url);
const loader=require('../plugins/navigation-performance/chunk-index-loader.cjs');
const core=fs.readFileSync(require.resolve('@docusaurus/core/lib/client/docusaurus.js'),'utf8');
const flatSource=fs.readFileSync(require.resolve('@docusaurus/core/lib/client/flat.js'),'utf8').replace('export default function flat','function flat');
const flat=new Function(flatSource+';return flat;')();
function lookup(source, manifest) {
 const start=source.indexOf(source.includes('let chunkNamesByPath;')?'let chunkNamesByPath;':'const getChunkNamesToLoad =');
 return new Function('routesChunkNames','flat',source.slice(start,source.indexOf('const prefetch =',start))+';return getChunkNamesToLoad;')(manifest,flat);
}
test('indexed prefetch exactly preserves installed Docusaurus chunk selection',()=>{
 const manifest={'/wiki/a-block-abc':{component:'a',nested:{data:'b'}},'/wiki/a-block-def':{component:'c'},'/pt-BR/wiki/a-111':{component:'d'},'/wiki-222':{component:'e'}};
 const original=lookup(core,manifest),indexed=lookup(loader(core),manifest);
 for(const p of ['/wiki/a-block','/pt-BR/wiki/a','/wiki','/missing','/wiki/a-block/']) assert.deepEqual(indexed(p),original(p));
 assert.deepEqual(indexed('/wiki/a-block'),['a','b','c']);
});
test('prefetch builds its manifest index once and rejects incompatible dependency changes',()=>{
 let reads=0;
 const manifest=new Proxy({'/wiki/a-123':{component:'a'}},{ownKeys(target){reads++;return Reflect.ownKeys(target);}});
 const indexed=lookup(loader(core),manifest);
 assert.equal(reads,0);
 for(let i=0;i<100;i++) indexed('/wiki/a');
 assert.equal(reads,1);
 assert.throws(()=>loader('changed upstream source'),/implementation changed/);
 assert.throws(()=>loader(core.replace('Object.values(flat(routeChunks))','Object.keys(flat(routeChunks))')),/implementation changed/);
});
test('catalog indexes retain aliases, first-match precedence, names and misses',()=>{
 const entries=[{id:'first',shortId:'shared',name:'Alias'},{id:'shared',identifier:'pack:second',name:'First'},{id:'third',name:'Alias'}];
 const find=createCatalogIndex(entries);
 const linear=id=>entries.find(e=>e.id===id||e.identifier===id||e.shortId===id)??entries.find(e=>e.name?.toLowerCase()===id.replace(/\s+\([^)]*\).*$/,'').trim().toLowerCase())??null;
 for(const id of ['first','shared','pack:second','third','ALIAS','Alias (block)','First','missing','']) assert.equal(find(id),linear(id));
 const local={items:entries,blocks:[{id:'fourth'}]};
 assert.equal(findLocalCatalogEntry(local,'shared'),entries[0]);
 assert.equal(findLocalCatalogEntry({...local,lookupItems:[entries[1]]},'shared'),entries[1]);
 assert.equal(findLocalCatalogEntry({},'missing'),null);
});
test('real wiki manifest IDs and names resolve identically to linear catalog searches',()=>{
 for(const project of ['utilitycraft','ascendant-technology']){
  const manifest=JSON.parse(fs.readFileSync(new URL(`../src/wiki/projects/${project}/manifest.json`,import.meta.url)));
  const entries=[...manifest.catalog.items,...manifest.content.blocks];
  const find=createCatalogIndex(entries);
  for(const entry of entries){for(const id of [entry.id,entry.identifier,entry.shortId,entry.name].filter(v=>typeof v==='string')){
   const expected=entries.find(e=>e.id===id||e.identifier===id||e.shortId===id)??entries.find(e=>e.name?.toLowerCase()===id.replace(/\s+\([^)]*\).*$/,'').trim().toLowerCase())??null;
   assert.equal(find(id),expected);
  }}
 }
});
test('brand derivatives retain transparency, animation frames and timing',async()=>{
 const sharp=(await import('sharp')).default;
 for(const name of ['black_no_bg','white_no_bg','blazing_animated_transparent']){
  const animated=name.startsWith('blazing');
  const source=new URL(`../static/img/${name}.${animated?'gif':'png'}`,import.meta.url);
  const output=new URL(`../static/img/optimized/${name}.webp`,import.meta.url);
  const a=await sharp(fileURLToPath(source),{animated}).metadata();
  const b=await sharp(fileURLToPath(output),{animated}).metadata();
  assert.equal(b.width,90);assert.equal(b.hasAlpha,true);assert.equal(b.pages??1,a.pages??1);
  if(animated){assert.deepEqual(b.delay,a.delay);assert.equal(b.loop,a.loop);}
  assert.ok(fs.statSync(output).size<fs.statSync(source).size);
 }
});
