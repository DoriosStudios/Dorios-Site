const entryTypes = ['machines', 'items', 'blocks', 'entities', 'generators', 'mechanics'];
const cache = new WeakMap();

function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function indexProject(project) {
  if (cache.has(project)) return cache.get(project);
  const entries = [];
  const icons = Object.fromEntries(project.wikiSections.map(({id, icon}) => [id, icon]));
  const specialized = new Map();
  for (const type of ['machines', 'generators']) {
    for (const entry of project[type] ?? []) {
      for (const key of [entry.blockSlug, entry.id, entry.identifier].filter(Boolean)) {
        specialized.set(key, entry);
      }
    }
  }
  const blockAliases = new Map();
  for (const block of project.blocks ?? []) {
    const target = specialized.get(block.slug) ?? specialized.get(block.shortId) ?? specialized.get(block.identifier);
    if (target) blockAliases.set(target, [...(blockAliases.get(target) ?? []), block.name, block.identifier]);
  }

  function add(type, entry, href, familyHref = href, aliases = []) {
    if (!href || !entry.name) return;
    const title = normalize(entry.name);
    const keys = [...new Set([entry.identifier, entry.id, ...aliases, ...(entry.aliases ?? [])].map(normalize))]
      .filter(key => key && key !== title);
    const category = normalize(entry.category);
    entries.push({
      name: entry.name, type, href, title,
      ...(familyHref !== href && {familyHref}),
      ...(keys.length > 0 && {keys}),
      ...(category && {category}),
    });
  }

  for (const type of entryTypes) {
    for (const entry of project[type] ?? []) {
      if (type === 'blocks' && [entry.slug, entry.shortId, entry.identifier]
        .some(key => specialized.has(key))) continue;
      const slug = type === 'machines' || type === 'generators' ? entry.id : type === 'mechanics'
        ? entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : entry.slug ?? entry.id;
      const href = entry.href ?? (slug ? project.basePath + '/' + type + '/' + slug : null);
      add(type, entry, href, href, blockAliases.get(entry));
      if (!href) continue;
      for (const variant of entry.variants ?? []) {
        const identifier = variant.identifier ?? variant.id;
        if (!identifier || identifier === (entry.identifier ?? entry.id)) continue;
        add(type, variant, variant.href ?? href + '?variant=' + encodeURIComponent(identifier), href);
      }
    }
  }
  for (const entry of project.searchEntries ?? []) add(entry.type, entry, entry.href);
  const index = {id: project.id, name: project.name, icons, entries};
  cache.set(project, index);
  return index;
}

export function createWikiSearchIndex(projects) {
  return projects.map(indexProject);
}

function score(entry, phrase, terms) {
  if (entry.title === phrase || entry.keys?.includes(phrase)) return 5;
  if (entry.title.startsWith(phrase)) return 4;
  if (entry.title.includes(phrase)) return 3;
  const titleWords = entry.title.split(' ');
  if (terms.every(term => titleWords.some(word => word.startsWith(term)))) return 2;
  return terms.every(term => entry.title.includes(term) || entry.category?.includes(term)
    || entry.keys?.some(key => key.includes(term))) ? 1 : 0;
}

function findResults(index, phrase, limit) {
  const terms = phrase.split(' ');
  const matches = Array.from({length: 5}, () => []);
  for (const project of index) {
    for (const entry of project.entries) {
      const rank = score(entry, phrase, terms);
      if (rank) matches[rank - 1].push({entry, project});
    }
  }
  const results = [];
  const families = new Set();
  for (const group of matches.reverse()) {
    for (const {entry, project} of group) {
      const key = project.id + ':' + (entry.familyHref ?? entry.href);
      if (families.has(key)) continue;
      families.add(key);
      const {name, type, href} = entry;
      results.push({name, type, href, project: project.name, projectId: project.id, icon: project.icons[type] ?? 'book'});
      if (results.length === limit) return results;
    }
  }
  return results;
}

export function searchWikiIndex(index, query, limit = 12) {
  const phrase = normalize(query);
  return phrase.length < 2 || limit < 1 ? [] : findResults(index, phrase, limit);
}

export function searchWikiProjects(projects, query, limit = 12) {
  const phrase = normalize(query);
  return phrase.length < 2 || limit < 1 ? [] : findResults(createWikiSearchIndex(projects), phrase, limit);
}
