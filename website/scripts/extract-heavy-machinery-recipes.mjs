import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const projectRoot = process.env.HEAVY_MACHINERY_PROJECT ?? path.join(
  os.homedir(),
  'AppData',
  'Local',
  'com.bridge.dev',
  'bridge',
  'projects',
  'UtilityCraft-Heavy-Machinery',
);
const recipesRoot = path.join(projectRoot, 'BP', 'recipes');

function walk(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : absolute.endsWith('.json') ? [absolute] : [];
  });
}

function categoryFrom(relativePath) {
  const parts = relativePath.split(path.sep);
  if (parts[0] === 'casings') return `${parts[1][0].toUpperCase()}${parts[1].slice(1)} casings`;
  if (parts[0] === 'controllers') return parts[1] === 'modules' ? 'Machine modules' : 'Controllers';
  const labels = {
    bronze: 'Bronze conversions',
    power_condensing_units: 'Condenser units',
    tin: 'Tin processing',
    uranium: 'Uranium processing',
  };
  return labels[parts[0]] ?? parts[0];
}

function normalizeRecipe(file) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const recipeKey = Object.keys(json).find((key) => key.startsWith('minecraft:recipe_'));
  const source = json[recipeKey];
  const shaped = recipeKey === 'minecraft:recipe_shaped';
  const relativePath = path.relative(recipesRoot, file);
  const category = categoryFrom(relativePath);
  const station = source.tags?.[0] ?? 'crafting_table';
  let slots;

  if (shaped) {
    slots = Array.from({length: 9}, (_, index) => {
      const row = source.pattern?.[Math.floor(index / 3)] ?? '';
      const symbol = row[index % 3] ?? ' ';
      const ingredient = source.key?.[symbol];
      if (!ingredient) return null;
      return {id: ingredient.item ?? ingredient.tag ?? 'unknown', count: ingredient.count ?? 1};
    });
  } else {
    slots = Array.from({length: 9}, (_, index) => {
      const ingredient = source.ingredients?.[index];
      if (!ingredient) return null;
      return {id: ingredient.item ?? ingredient.tag ?? 'unknown', count: ingredient.count ?? 1};
    });
  }

  const result = Array.isArray(source.result) ? source.result[0] : source.result;
  return {
    id: source.description.identifier.replace(/^utilitycraft:/, ''),
    identifier: source.description.identifier,
    category,
    station,
    kind: shaped ? 'shaped' : 'shapeless',
    slotCount: slots.filter(Boolean).length,
    slots,
    result: {id: result.item, count: result.count ?? 1},
  };
}

const recipes = walk(recipesRoot).map(normalizeRecipe).sort((a, b) => a.identifier.localeCompare(b.identifier));
process.stdout.write(`export const craftingRecipeDetails = ${JSON.stringify(recipes, null, 2)};\n`);
