export const SHAPES = ['block', 'slab', 'stairs', 'vertical_slab', 'wall', 'carpet'];
export const PRESETS = ['everything', 'full_blocks', 'tools_only', 'wood_only', 'stone_only', 'colored_only'];
export const CATEGORIES = ['all', 'stone', 'wood', 'colored', 'nature', 'tools'];

export const familySelection = (family, enabled = true) => ({enabled,
  variants: family.variants.map(value => value.id), shapes: [...family.shapes], colors: family.colors.map(value => value.id)});

export function defaultSelection(catalog, enabled = true) {
  return {families: Object.fromEntries(catalog.families.map(family => [family.id, familySelection(family, enabled)])),
    tools: enabled ? catalog.tools.map(tool => tool.id) : []};
}

export function familyCategory(family) {
  if (family.id.endsWith('_wood')) return 'wood';
  if (['glass', 'concrete', 'wool', 'terracotta'].includes(family.id)
    || family.colors.some(color => color.id !== 'none')) return 'colored';
  if (['grass', 'dirt', 'nature'].includes(family.id)) return 'nature';
  return 'stone';
}

export function selectedRecords(catalog, selection) {
  return catalog.records.filter(record => {
    if (record.kind === 'tool') return selection.tools.includes(record.tool);
    const family = selection.families[record.family];
    return record.kind === 'block' && family?.enabled && family.variants.includes(record.variant)
      && family.shapes.includes(record.shape) && family.colors.includes(record.color);
  });
}

// Reset all dimensions; a previous partial or empty selection cannot leak in.
export function fullBlockSelection(catalog, family) {
  const blocks = catalog.records.filter(record => record.kind === 'block'
    && record.family === family.id && record.shape === 'block');
  if (!blocks.length) return {...familySelection(family, false), shapes: []};
  return {enabled: blocks.length > 0, shapes: blocks.length ? ['block'] : [],
    variants: [...new Set(blocks.map(record => record.variant))],
    colors: [...new Set(blocks.map(record => record.color))]};
}

export function applyPreset(catalog, preset) {
  if (preset === 'everything') return defaultSelection(catalog);
  const selection = defaultSelection(catalog, false);
  if (preset === 'tools_only') selection.tools = catalog.tools.map(tool => tool.id);
  for (const family of catalog.families) {
    if (preset === 'full_blocks') selection.families[family.id] = fullBlockSelection(catalog, family);
    else if (familyCategory(family) === {wood_only: 'wood', stone_only: 'stone', colored_only: 'colored'}[preset]) {
      selection.families[family.id] = familySelection(family);
    }
  }
  return selection;
}

export const selectionKey = (catalog, selection) => selectedRecords(catalog, selection)
  .map(record => record.id).sort().join('\n');

export const toggle = (values, value) => values.includes(value)
  ? values.filter(entry => entry !== value) : [...values, value];

export const nameOf = (value, locale) => value.labels[locale] ?? value.labels.en;
