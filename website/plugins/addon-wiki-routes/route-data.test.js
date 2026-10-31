const assert = require('node:assert/strict');
const {test} = require('node:test');
const {registerRoutes} = require('./route-data');
const plugin = require('./index');
const {detailSectionPath, legacyDetailSection, sectionsForEntry} = require('../../src/wiki/detailSections');

function recorder() {
  const data = new Map();
  const routes = [];
  return {
    data, routes,
    actions: {
      async createData(name, content) {
        assert.match(name, /^r\/[a-f0-9]{20}\.json$/);
        assert.equal(data.has(name), false, 'identical parameters should reuse a module');
        data.set(name, JSON.parse(content));
        return `/generated/${name}`;
      },
      addRoute(route) { routes.push(route); },
    },
  };
}

test('internal IDs are stable, shared across locales, and independent of the public URL', async () => {
  const props = {projectId: 'utilitycraft', entryType: 'recipes', slug: 'processing-'.repeat(30), detailSection: 'details'};
  const paths = ['/wiki/utilitycraft/recipes/long-readable-name', '/pt-BR/wiki/utilitycraft/recipes/long-readable-name'];
  const first = recorder();
  await registerRoutes(first.actions, paths.map((path) => ({path, component: 'entry.js', props})));
  assert.equal(first.data.size, 1);
  assert.deepEqual(first.routes.map(({path}) => path), paths);
  assert.equal(first.routes[0].modules.routeData, first.routes[1].modules.routeData);
  assert.ok(first.routes.every((route) => !('props' in route)));
  const second = recorder();
  await registerRoutes(second.actions, [{path: '/different-public-path', props}]);
  assert.deepEqual([...first.data.keys()], [...second.data.keys()]);
  assert.deepEqual([...first.data.values()][0], props);
});

test('sectors have distinct static paths and migrate old hashes explicitly', () => {
  const base = '/wiki/utilitycraft/machines/autosieve';
  assert.equal(detailSectionPath(base), base);
  assert.equal(detailSectionPath(`${base}/`, 'recipes'), `${base}/recipes`);
  assert.equal(legacyDetailSection('machines', '#drops'), 'recipes');
  assert.equal(legacyDetailSection('blocks', '#drops'), 'drops');
  assert.equal(legacyDetailSection('items', '#item-properties'), 'specs');
  assert.equal(legacyDetailSection('items', '#item-main-uses'), 'uses');
  assert.equal(legacyDetailSection('items', '#not-a-sector'), null);
  assert.equal(legacyDetailSection('items', '#%'), null);
  assert.ok(sectionsForEntry('machines').includes('recipes'));
});

test('the actual project catalogs generate direct sector pages using short internal modules', async () => {
  const recorded = recorder();
  await plugin({siteConfig: {baseUrl: '/pt-BR/'}}).contentLoaded({actions: recorded.actions});
  const byPath = new Map(recorded.routes.map((route) => [route.path.replace(/\/$/, ''), route]));
  assert.equal(byPath.size, recorded.routes.length, 'public routes must be unique');
  for (const section of ['specs', 'recipes', 'drops']) {
    const route = byPath.get(`/pt-BR/wiki/utilitycraft/machines/autosieve/${section}`);
    assert.ok(route, `missing Autosieve ${section} page`);
    const props = recorded.data.get(route.modules.routeData.replace('/generated/', ''));
    assert.equal(props.detailSection, section);
    assert.equal(props.projectId, 'utilitycraft');
    assert.equal(props.slug, 'autosieve');
  }
  assert.ok(byPath.has('/pt-BR/projects/utilitycraft'));
  assert.ok(byPath.has('/pt-BR/wiki/utilitycraft/how-to-play/primitive-forge'));
  assert.ok(recorded.routes.every((route) => !route.path.includes('#')));
  console.log(`${recorded.routes.length} public routes; ${recorded.data.size} short parameter modules`);
});
