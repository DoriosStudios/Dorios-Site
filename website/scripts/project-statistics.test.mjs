import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {projectSources, normalizeSource, aggregateSources, migrateStatistics} from '../src/data/downloadSources.mjs';
import {validProjectStatistics, withProjectStatistics} from '../src/data/projectStatistics.mjs';
import {collectStatistics} from './statistics/collect.mjs';
import {recordDownloadStarted} from '../src/data/downloadEvents.mjs';
import {collect as internal} from './statistics/providers/internal-downloads.mjs';
import {fetchReleaseStats} from './refresh-github-release-stats.mjs';
import {extractDetailsDownloadCount} from './refresh-curseforge-stats.mjs';
const date='2026-11-22T00:00:00.000Z';
const project={id:'demo',links:{repository:'https://github.com/studio/demo',curseforge:'https://www.curseforge.com/minecraft-bedrock/addons/demo'}};
const source=projectSources(project)[0];
const good=value=>({value,updatedAt:date});
const row=(value=100)=>normalizeSource(source,good(value));
test('migrate every historical project without losing reliable downloads',async()=>{
  const read=async name=>JSON.parse(await fs.readFile(new URL('../src/data/'+name,import.meta.url)));
  const catalog=await read('projectCatalog.json');
  const legacy={schemaVersion:1,githubReleaseStats:await read('githubReleaseStats.json'),curseForgeStats:await read('curseForgeStats.json')};
  const migrated=migrateStatistics(legacy,catalog.projects);
  assert.ok(validProjectStatistics(migrated));
  for(const p of catalog.projects){
    const old=[legacy.githubReleaseStats[p.id],legacy.curseForgeStats[p.id]].filter(r=>r?.available!==false&&r?.downloads>=0).reduce((n,r)=>n+r.downloads,0);
    assert.equal(aggregateSources(migrated.projects[p.id].sources).total,old,p.id);
  }
});
test('invalid or absent values stay unavailable; valid zero remains zero',()=>{
  for(const value of [undefined,null,-1,NaN,Infinity,'123',1.5,Number.MAX_SAFE_INTEGER+1])assert.equal(normalizeSource(source,good(value)).value,null);
  assert.equal(normalizeSource(source,good(0)).status,'available');
  assert.equal(normalizeSource(source,{value:42,updatedAt:'bad'}).value,null);
  assert.equal(validProjectStatistics({schemaVersion:2,projects:{demo:{sources:[null]}}}),false);
});
test('failures, regressing counts, older feeds and invalid responses preserve the high water mark',()=>{
  for(const result of [null,good(99),{...good(999),updatedAt:'2020-01-01'},good(NaN)]){
    const next=normalizeSource(source,result,row());assert.equal(next.value,100);assert.equal(next.updatedAt,date);assert.equal(next.status,'stale');
  }
  assert.equal(normalizeSource({...source,countingKey:'different'},null,row()).value,null);
});
test('source instances, exclusions, clicks and shared counting keys aggregate independently',()=>{
  const second=normalizeSource({...source,id:'another-repo',countingKey:'github:another'},good(20));
  const click=normalizeSource({...source,id:'click',metric:'clicks',countingKey:'click'},good(7));
  const disabled={...row(400),id:'disabled',enabled:false};
  const aggregate=aggregateSources([row(),{...row(),id:'mirror'},second,click,disabled]);
  assert.equal(aggregate.total,120);assert.equal(aggregate.clicks,7);assert.ok(aggregate.sources[1].duplicate);
});
test('collector isolates provider failures and supports adding, disabling and multiple instances',async()=>{
  const configured={...project,statisticsSources:[{...source,id:'second',countingKey:'github:second',url:'https://github.com/studio/second'},{id:'disabled',provider:'github-releases',enabled:false}]};
  const payload=await collectStatistics({projects:[configured],fallback:{},adapters:{'github-releases':{collect:async s=>good(s.id==='second'?25:10)},curseforge:{collect:async()=>{throw Error('down');}}}});
  assert.ok(validProjectStatistics(payload));assert.equal(aggregateSources(payload.projects.demo.sources).total,35);
  assert.equal(payload.projects.demo.sources.find(s=>s.provider==='curseforge').value,null);
  assert.equal(payload.projects.demo.sources.find(s=>s.id==='disabled').status,'disabled');
  const live=withProjectStatistics(configured,payload);assert.equal(live.metrics.downloads,35);
  const offline=await collectStatistics({projects:[configured],previous:payload,fallback:{},offline:true});
  assert.equal(withProjectStatistics(live,offline).metrics.downloads,35);
});
test('legacy and version 2 feeds update already built projects without a build',()=>{
  const legacy={schemaVersion:1,githubReleaseStats:{demo:{downloads:100,updatedAt:date}},curseForgeStats:{}};
  const initial=withProjectStatistics(project,legacy);
  const feed={schemaVersion:2,projects:{demo:{sources:[normalizeSource(source,good(200))]}}};
  assert.equal(withProjectStatistics(initial,feed).metrics.downloads,200);
  assert.equal(withProjectStatistics(withProjectStatistics(initial,feed),legacy).metrics.downloads,200);
  assert.equal(withProjectStatistics(initial,{schemaVersion:2,projects:{demo:{sources:[{...row(),enabled:false}]}}}).metrics.downloads,null);
});
test('GitHub validates asset counters and paginates; CurseForge only accepts exact totals',async()=>{
  let calls=0;
  const result=await fetchReleaseStats({id:'demo',repository:'studio/demo'},async()=>({ok:true,json:async()=>++calls===1?Array.from({length:100},()=>({assets:[{download_count:1}]})):[]}));
  assert.equal(result.downloads,100);assert.equal(calls,2);
  await assert.rejects(fetchReleaseStats({repository:'studio/demo'},async()=>({ok:true,json:async()=>[{assets:[{download_count:-1}]}]})));
  assert.equal(extractDetailsDownloadCount('<h2>Details</h2><p>Downloads</p><b>123,456</b>'),123456);
  assert.throws(()=>extractDetailsDownloadCount('<h2>Details</h2><p>Downloads</p><b>123K</b>'));
});
test('internal counts stay unavailable before configuration, and validate remote records',async()=>{
  await assert.rejects(internal({event:'custom-install-started'},{project,env:{}}),/not-configured/);
  const result=await internal({event:'custom-install-started'},{project,env:{DOWNLOAD_COUNTER_URL:'https://counter.example',DOWNLOAD_COUNTER_READ_TOKEN:'test'},request:async()=>({ok:true,json:async()=>({schemaVersion:1,counters:[{project:'demo',event:'custom-install-started',value:3,updatedAt:date}]})})});
  assert.equal(result.value,3);assert.equal(result.metric,'download-starts');
});
test('download telemetry retries use one id, suppress duplicates and tolerate outages',async()=>{
  const calls=[];let attempt=0;
  const options={endpoint:'https://counter.example',project:'demo',event:'custom-install-started',eventId:crypto.randomUUID()};
  const request=async(url,init)=>{calls.push(JSON.parse(init.body));return {ok:++attempt>1,status:attempt>1?202:503};};
  assert.equal(await recordDownloadStarted(options,{request}),true);
  assert.equal(calls.length,2);assert.equal(calls[0].eventId,calls[1].eventId);
  await recordDownloadStarted(options,{request});assert.equal(calls.length,2);
  assert.equal(await recordDownloadStarted({...options,eventId:crypto.randomUUID()},{request:async()=>{throw Error('offline');}}),false);
});
test('CLI publishes schema 1 compatibility and schema 2, preserving internal counters on the next run',async()=>{
  const website=fileURLToPath(new URL('..',import.meta.url));
  const cache=path.join(website,'.cache-loader');await fs.mkdir(cache,{recursive:true});
  const directory=await fs.mkdtemp(path.join(cache,'stats-test-'));
  const run=extra=>execFileSync(process.execPath,[path.join(website,'scripts/collect-project-stats.mjs'),'--offline','--output',directory,...extra],{cwd:website,stdio:'pipe'});
  try{
    run([]);
    const legacy=JSON.parse(await fs.readFile(path.join(directory,'project-stats.json')));
    const modern=JSON.parse(await fs.readFile(path.join(directory,'project-stats-v2.json')));
    assert.equal(legacy.schemaVersion,1);assert.equal(modern.schemaVersion,2);
    assert.ok(validProjectStatistics(legacy));assert.ok(validProjectStatistics(modern));
    const internal=modern.projects.atelier.sources.find(row=>row.id==='custom-install');
    assert.equal(internal.value,null);
    Object.assign(internal,{value:9,updatedAt:date,status:'available'});
    const previous=path.join(directory,'previous.json');await fs.writeFile(previous,JSON.stringify(modern));
    run(['--previous',previous]);
    const next=JSON.parse(await fs.readFile(path.join(directory,'project-stats-v2.json')));
    assert.equal(next.projects.atelier.sources.find(row=>row.id==='custom-install').value,9);
    assert.equal(next.projects.atelier.sources.find(row=>row.id==='custom-install').status,'stale');
  }finally{assert.equal(path.dirname(path.resolve(directory)),path.resolve(cache));await fs.rm(directory,{recursive:true,force:true});}
});
