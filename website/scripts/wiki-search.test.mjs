import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {searchWikiIndex, searchWikiProjects} from '../src/wiki/search.mjs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

import {containerSearchProject, containersById} from '../src/components/BetterContainersWiki/model.mjs';

const require = createRequire(import.meta.url);

const project = {
  id: 'demo', name: 'Demo', basePath: '/wiki/demo', wikiSections: [{id: 'machines', icon: 'tool'}],
  machines: [{id: 'catalyst_weaver', name: 'Catalyst Weaver', blockSlug: 'catalyst-weaver'}],
  blocks: [{id: 'demo:catalyst_weaver', slug: 'catalyst-weaver', name: 'Catalyst Device'}],
  items: [{id: 'demo:catalyst', slug: 'catalyst-item', name: 'Catalyst',
    variants: [{id: 'demo:expert_catalyst', name: 'Expert Catalyst'}]}],
  mechanics: [{name: 'Catalyst Basics'}],
};

test('search ranks exact names and opens the canonical route for machine blocks', () => {
  const results = searchWikiProjects([project], ' catalyst ');
  assert.deepEqual(results.map(result => result.href), [
    '/wiki/demo/items/catalyst-item', '/wiki/demo/machines/catalyst_weaver', '/wiki/demo/mechanics/catalyst-basics',
  ]);
  assert.equal(results[1].icon, 'tool');
  assert.equal(searchWikiProjects([project], 'c').length, 0);
  assert.equal(searchWikiProjects([project], 'catalyst', 1).length, 1);
  assert.equal(searchWikiProjects([project], 'demo:catalyst')[0].type, 'items');
  assert.equal(searchWikiProjects([project], 'catalyst device')[0].href, '/wiki/demo/machines/catalyst_weaver');
});

test('search opens a matched variant and groups broad searches by family', () => {
  const [result] = searchWikiProjects([project], 'expert catalyst');
  assert.equal(result.href, '/wiki/demo/items/catalyst-item?variant=demo%3Aexpert_catalyst');
  assert.equal(searchWikiProjects([project], 'catalyst').filter(entry => entry.type === 'items').length, 1);
});

test('localized container search opens the copper drawer and matches accented names', () => {
  const containers = containerSearchProject('pt-BR');
  const [result] = searchWikiProjects([containers], 'gaveta de cobre');
  assert.equal(result.href, '/wiki/better-containers/drawers/copper-drawer');
  assert.deepEqual(searchWikiProjects([containers], 'baú de ferro'), searchWikiProjects([containers], 'bau de ferro'));
  const copper = containersById.get('better_containers:copper_drawer');
  assert.deepEqual(copper.capacity, {types: 1, stacks: 32});
  assert.deepEqual(copper.recipe.slots, Array.from({length: 9}, (_, i) =>
    i === 4 ? 'better_containers:drawer' : 'minecraft:copper_ingot'));
  assert.ok(fs.existsSync(new URL('../static' + copper.image, import.meta.url)));
});

test('generated search indexes preserve localized names and direct links without page content', async () => {
  const {loadFreshModule} = require('@docusaurus/utils');
  const {buildGlobalWikiSearchIndex} = await loadFreshModule(
    fileURLToPath(new URL('../src/wiki/buildSearchIndex.js', import.meta.url)),
  );
  const basePath = '/wiki/better-containers/drawers/copper-drawer';
  for (const [locale, drawer] of [['en', 'copper drawer'], ['pt-BR', 'gaveta de cobre'], ['es-MX', 'cajon de cobre']]) {
    const index = JSON.parse(JSON.stringify(buildGlobalWikiSearchIndex(locale)));
    assert.equal(searchWikiIndex(index, drawer)[0].href, basePath);
    assert.equal(searchWikiIndex(index, 'expert storage cell')[0].href,
      '/wiki/digital-storage/items/storage-cell?variant=utilitycraft%3Aexpert_storage_cell');
    assert.ok(index.flatMap(project => project.entries)
      .every(entry => Object.keys(entry).every(key => ['name', 'type', 'href', 'title', 'familyHref', 'keys', 'category'].includes(key))));
  }
  const index = buildGlobalWikiSearchIndex('pt-BR');
  assert.equal(searchWikiIndex(index.filter(project => project.id === 'trees'), 'muda de redstone')[0].href,
    '/wiki/trees/how-to-play#crafting-ore-saplings');
});
