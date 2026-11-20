const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const babel = require('@babel/core');
const sourceRoot = path.resolve(__dirname, '../src') + path.sep;
const originalLoader = require.extensions['.js'];
// The adapters use extensionless ES module imports, like the webpack build.
require.extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(sourceRoot)) return originalLoader(module, filename);
  const {code} = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false, configFile: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  });
  module._compile(code, filename);
};
const {wikiProjects, getWikiProject} = require('../src/wiki/projects');
const {isResource, resourceOrigin, transportDocumentation} = require('../src/wiki/editorialContent');
const {wikiText, translatePresentation, copy} = require('../src/i18n/wiki');

test('current Ascendant steam and alchemy recipes retain their resource costs and restrictions', () => {
  const project = wikiProjects['ascendant-technology'];
  for (const id of ['alchemical_station', 'steam_boiler', 'vaporizer', 'network_center']) {
    assert.ok(project.machines.some((machine) => machine.id === id), id);
  }
  const boiler = project.processingRecipes.find((recipe) => recipe.station === 'steam_boiler');
  assert.equal(boiler.inputFluid.type, 'water');
  assert.equal(boiler.outputGas.amount, 1000);
  assert.equal(boiler.ticks, 160);
  assert.equal(boiler.cost, 2400);
  const cryofluid = project.processingRecipes.find((recipe) => recipe.station === 'vaporizer' && recipe.inputFluid?.type === 'cryofluid');
  assert.equal(cryofluid.outputGas.amount, 3000);
  assert.equal(cryofluid.ticks, 80);
  const alchemy = project.processingRecipes.filter((recipe) => recipe.station === 'alchemical_station');
  assert.ok(alchemy.some((recipe) => recipe.recipeKind === 'brewing' && recipe.fluid.type === 'blaze_essence'));
  assert.ok(alchemy.some((recipe) => recipe.category === 'Alchemical amplify' && recipe.fluid.amount === 1000));
  assert.ok(alchemy.some((recipe) => recipe.category === 'Alchemical extend' && recipe.fluid.amount === 750));
  assert.equal(alchemy.some((recipe) => recipe.category === 'Alchemical extend' && /extend-(healing|harming|saturation)-/.test(recipe.id)), false);
  const lingeringHaste = project.allItems.find((entry) => entry.id === 'utilitycraft:alchemical_haste_1_normal_lingering');
  assert.equal(lingeringHaste.documentation.statistics.find(([label]) => label === 'Effect duration')[1], '45 s');
  for (const locale of ['pt-BR', 'es-MX']) {
    const localized = getWikiProject(project.id, locale);
    for (const id of ['alchemical_station', 'steam_boiler', 'vaporizer', 'network_center']) {
      assert.notEqual(localized.machines.find((machine) => machine.id === id).description,
        project.machines.find((machine) => machine.id === id).description, `${locale}: ${id}`);
    }
  }
});

test('Heavy Machinery uses current source entries while retaining existing URLs and nuclear recovery outputs', () => {
  const project = wikiProjects['heavy-machinery'];
  assert.ok(project.items.some((entry) => entry.slug === 'utility_exo_boots'));
  assert.ok(project.items.some((entry) => entry.id === 'utilitycraft:stabilized_nuclear_matter'));
  assert.equal(project.items.some((entry) => entry.id === 'utilitycraft:saline_coolant_bucket'), false);
  assert.equal(project.blocks.some((entry) => entry.id === 'utilitycraft:fluid_controller'), false);
  assert.ok(project.machines.some((entry) => entry.id === 'reinforced_induction_anvil'));
  assert.ok(project.generators.some((entry) => entry.id === 'combustion-chamber'));
  const recovery = project.processingRecipes.find((recipe) => recipe.station === 'chemical-processor'
    && recipe.result.id === 'utilitycraft:spent_uranium_pellet');
  assert.equal(recovery.cost, 32000000);
  assert.equal(recovery.outputGas, undefined, 'nuclear recovery has no gas byproduct');
  assert.equal(project.allItems.find((entry) => entry.id === 'utilitycraft:utility_exo_boots')
    .documentation.properties.find(([label]) => label === 'Durability')[1], '10,200');
});

test('Primitive Forge tutorial is localized without changing navigation or assets', () => {
  const original = getWikiProject('utilitycraft', 'en').howToPlay.pages.find(({id}) => id === 'primitive-forge');
  assert.ok(original);
  for (const locale of ['pt-BR', 'es-MX']) {
    const localized = getWikiProject('utilitycraft', locale).howToPlay.pages.find(({id}) => id === original.id);
    assert.notEqual(localized.title, original.title);
    assert.notEqual(localized.intro, original.intro);
    assert.equal(localized.hero, original.hero);
    localized.sections.forEach((section, index) => {
      const source = original.sections[index];
      assert.notEqual(section.title, source.title);
      for (const key of ['paragraphs', 'steps']) {
        section[key]?.forEach((text, i) => assert.notEqual(text, source[key][i], `${locale}: ${text}`));
      }
      section.links?.forEach((link, i) => {
        assert.equal(link.href, source.links[i].href);
        assert.notEqual(link.label, source.links[i].label);
      });
    });
  }
});

test('resource acquisition descriptions exist in all supported languages', () => {
  assert.equal(isResource({id: 'dorios:abyssal_essence', documentation: {basic: {itemType: 'Equippable trinket'}}}), false);
  let count = 0;
  for (const project of Object.values(wikiProjects)) {
    for (const entry of (project.allItems ?? project.items ?? []).filter(isResource)) {
      const descriptions = ['en', 'pt-BR', 'es-MX'].map((locale) => resourceOrigin(entry, project, locale, () => null));
      assert.ok(descriptions.every((text) => text?.length > 35), `${project.id}: ${entry.id}`);
      assert.equal(new Set(descriptions).size, 3, `${entry.id}: English fallback`);
      count += 1;
    }
  }
  assert.ok(count > 100);
});

test('localization preserves identifiers, public paths, recipe keys and original data', () => {
  const original = wikiProjects['ascendant-technology'];
  const originalItem = original.items.find((entry) => entry.identifier === 'utilitycraft:aetherium_crystal');
  const description = originalItem.documentation.description;
  const pt = getWikiProject(original.id, 'pt-BR');
  const item = pt.items.find((entry) => entry.id === originalItem.id);
  assert.equal(item.slug, originalItem.slug);
  assert.equal(pt.basePath, original.basePath);
  assert.equal(originalItem.documentation.description, description);
  assert.match(item.documentation.description, /Encontrado ao minerar/);
  assert.match(item.documentation.primarySources[0].description, /Minere Aetherium/);
  assert.deepEqual(item.documentation.primarySources[0].recipe, originalItem.documentation.primarySources[0].recipe);
  assert.equal(getWikiProject(original.id, 'pt-BR'), pt);
  assert.notEqual(getWikiProject(original.id, 'es-MX'), pt);
});

test('transport direction, filters and throughput distinguish exporters, importers and hoppers', () => {
  const project = {id: 'utilitycraft'};
  const doc = (id) => transportDocumentation({id: `utilitycraft:${id}`}, project, 'en');
  assert.match(doc('item_exporter').description, /Extracts.*source/);
  assert.match(doc('item_importer').description, /destination.*exporter performs/);
  const exporter = JSON.stringify(doc('item_exporter'));
  assert.match(exporter, /128 items\/s/);
  assert.match(exporter, /640 items\/s/);
  assert.match(exporter, /empty whitelist blocks exports/);
  assert.match(JSON.stringify(doc('item_importer')), /empty importer item list accepts all items/);
  assert.match(JSON.stringify(doc('mechanic_hopper')), /stack attempts\/s/);
  assert.match(JSON.stringify(doc('ender_hopper')), /up to 11/);
  assert.equal(doc('steel_block'), null);
});

test('conveyors and digital buffers expose their own transport rules', () => {
  const universal = transportDocumentation({id: 'utilitycraft:universal_exporter'}, {id: 'ascendant-technology'}, 'pt-BR');
  assert.match(JSON.stringify(universal), /640 itens\/s/);
  assert.match(JSON.stringify(universal), /4.000 mB por ciclo/);
  assert.match(JSON.stringify(universal), /Conexão de energia/);
  const conveyor = transportDocumentation({id: 'utilitycraft:titanium_conveyor_bridge_transmitter'}, {id: 'ascendant-technology'}, 'pt-BR');
  assert.match(JSON.stringify(conveyor), /2 blocos\/s/);
  assert.match(JSON.stringify(conveyor), /Até 16 blocos/);
  const sorter = transportDocumentation({id: 'utilitycraft:conveyor_sorter'}, {id: 'ascendant-technology'}, 'es-MX');
  assert.match(sorter.description, /al frente/);
  const buffer = transportDocumentation({id: 'utilitycraft:export_buffer'}, {id: 'digital-storage'}, 'pt-BR');
  assert.match(JSON.stringify(buffer), /Nove slots de amostra/);
  assert.match(JSON.stringify(buffer), /2–18 operações de pilha\/s/);
  const entry = getWikiProject('digital-storage', 'pt-BR').machines.find((machine) => machine.id === 'export_buffer');
  assert.equal(entry.transport.title, 'Funcionamento do transporte');
  assert.equal(entry.description, entry.transport.copy);
  for (const project of Object.values(wikiProjects)) {
    for (const block of (project.allBlocks ?? project.blocks ?? []).filter((entry) => /(?:item|universal)_(?:importer|exporter)|(?:mechanic|ender)_hopper|mechanic_(?:upper|dropper)|(?:import|export)_buffer/.test(entry.identifier ?? entry.id))) {
      assert.ok(transportDocumentation(block, project, 'pt-BR'), block.id);
    }
  }
});

test('editorial translation leaves semantic fields stable and translates supported copy', () => {
  const source = {id: 'properties', type: 'Item', category: 'Materials', title: 'Properties', facts: [['Durability', 1000]], recipe: {station: 'crusher'}};
  assert.deepEqual(translatePresentation(source, 'pt-BR'), {...source, title: 'Propriedades', facts: [['Durabilidade', 1000]]});
  assert.equal(wikiText('pt-BR', '3 additional documented recipes and conversions.'), '3 receitas e conversões adicionais documentadas.');
  assert.equal(wikiText('es-MX', '20% chance'), '20% de probabilidad');
  for (const [key, translations] of Object.entries(copy)) assert.ok(translations.length === 2 && translations.every((value) => typeof value === 'string'), key);
});
