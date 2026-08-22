import originDefinitions from './recipeOrigins.json';

// Recipe provenance is intentionally shared by every generated catalog. A
// recipe can be consumed through UtilityCraft's common stations while still
// belonging to the extension that registered it. The generator reads the
// same JSON definition directly, avoiding Node's package-module warning.
export const RECIPE_ORIGINS = Object.freeze(Object.fromEntries(
  Object.entries(originDefinitions).map(([id, origin]) => [id, Object.freeze({...origin})]),
));

export function recipeOriginFor(origin) {
  const id = typeof origin === 'string' ? origin : origin?.id;
  const known = RECIPE_ORIGINS[id];
  if (known) return {...known};

  return {
    id: id ?? 'unknown',
    label: origin?.label ?? 'Unknown source',
    accent: origin?.accent ?? '#94a3b8',
    category: origin?.category ?? origin?.label ?? 'Unknown source',
  };
}
