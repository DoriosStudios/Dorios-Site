const {createHash} = require('node:crypto');
const path = require('node:path');

const groupComponent = path.join(__dirname, '../../src/components/GeneratedRouteGroup/index.js');

function groupWikiRoutes(routes) {
  const result = [];
  const projects = new Map();
  for (const route of routes) {
    const prefix = route.path.match(/^.*?\/wiki\/[^/]+(?=\/|$)/)?.[0];
    if (!prefix) {
      result.push(route);
      continue;
    }
    if (!projects.has(prefix)) projects.set(prefix, []);
    projects.get(prefix).push(route);
  }
  for (const [prefix, projectRoutes] of projects) {
    const sections = new Map();
    const children = [];
    for (const route of projectRoutes) {
      const section = route.path.slice(prefix.length).split('/')[1];
      if (!section) {
        children.push(route);
        continue;
      }
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section).push(route);
    }
    for (const [section, sectionRoutes] of sections) {
      if (sectionRoutes.length < 64) children.push(...sectionRoutes);
      else children.push({path: `${prefix}/${section}`, component: groupComponent, routes: sectionRoutes});
    }
    result.push({path: prefix, component: groupComponent, routes: children});
  }
  return result;
}

// Public URLs describe the content. Internal modules use stable IDs instead of
// repeating that hierarchy in a filename (which can exceed Windows path limits).
async function registerRoutes(actions, routes) {
  const dataById = new Map();
  const prepared = routes.map(({props = {}, ...route}) => {
    const data = JSON.stringify(props);
    const id = createHash('sha256').update(data).digest('hex').slice(0, 20);
    const existing = dataById.get(id);
    if (existing && existing.data !== data) throw new Error(`Route data ID collision: ${id}`);
    if (!existing) dataById.set(id, {data});
    return {route, id};
  });

  const entries = [...dataById.entries()];
  for (let offset = 0; offset < entries.length; offset += 32) {
    await Promise.all(entries.slice(offset, offset + 32).map(async ([id, record]) => {
      record.path = await actions.createData(`r/${id}.json`, record.data);
    }));
  }
  // Enter the matching wiki project/section before checking its individual
  // pages. A flat list makes every static render scan thousands of unrelated
  // paths and exceeds React Router's compiled-path cache.
  const registered = prepared.map(({route, id}) => ({
    ...route,
    modules: {...route.modules, routeData: dataById.get(id).path},
  }));
  groupWikiRoutes(registered).forEach(route => actions.addRoute(route));
}

module.exports = {registerRoutes};
