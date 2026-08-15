import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const siteRoot = path.resolve(import.meta.dirname, '..');
const outputPath = path.join(siteRoot, 'src', 'wiki', 'projects', 'utilitycraft', 'processingRecipes.json');
const projectRoot = process.env.UTILITYCRAFT_PROJECT_PATH ?? path.join(
  os.homedir(),
  'AppData',
  'Local',
  'com.bridge.dev',
  'bridge',
  'projects',
  'UtilityCraft',
);
const recipesRoot = path.join(projectRoot, 'BP', 'scripts', 'config', 'recipes');

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function titleize(value) {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function objectLiteral(source, variable) {
  const declaration = source.indexOf(`const ${variable} =`);
  if (declaration < 0) throw new Error(`Could not find ${variable}.`);
  const start = source.indexOf('{', declaration);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (character === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (!escaped && character === quote) quote = null;
      escaped = !escaped && character === '\\';
      if (character !== '\\') escaped = false;
      continue;
    }
    if (character === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Could not close ${variable}.`);
}

function registeredObject(file, variable) {
  const source = fs.readFileSync(path.join(recipesRoot, file), 'utf8');
  const literal = objectLiteral(source, variable);
  return vm.runInNewContext(`(${literal})`, Object.create(null), {filename: file});
}

function recipe({station, category, input, result, cost, chance, note}) {
  const slots = Array.from({length: 9}, (_, index) => input[index] ?? null);
  const key = `${station}-${input.filter(Boolean).map((entry) => entry.id).join('-')}-${result.id}-${result.count ?? 1}-${chance ?? 'guaranteed'}-${note ?? ''}`;
  return {
    id: slugify(key),
    identifier: `utilitycraft:process/${slugify(station)}/${slugify(key)}`,
    type: 'machine',
    station,
    category,
    slotCount: input.length,
    slots,
    result,
    ...(cost ? {cost: `${cost.toLocaleString('en-US')} DE`} : {}),
    ...(chance ? {chance} : {}),
    ...(note ? {note} : {}),
    // Keep readable values for the recipe index and legacy linked-recipe helpers.
    input: input.map((entry) => `${entry.count > 1 ? `${entry.count}× ` : ''}${entry.id}`).join(' + '),
    output: `${result.count > 1 ? `${result.count}× ` : ''}${result.id}`,
  };
}

function isConcreteIdentifier(identifier) {
  return typeof identifier === 'string' && !/[{}]/.test(identifier);
}

function singleInputRecipes(file, variable, station, category) {
  const entries = registeredObject(file, variable);
  return Object.entries(entries).flatMap(([inputId, data]) => {
    if (!data.output || !isConcreteIdentifier(inputId) || !isConcreteIdentifier(data.output)) return [];
    return [recipe({
      station,
      category,
      input: [{id: inputId, count: data.required ?? 1}],
      result: {id: data.output, count: data.amount ?? 1},
      cost: data.cost,
    })];
  });
}

function infuserRecipes() {
  const entries = registeredObject('infuser.js', 'infuserRecipesRegister');
  return Object.entries(entries).flatMap(([key, data]) => {
    if (!data.output || !isConcreteIdentifier(data.output)) return [];
    const [catalyst, input] = key.split('|');
    if (!catalyst || !input || !isConcreteIdentifier(catalyst) || !isConcreteIdentifier(input)) return [];
    return [recipe({
      station: 'infuser',
      category: 'Infuser recipe',
      input: [
        {id: catalyst, count: data.required ?? 1},
        {id: input, count: data.input_required ?? 1},
      ],
      result: {id: data.output, count: data.amount ?? 1},
      cost: data.cost,
    })];
  });
}

function sieveRecipes() {
  const entries = registeredObject('sieve.js', 'sieveRecipesRegister');
  return Object.entries(entries).flatMap(([inputId, drops]) => (Array.isArray(drops) ? drops : [])
    .filter((drop) => isConcreteIdentifier(inputId) && isConcreteIdentifier(drop.item))
    .map((drop) => recipe({
    station: 'autosieve',
    category: `Auto Sieve loot${drop.chance ? ` · ${(drop.chance * 100).toLocaleString('en-US', {maximumFractionDigits: 2})}% chance` : ''}`,
    input: [{id: inputId, count: 1}],
    result: {id: drop.item, count: drop.amount ?? 1},
    chance: drop.chance,
    note: drop.tier === undefined ? undefined : `Mesh tier ${drop.tier}`,
    })));
}

if (!fs.existsSync(recipesRoot)) {
  process.stdout.write(`UtilityCraft recipe source was not found; preserving ${path.relative(siteRoot, outputPath)}.\n`);
  process.exit(0);
}

const recipes = [
  ...singleInputRecipes('crusher.js', 'crusherRecipesRegister', 'crusher', 'Crusher recipe'),
  ...infuserRecipes(),
  ...singleInputRecipes('press.js', 'pressRecipesRegister', 'electro_press', 'Electro Press recipe'),
  ...singleInputRecipes('furnace.js', 'furnaceRecipesRegister', 'incinerator', 'Incinerator recipe'),
  ...sieveRecipes(),
].sort((left, right) => left.identifier.localeCompare(right.identifier));

fs.writeFileSync(outputPath, `${JSON.stringify(recipes, null, 2)}\n`, 'utf8');
process.stdout.write(`Wrote ${recipes.length} UtilityCraft machine recipes to ${path.relative(siteRoot, outputPath)}.\n`);
