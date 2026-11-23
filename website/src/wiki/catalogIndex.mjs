// Preserve the catalog's first-match precedence, including aliases shared by
// several projects. IDs always take precedence over presentation names.
export function createCatalogIndex(entries) {
  const ids = new Map();
  const names = new Map();
  for (const entry of entries) {
    for (const id of [entry.id, entry.identifier, entry.shortId]) {
      if (typeof id === 'string' && !ids.has(id)) ids.set(id, entry);
    }
    const name = entry.name?.toLowerCase();
    if (name !== undefined && !names.has(name)) names.set(name, entry);
  }
  return identifier => ids.get(identifier) ?? names.get(identifier.replace(/\s+\([^)]*\).*$/, '').trim().toLowerCase()) ?? null;
}

const projectIndexes = new WeakMap();
export function findLocalCatalogEntry(project, identifier) {
  let find = projectIndexes.get(project);
  if (!find) {
    find = createCatalogIndex([
      ...(project.lookupItems ?? project.allItems ?? project.items ?? []),
      ...(project.lookupBlocks ?? project.blocks ?? []),
    ]);
    projectIndexes.set(project, find);
  }
  return find(identifier);
}
