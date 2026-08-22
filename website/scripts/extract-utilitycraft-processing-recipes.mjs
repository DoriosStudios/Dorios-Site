import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const originDefinitionsPath = path.join(path.resolve(import.meta.dirname, '..'), 'src', 'wiki', 'recipeOrigins.json');
const recipeOrigins = JSON.parse(fs.readFileSync(originDefinitionsPath, 'utf8'));

function recipeOriginFor(origin) {
  const id = typeof origin === 'string' ? origin : origin?.id;
  const known = recipeOrigins[id];
  if (known) return {...known};

  return {
    id: id ?? 'unknown',
    label: origin?.label ?? 'Unknown source',
    accent: origin?.accent ?? '#94a3b8',
    category: origin?.category ?? origin?.label ?? 'Unknown source',
  };
}

// Recipe provenance is based on the add-on that registered a recipe, not on
// the namespace of its ingredients. Ascendant Technology and Heavy Machinery
// intentionally share UtilityCraft's namespace and common stations.
//
// Static catalogue policy:
// - Extract literal registries, declared loot tables, craft grids, fuel rules,
//   and materialized templates from the three add-ons below.
// - Keep loot and random/template operations visibly non-deterministic through
//   `recipeKind`, `drops`, and `conditions`; do not manufacture fixed output
//   recipes from them.
// - Runtime script-event registrations are intentionally not guessed. The
//   Duplicator accepts arbitrary eligible items subject to runtime exclusions,
//   while world harvest machines (for example Verdant Cultivator) expose their
//   configured targets and conditions rather than invented crop loot.
// - Ascendant's Arcane Enchanter, Disenchanter, Enchantment Station,
//   Reinforcement Anvil, Pattern Placer, Seismic Breaker, and Laser Barrier
//   operate on arbitrary item state or the world and therefore have no finite
//   static recipe catalogue. The Duplicator follows the same rule.
const siteRoot = path.resolve(import.meta.dirname, '..');
const projectRoots = {
  utilitycraft: process.env.UTILITYCRAFT_PROJECT_PATH ?? path.join(
    os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects', 'UtilityCraft',
  ),
  'ascendant-technology': process.env.ASCENDANT_TECHNOLOGY_PROJECT_PATH ?? path.join(
    os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects', 'Ascendant-Technology',
  ),
  'heavy-machinery': process.env.HEAVY_MACHINERY_PROJECT_PATH ?? process.env.HEAVY_MACHINERY_PROJECT ?? path.join(
    os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects', 'UtilityCraft-Heavy-Machinery',
  ),
};

const recipeRoots = {
  utilitycraft: path.join(projectRoots.utilitycraft, 'BP', 'scripts', 'config', 'recipes'),
  'ascendant-technology': path.join(projectRoots['ascendant-technology'], 'BP', 'scripts', 'config', 'recipes'),
  'heavy-machinery': path.join(projectRoots['heavy-machinery'], 'BP', 'scripts', 'config', 'recipes'),
};

const outputPaths = {
  utilitycraft: path.join(siteRoot, 'src', 'wiki', 'projects', 'utilitycraft', 'processingRecipes.json'),
  'ascendant-technology': path.join(siteRoot, 'src', 'wiki', 'projects', 'ascendant-technology', 'processingRecipes.json'),
  'heavy-machinery': path.join(siteRoot, 'src', 'wiki', 'projects', 'heavy-machinery', 'processingRecipes.json'),
};

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function titleize(value) {
  return String(value).replace(/^.*:/, '').replace(/[_/-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sourceFile(root, ...parts) {
  return path.join(root, ...parts);
}

function readSource(root, ...parts) {
  return fs.readFileSync(sourceFile(root, ...parts), 'utf8');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Extract the literal assigned to a named declaration. Registry modules are
// JavaScript because the game executes them, but their declarative tables can
// be safely evaluated in an isolated VM without loading Minecraft imports.
function literalFor(source, variable) {
  const declaration = new RegExp(`(?:^|[;\\n])\\s*(?:export\\s+)?(?:const|let|var)\\s+${escapeRegExp(variable)}\\s*=`, 'm').exec(source);
  if (!declaration) throw new Error(`Could not find declaration for ${variable}.`);

  let start = declaration.index + declaration[0].length;
  while (/\s/.test(source[start] ?? '')) start += 1;
  const firstLiteralCharacter = source.slice(start).search(/[\[{]/);
  if (firstLiteralCharacter < 0) throw new Error(`Could not find literal for ${variable}.`);
  start += firstLiteralCharacter;

  const stack = [];
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
    if (character === '{') stack.push('}');
    if (character === '[') stack.push(']');
    if (character === '}' || character === ']') {
      if (stack.at(-1) !== character) throw new Error(`Unbalanced literal while reading ${variable}.`);
      stack.pop();
      if (!stack.length) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Could not close literal for ${variable}.`);
}

function readLiteral(root, file, variable, context = {}) {
  const source = readSource(root, file);
  return vm.runInNewContext(`(${literalFor(source, variable)})`, {...context}, {
    filename: sourceFile(root, file),
  });
}

function isConcreteIdentifier(value) {
  return typeof value === 'string' && value.length > 0 && !/[{}]/.test(value);
}

function numberOr(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function positiveInteger(value, fallback = 1) {
  const numeric = Math.floor(numberOr(value, fallback));
  return numeric > 0 ? numeric : fallback;
}

function normalizedStack(value, fallbackId) {
  const source = typeof value === 'string' ? {id: value} : (value ?? {});
  const id = source.id ?? source.item ?? fallbackId;
  if (!isConcreteIdentifier(id)) return null;
  const amount = source.amount ?? (source.min !== undefined || source.max !== undefined
    ? [source.min ?? source.max, source.max ?? source.min]
    : source.count ?? 1);
  const stack = {id, count: 1};
  if (Array.isArray(amount)) {
    const min = Math.max(0, Math.floor(numberOr(amount[0], 0)));
    const max = Math.max(min, Math.floor(numberOr(amount[1], min)));
    stack.count = max;
    stack.min = min;
    stack.max = max;
  } else {
    stack.count = positiveInteger(amount, 1);
  }
  if (source.chance !== undefined) stack.chance = Math.max(0, Math.min(1, numberOr(source.chance, 1)));
  if (source.label) stack.label = source.label;
  if (source.unit) stack.unit = source.unit;
  if (source.resourceType) stack.resourceType = source.resourceType;
  if (source.resourceId) stack.resourceId = source.resourceId;
  return stack;
}

function resourceStack(resourceType, type, amount, label) {
  return {
    id: `${resourceType}:${type}`,
    label: label ?? titleize(type),
    count: positiveInteger(amount, 1),
    unit: 'mB',
    resourceType,
    resourceId: type,
  };
}

function stackLabel(stack) {
  if (!stack) return '';
  const amount = stack.min !== undefined && stack.max !== undefined
    ? `${stack.min}–${stack.max}× `
    : stack.count > 1 ? `${stack.count}× ` : '';
  const chance = stack.chance !== undefined && stack.chance < 1
    ? ` (${Math.round(stack.chance * 10000) / 100}%)`
    : '';
  return `${amount}${stack.label ?? stack.id}${chance}`;
}

function uniqueStacks(stacks) {
  const seen = new Set();
  return stacks.filter(Boolean).filter((stack) => {
    const key = `${stack.id}|${stack.count}|${stack.min ?? ''}|${stack.max ?? ''}|${stack.chance ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function machineRecipe({
  originId,
  station,
  category,
  key,
  recipeKind = 'processing',
  inputs = [],
  catalysts = [],
  slots,
  result,
  results = [],
  includeResultInResults = true,
  drops = [],
  byproducts = [],
  fluid,
  inputFluid,
  outputFluid,
  outputGas,
  conditions,
  inputGroups,
  cost,
  ticks,
  note,
  tier,
  derivedFrom,
  machineAddon,
}) {
  const normalizedInputs = uniqueStacks(inputs.map((entry) => normalizedStack(entry)).filter(Boolean));
  const normalizedCatalysts = uniqueStacks(catalysts.map((entry) => normalizedStack(entry)).filter(Boolean));
  const normalizedDrops = uniqueStacks(drops.map((entry) => normalizedStack(entry)).filter(Boolean));
  const normalizedResult = normalizedStack(result);
  const normalizedResults = uniqueStacks([
    ...(includeResultInResults && normalizedResult ? [normalizedResult] : []),
    ...results.map((entry) => normalizedStack(entry)).filter(Boolean),
  ]);
  const normalizedByproducts = uniqueStacks(byproducts.map((entry) => normalizedStack(entry)).filter(Boolean));
  const representative = normalizedResult ?? normalizedResults[0] ?? normalizedDrops[0] ?? resourceStack('resource', 'unknown', 1, 'Machine result');
  const visibleSlots = slots === undefined
    ? [...normalizedInputs, ...normalizedCatalysts]
    : slots.map((entry) => (entry ? normalizedStack(entry) : null));
  const slotCount = visibleSlots.filter(Boolean).length;
  const id = `${slugify(originId)}-${slugify(station)}-${slugify(key)}`;
  const legacyOutputs = uniqueStacks([...normalizedResults, ...normalizedByproducts, ...normalizedDrops]);

  return {
    id,
    identifier: `${originId}:process/${slugify(station)}/${slugify(key)}`,
    type: 'machine',
    station,
    category,
    recipeKind,
    slotCount,
    slots: [...visibleSlots, ...Array(9)].slice(0, 9),
    inputs: normalizedInputs,
    ...(normalizedCatalysts.length ? {catalysts: normalizedCatalysts} : {}),
    result: representative,
    results: normalizedResults,
    ...(normalizedDrops.length ? {drops: normalizedDrops} : {}),
    ...(normalizedByproducts.length ? {byproducts: normalizedByproducts} : {}),
    ...(fluid ? {fluid} : {}),
    ...(inputFluid ? {inputFluid} : {}),
    ...(outputFluid ? {outputFluid} : {}),
    ...(outputGas ? {outputGas} : {}),
    ...(conditions?.length ? {conditions} : {}),
    ...(inputGroups?.length ? {inputGroups} : {}),
    ...(cost !== undefined ? {cost: numberOr(cost, cost), energyCost: numberOr(cost, cost)} : {}),
    ...(ticks !== undefined ? {ticks: positiveInteger(ticks, 1)} : {}),
    ...(note ? {note} : {}),
    ...(tier !== undefined ? {tier} : {}),
    ...(derivedFrom ? {derivedFrom} : {}),
    ...(machineAddon ? {machineAddon} : {}),
    origin: recipeOriginFor(originId),
    originId,
    input: [...normalizedInputs, ...normalizedCatalysts].map(stackLabel).filter(Boolean).join(' + '),
    output: legacyOutputs.map(stackLabel).filter(Boolean).join(' + '),
  };
}

function directRegistryRecipes(entries, {originId, station, category}) {
  return Object.entries(entries ?? {}).flatMap(([inputId, definition]) => {
    if (!definition?.output || !isConcreteIdentifier(inputId) || !isConcreteIdentifier(definition.output)) return [];
    return [machineRecipe({
      originId,
      station,
      category,
      key: inputId,
      inputs: [{id: inputId, amount: definition.required ?? definition.input_required ?? 1}],
      result: {id: definition.output, amount: definition.amount ?? definition.outputAmount ?? 1},
      cost: definition.cost,
      tier: definition.tier,
    })];
  });
}

function infuserRegistryRecipes(entries, {originId, station = 'infuser', category = 'Infuser recipe', derivedFrom}) {
  return Object.entries(entries ?? {}).flatMap(([key, definition]) => {
    const [catalystId, inputId] = key.split('|');
    if (!definition?.output || !isConcreteIdentifier(catalystId) || !isConcreteIdentifier(inputId)) return [];
    const catalyst = {id: catalystId, amount: definition.required ?? definition.catalystAmount ?? 1};
    const input = {id: inputId, amount: definition.input_required ?? definition.inputAmount ?? 1};
    return [machineRecipe({
      originId,
      station,
      category,
      key,
      recipeKind: derivedFrom ? 'converted' : 'infusion',
      inputs: [input],
      catalysts: [catalyst],
      slots: [catalyst, input],
      result: {id: definition.output, amount: definition.amount ?? definition.outputAmount ?? 1},
      cost: definition.cost,
      derivedFrom,
    })];
  });
}

function catalystWeaverConversions(entries, originId) {
  return infuserRegistryRecipes(entries, {
    originId,
    station: 'catalyst_weaver',
    category: 'Catalyst Weaver · Infuser conversion',
    derivedFrom: 'infuser',
  }).map((recipe) => ({
    ...recipe,
    id: `${recipe.id}-converted`,
    identifier: `${recipe.identifier}-converted`,
    cost: recipe.cost === undefined ? 1280 : recipe.cost / 2.5,
    energyCost: recipe.cost === undefined ? 1280 : recipe.cost / 2.5,
    machineAddon: 'ascendant-technology',
  }));
}

function registryValueKey(value, fallback = 'default') {
  if (Array.isArray(value)) return value.map((entry) => registryValueKey(entry, fallback)).join('to');
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).replace(/\./g, 'p').replace(/[^a-z0-9]+/gi, '-');
}

function sieveRegistryRecipes(entries, {originId}) {
  return Object.entries(entries ?? {}).flatMap(([inputId, drops]) => (Array.isArray(drops) ? drops : [])
    .filter((drop) => isConcreteIdentifier(inputId) && isConcreteIdentifier(drop?.item))
    .map((drop, index) => machineRecipe({
      originId,
      station: 'autosieve',
      category: 'Auto Sieve loot',
      // A registry may deliberately contain two rolls for the same item and
      // mesh tier with different count/chance values. Keep every roll stable.
      key: `${inputId}-${drop.item}-${drop.tier ?? 'any'}-${registryValueKey(drop.amount, '1')}-${registryValueKey(drop.chance, 'certain')}-${index}`,
      recipeKind: 'loot',
      inputs: [{id: inputId, amount: 1}],
      result: {id: drop.item, amount: drop.amount ?? 1, chance: drop.chance},
      includeResultInResults: false,
      drops: [{id: drop.item, amount: drop.amount ?? 1, chance: drop.chance}],
      conditions: drop.tier === undefined ? [] : [{id: 'mesh-tier', label: 'Minimum mesh tier', value: drop.tier}],
      tier: drop.tier,
    })));
}

function seedSynthesisRecipes(entries, {originId, station, category, soils, extraConditions = []}) {
  const soilValues = Object.entries(soils ?? {}).map(([id, definition]) => ({
    id,
    ...(definition.cost !== undefined ? {costMultiplier: definition.cost} : {}),
  }));
  return Object.entries(entries ?? {}).flatMap(([inputId, definition]) => {
    if (!isConcreteIdentifier(inputId) || !Array.isArray(definition?.drops) || !definition.drops.length) return [];
    const drops = definition.drops.map((drop) => normalizedStack(drop)).filter(Boolean);
    const guaranteed = drops.filter((drop) => (drop.chance ?? 1) >= 1);
    if (!drops.length) return [];
    return [machineRecipe({
      originId,
      station,
      category,
      key: inputId,
      recipeKind: 'loot-table',
      inputs: [{id: inputId, amount: 1}],
      result: guaranteed[0] ?? drops[0],
      results: guaranteed.slice(1),
      includeResultInResults: guaranteed.length > 0,
      drops,
      cost: definition.cost,
      conditions: [
        ...(soilValues.length ? [{id: 'soil', label: 'Compatible soil', values: soilValues}] : []),
        ...extraConditions,
      ],
      note: 'Each possible drop is rolled independently per synthesized input.',
    })];
  });
}

function autoFisherRecipes(root) {
  const config = readLiteral(root, 'fisher.js', 'autoFisherConfig');
  const drops = readLiteral(root, 'fisher.js', 'autoFisherLoot', {autoFisherConfig: config});
  return drops.flatMap((drop, index) => {
    const output = normalizedStack(drop);
    if (!output) return [];
    const conditions = [
      {id: 'fishing-net-tier', label: 'Minimum fishing-net tier', value: drop.tier ?? 0},
      ...(drop.durabilityDamageRange ? [{
        id: 'durability',
        label: 'Equipment durability on drop',
        value: `${drop.durabilityDamageRange[0]}–${drop.durabilityDamageRange[1]}`,
      }] : []),
      ...(drop.randomEnchant ? [{
        id: 'random-enchant',
        label: 'Possible random enchantment',
        value: `${Math.round(numberOr(drop.randomEnchant.chance, 0) * 100)}%`,
      }] : []),
    ];
    return [machineRecipe({
      originId: 'utilitycraft',
      station: 'autofisher',
      category: 'Auto Fisher loot',
      key: `${drop.item}-${drop.tier ?? 0}-${registryValueKey(drop.amount, '1')}-${registryValueKey(drop.chance, 'certain')}-${index}`,
      recipeKind: 'loot',
      result: output,
      includeResultInResults: false,
      drops: [output],
      conditions,
      note: 'Configured drop chance before fishing-net modifiers and runtime additions.',
    })];
  });
}

function bonsaiRecipes(plants) {
  return Object.entries(plants ?? {}).flatMap(([inputId, definition]) => {
    const bonsai = definition?.bonsai;
    if (!isConcreteIdentifier(inputId) || !bonsai || !Array.isArray(definition?.drops)) return [];
    const drops = definition.drops.map((drop) => normalizedStack(drop)).filter(Boolean);
    const guaranteed = drops.filter((drop) => (drop.chance ?? 1) >= 1);
    if (!drops.length) return [];
    return [machineRecipe({
      originId: 'utilitycraft',
      station: 'bonsai',
      category: 'Bonsai growth',
      key: inputId,
      recipeKind: 'loot-table',
      inputs: [{id: inputId, amount: 1}],
      result: guaranteed[0] ?? drops[0],
      results: guaranteed.slice(1),
      includeResultInResults: guaranteed.length > 0,
      drops,
      cost: definition.cost,
      conditions: [
        {id: 'bonsai-entity', label: 'Bonsai entity', value: bonsai.entityTypeId},
        ...(bonsai.allowedSoils?.length ? [{id: 'soil', label: 'Allowed soils', values: bonsai.allowedSoils}] : []),
        ...((bonsai.durationTicks ?? (bonsai.durationSeconds ? bonsai.durationSeconds * 20 : 0)) ? [{
          id: 'growth-time',
          label: 'Growth cycle',
          value: `${bonsai.durationTicks ?? bonsai.durationSeconds * 20} ticks`,
        }] : []),
        ...(bonsai.yieldMultiplier ? [{id: 'yield', label: 'Yield multiplier', value: bonsai.yieldMultiplier}] : []),
      ],
      note: 'Each configured bonsai drop is rolled after its growth cycle.',
    })];
  });
}

function furnatorFuelRecipes(root) {
  const fuels = readLiteral(root, 'fuel.js', 'solidFuels');
  return fuels.flatMap((fuel, index) => {
    if (!isConcreteIdentifier(fuel?.id) || !Number.isFinite(Number(fuel.de))) return [];
    const isRule = /[*_]/.test(fuel.id) || !fuel.id.includes(':');
    return [machineRecipe({
      originId: 'utilitycraft',
      station: 'furnator',
      category: isRule ? 'Furnator fuel rule' : 'Furnator fuel',
      key: `${fuel.id}-${fuel.de}-${index}`,
      recipeKind: isRule ? 'fuel-rule' : 'fuel',
      inputs: [{id: fuel.id, amount: 1, label: isRule ? `Items matching ${fuel.id}` : undefined}],
      result: resourceStack('energy', 'dorios-energy', fuel.de, 'Dorios Energy'),
      results: [resourceStack('energy', 'dorios-energy', fuel.de, 'Dorios Energy')],
      conditions: isRule ? [{id: 'match-rule', label: 'Accepted item pattern', value: fuel.id}] : [],
      note: isRule ? 'Pattern-based fuel rule; matching item variants are accepted at runtime.' : undefined,
    })];
  });
}

function crafterGridRecipes(root, originId) {
  const batches = readLiteral(root, 'crafter.js', 'crafterRecipeBatches');
  return batches.flatMap((batch, batchIndex) => Object.entries(batch ?? {}).flatMap(([pattern, definition], recipeIndex) => {
    if (!isConcreteIdentifier(definition?.output)) return [];
    const slots = pattern.split(',').map((itemId) => (
      itemId && itemId !== 'air' ? {id: itemId, amount: 1} : null
    ));
    if (slots.length !== 9) return [];
    const inputs = slots.filter(Boolean);
    return [machineRecipe({
      originId,
      station: 'crafter',
      category: 'Crafter grid recipe',
      key: `${batchIndex}-${recipeIndex}-${definition.output}`,
      recipeKind: 'craft-grid',
      inputs,
      slots,
      result: {id: definition.output, amount: definition.amount ?? 1},
      byproducts: definition.leftover ?? [],
      note: 'Grid ingredient IDs intentionally omit namespaces because the in-game Crafter compares their short item IDs.',
    })];
  }));
}

function melterRecipes(entries, originId) {
  return Object.entries(entries ?? {}).flatMap(([inputId, definition]) => {
    if (!isConcreteIdentifier(inputId) || !isConcreteIdentifier(definition?.liquid)) return [];
    const output = resourceStack('fluid', definition.liquid, definition.amount);
    return [machineRecipe({
      originId,
      station: 'magmatic-chamber',
      category: 'Magmatic Chamber recipe',
      key: inputId,
      recipeKind: 'fluid-output',
      inputs: [{id: inputId, amount: definition.required ?? 1}],
      result: output,
      results: [output],
      outputFluid: {type: definition.liquid, amount: positiveInteger(definition.amount, 1)},
      cost: definition.cost,
      machineAddon: 'heavy-machinery',
    })];
  });
}

function baseRecipeData() {
  const root = recipeRoots.utilitycraft;
  const bountifulDefinitionsPath = sourceFile(root, 'bountifulCrops.generated.js');
  const bountifulDefinitions = fs.existsSync(bountifulDefinitionsPath)
    ? readLiteral(root, 'bountifulCrops.generated.js', 'BOUNTIFUL_CROP_DEFINITIONS')
    : [];
  // plants.js spreads this generated table into its main registry. Recreate
  // that import in the sandbox so Seed Synthesizer includes every Bountiful
  // Crops tier as well as the literal vanilla entries.
  const bountifulPlantsData = Object.fromEntries(bountifulDefinitions.map((definition) => [definition.seedId, {
    cost: definition.cost,
    bonsai: {
      entityTypeId: definition.bonsaiEntityId,
      durationSeconds: definition.bonsaiDurationSeconds,
      allowedSoils: definition.soil ? [definition.soil] : [],
    },
    drops: [
      ...(definition.drops ?? []).map((drop) => ({...drop})),
      {item: definition.seedId, amount: 1, chance: definition.seedChance},
    ],
  }]));
  const plants = readLiteral(root, 'plants.js', 'plantsData', {bountifulPlantsData});
  const soils = readLiteral(
    sourceFile(projectRoots.utilitycraft, 'BP', 'scripts', 'machinery', 'machines'),
    'seedSynthesizer.js',
    'acceptedSoils',
  );
  const infuser = readLiteral(root, 'infuser.js', 'infuserRecipesRegister');

  return {
    core: [
      ...directRegistryRecipes(readLiteral(root, 'crusher.js', 'crusherRecipesRegister'), {
        originId: 'utilitycraft', station: 'crusher', category: 'Crusher recipe',
      }),
      ...infuserRegistryRecipes(infuser, {originId: 'utilitycraft'}),
      ...directRegistryRecipes(readLiteral(root, 'press.js', 'pressRecipesRegister'), {
        originId: 'utilitycraft', station: 'electro_press', category: 'Electro Press recipe',
      }),
      ...directRegistryRecipes(readLiteral(root, 'furnace.js', 'furnaceRecipesRegister'), {
        originId: 'utilitycraft', station: 'incinerator', category: 'Incinerator recipe',
      }),
      ...sieveRegistryRecipes(readLiteral(root, 'sieve.js', 'sieveRecipesRegister'), {originId: 'utilitycraft'}),
      ...seedSynthesisRecipes(plants, {
        originId: 'utilitycraft', station: 'seed_synthesizer', category: 'Seed Synthesizer recipe', soils,
      }),
      ...autoFisherRecipes(root),
      ...bonsaiRecipes(plants),
      ...furnatorFuelRecipes(root),
      ...crafterGridRecipes(root, 'utilitycraft'),
    ],
    infuser,
    melter: melterRecipes(readLiteral(root, 'melter.js', 'melterRecipesRegister'), 'utilitycraft'),
  };
}

function coreAdditions(root, originId, layout) {
  const prefix = layout === 'ascendant' ? 'added' : 'recipes_register';
  const registryRoot = layout === 'ascendant' ? root : path.dirname(root);
  const variables = layout === 'ascendant'
    ? {
      crusher: 'crusherRecipeAdditions',
      furnace: 'furnaceRecipeAdditions',
      infuser: 'infuserRecipeAdditions',
      press: 'pressRecipeAdditions',
      sieve: 'sieveDropAdditions',
    }
    : {
      crusher: 'newRecipes',
      furnace: 'newRecipes',
      infuser: 'newRecipes',
      press: 'newRecipes',
      sieve: 'newDrops',
    };
  const file = (name) => `${prefix}/${name}.js`;
  const read = (name) => readLiteral(registryRoot, file(name), variables[name]);
  const infuser = read('infuser');
  const crafter = layout === 'heavy' ? crafterGridRecipes(root, originId) : [];
  return {
    core: [
      ...directRegistryRecipes(read('crusher'), {
        originId, station: 'crusher', category: 'Crusher recipe',
      }),
      ...infuserRegistryRecipes(infuser, {originId}),
      ...directRegistryRecipes(read('press'), {
        originId, station: 'electro_press', category: 'Electro Press recipe',
      }),
      ...directRegistryRecipes(read('furnace'), {
        originId, station: 'incinerator', category: 'Incinerator recipe',
      }),
      ...sieveRegistryRecipes(read('sieve'), {originId}),
      ...crafter,
    ],
    infuser,
  };
}

function sharedStationAliases(recipes) {
  // These superior AT machines intentionally call the same shared registries
  // as their UtilityCraft counterparts. Emit a catalogue entry for the actual
  // station without re-attributing the recipe to AT merely because its machine
  // can run it.
  const aliases = [
    {sourceStation: 'electro_press', station: 'arc_press_forge', category: 'Arc Press Forge recipe'},
    {sourceStation: 'crusher', station: 'pulverizer', category: 'Pulverizer recipe'},
    {sourceStation: 'crusher', station: 'impact_crusher', category: 'Impact Crusher recipe'},
    {sourceStation: 'incinerator', station: 'industrial_burner', category: 'Industrial Burner recipe'},
    {sourceStation: 'autosieve', station: 'centrifugal_siever', category: 'Centrifugal Siever loot'},
    {sourceStation: 'autosieve', station: 'dual_siever', category: 'Dual Siever loot'},
  ];
  return aliases.flatMap((alias) => recipes
    .filter((recipe) => recipe.station === alias.sourceStation)
    .map((recipe) => ({
      ...recipe,
      id: `${recipe.id}-${slugify(alias.station)}`,
      identifier: `${recipe.identifier}-${slugify(alias.station)}`,
      station: alias.station,
      category: alias.category,
      machineAddon: 'ascendant-technology',
      note: [recipe.note, 'Uses the shared UtilityCraft registry; machine-specific modes change throughput rather than the recipe.']
        .filter(Boolean).join(' '),
    })));
}

function ascendantSpecializedRecipes(baseInfuser, ascendantInfuser, heavyInfuser) {
  const root = recipeRoots['ascendant-technology'];
  const read = (file, variable, context) => readLiteral(root, file, variable, context);
  const recipes = [];

  const catalystDefinitions = read('catalystWeaver.js', 'catalystWeaverRecipeDefinitions');
  for (const [id, definition] of Object.entries(catalystDefinitions)) {
    // This is a hidden novelty recipe in the add-on, not player-facing documentation.
    if (id === 'at:easter_egg') continue;
    const input = normalizedStack(definition.input);
    const output = normalizedStack(definition.output);
    if (!input || !output) continue;
    const catalysts = (definition.catalysts ?? []).map((entry) => normalizedStack(entry)).filter(Boolean);
    const byproduct = normalizedStack(definition.byproduct);
    recipes.push(machineRecipe({
      originId: 'ascendant-technology',
      station: 'catalyst_weaver',
      category: 'Catalyst Weaver recipe',
      key: id,
      recipeKind: 'catalyst',
      inputs: [input],
      catalysts,
      slots: [input, ...catalysts],
      result: output,
      ...(byproduct ? {byproducts: [byproduct]} : {}),
      fluid: definition.fluid,
      cost: definition.cost ?? 3200,
      note: definition.speed ? `Processing speed modifier ×${definition.speed}.` : undefined,
    }));
  }

  // The Catalyst Weaver listens for every Infuser registration at runtime.
  // Preserve the original registrar on the generated conversion recipe.
  recipes.push(
    ...catalystWeaverConversions(baseInfuser, 'utilitycraft'),
    ...catalystWeaverConversions(ascendantInfuser, 'ascendant-technology'),
    ...catalystWeaverConversions(heavyInfuser, 'heavy-machinery'),
  );

  const liquifier = read('liquifier.js', 'liquifierRecipes');
  for (const [inputId, definition] of Object.entries(liquifier)) {
    if (!isConcreteIdentifier(inputId) || !isConcreteIdentifier(definition?.liquid)) continue;
    const output = resourceStack('fluid', definition.liquid, definition.amount);
    const byproduct = normalizedStack(definition.byproduct);
    recipes.push(machineRecipe({
      originId: 'ascendant-technology',
      station: 'liquifier',
      category: 'Liquifier recipe',
      key: inputId,
      recipeKind: 'fluid-output',
      inputs: [{id: inputId, amount: definition.required ?? 1}],
      result: output,
      results: [output],
      ...(byproduct ? {byproducts: [byproduct]} : {}),
      outputFluid: {type: definition.liquid, amount: positiveInteger(definition.amount, 1)},
      cost: definition.cost,
      ticks: definition.ticks,
    }));
  }

  const crucible = read('industrialCrucible.js', 'industrialCrucibleRecipes');
  for (const [inputId, definition] of Object.entries(crucible)) {
    const output = normalizedStack(definition?.output);
    if (!isConcreteIdentifier(inputId) || !output) continue;
    const lava = resourceStack('fluid', 'lava', definition.lavaGain ?? 1);
    recipes.push(machineRecipe({
      originId: 'ascendant-technology',
      station: 'industrial_crucible',
      category: 'Industrial Crucible recipe',
      key: inputId,
      recipeKind: 'item-and-fluid-output',
      inputs: [{id: inputId, amount: definition.input?.amount ?? 1}],
      result: output,
      results: [output, lava],
      outputFluid: {type: 'lava', amount: positiveInteger(definition.lavaGain, 1)},
      cost: definition.energyCost,
    }));
  }

  const residue = read('residueProcessor.js', 'residueProcessorRecipes');
  for (const [inputId, definition] of Object.entries(residue)) {
    if (!isConcreteIdentifier(inputId) || !isConcreteIdentifier(definition?.output)) continue;
    const byproduct = normalizedStack(definition.byproduct);
    recipes.push(machineRecipe({
      originId: 'ascendant-technology',
      station: 'residue_processor',
      category: 'Residue Processor recipe',
      key: inputId,
      inputs: [{id: inputId, amount: definition.required ?? 1}],
      result: {id: definition.output, amount: definition.amount ?? 1},
      ...(byproduct ? {byproducts: [byproduct]} : {}),
      cost: definition.cost,
    }));
  }

  const energizer = read('energizer.js', 'energizerRecipeDefinitions');
  for (const [id, definition] of Object.entries(energizer)) {
    const input = normalizedStack(definition.input);
    const output = normalizedStack(definition.output);
    if (!input || !output) continue;
    recipes.push(machineRecipe({
      originId: 'ascendant-technology',
      station: 'energizer',
      category: 'Energizer recipe',
      key: id,
      inputs: [input],
      result: output,
      cost: definition.cost,
      ticks: definition.ticks,
      note: definition.preferredChannel ? `Preferred ${definition.preferredChannel} channel.` : undefined,
    }));
  }

  const vaporworks = read('vaporworksProcessor.js', 'vaporworksRecipeDefinitions');
  for (const [id, definition] of Object.entries(vaporworks)) {
    if (!definition?.inputFluid?.type || !definition?.outputGas?.type) continue;
    const output = resourceStack('gas', definition.outputGas.type, definition.outputGas.amount);
    recipes.push(machineRecipe({
      originId: 'ascendant-technology',
      station: 'vaporworks_processor',
      category: 'Vaporworks Processor recipe',
      key: id,
      recipeKind: 'fluid-to-gas',
      result: output,
      results: [output],
      inputFluid: {type: definition.inputFluid.type, amount: positiveInteger(definition.inputFluid.amount, 1)},
      outputGas: {type: definition.outputGas.type, amount: positiveInteger(definition.outputGas.amount, 1)},
      cost: definition.cost,
      ticks: definition.ticks,
    }));
  }

  const stabilizer = read('cryoStabilizer.js', 'cryoStabilizerRecipeDefinitions');
  for (const [id, definition] of Object.entries(stabilizer)) {
    const input = normalizedStack(definition.input);
    const output = normalizedStack(definition.output);
    if (!input || !output) continue;
    for (const station of ['cryo_stabilizer', 'cryo_chamber']) {
      recipes.push(machineRecipe({
        originId: 'ascendant-technology',
        station,
        category: 'Cryo Stabilizer recipe',
        key: id,
        inputs: [input],
        result: output,
        fluid: {type: 'cryofluid', amount: positiveInteger(definition.cryofluid, 1)},
        cost: definition.cost,
        ticks: definition.ticks,
      }));
    }
  }

  const cooling = read('cryoCooling.js', 'cryoCoolingRecipeDefinitions');
  for (const [id, definition] of Object.entries(cooling)) {
    const input = normalizedStack(definition.input);
    const output = normalizedStack(definition.output);
    if (!input || !output) continue;
    for (const station of ['cryo_freezer', 'cryo_chamber']) {
      recipes.push(machineRecipe({
        originId: 'ascendant-technology',
        station,
        category: 'Cryo Cooling recipe',
        key: id,
        inputs: [input],
        result: output,
        fluid: definition.fluid,
        cost: definition.cost,
        ticks: definition.ticks,
      }));
    }
  }

  const cryoCatalysts = read('cryoChamber.js', 'cryoChamberCatalystDefinitions');
  const lapisSources = read('cryoChamber.js', 'cryoChamberLapisDefinitions');
  const cryoGeneration = read('cryoChamber.js', 'cryoChamberGeneration');
  for (const [catalystId, catalyst] of Object.entries(cryoCatalysts)) {
    for (const [lapisId, lapis] of Object.entries(lapisSources)) {
      const catalystInput = normalizedStack(catalyst.input);
      const lapisInput = normalizedStack(lapis.input);
      if (!catalystInput || !lapisInput) continue;
      const multiplier = Math.max(0.01, numberOr(lapis.yieldMultiplier, 1));
      const water = Math.max(1, Math.round(numberOr(catalyst.water, 0) * multiplier));
      const amount = Math.max(1, Math.round(numberOr(catalyst.cryofluid, 0) * multiplier));
      const output = resourceStack('fluid', 'cryofluid', amount);
      recipes.push(machineRecipe({
        originId: 'ascendant-technology',
        station: 'cryo_chamber',
        category: 'Cryofluid Generator recipe',
        key: `${catalystId}-${lapisId}`,
        recipeKind: 'fluid-output',
        inputs: [catalystInput, lapisInput],
        result: output,
        results: [output],
        fluid: {type: 'water', amount: water},
        outputFluid: {type: 'cryofluid', amount},
        cost: cryoGeneration.cost,
        ticks: cryoGeneration.ticks,
        conditions: [{id: 'lapis-yield', label: 'Lapis yield multiplier', value: multiplier}],
      }));
    }
  }

  const cryofluidSynthesis = read('cryofluidSynthesizer.js', 'CRYOFLUID_SYNTHESIS_RECIPE');
  const synthesisGroups = Object.entries(cryofluidSynthesis.inputs ?? {}).map(([id, definition]) => ({
    id,
    label: `${titleize(id)} value`,
    requiredValue: definition.requiredValue,
    alternatives: Object.entries(definition.alternatives ?? {}).map(([itemId, value]) => ({id: itemId, value})),
  }));
  if (synthesisGroups.length) {
    const output = resourceStack('fluid', 'cryofluid', cryofluidSynthesis.cryofluid);
    recipes.push(machineRecipe({
      originId: 'ascendant-technology',
      station: 'cryofluid_synthesizer',
      category: 'Cryofluid Synthesizer recipe',
      key: 'standard-synthesis',
      recipeKind: 'value-input',
      result: output,
      results: [output],
      fluid: {type: 'water', amount: positiveInteger(cryofluidSynthesis.water, 1)},
      outputFluid: {type: 'cryofluid', amount: positiveInteger(cryofluidSynthesis.cryofluid, 1)},
      inputGroups: synthesisGroups,
      cost: cryofluidSynthesis.energyCost,
      note: 'Items in each value group can be mixed until its required value is reached.',
    }));
  }

  const genetic = read('geneticSeedSynthesizer.js', 'geneticSeedRecipeDefinitions');
  const geneticSoils = read('geneticSeedSynthesizer.js', 'geneticSoilDefinitions');
  const geneticOverrides = read('geneticSeedSynthesizer.js', 'geneticDropItemOverrides');
  const remappedGenetic = Object.fromEntries(Object.entries(genetic).map(([seedId, definition]) => [seedId, {
    ...definition,
    drops: (definition.drops ?? []).map((drop) => ({
      ...drop,
      item: geneticOverrides[seedId]?.[drop.item] ?? drop.item,
    })),
  }]));
  recipes.push(...seedSynthesisRecipes(remappedGenetic, {
    originId: 'ascendant-technology',
    station: 'genetic_seed_synthesizer',
    category: 'Genetic Seed Synthesizer recipe',
    soils: geneticSoils,
    extraConditions: [{id: 'coolant', label: 'Coolant', value: 'Any compatible coolant'}],
  }));

  const rarityCosts = read('singularityFabricator.js', 'rarityEnergyPerSecond');
  const singularities = read('singularityFabricator.js', 'singularityFabricatorRecipeDefinitions');
  for (const definition of singularities) {
    if (!isConcreteIdentifier(definition?.input)) continue;
    const energyCost = numberOr(rarityCosts[definition.rarity], 0) * numberOr(definition.timeSeconds, 0);
    const darkMatter = numberOr(definition.timeSeconds, 0) * 80;
    recipes.push(machineRecipe({
      originId: 'ascendant-technology',
      station: 'singularity_fabricator',
      category: 'Singularity Fabricator recipe',
      key: definition.id,
      recipeKind: 'cloning',
      inputs: [{id: definition.input, amount: 1}],
      result: {id: definition.input, amount: 1},
      fluid: {type: 'dark_matter', amount: positiveInteger(darkMatter, 1)},
      cost: energyCost,
      conditions: [{id: 'rarity', label: 'Clone rarity', value: definition.rarity}],
      note: `${definition.timeSeconds} second cloning cycle.`,
    }));
  }

  recipes.push(...compactorRecipes(root));
  recipes.push(...refiningTableRecipes(root));
  recipes.push(...verdantCultivatorRecipes(root));
  recipes.push(...abyssalFisherRecipes(root));
  return recipes;
}

function refiningTableRecipes(root) {
  // The table refines arbitrary StatsCore equipment. These are configuration
  // templates, not fixed item conversions, so its virtual result intentionally
  // describes the preserved equipment with a randomized refinement state.
  const iconFallbacks = new Proxy({}, {get: () => ''});
  const config = readLiteral(root, 'refiningTable.js', 'REFINING_TABLE_CONFIG', {STATSCORE_ICONS: iconFallbacks});
  const chips = Array.from(config.chips?.values?.() ?? []);
  const ingots = Array.from(config.ingots?.values?.() ?? []);
  const defaults = config.defaults ?? {};
  const ingotAlternatives = ingots.map((ingot) => ({
    id: ingot.id,
    label: ingot.label,
    power: ingot.power,
  }));
  return chips.flatMap((chip) => {
    if (!isConcreteIdentifier(chip?.id)) return [];
    return [machineRecipe({
      originId: 'ascendant-technology',
      station: 'refining_table',
      category: 'Refining Table roll',
      key: chip.id,
      recipeKind: 'randomized-refinement',
      inputs: [
        {id: 'virtual:statscore-equipment', label: 'Compatible StatsCore equipment', amount: 1},
        {id: chip.id, label: chip.label, amount: 1},
      ],
      result: {id: 'virtual:refined-statscore-equipment', label: 'Same equipment with randomized refinement', amount: 1},
      inputFluid: {type: defaults.xpFluidType ?? 'xp', amount: positiveInteger(chip.baseXpCost, 1)},
      inputGroups: [
        {
          id: 'refinement-ingot',
          label: `Optional refinement ingot (0–${defaults.maxIngotsPerRoll ?? 0})`,
          alternatives: ingotAlternatives,
        },
        {
          id: 'unlock-catalyst',
          label: 'Optional ability unlock catalyst',
          alternatives: [
            {id: defaults.unlockCatalystId, label: 'Runic Core'},
            {id: defaults.advancedUnlockCatalystId, label: 'Advanced Runic Core'},
          ].filter((entry) => isConcreteIdentifier(entry.id)),
        },
      ],
      cost: chip.baseEnergyCost,
      conditions: [
        {id: 'quality-range', label: 'Base quality range', value: `${Math.round(numberOr(chip.minQuality, 0) * 100)}–${Math.round(numberOr(chip.maxQuality, 0) * 100)}%`},
        {id: 'max-ingots', label: 'Maximum ingots', value: `${defaults.maxIngotsPerRoll ?? 0} normal / ${defaults.advancedMaxIngotsPerRoll ?? 0} advanced`},
        {id: 'result', label: 'Result', value: 'Randomized refinement; the input equipment is retained'},
      ],
      note: 'Base XP and energy shown for this chip before optional ingots, prior rerolls, and advanced-roll multipliers.',
    })];
  });
}

function compactorRecipes(root) {
  const compressedBlocks = readLiteral(root, 'compactorCompressedBlocks.js', 'UTILITYCRAFT_COMPRESSED_BLOCK_RECIPES');
  const compressedItems = readLiteral(root, 'compactorCompressedItems.js', 'UTILITYCRAFT_COMPRESSED_ITEM_RECIPES');
  const config = readLiteral(root, 'compactor.js', 'COMPACTOR_CONFIG', {
    UTILITYCRAFT_COMPRESSED_BLOCK_RECIPES: compressedBlocks,
    UTILITYCRAFT_COMPRESSED_ITEM_RECIPES: compressedItems,
  });
  const defaults = config.defaults ?? {};
  const materialized = new Map();
  const register = (input, output, required, level, final, amount = 1) => {
    if (!isConcreteIdentifier(input) || !isConcreteIdentifier(output)) return;
    const recipe = {
      input,
      output,
      required: positiveInteger(required, 1),
      amount: positiveInteger(amount, 1),
      level,
      final,
      cost: Math.ceil(numberOr(defaults.ingotCost, 800) * (numberOr(defaults.costMultiplierPerLevel, 9) ** level)),
    };
    materialized.set(`${input}|${output}|${recipe.required}|${recipe.amount}`, recipe);
  };

  for (const chain of config.chains ?? []) {
    const final = chain.at(-1);
    for (let stage = 0; stage < chain.length - 1; stage += 1) {
      register(chain[stage], chain[stage + 1], defaults.ratio, stage, final);
    }
  }
  for (const [input, output, required] of config.materialCompactions ?? []) register(input, output, required, 1, output);
  for (const [input, output, required] of config.fragmentCompactions ?? []) register(input, output, required, 1, output);

  const next = new Map(compressedBlocks);
  const parent = new Map(compressedBlocks.map(([input, output]) => [output, input]));
  const levelFor = (input) => parent.has(input) ? levelFor(parent.get(input)) + 1 : 2;
  const finalFor = (input) => {
    const visited = new Set();
    let current = input;
    while (next.has(current) && !visited.has(current)) {
      visited.add(current);
      current = next.get(current);
    }
    return current;
  };
  for (const [input, output] of compressedBlocks) {
    register(input, output, defaults.ratio, levelFor(input), finalFor(output));
  }
  for (const [input, output, required, amount] of compressedItems) {
    register(input, output, required, 1, output, amount);
  }

  return [...materialized.values()].map((definition) => machineRecipe({
    originId: 'ascendant-technology',
    station: 'compactor',
    category: 'Compactor recipe',
    key: `${definition.input}-${definition.output}-${definition.required}-${definition.amount}`,
    recipeKind: 'compaction',
    inputs: [{id: definition.input, amount: definition.required}],
    result: {id: definition.output, amount: definition.amount},
    cost: definition.cost,
    ticks: defaults.ticks,
    conditions: [
      {id: 'compression-level', label: 'Compression level', value: definition.level},
      {id: 'final-form', label: 'Final form', value: definition.final},
    ],
  }));
}

function verdantCultivatorRecipes(root) {
  const definitions = readLiteral(root, 'verdantCultivator.js', 'verdantCropDefinitions');
  const utilityTiers = readLiteral(root, 'verdantCultivator.js', 'utilityTiers');
  const utilityProduce = readLiteral(root, 'verdantCultivator.js', 'utilityProduce');
  const cropNameOverrides = readLiteral(root, 'verdantCultivator.js', 'cropNameOverrides');
  const biomeProfiles = readLiteral(root, 'verdantCultivator.js', 'biomeProfiles');
  for (const tier of Object.values(utilityTiers)) {
    for (const rawName of tier.seeds ?? []) {
      const seedId = `utilitycraft:${rawName}_seeds`;
      const biome = biomeProfiles[rawName];
      definitions[seedId] = {
        cropBlockId: `utilitycraft:${cropNameOverrides[rawName] ?? `${rawName}_crop`}`,
        ageState: 'utilitycraft:age',
        maxAge: 5,
        validSoils: [tier.soil],
        bonusExclusions: [seedId],
        biomeTokens: biome?.tokens ?? [],
        biomeTitle: biome?.title ?? null,
        pickupItemIds: [seedId, ...(utilityProduce[seedId] ?? [])],
      };
    }
  }

  return Object.entries(definitions).flatMap(([inputId, definition]) => {
    const targets = (definition.pickupItemIds ?? []).filter(isConcreteIdentifier);
    if (!isConcreteIdentifier(inputId) || !targets.length) return [];
    return [machineRecipe({
      originId: 'ascendant-technology',
      station: 'verdant_cultivator',
      category: 'Verdant Cultivator crop',
      key: inputId,
      recipeKind: 'world-harvest',
      inputs: [{id: inputId, amount: 1}],
      result: {id: targets[0], amount: 1},
      // Crop loot is determined by the placed crop block, so these are
      // harvest targets rather than a fabricated deterministic drop table.
      conditions: [
        {id: 'valid-soils', label: 'Valid soils', values: definition.validSoils ?? []},
        ...(definition.biomeTokens?.length ? [{id: 'biome', label: 'Biome bonus', value: definition.biomeTitle, values: definition.biomeTokens}] : []),
        {id: 'growth', label: 'Growth state', value: `${definition.ageState} up to ${definition.maxAge}`},
      ],
      note: `World crop loot applies after growth. Harvest targets: ${targets.map(titleize).join(', ')}.`,
    })];
  });
}

function abyssalFisherRecipes(root) {
  const config = readLiteral(root, 'abyssalFisher.js', 'abyssalFisherConfig');
  const drops = readLiteral(root, 'abyssalFisher.js', 'abyssalFisherLootDefinitions', {abyssalFisherConfig: config});
  return drops.flatMap((drop, index) => {
    const output = normalizedStack(drop);
    if (!output) return [];
    // `chance` in this registry is a category weight, not final probability.
    delete output.chance;
    return [machineRecipe({
      originId: 'ascendant-technology',
      station: 'abyssal_fisher',
      category: 'Abyssal Fisher loot',
      key: `${drop.category}-${drop.tier}-${drop.item}-${index}`,
      recipeKind: 'weighted-loot',
      result: output,
      includeResultInResults: false,
      drops: [output],
      conditions: [
        {id: 'loot-category', label: 'Loot category', value: drop.category},
        {id: 'tier', label: 'Minimum tier', value: drop.tier},
        {id: 'weight', label: 'Relative weight', value: drop.chance},
      ],
      note: 'Relative weight inside its category and tier; it is not a final drop percentage.',
    })];
  });
}

function heavySpecializedRecipes() {
  const root = recipeRoots['heavy-machinery'];
  const definitions = readLiteral(root, 'reaction_chamber.js', 'reactionRecipes');
  return Object.entries(definitions ?? {}).flatMap(([key, definition]) => {
    const [inputId, fluidType] = key.split('|');
    if (!isConcreteIdentifier(inputId) || !fluidType) return [];
    const outputItem = normalizedStack(definition.output_item);
    const outputFluid = definition.output_liquid?.type
      ? resourceStack('fluid', definition.output_liquid.type, definition.output_liquid.amount)
      : null;
    const result = outputItem ?? outputFluid;
    if (!result) return [];
    return [machineRecipe({
      originId: 'heavy-machinery',
      station: 'reaction-chamber',
      category: 'Reaction Chamber recipe',
      key,
      recipeKind: 'reaction',
      inputs: [{id: inputId, amount: definition.required_items ?? 1}],
      result,
      results: [outputItem, outputFluid].filter(Boolean),
      fluid: {type: fluidType, amount: positiveInteger(definition.required_liquid, 1)},
      ...(definition.output_liquid?.type ? {
        outputFluid: {type: definition.output_liquid.type, amount: positiveInteger(definition.output_liquid.amount, 1)},
      } : {}),
      cost: definition.cost,
    })];
  });
}

function sortRecipes(recipes) {
  return [...recipes].sort((left, right) => (
    `${left.station}|${left.originId}|${left.identifier}`.localeCompare(`${right.station}|${right.originId}|${right.identifier}`)
  ));
}

function writeRecipes(outputPath, recipes) {
  fs.writeFileSync(outputPath, `${JSON.stringify(sortRecipes(recipes), null, 2)}\n`, 'utf8');
}

function readExisting(outputPath) {
  if (!fs.existsSync(outputPath)) return [];
  try {
    const entries = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

function originRecipes(recipes, originId) {
  return recipes.filter((recipe) => (recipe.origin?.id ?? recipe.originId) === originId);
}

const sourceAvailable = Object.fromEntries(Object.entries(recipeRoots).map(([id, directory]) => [id, fs.existsSync(directory)]));
if (!Object.values(sourceAvailable).some(Boolean)) {
  process.stdout.write('No recipe source projects were found; preserving generated machine recipe catalogs.\n');
  process.exit(0);
}

const existing = Object.fromEntries(Object.entries(outputPaths).map(([id, outputPath]) => [id, readExisting(outputPath)]));
const base = sourceAvailable.utilitycraft
  ? baseRecipeData()
  : {core: originRecipes(existing.utilitycraft, 'utilitycraft'), infuser: {}, melter: []};
const ascendantCore = sourceAvailable['ascendant-technology']
  ? coreAdditions(recipeRoots['ascendant-technology'], 'ascendant-technology', 'ascendant')
  : {core: originRecipes(existing.utilitycraft, 'ascendant-technology'), infuser: {}};
const heavyCore = sourceAvailable['heavy-machinery']
  ? coreAdditions(recipeRoots['heavy-machinery'], 'heavy-machinery', 'heavy')
  : {core: originRecipes(existing.utilitycraft, 'heavy-machinery'), infuser: {}};

const utilitycraftCatalog = [...base.core, ...ascendantCore.core, ...heavyCore.core];
const ascendantCatalog = sourceAvailable['ascendant-technology']
  ? [
    ...ascendantCore.core,
    ...ascendantSpecializedRecipes(base.infuser, ascendantCore.infuser, heavyCore.infuser),
    ...sharedStationAliases(utilitycraftCatalog),
  ]
  : existing['ascendant-technology'];
const heavyCatalog = sourceAvailable['heavy-machinery']
  ? [...heavyCore.core, ...heavySpecializedRecipes(), ...base.melter]
  : existing['heavy-machinery'];

writeRecipes(outputPaths.utilitycraft, utilitycraftCatalog);
writeRecipes(outputPaths['ascendant-technology'], ascendantCatalog);
writeRecipes(outputPaths['heavy-machinery'], heavyCatalog);

process.stdout.write(
  `Wrote ${utilitycraftCatalog.length} UtilityCraft, ${ascendantCatalog.length} Ascendant Technology, and ${heavyCatalog.length} Heavy Machinery machine recipes.\n`,
);
