import ascendantTechnology from './ascendant-technology';
import generatedProjects from './generatedProjects';
import heavyMachinery from './heavy-machinery';
import utilitycraft from './utilitycraft';

const projects = {
  [ascendantTechnology.id]: ascendantTechnology,
  [heavyMachinery.id]: heavyMachinery,
  [utilitycraft.id]: utilitycraft,
  ...generatedProjects,
};

function catalogSource(value) {
  const source = typeof value === 'object' && value !== null
    ? value.id ?? value.identifier ?? value.label ?? value.name ?? ''
    : value;
  return String(source).replace(/^\d+×\s*/, '').trim();
}

function globalEntriesFor(project, entries, entryType) {
  return (entries ?? []).map((entry) => ({
    ...entry,
    assetRoot: entry.assetRoot ?? project.assetRoot,
    basePath: entry.basePath ?? project.basePath,
    entryType: entry.entryType ?? entryType,
  }));
}

function globalBlockEntriesFor(project) {
  const machinesByBlock = new Map((project.machines ?? []).map((machine) => [machine.blockSlug ?? machine.id, machine]));
  const generatorsByBlock = new Map((project.generators ?? []).map((generator) => [generator.blockSlug ?? generator.id, generator]));
  return (project.allBlocks ?? project.blocks ?? []).map((entry) => {
    const machine = machinesByBlock.get(entry.slug) ?? machinesByBlock.get(entry.shortId);
    const generator = generatorsByBlock.get(entry.slug) ?? generatorsByBlock.get(entry.shortId);
    const entryType = machine ? 'machines' : generator ? 'generators' : (entry.entryType ?? 'blocks');
    return {
      ...entry,
      assetRoot: entry.assetRoot ?? project.assetRoot,
      basePath: entry.basePath ?? project.basePath,
      entryType,
      catalogSlug: entry.catalogSlug ?? (entryType === 'blocks' ? entry.slug : (machine ?? generator)?.id ?? entry.shortId ?? entry.slug),
    };
  });
}

// Recipes are shared by several official add-ons, while their textures are
// stored with the project that owns the item or block. This library is the
// canonical cross-project lookup for recipe slots and detail links.
const globalCatalogEntries = Object.values(projects).flatMap((project) => [
  ...globalEntriesFor(project, project.allItems ?? project.items, 'items'),
  ...globalBlockEntriesFor(project),
]);

export function findGlobalCatalogEntry(value) {
  const identifier = catalogSource(value);
  if (!identifier) return null;
  const normalizedName = identifier.replace(/\s+\([^)]*\).*$/, '').trim().toLowerCase();
  return globalCatalogEntries.find((entry) => (
    entry.id === identifier || entry.identifier === identifier || entry.shortId === identifier
  )) ?? globalCatalogEntries.find((entry) => entry.name?.toLowerCase() === normalizedName) ?? null;
}

export function getWikiProject(projectId) {
  const project = projects[projectId];
  if (!project) throw new Error(`Unknown wiki project: ${projectId}`);
  return project;
}

export {projects as wikiProjects};
