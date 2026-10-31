const {createHash} = require('node:crypto');

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
  prepared.forEach(({route, id}) => actions.addRoute({
    ...route,
    modules: {...route.modules, routeData: dataById.get(id).path},
  }));
}

module.exports = {registerRoutes};
