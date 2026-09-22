import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const siteRoot = path.resolve(import.meta.dirname, '..');
const addonRoot = process.env.BETTER_SMELTERS_PROJECT_PATH ?? path.join(
  os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects', 'Better-Smelters',
);
const blocksRoot = path.join(addonRoot, 'BP', 'blocks');
const configPath = path.join(addonRoot, 'BP', 'scripts', 'config.js');
const outputPath = path.join(siteRoot, 'src', 'wiki', 'projects', 'smelters', 'furnaceData.generated.json');

function stripJsonComments(source) {
  let output = '';
  let quote = null;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (quote) {
      output += character;
      if (!escaped && character === quote) quote = null;
      escaped = !escaped && character === '\\';
      if (character !== '\\') escaped = false;
      continue;
    }
    if (character === '"' || character === "'") { quote = character; output += character; continue; }
    if (character === '/' && next === '/') { while (index < source.length && source[index] !== '\n') index += 1; output += '\n'; continue; }
    if (character === '/' && next === '*') { index += 2; while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index += 1; index += 1; continue; }
    output += character;
  }
  return output;
}

function extractObject(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Could not find ${marker} in ${configPath}`);
  const objectStart = source.indexOf('{', start + marker.length);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = objectStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (!escaped && character === quote) quote = null;
      escaped = !escaped && character === '\\';
      if (character !== '\\') escaped = false;
      continue;
    }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(objectStart, index + 1);
    }
  }
  throw new Error(`Unclosed object for ${marker}`);
}

function parseFurnaceRecipes(source) {
  const clean = stripJsonComments(extractObject(source, 'export const furnaceRecipes ='));
  const entries = [...clean.matchAll(/"([^"]+)"\s*:\s*{\s*output\s*:\s*"([^"]+)"\s*,?\s*}/g)]
    .map((match) => [match[1], {output: match[2]}]);
  if (!entries.length) throw new Error(`No furnace recipes were parsed from ${configPath}`);
  return Object.fromEntries(entries);
}

function titleize(value) {
  return String(value).replace(/^.*:/, '').replace(/[_/-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactNumber(value, maximumFractionDigits = 2) {
  return Number(value).toLocaleString('en-US', {maximumFractionDigits});
}

function machineDescription(name, speed, efficiency, special) {
  const base = `${name} processes every registered Better Smelters furnace recipe at ${compactNumber(speed)}\u00d7 speed while using ${compactNumber(efficiency * 100)}% of the baseline fuel per unit of work.`;
  return special ? `${base} ${special}` : base;
}

function specialBehavior(id) {
  if (id === 'oak_wood_furnace') return 'While active, each two-tick work interval has a 1% chance to destroy the furnace and drop its inventory.';
  if (id === 'netherrack_furnace') return 'After a valid fuel item starts the furnace, its infinite-fuel setting prevents the stored burn value from being consumed.';
  if (id === 'nether_star_furnace') return 'When one cycle completes, it processes as much of the matching input stack as the output slot can accept.';
  return null;
}

function buildMachineProfile(file) {
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  const block = source['minecraft:block'];
  const identifier = block.description.identifier;
  const id = identifier.split(':')[1];
  const component = block.components['better_smelters:furnace'];
  if (!component) return null;
  const speed = Number(component.speed ?? 1);
  const efficiency = Number(component.efficiency ?? 1);
  const cycleTicks = 80 / speed;
  const coalYield = component.infinite ? 'Unlimited after one valid fuel item starts the furnace' : `${compactNumber(8 / efficiency)} items per coal-equivalent`;
  const special = specialBehavior(id);
  const name = titleize(id);
  return [id, {
    category: 'Furnaces',
    tier: titleize(id.replace(/_furnace$/, '')),
    recipe: 'better_smelters_furnace',
    description: machineDescription(name, speed, efficiency, special),
    baseConsumption: component.infinite ? 'One valid solid fuel to start; no further burn value consumed' : `${compactNumber(efficiency * 100)} work-fuel units per smelt`,
    energyCapacity: 'Not applicable',
    productionType: 'Item',
    input: 'One registered smelting input and one supported solid fuel',
    output: 'One smelted item per input, except Nether Star Furnace stack batches',
    primaryResource: component.infinite ? 'Ignition fuel' : 'Solid fuel',
    modules: [],
    specifications: [
      ['Processing speed', `${compactNumber(speed)}\u00d7`],
      ['Nominal cycle', `${compactNumber(cycleTicks)} ticks \u00b7 ${compactNumber(cycleTicks / 20, 3)} s`],
      ['Fuel use', component.infinite ? 'Infinite after ignition' : `${compactNumber(efficiency * 100)}% of baseline`],
      ['Coal-equivalent yield', coalYield],
      ['Inventory', '1 fuel slot \u00b7 1 input slot \u00b7 1 output slot'],
      ['Automated fuel', 'Pulled from the top; fuel slot is also exposed below'],
      ['Automated items', 'Input from the right side and output to the left side, relative to the furnace front'],
      special && ['Special behavior', special],
    ].filter(Boolean),
    howItWorks: [
      'Insert a registered smelting input and a supported solid fuel.',
      `The furnace completes a nominal cycle in ${compactNumber(cycleTicks)} ticks while its inventory can accept the result.`,
      'Collect the result manually or from the configured output side.',
    ],
    io: [
      ['Fuel input', 'Top or bottom'],
      ['Item input', 'Horizontal input sides; automatic pull uses the right side'],
      ['Item output', 'All exposed output sides; automatic push uses the left side'],
    ],
  }];
}

if (!fs.existsSync(blocksRoot) || !fs.existsSync(configPath)) {
  throw new Error(`Better Smelters source was not found at ${addonRoot}`);
}

const configSource = fs.readFileSync(configPath, 'utf8');
const furnaceRecipes = parseFurnaceRecipes(configSource);
const machineProfiles = Object.fromEntries(fs.readdirSync(blocksRoot)
  .filter((name) => name.endsWith('.json'))
  .map((name) => buildMachineProfile(path.join(blocksRoot, name)))
  .filter(Boolean)
  .sort(([left], [right]) => left.localeCompare(right)));

const processingRecipes = Object.entries(furnaceRecipes).map(([input, recipe]) => {
  const slug = input.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase();
  return {
    id: `better-smelters-furnace-${slug}`,
    identifier: `better_smelters:process/furnace/${slug}`,
    type: 'machine',
    station: 'better_smelters_furnace',
    category: 'Furnace recipes',
    recipeKind: 'processing',
    slotCount: 1,
    slots: [{id: input, count: 1}, null, null, null, null, null, null, null, null],
    inputs: [{id: input, count: 1}],
    result: {id: recipe.output, count: 1},
    results: [{id: recipe.output, count: 1}],
    output: `1\u00d7 ${recipe.output}`,
    input: `1\u00d7 ${input}`,
    origin: {id: 'smelters', label: 'Better Smelters', accent: '#d78c55', category: 'Base'},
    originId: 'smelters',
  };
});

fs.writeFileSync(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: 'Better-Smelters/BP',
  machineProfiles,
  processingRecipes,
}, null, 2)}\n`);

console.log(`[better-smelters-wiki] Generated ${Object.keys(machineProfiles).length} furnace profiles and ${processingRecipes.length} processing recipes.`);
