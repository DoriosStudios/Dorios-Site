import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import worker from './worker.mjs';
const origin='https://doriosstudios.com';
function setup(filename=':memory:') {
  const db=new DatabaseSync(filename);db.exec(fs.readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
  const env={DB:{prepare(sql){const statement=db.prepare(sql);return {all:async()=>({results:statement.all()}),bind(...values){return {run:async()=>statement.run(...values)};}};}},READ_TOKEN:'test-token',ALLOWED_ORIGINS:origin,ALLOWED_EVENTS:{atelier:['custom-install-started']},EVENT_LIMITER:{limit:async()=>({success:true})}};
  return {db,env};
}
const event=(eventId=crypto.randomUUID())=>({project:'atelier',event:'custom-install-started',eventId});
const post=(body,site=origin)=>new Request('https://counter.example/events',{method:'POST',headers:{Origin:site,'Content-Type':'application/json'},body:JSON.stringify(body)});
const read=env=>worker.fetch(new Request('https://counter.example/counters',{headers:{Authorization:'Bearer test-token'}}),env).then(response=>response.json());
test('atomic counter persists across worker/database restarts; repeated attempts count once',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'dorios-counter-')),filename=path.join(directory,'counter.sqlite');
  let {db,env}=setup(filename);const body=event();
  for(let i=0;i<5;i++)assert.equal((await worker.fetch(post(body),env)).status,202);
  assert.equal((await read(env)).counters[0].value,1);
  await worker.fetch(post(event()),env);db.close();
  ({db,env}=setup(filename));assert.equal((await read(env)).counters[0].value,2);
  assert.equal((await worker.fetch(post(body),env)).status,202);assert.equal((await read(env)).counters[0].value,2);
  db.close();fs.rmSync(directory,{recursive:true});
});
test('invalid origins/events/body/token and rate limits never increment the counter',async()=>{
  const {db,env}=setup();
  for(const body of [{...event(),project:'other'},{...event(),event:'click'},{...event(),eventId:'bad'},{...event(),eventId:[crypto.randomUUID()]},{...event(),user:'unnecessary-data'}])assert.equal((await worker.fetch(post(body),env)).status,400);
  assert.equal((await worker.fetch(post(event(),'https://other.example'),env)).status,403);
  assert.equal((await worker.fetch(post({large:'x'.repeat(2000)}),env)).status,400);
  assert.equal((await worker.fetch(new Request('https://counter.example/counters'),env)).status,401);
  env.EVENT_LIMITER.limit=async()=>({success:false});assert.equal((await worker.fetch(post(event()),env)).status,429);
  assert.equal((await read(env)).counters[0].value,0);db.close();
});
test('counter failure returns retryable error and no binding fails closed',async()=>{
  const {db,env}=setup();
  assert.equal((await worker.fetch(post(event()),{...env,DB:null})).status,503);
  assert.equal((await worker.fetch(post(event()),{...env,EVENT_LIMITER:null})).status,503);
  assert.equal((await worker.fetch(post(event()),{...env,DB:{prepare(){throw Error('offline');}}})).status,503);
  db.close();
});
test('concurrent duplicate requests cannot double-count one attempt',async()=>{
  const {db,env}=setup(),same=event();
  await Promise.all([...Array.from({length:20},()=>same),...Array.from({length:20},()=>event())].map(body=>worker.fetch(post(body),env)));
  assert.equal((await read(env)).counters[0].value,21);db.close();
});
