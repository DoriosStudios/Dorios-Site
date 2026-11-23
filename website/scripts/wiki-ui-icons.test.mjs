import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {ASCENDANT_UI_ICON_NAMES,VANILLA_EFFECT_NAMES,WIKI_UI_ICONS,WIKI_SECTION_ICONS,WIKI_UPGRADE_ICONS,wikiIconKey,wikiStatValue,isWikiPropertyFlag,wikiHeartIcons} from '../src/data/wikiUiIcons.mjs';
import {syncVanillaUiIcons} from './sync-wiki-ui-icons.mjs';

const site = path.resolve(import.meta.dirname,'..');

test('heart icons repeat exactly once per extra heart, including halves without rounding',()=>{
  assert.deepEqual(wikiHeartIcons('Max health','+3 hearts'),['full_heart','full_heart','full_heart']);
  assert.equal(wikiHeartIcons('Max health','+5 hearts').length,5);
  assert.equal(wikiHeartIcons('Max health','+10 hearts').length,10);
  assert.deepEqual(wikiHeartIcons('Max health','+1.5 hearts'),['full_heart','half_heart']);
  assert.deepEqual(wikiHeartIcons('Max health','+0,5 hearts'),['half_heart']);
  assert.deepEqual(wikiHeartIcons('Max health','-2 hearts'),['full_heart','full_heart']);
  assert.deepEqual(wikiHeartIcons('Max health','0 hearts'),[]);
  assert.equal(wikiHeartIcons('Max health','+0.25 hearts'),null);
  assert.equal(wikiHeartIcons('Attack damage',3),null);
  assert.equal(wikiHeartIcons('Max health',3),null);
});

test('inline heart units preserve the actual bonus and other values retain their units',()=>{
  assert.deepEqual(wikiStatValue('Max health','+3 hearts'),{value:'+3',icon:'full_heart'});
  assert.deepEqual(wikiStatValue('Max health','+0.5 hearts'),{value:'+0.5',icon:'full_heart'});
  assert.deepEqual(wikiStatValue('Max health','-2 hearts'),{value:'-2',icon:'full_heart'});
  assert.deepEqual(wikiStatValue('Max health','+ 3 hearts'),{value:'+3',icon:'full_heart'});
  assert.deepEqual(wikiStatValue('Attack damage',11),{value:11,icon:'extra_damage'});
  assert.equal(wikiStatValue('Energy capacity','2,048,000 DE').value,'2,048,000 DE');
  assert.deepEqual(wikiStatValue('Unknown property','+3 hearts'),{value:'+3 hearts',icon:null});
});

test('fire resistance glyph represents an explicitly enabled item property',()=>{
  assert.ok(isWikiPropertyFlag('Fire resistant','Yes'));
  assert.ok(isWikiPropertyFlag('Fire resistant',true));
  for(const value of ['No',false,null,undefined]){
    assert.equal(isWikiPropertyFlag('Fire resistant',value),false);
    assert.equal(wikiStatValue('Fire resistant',value).icon,null);
  }
  assert.equal(wikiStatValue('Fire resistant','Yes').icon,'effect:fire_resistance');
  assert.equal(isWikiPropertyFlag('Unknown property','Yes'),false);
});

test('every shared icon is a real small transparent sprite, including every section and upgrade',async()=>{
  assert.equal(new Set(ASCENDANT_UI_ICON_NAMES).size,ASCENDANT_UI_ICON_NAMES.length);
  for(const [key,url] of Object.entries(WIKI_UI_ICONS)) {
    const image = sharp(path.join(site,'static',url));
    const metadata = await image.metadata();
    assert.equal(metadata.width,key.startsWith('effect:')?18:16,key);
    assert.equal(metadata.height,metadata.width,key);
    assert.ok(metadata.hasAlpha,key);
    assert.ok((await image.stats()).channels[3].min<255,key);
  }
  for(const name of [...Object.values(WIKI_SECTION_ICONS),...Object.values(WIKI_UPGRADE_ICONS)]) assert.ok(WIKI_UI_ICONS[name]);
  assert.ok(!VANILLA_EFFECT_NAMES.includes('frozen'));
});

test('attributes, potion effects and immunity use different semantic icons',()=>{
  assert.equal(wikiIconKey('Max health'),'full_heart');
  assert.equal(wikiIconKey('Bonus damage','attribute'),'extra_damage');
  assert.equal(wikiIconKey('Strength II','effect'),'effect:strength');
  assert.equal(wikiIconKey('minecraft:fire_resistance','immunity'),'effect:fire_resistance');
  assert.equal(wikiIconKey('Regeneration 1','effect'),'effect:regeneration');
  assert.equal(wikiIconKey('Darkness','immunity'),'effect:darkness');
  assert.equal(wikiIconKey('Durability'),'stats');
  assert.equal(wikiIconKey('Damage reduction'),'damage_reduction');
  assert.equal(wikiIconKey('Dragon heart grants regeneration','effect'),null);
  assert.equal(wikiIconKey('Bloodbound Strength','effect'),null);
  assert.equal(wikiIconKey('Unknown new property'),null);
});

test('vanilla synchronization copies original bytes and preserves committed assets without local sources',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'wiki-icons-'));
  try {
    const source=path.join(root,'source','resource_pack','textures','ui');
    const target=path.join(root,'site','static','img','wiki','ui','effects');
    fs.mkdirSync(source,{recursive:true});
    const original=fs.readFileSync(path.join(site,'static',WIKI_UI_ICONS['effect:regeneration']));
    for(const name of VANILLA_EFFECT_NAMES) fs.writeFileSync(path.join(source,`${name}_effect.png`),original);
    syncVanillaUiIcons({sourceRoot:path.join(root,'source'),siteRoot:path.join(root,'site')});
    assert.deepEqual(fs.readFileSync(path.join(target,'regeneration.png')),original);
    syncVanillaUiIcons({sourceRoot:path.join(root,'absent'),siteRoot:path.join(root,'site')});
    assert.deepEqual(fs.readFileSync(path.join(target,'regeneration.png')),original);
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
