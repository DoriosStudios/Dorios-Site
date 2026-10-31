import ascendantTechnology from './ascendant-technology';
import generatedProjects from './generatedProjects';
import heavyMachinery from './heavy-machinery';
import utilitycraft from './utilitycraft';
import localizedWikiNames from '../../i18n/wikiNames.generated.json';
import {translatePresentation, wikiText} from '../../i18n/wiki';
import {resourceOrigin, transportDocumentation} from '../editorialContent';

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

const nameMaps = new Map();
const localizedProjects = new WeakMap();
function localeNameMap(locale) {
  if (nameMaps.has(locale)) return nameMaps.get(locale);
  const localeProjects = localizedWikiNames.locales?.[locale] ?? {};
  const names = Object.values(localeProjects).reduce((result, project) => Object.assign(result, project.names), {});
  nameMaps.set(locale, names);
  return names;
}

function localizeEntry(entry, names, project, locale) {
  if (!entry) return entry;
  const localizedName = names[entry.identifier] ?? names[entry.id];
  const entries = project.allItems ?? project.items ?? [];
  const nameFor = (id) => names[id] ?? entries.find((candidate) => candidate.identifier === id || candidate.id === id)?.name
    ?? wikiText(locale, id.replace(/^.*:/, '').replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()));
  const origin = entry.entryType === 'items' || entries.includes(entry)
    ? resourceOrigin(entry, project, locale, nameFor) : null;
  const transport = transportDocumentation(entry, project, locale);
  const documentation = translatePresentation(entry.documentation ?? {}, locale);
  if (localizedName && entry.name && documentation.description) {
    documentation.description = documentation.description.replaceAll(entry.name, localizedName);
  }
  return {
    ...entry,
    name: localizedName ?? entry.name,
    description: origin ?? transport?.description ?? translatePresentation(entry.description, locale),
    documentation: entry.documentation || origin ? {
      ...documentation,
      ...(origin ? {description: origin} : {}),
    } : undefined,
    transport: transport?.section,
    blockDetails: translatePresentation(entry.blockDetails, locale),
    mining: translatePresentation(entry.mining, locale),
    variants: entry.variants?.map((variant) => ({
      ...variant,
      name: names[variant.identifier] ?? names[variant.id] ?? variant.name,
    })),
  };
}

export function localizeWikiProject(project, locale) {
  if (!project) return project;
  const cache = localizedProjects.get(project) ?? new Map();
  if (cache.has(locale)) return cache.get(locale);
  const names = localeNameMap(locale);
  const localizedBlocks = (project.allBlocks ?? project.blocks ?? []).map((entry) => localizeEntry(entry, names, project, locale));
  const blocksById = new Map(localizedBlocks.flatMap((entry) => [
    [entry.shortId, entry],
    [entry.slug, entry],
    [entry.identifier, entry],
  ]));
  const localizeMachine = (entry) => {
    const controller = blocksById.get(entry.blockSlug) ?? blocksById.get(entry.id);
    return {...entry, description: controller?.transport?.copy ?? translatePresentation(entry.description, locale), transport: controller?.transport,
      specifications: translatePresentation(entry.specifications, locale), io: translatePresentation(entry.io, locale),
      howItWorks: translatePresentation(entry.howItWorks, locale),
      name: controller?.name ?? names[entry.identifier] ?? entry.name, controller: controller?.name ?? entry.controller};
  };
  const localizeArray = (entries) => entries?.map((entry) => localizeEntry(entry, names, project, locale));
  const result = {
    ...project,
    locale,
    pageMeta: translatePresentation(project.pageMeta, locale),
    sectionDescriptions: translatePresentation(project.sectionDescriptions, locale),
    overview: translatePresentation(project.overview, locale),
    howToPlay: translatePresentation(project.howToPlay, locale),
    stationMeta: Object.fromEntries(Object.entries(project.stationMeta ?? {}).map(([id, station]) => [id, {...station,
      label: names[`utilitycraft:${id}`] ?? wikiText(locale, station.label),
    }])),
    mechanics: project.mechanics?.map((entry) => ({...entry, description: translatePresentation(entry.description, locale)})),
    items: localizeArray(project.items),
    allItems: localizeArray(project.allItems),
    lookupItems: localizeArray(project.lookupItems),
    allBlocks: localizedBlocks,
    blocks: localizeArray(project.blocks),
    lookupBlocks: localizeArray(project.lookupBlocks),
    entities: localizeArray(project.entities),
    machines: project.machines?.map(localizeMachine),
    generators: project.generators?.map(localizeMachine),
  };
  cache.set(locale, result);
  localizedProjects.set(project, cache);
  return result;
}

export function findGlobalCatalogEntry(value, locale = 'en') {
  const identifier = catalogSource(value);
  if (!identifier) return null;
  const normalizedName = identifier.replace(/\s+\([^)]*\).*$/, '').trim().toLowerCase();
  const entry = globalCatalogEntries.find((entry) => (
    entry.id === identifier || entry.identifier === identifier || entry.shortId === identifier
  )) ?? globalCatalogEntries.find((entry) => entry.name?.toLowerCase() === normalizedName) ?? null;
  if (!entry) return null;
  const names = localeNameMap(locale);
  return {...entry, name: names[entry.identifier] ?? names[entry.id] ?? entry.name};
}

export function getWikiProject(projectId, locale = 'en') {
  const project = projects[projectId];
  if (!project) throw new Error(`Unknown wiki project: ${projectId}`);
  return localizeWikiProject(project, locale);
}

export {projects as wikiProjects};
