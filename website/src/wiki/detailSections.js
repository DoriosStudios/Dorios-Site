// Shared by the route generator and React: every sector is a static page, so
// direct links and refreshes render the requested content before hydration.
const DETAIL_SECTIONS = {
  items: ['details', 'specs', 'recipes', 'drops', 'uses', 'related', 'notes'],
  blocks: ['details', 'specs', 'recipes', 'drops', 'locations', 'modifiers', 'sieving'],
  machines: ['details', 'specs', 'recipes', 'drops'],
  generators: ['details', 'specs', 'recipes'],
};

function sectionsForEntry(entryType) {
  return DETAIL_SECTIONS[entryType] ?? ['details'];
}

function detailSectionPath(basePath, section = 'details') {
  const base = basePath.replace(/\/$/, '');
  return section === 'details' ? base : `${base}/${section}`;
}

function legacyDetailSection(entryType, hash) {
  let value;
  try { value = decodeURIComponent(String(hash ?? '').replace(/^#/, '')); }
  catch { return null; }
  // The old machine tab called "drops" actually contained recipes.
  if (entryType === 'machines' && value === 'drops') return 'recipes';
  const aliases = {
    'item-properties': 'specs', 'item-capabilities': 'specs', 'item-obtain': 'recipes',
    'item-main-uses': 'uses', 'item-related': 'related', 'item-trivia': 'notes',
    'item-usage': 'details',
  };
  const section = aliases[value] ?? value;
  return sectionsForEntry(entryType).includes(section) ? section : null;
}

module.exports = {sectionsForEntry, detailSectionPath, legacyDetailSection};
