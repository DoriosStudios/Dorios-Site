const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const sourceRoot = path.resolve(__dirname, '../src') + path.sep;
const originalLoader = require.extensions['.js'];
require.extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(sourceRoot)) return originalLoader(module, filename);
  const {code} = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false, configFile: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  });
  module._compile(code, filename);
};
const {wikiProjects} = require('../src/wiki/projects');

test('every current Ascendant machine has concise localized gallery copy without changing detail data', async () => {
  const {machineCatalogDescription} = await import('../src/wiki/machineCatalog.mjs');
  const project = wikiProjects['ascendant-technology'];
  const before = JSON.stringify(project.machines);
  assert.equal(project.machines.length, 36);
  for (const machine of project.machines) {
    const translations = ['en', 'pt-BR', 'es-MX'].map(locale => machineCatalogDescription(project.id, machine, locale));
    assert.equal(new Set(translations).size, 3, machine.id);
    for (const text of translations) {
      assert.ok(text.length >= 15 && text.length <= 140, `${machine.id}: ${text}`);
      assert.ok(!/[\d_]|\w+:\w+|configured material interfaces|functionality as part/u.test(text), `${machine.id}: ${text}`);
      assert.equal(text.match(/[.!?](?:\s|$)/g)?.length, 1, `${machine.id}: one sentence`);
    }
  }
  assert.equal(JSON.stringify(project.machines), before);
});

test('summaries retain meaningful limitations and never leak across project namespaces', async () => {
  const {machineCatalogDescription, machineCategoryDescription} = await import('../src/wiki/machineCatalog.mjs');
  for (const locale of ['en', 'pt-BR', 'es-MX']) {
    assert.match(machineCatalogDescription('ascendant-technology', {id: 'singularity_fabricator'}, locale), /rework|reformula|rediseño/);
    for (const id of ['cryo_chamber', 'vaporworks_processor']) assert.match(machineCatalogDescription('ascendant-technology', {id}, locale), /Legacy|legad|heredad/);
    for (const category of ['Superior Machines', 'Unique Machines', 'Equipment Management Machines', 'Mob Grinding Machines', 'Utility']) {
      assert.ok(machineCategoryDescription('ascendant-technology', category, locale).length > 10);
    }
  }
  assert.equal(machineCatalogDescription('other', {id: 'steam_boiler', description: 'Performs another task. More details.'}), 'Performs another task.');
  assert.equal(machineCatalogDescription('ascendant-technology', {identifier: 'utilitycraft:steam_boiler'}, 'pt-BR'), 'Converte água em vapor.');
  assert.equal(machineCategoryDescription('other', 'Utility'), '');
});

test('unknown machine fallback keeps source copy and omits generic templates', async () => {
  const {machineCatalogDescription} = await import('../src/wiki/machineCatalog.mjs');
  assert.equal(machineCatalogDescription('new', null), '');
  assert.equal(machineCatalogDescription('new', {}), '');
  assert.equal(machineCatalogDescription('new', {description: 'Runs registered New Machine recipes using Dorios Energy and its configured material interfaces.'}), '');
  assert.equal(machineCatalogDescription('new', {description: 'Provides new machine functionality as part of a Dorios automation network.'}), '');
  assert.equal(machineCatalogDescription('new', {description: 'Consumes 1.5 units per cycle. Additional notes.'}), 'Consumes 1.5 units per cycle.');
  assert.equal(machineCatalogDescription('new', {description: 'A supplied sentence without punctuation'}), 'A supplied sentence without punctuation');
  assert.equal(machineCatalogDescription('ascendant-technology', {id: 'steam_boiler'}, 'fr'), 'Converts water into steam.');
});

test('gallery resource labels include configured fluids/gases without inventing unregistered interfaces',()=>{
 const {machineCatalogResources}=require('../src/wiki/machineCatalog.mjs');
 const weaver=wikiProjects['ascendant-technology'].machines.find(machine=>machine.id==='catalyst_weaver');
 assert.deepEqual(machineCatalogResources(weaver),['items','fluids']);
 assert.deepEqual(machineCatalogResources({productionType:'Other'}),[]);
 assert.deepEqual(machineCatalogResources({productionType:'Gas',machineData:{fluidCapacity:0}}),['gases']);
});
