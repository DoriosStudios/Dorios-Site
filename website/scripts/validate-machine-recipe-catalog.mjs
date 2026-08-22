import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, '..');
const projectsRoot = path.join(siteRoot, 'src', 'wiki', 'projects');

const catalogPaths = Object.freeze({
  utilitycraft: path.join(projectsRoot, 'utilitycraft', 'processingRecipes.json'),
  'ascendant-technology': path.join(projectsRoot, 'ascendant-technology', 'processingRecipes.json'),
  'heavy-machinery': path.join(projectsRoot, 'heavy-machinery', 'processingRecipes.json'),
});

function fail(message) {
  process.stderr.write(`Machine recipe catalog validation failed: ${message}\n`);
  process.exitCode = 1;
}

function loadCatalog(id, filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`${id} catalog is missing at ${path.relative(siteRoot, filePath)}. Run generate:utilitycraft-machine-recipes first.`);
    return [];
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(parsed)) {
      fail(`${id} catalog must contain an array.`);
      return [];
    }
    return parsed;
  } catch (error) {
    fail(`${id} catalog is not valid JSON (${error.message}).`);
    return [];
  }
}

function validIngredient(value) {
  return Boolean(value && typeof value === 'object' && (typeof value.id === 'string' || typeof value.label === 'string'));
}

function validateRecipe(catalogId, recipe, index, seen) {
  const label = `${catalogId}[${index}]`;
  if (!recipe || typeof recipe !== 'object') {
    fail(`${label} must be an object.`);
    return;
  }
  if (typeof recipe.id !== 'string' || !recipe.id) fail(`${label} is missing a stable id.`);
  else if (seen.has(recipe.id)) fail(`${catalogId} contains duplicate recipe id '${recipe.id}'.`);
  else seen.add(recipe.id);
  if (typeof recipe.identifier !== 'string' || !recipe.identifier) fail(`${label} is missing an identifier.`);
  if (typeof recipe.station !== 'string' || !recipe.station) fail(`${label} is missing its machine station.`);

  const origin = recipe.origin;
  if (!origin || typeof origin !== 'object' || typeof origin.id !== 'string') {
    fail(`${label} is missing recipe.origin.id.`);
  } else if (!origin.label || !origin.accent || !origin.category) {
    fail(`${label} origin must include label, accent, and category for the visual provenance card.`);
  }

  const hasResult = validIngredient(recipe.result)
    || (Array.isArray(recipe.results) && recipe.results.some(validIngredient))
    || (Array.isArray(recipe.drops) && recipe.drops.some(validIngredient));
  if (!hasResult) fail(`${label} has no result, results, or drops.`);
}

const catalogs = Object.fromEntries(Object.entries(catalogPaths).map(([id, filePath]) => [id, loadCatalog(id, filePath)]));

for (const [catalogId, recipes] of Object.entries(catalogs)) {
  const seen = new Set();
  recipes.forEach((recipe, index) => validateRecipe(catalogId, recipe, index, seen));
}

const coreOrigins = new Set(catalogs.utilitycraft.map((recipe) => recipe.origin?.id));
for (const origin of ['utilitycraft', 'ascendant-technology', 'heavy-machinery']) {
  if (!coreOrigins.has(origin)) fail(`UtilityCraft's merged catalog is missing ${origin} recipes.`);
}

if (!catalogs.utilitycraft.some((recipe) => recipe.station === 'crusher' && recipe.origin?.id === 'ascendant-technology')) {
  fail('UtilityCraft must expose Ascendant Technology Crusher additions with their original provenance.');
}
if (!catalogs.utilitycraft.some((recipe) => recipe.station === 'crusher' && recipe.origin?.id === 'heavy-machinery')) {
  fail('UtilityCraft must expose Heavy Machinery Crusher additions with their original provenance.');
}

if (!process.exitCode) {
  const summary = Object.entries(catalogs).map(([id, recipes]) => `${id}: ${recipes.length}`).join(', ');
  process.stdout.write(`Validated machine recipe catalogs (${summary}).\n`);
}
