import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {data,records,byId,lineage,incoming,blockPath} from '../src/components/AtelierWiki/model.mjs';
const staticRoot=path.resolve(import.meta.dirname,'../static');
test('all 34 raw materials and 916 custom blocks retain local original images and stable ids',async()=>{
  assert.equal(data.materials.length,34);assert.equal(records.filter(r=>r.origin==='Atelier').length,916);
  const paths=new Set();
  for(const record of records){const route=blockPath(record);assert.ok(!paths.has(route));paths.add(route);assert.ok(fs.existsSync(path.join(staticRoot,record.image)));}
  for(const record of records.filter(r=>r.origin==='Atelier')){const meta=await sharp(path.join(staticRoot,record.image)).metadata();assert.equal(meta.width,128);assert.equal(meta.height,128);}
  for(const m of data.materials){assert.ok(fs.existsSync(path.join(staticRoot,m.texture)));for(const locale of ['en','pt-BR','es-MX'])assert.ok(m.label[locale]);}
});
test('recipe lineage, quantities, recomposition and paint targets point to real blocks',()=>{
  const slab=byId.get('dorios_atelier:andesite_bricks_slab');
  const route=lineage(slab);assert.equal(route.nodes.at(-1),slab.idIndex);assert.ok(route.edges.length>0);
  assert.ok(incoming.get(slab.idIndex).some(recipe=>recipe.count===2));
  assert.ok(data.recipes.every(r=>r[0].every(([,count])=>Number.isFinite(count)&&count>0)&&r[2]>0&&r[5]));
  for(const destinations of Object.values(data.paint))for(const [,index] of destinations)assert.ok(records[index]);
  assert.ok(Object.keys(data.paint).length>300);
});
