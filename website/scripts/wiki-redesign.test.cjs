const assert=require('node:assert/strict'),test=require('node:test'),fs=require('node:fs'),path=require('node:path'),babel=require('@babel/core');
const root=path.resolve(__dirname,'../src')+path.sep,original=require.extensions['.js'];
require.extensions['.js']=(module,filename)=>{if(!filename.startsWith(root))return original(module,filename);const {code}=babel.transformSync(fs.readFileSync(filename,'utf8'),{babelrc:false,configFile:false,plugins:[require('@babel/plugin-transform-modules-commonjs')]});module._compile(code,filename);};
const {wikiProjects,getWikiProject}=require('../src/wiki/projects');
const {equipmentBenefits,itemHighlights,isSimpleEquipment,machinePlayerGuide,meaningfulValue}=require('../src/wiki/playerGuide.mjs');
const {wikiText}=require('../src/i18n/wiki');
const {wikiIconKey}=require('../src/data/wikiUiIcons.mjs');

test('every documented trinket effect and immunity resolves from its canonical source label',()=>{
 let checked=0;
 for(const entry of wikiProjects.trinkets.items){
  const capabilities=entry.documentation?.capabilities??{};
  for(const item of [...(capabilities.passiveEffects??[]),...(capabilities.activeEffects??[]),...(capabilities.immunities??[])]){
   assert.ok(wikiIconKey(item.name,'effect'),`${entry.id}: ${item.name}`);checked++;
  }
 }
 assert.ok(checked>30);
 for(const locale of ['pt-BR','es-MX']) {
  const localized=getWikiProject('trinkets',locale);
  for(const entry of localized.items){
   const source=wikiProjects.trinkets.items.find(item=>item.id===entry.id);
   assert.equal(equipmentBenefits(entry.documentation??{}).length,equipmentBenefits(source.documentation??{}).length,`${locale}: ${entry.id}`);
  }
 }
});

test('simple equipment exposes real bonuses; every Hearty Charm and secondary attribute survives',()=>{
 const hearts=wikiProjects.trinkets.items.filter(e=>e.category==='Hearty Charms');
 assert.equal(hearts.length,12);
 const black=hearts.find(e=>e.id==='dorios:black_heart');
 assert.deepEqual(itemHighlights(black.documentation),[['Max health','+3 hearts']]);
 assert.ok(isSimpleEquipment(black.documentation));
 const immaculate=hearts.find(e=>e.id==='dorios:immaculate_heart');
 assert.ok(equipmentBenefits(immaculate.documentation).some(e=>e.value==='+1'&&/damage/i.test(e.label)));
 assert.equal(equipmentBenefits(black.documentation).length,1);
 assert.equal(black.documentation.acquisition.structures[0].conditions.dimension,'minecraft:the_end');
 assert.equal(black.documentation.acquisition.structures[0].chance,0.15);
});
test('Paxel and AiOT retain separate metrics, roles, repair and enchantment data',()=>{
 const items=wikiProjects['ascendant-technology'].items;
 const paxel=items.find(e=>e.id==='utilitycraft:aetherium_paxel'),aiot=items.find(e=>e.id==='utilitycraft:aetherium_aiot');
 assert.equal(new Map(itemHighlights(paxel.documentation)).get('Durability'),'10,737');
 assert.equal(new Map(itemHighlights(aiot.documentation)).get('Durability'),'17,895');
 assert.equal(new Map(itemHighlights(paxel.documentation)).get('Attack damage'),11);
 assert.equal(new Map(itemHighlights(aiot.documentation)).get('Attack damage'),12);
 for(const entry of [paxel,aiot]){
  assert.ok(entry.documentation.sections.some(s=>s.id==='enchantments'));
  assert.ok(entry.documentation.sections.some(s=>s.repairs?.length));
  assert.ok(!isSimpleEquipment(entry.documentation));
 }
});
test('furnace metrics and two-tick risk use their exact verified source',()=>{
 const furnace=wikiProjects.smelters.machines.find(e=>e.id==='oak_wood_furnace');
 const before=JSON.stringify(furnace),guide=machinePlayerGuide(furnace);
 assert.deepEqual(guide.metrics.map(([label])=>label),['Processing speed','Nominal cycle','Fuel use','Coal-equivalent yield']);
 assert.ok(guide.features.some(([,value])=>/two-tick work interval.*1%/.test(value)));
 assert.equal(guide.inputs[0],furnace.input);assert.equal(guide.outputs[0],furnace.output);
 assert.equal(JSON.stringify(furnace),before);
});
test('machine guide uses real capacity, baseline timing, catalysts and supported upgrades',()=>{
 const machine=wikiProjects['ascendant-technology'].machines.find(e=>e.id==='catalyst_weaver');
 const before=JSON.stringify(machine),guide=machinePlayerGuide(machine),metrics=new Map(guide.metrics);
 assert.equal(metrics.get('Energy capacity'),'2,048,000 DE');
 assert.equal(metrics.get('Base energy consumption'),'1,600 DE/action');
 assert.equal(metrics.get('Base processing time'),'5 ticks · 0.25 s');
 assert.equal(metrics.get('Fluid capacity'),'512,000 mB');
 assert.deepEqual(guide.upgrades,['speed','energy','hyper','stack']);
 assert.ok(guide.features.some(([label,value])=>label==='Catalyst slots'&&value==='Up to 6'));
 assert.ok(guide.inputs[0].includes('up to 6 catalysts'));
 assert.ok(!guide.metrics.some(([label])=>/inventory|slots/i.test(label)));
 assert.equal(JSON.stringify(machine),before);
});
test('incomplete entries omit placeholder gameplay data without fabricating generic process results',()=>{
 const empty=machinePlayerGuide({input:'Configured machine input',output:'Machine-specific result',howItWorks:['Supply configured machine input to the machine.']});
 assert.deepEqual(empty.metrics,[]);assert.deepEqual(empty.inputs,[]);assert.deepEqual(empty.outputs,[]);assert.deepEqual(empty.steps,[]);
 assert.equal(meaningfulValue(0),true);assert.equal(meaningfulValue('None'),false);
 assert.equal(meaningfulValue('Not applicable'),false);
});
test('new presentation text and source fields work in every locale without mutating IDs or routes',()=>{
 for(const locale of ['en','pt-BR','es-MX']){
  const project=getWikiProject('trinkets',locale),heart=project.items.find(e=>e.id==='dorios:black_heart');
  assert.equal(heart.slug,'black-heart');assert.ok(isSimpleEquipment(heart.documentation));
  assert.ok(heart.documentation.capabilities.attributeModifiers[0].modifier.includes('3'));
  assert.ok(wikiText(locale,'Technical details'));
  if(locale!=='en'){
   assert.notEqual(wikiText(locale,'Process schematic'), 'Process schematic');
   assert.notEqual(wikiText(locale,'Max health'),'Max health');
   assert.notEqual(wikiText(locale,'+3 hearts'),'+3 hearts');
  }
 }
});

test('furnace render association points to a transparent real active-state asset',async()=>{
 const manifest=require('../src/wiki/projects/smelters/manifest.json');
 const block=manifest.content.blocks.find(e=>e.identifier==='better_smelters:oak_wood_furnace');
 assert.ok(block.render.startsWith('auto-renders/'));
 const index=require('../static/img/wiki/smelters/auto-renders/index.json');
 const variant=Object.values(index.blocks).find(e=>e.path===block.render);
 assert.equal(variant.states['better_smelters:on'],true);
 assert.equal(variant.states['minecraft:cardinal_direction'],'south');
 const image=await require('sharp')(path.resolve(__dirname,'../static/img/wiki/smelters',block.render)).metadata();
 assert.equal(image.width,128);assert.equal(image.height,128);assert.equal(image.hasAlpha,true);
});
