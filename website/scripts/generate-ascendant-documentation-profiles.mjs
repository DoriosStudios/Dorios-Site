import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// This generator deliberately reads the add-on's authoritative item, block,
// world-generation and drop configuration.  The site only stores the rendered
// profile so its client bundle never needs access to a local add-on checkout.
const siteRoot = path.resolve(import.meta.dirname, '..');
const addonRoot = process.env.ASCENDANT_TECHNOLOGY_PROJECT_PATH ?? path.join(
  os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects', 'Ascendant-Technology',
);
const outputPath = path.join(siteRoot, 'src', 'wiki', 'projects', 'ascendant-technology', 'documentationProfiles.generated.json');
const manifestPath = path.join(siteRoot, 'src', 'wiki', 'projects', 'ascendant-technology', 'manifest.json');

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => (
    entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]
  ));
}

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
    if (character === '"' || character === "'") {
      quote = character;
      output += character;
      continue;
    }
    if (character === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') index += 1;
      output += '\n';
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index += 1;
      index += 1;
      continue;
    }
    output += character;
  }
  return output;
}

function readJson(file) {
  return JSON.parse(stripJsonComments(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')));
}

function formatIdentifier(value) {
  return String(value ?? '')
    .replace(/^.*:/, '')
    .replace(/[_/-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function number(value) {
  return Number(value).toLocaleString('en-US');
}

function tierFromTags(tags) {
  const joined = tags.join(' ');
  const tiers = [
    ['netherite_tier', 'Netherite'],
    ['diamond_tier', 'Diamond'],
    ['iron_tier', 'Iron'],
    ['stone_tier', 'Stone'],
    ['wooden_tier', 'Wood'],
  ];
  return tiers.find(([token]) => joined.includes(token))?.[1] ?? 'No explicit Minecraft tier tag';
}

const ENCHANTMENT_PRESETS = {
  pickaxe: ['Efficiency', 'Fortune', 'Silk Touch', 'Unbreaking', 'Mending', 'Curse of Vanishing'],
  shovel: ['Efficiency', 'Fortune', 'Silk Touch', 'Unbreaking', 'Mending', 'Curse of Vanishing'],
  axe: ['Efficiency', 'Fortune', 'Silk Touch', 'Sharpness', 'Smite', 'Bane of Arthropods', 'Unbreaking', 'Mending', 'Curse of Vanishing'],
  hoe: ['Efficiency', 'Fortune', 'Silk Touch', 'Unbreaking', 'Mending', 'Curse of Vanishing'],
  sword: ['Sharpness', 'Smite', 'Bane of Arthropods', 'Fire Aspect', 'Looting', 'Knockback', 'Unbreaking', 'Mending', 'Curse of Vanishing'],
  armor_head: ['Protection', 'Fire Protection', 'Blast Protection', 'Projectile Protection', 'Respiration', 'Aqua Affinity', 'Thorns', 'Unbreaking', 'Mending', 'Curse of Binding', 'Curse of Vanishing'],
  armor_torso: ['Protection', 'Fire Protection', 'Blast Protection', 'Projectile Protection', 'Thorns', 'Unbreaking', 'Mending', 'Curse of Binding', 'Curse of Vanishing'],
  armor_legs: ['Protection', 'Fire Protection', 'Blast Protection', 'Projectile Protection', 'Swift Sneak', 'Thorns', 'Unbreaking', 'Mending', 'Curse of Binding', 'Curse of Vanishing'],
  armor_feet: ['Protection', 'Fire Protection', 'Blast Protection', 'Projectile Protection', 'Feather Falling', 'Depth Strider', 'Frost Walker', 'Soul Speed', 'Thorns', 'Unbreaking', 'Mending', 'Curse of Binding', 'Curse of Vanishing'],
};

function roleLabels(tags) {
  const roles = [
    ['minecraft:is_pickaxe', 'Pickaxe'], ['minecraft:is_shovel', 'Shovel'], ['minecraft:is_axe', 'Axe'],
    ['minecraft:is_hoe', 'Hoe'], ['minecraft:is_sword', 'Sword'], ['utilitycraft:is_hammer', 'Hammer'],
    ['utilitycraft:is_paxel', 'Paxel'], ['utilitycraft:is_aiot', 'AiOT'],
  ].filter(([tag]) => tags.includes(tag)).map(([, label]) => label);
  return roles.length ? roles.join(' · ') : null;
}

function repairLabel(entry) {
  const items = entry.items?.map(formatIdentifier).join(' + ');
  if (!items) return null;
  const amount = String(entry.repair_amount ?? '');
  const ratio = amount.match(/\*\s*(0?\.\d+)/)?.[1];
  if (ratio) return `${items} — ${Number(ratio) * 100}% of maximum durability`;
  if (amount) return `${items} — ${amount}`;
  return items;
}

function digSpeedLabel(digger) {
  const speeds = digger?.destroy_speeds ?? [];
  if (!speeds.length) return null;
  return speeds.map(({speed, block}) => {
    const target = typeof block === 'string'
      ? formatIdentifier(block)
      : String(block?.tags ?? 'configured blocks').replace(/q\.any_tag\(|query\.any_tag\(|[()']/g, '').replace(/,/g, ' / ');
    return `${speed}× — ${target}`;
  }).join('; ');
}

function capsuleInfo(identifier) {
  const empty = identifier === 'utilitycraft:empty_liquid_capsule';
  if (empty) return {
    kind: 'Empty resource capsule',
    capacity: '8,000 mB',
    entries: [
      'Fluids: Water, Lava, XP, Liquified Aetherium, Dark Matter, Cryofluid, and Milk.',
      'Gas: Steam.',
      'World collection: Water and lava source blocks; fills up to eight 1,000 mB steps at once.',
    ],
  };
  const match = /^utilitycraft:(aetherium_liquid|dark_matter_liquid|cryofluid|water|lava|xp|steam)_capsule_(\d+|infinite)$/.exec(identifier);
  if (!match) return null;
  const [, family, tier] = match;
  const labels = {
    aetherium_liquid: 'Liquified Aetherium', dark_matter_liquid: 'Dark Matter', cryofluid: 'Cryofluid',
    water: 'Water', lava: 'Lava', xp: 'XP', steam: 'Steam',
  };
  const infinite = tier === 'infinite';
  const capacity = infinite ? 512000 : Number(tier) * 1000;
  return {
    kind: family === 'steam' ? 'Gas capsule' : 'Fluid capsule',
    capacity: `${number(capacity)} mB${infinite ? ' · infinite flag' : ''}`,
    entries: [
      `${family === 'steam' ? 'Gas' : 'Fluid'} contents: ${labels[family]}.`,
      infinite ? 'The runtime reuses this capsule after transfer.' : 'Transfers its contents and returns an Empty Liquid Capsule.',
      ['water', 'lava'].includes(family) && !infinite ? 'Can collect source blocks directly in the world.' : null,
    ].filter(Boolean),
  };
}

function specialFunction(components, identifier) {
  if (components['utilitycraft:drill']) {
    const size = components['utilitycraft:drill'].size;
    return `Absolute drill profile · ${size}×${size}×${size} operator area after its StatsCore ability is active.`;
  }
  if (components['utilitycraft:hammer']) return `Hammer tier ${components['utilitycraft:hammer'].tier}; registered as a hammer for AT Core ore-drop overrides.`;
  if (components['utilitycraft:hoe'] || components['utilitycraft:shovel']) {
    const hoe = components['utilitycraft:hoe'];
    const shovel = components['utilitycraft:shovel'];
    return [hoe && `Hoe area ${hoe.size} with ${hoe.runTractor ? 'tractor mode' : 'standard mode'}`, shovel && `shovel area ${shovel.size}`].filter(Boolean).join('; ');
  }
  if (identifier.includes('void_essence')) return 'Utility resource used by Ascendant Technology systems.';
  return null;
}

function itemProfile(identifier, components) {
  const capsule = capsuleInfo(identifier);
  const tags = components['minecraft:tags']?.tags ?? [];
  const durability = components['minecraft:durability']?.max_durability;
  const enchantable = components['minecraft:enchantable'];
  const repairItems = components['minecraft:repairable']?.repair_items ?? [];
  const wearable = components['minecraft:wearable'];
  const digger = components['minecraft:digger'];
  const special = specialFunction(components, identifier);
  const isEquipment = durability || enchantable || repairItems.length || wearable || digger || capsule;
  if (!isEquipment) return null;

  const itemType = capsule?.kind ?? (wearable ? 'Armor' : digger ? 'Tool' : 'Equipment');
  const stats = [
    durability && ['Durability', number(durability)],
    components['minecraft:damage'] !== undefined && ['Attack damage', components['minecraft:damage']],
    wearable?.protection !== undefined && ['Protection', wearable.protection],
    enchantable && ['Enchantability', `${enchantable.value} · ${formatIdentifier(enchantable.slot)} preset`],
    components['minecraft:fire_resistant'] && ['Fire resistant', 'Yes'],
  ].filter(Boolean);
  const properties = [
    digger && ['Tool roles', roleLabels(tags)],
    digger && ['Mining tier', tierFromTags(tags)],
    digger && ['Mining speed', digSpeedLabel(digger)],
    wearable?.slot && ['Wear slot', wearable.slot.replace('slot.armor.', '').replace(/\b\w/g, (letter) => letter.toUpperCase())],
    repairItems.length && ['Repair with', repairItems.map(repairLabel).filter(Boolean).join('; ')],
    special && ['Special function', special],
    capsule && ['Maximum capacity', capsule.capacity],
  ].filter(Boolean).filter(([, value]) => value);
  const sections = properties.length ? [{
    id: capsule ? 'resource-storage' : wearable ? 'equipment-properties' : 'tool-properties',
    label: capsule ? 'Storage' : wearable ? 'Equipment' : 'Tool Properties',
    title: capsule ? 'Resource storage' : wearable ? 'Equipment properties' : 'Tool properties',
    copy: capsule ? 'Capsule behavior is registered by Ascendant Technology\'s resource registry.' : 'Values are read from the registered Bedrock item definition.',
    facts: properties,
    entries: capsule?.entries,
  }] : [];
  const preset = enchantable ? (enchantable.slot === 'all'
    ? ['Uses the all-slot preset: every compatible category is considered by the item component.']
    : ENCHANTMENT_PRESETS[enchantable.slot] ?? []) : [];
  if (enchantable) sections.push({
    id: 'enchantments', label: 'Enchantments', title: 'Enchantment preset',
    copy: `Bedrock slot preset: ${formatIdentifier(enchantable.slot)} · enchantability ${enchantable.value}.`,
    entries: preset,
  });
  return {
    documentation: {
      description: capsule
        ? `${formatIdentifier(identifier)} stores ${capsule.kind.toLowerCase().replace(' capsule', '')} resources for Ascendant Technology machines and holders.`
        : `${formatIdentifier(identifier)} is a registered ${itemType.toLowerCase()} with its Bedrock durability, repair, and enchantment data documented below.`,
      basic: {itemType, maximumStack: components['minecraft:max_stack_size'] ?? 1},
      statistics: stats,
      statisticsTitle: itemType === 'Armor' ? 'Armor statistics' : itemType === 'Tool' ? 'Tool statistics' : 'Item statistics',
      sections,
    },
  };
}

function featureGeneration() {
  const features = new Map();
  for (const file of walk(path.join(addonRoot, 'BP', 'features')).filter((file) => file.endsWith('.json'))) {
    const feature = readJson(file)['minecraft:ore_feature'];
    if (!feature?.description?.identifier) continue;
    features.set(feature.description.identifier, {
      vein: feature.count,
      blocks: feature.replace_rules ?? [],
    });
  }
  const result = new Map();
  for (const file of walk(path.join(addonRoot, 'BP', 'feature_rules')).filter((file) => file.endsWith('.json'))) {
    const rule = readJson(file)['minecraft:feature_rules'];
    const feature = features.get(rule?.description?.places_feature);
    if (!feature) continue;
    const serializedConditions = JSON.stringify(rule.conditions ?? {}).toLowerCase();
    const dimension = serializedConditions.includes('the_end') ? 'The End'
      : serializedConditions.includes('nether') ? 'Nether' : 'Overworld';
    const distribution = rule.distribution ?? {};
    const extent = distribution.y?.extent;
    const height = Array.isArray(extent) ? `Y ${extent[0]} to ${extent[1]}` : 'Configured distribution';
    const chance = distribution.scatter_chance;
    const chanceLabel = chance ? `${chance.numerator}/${chance.denominator} scatter` : 'Always evaluated';
    for (const replacement of feature.blocks) {
      const replaceable = replacement.may_replace ?? [];
      const dimensionMatch = dimension === 'Overworld'
        ? replaceable.some((block) => /:(?:deepslate|stone)$/.test(block))
        : dimension === 'Nether'
          ? replaceable.some((block) => /netherrack/.test(block))
          : replaceable.some((block) => /end_stone/.test(block));
      // A single ore feature can contain rules for multiple dimensions.  Its
      // replacement material is the authoritative discriminator for the
      // actual block that can generate in that dimension.
      if (!dimensionMatch) continue;
      const locations = result.get(replacement.places_block) ?? [];
      locations.push({
        dimension,
        height,
        replace: replaceable.map(formatIdentifier).join(', '),
        detail: `${distribution.iterations ?? 1} attempts/chunk · ${chanceLabel} · vein up to ${feature.vein}`,
      });
      result.set(replacement.places_block, locations);
    }
  }
  return result;
}

const ORE_DROPS = {
  'utilitycraft:deepslate_titanium_ore': {drop: 'utilitycraft:raw_titanium', silk: 'utilitycraft:deepslate_titanium_ore', mode: 'bonus', perLevel: [0.6, 1]},
  'utilitycraft:deepslate_tungsten_ore': {drop: 'utilitycraft:raw_tungsten', silk: 'utilitycraft:deepslate_tungsten_ore', mode: 'bonus', perLevel: [0.6, 1]},
  'utilitycraft:nether_tungsten_ore': {drop: 'utilitycraft:raw_tungsten', silk: 'utilitycraft:nether_tungsten_ore', mode: 'bonus', perLevel: [0.6, 1]},
  'utilitycraft:deepslate_aetherium_ore': {drop: 'utilitycraft:aetherium_shard', silk: 'utilitycraft:deepslate_aetherium_ore', mode: 'multiplier', perLevel: [0.2, 0.5]},
  'utilitycraft:end_aetherium_ore': {drop: 'utilitycraft:aetherium_shard', silk: 'utilitycraft:end_aetherium_ore', mode: 'multiplier', perLevel: [0.5, 0.75]},
};

function fortuneRows(config) {
  return Array.from({length: 11}, (_, fortune) => {
    let min = 1;
    let max = 1;
    if (config.mode === 'bonus') {
      min += config.perLevel[0] * fortune;
      max += config.perLevel[1] * fortune;
    } else {
      min *= 1 + config.perLevel[0] * fortune;
      max *= 1 + config.perLevel[1] * fortune;
    }
    min = Math.max(1, Math.floor(min));
    max = Math.max(1, Math.floor(max));
    return {fortune, id: config.drop, amount: min === max ? `×${min}` : `×${min}–${max}`};
  });
}

function oreModifiers(identifier) {
  const modifiers = [
    {title: 'AT Core resolver', copy: 'Replaces the normal raw-resource stack with the configured formula shown above. Silk Touch leaves the ore block intact.'},
    {title: 'StatsCore · Double / Triple Trouble', copy: 'A refined compatible tool can roll a full extra loot-table result; Triple Trouble can add a second extra result.'},
  ];
  if (identifier.includes('titanium_ore')) {
    modifiers.splice(1, 0,
      {title: 'Smelting Pickaxe', copy: 'Drops Titanium instead of Raw Titanium, using its own Fortuna multiplier; awards 2–5 XP.'},
      {title: 'Hammer', copy: 'Drops 5–12 Titanium Dust, plus 1–3 per Fortuna level.'},
      {title: 'StatsCore · Forger / Crushing', copy: 'Forger adds Titanium Plates equal to the tracked ore-drop amount; Crushing adds one Titanium Dust.'},
    );
  } else if (identifier.includes('tungsten_ore')) {
    modifiers.splice(1, 0,
      {title: 'Hammer', copy: 'Drops 5–12 Raw Tungsten Dust, plus 1–3 per Fortuna level.'},
      {title: 'StatsCore · Forger / Crushing', copy: 'Forger adds Tungsten Plates equal to the tracked ore-drop amount; Crushing adds one Raw Tungsten Dust.'},
    );
  } else {
    modifiers.splice(1, 0, {title: 'StatsCore · Bonus Loot', copy: 'When the tool\'s resolved Bonus Loot chance succeeds, the ore gets an additional matching drop amount.'});
  }
  return modifiers;
}

function blockProfile(identifier, block, generation) {
  const components = block.components ?? {};
  if (identifier === 'utilitycraft:absolute_container') {
    const machine = components['utilitycraft:absolute_container']?.machine ?? {};
    const inventorySize = components['utilitycraft:absolute_container']?.entity?.inventory_size;
    const storageSlots = 168; // The runtime explicitly configures indices 0–167.
    return {
      blockType: 'Absolute storage container', tier: 'Absolute',
      description: 'A high-density, all-in-one Dorios network container for items, energy, and one fluid type.',
      blockDetails: [
        ['Item storage', `${number(storageSlots)} configurable input/output slots`],
        ['Entity inventory', `${number(inventorySize)} total slots · indices 168 and 169 display energy and fluid`],
        ['Energy capacity', `${number(machine.energy_cap)} DE`],
        ['Configured energy rate', `${number(machine.rate_speed_base)} DE/t`],
        ['Fluid capacity', `${number(machine.fluid_cap)} mB`],
        ['Fluid types', machine.fluid_types],
        ['Configured fluid rate', `${number(machine.fluid_rate)} mB/t`],
        ['Function', 'All 168 storage slots accept both input and output; it stays active and exposes item, energy, and fluid interfaces to the network.'],
      ],
      blockData: {
        breakTime: components['minecraft:destructible_by_mining']?.seconds_to_destroy,
        explosionResistance: components['minecraft:destructible_by_explosion'] === false ? 'Immune' : undefined,
        tool: 'Pickaxe', directional: true, lightEmission: components['minecraft:light_emission'],
      },
    };
  }
  const drop = ORE_DROPS[identifier];
  if (!drop) return null;
  const tags = [
    ...Object.keys(components).filter((key) => key.startsWith('tag:')),
    ...(Array.isArray(components['minecraft:tags']) ? components['minecraft:tags'] : []),
  ];
  return {
    blockType: 'Ore', tier: tierFromTags(tags),
    description: `${formatIdentifier(identifier)} is a world-generated ore with an AT Core drop resolver and optional StatsCore mining modifiers.`,
    blockData: {
      breakTime: components['minecraft:destructible_by_mining']?.seconds_to_destroy,
      explosionResistance: components['minecraft:destructible_by_explosion'] === false ? 'Immune' : components['minecraft:destructible_by_explosion']?.explosion_resistance,
      tool: `${tierFromTags(tags)} pickaxe`, lootTable: components['minecraft:loot'],
    },
    mining: {
      requiredTool: `${tierFromTags(tags)} pickaxe`, silkDrop: {id: drop.silk, amount: '×1'},
      drops: fortuneRows(drop), locations: generation.get(identifier) ?? [], modifiers: oreModifiers(identifier),
    },
  };
}

if (!fs.existsSync(addonRoot)) {
  process.stdout.write(
    `Ascendant Technology project was not found at ${addonRoot}; preserving generated documentation profiles.\n`,
  );
  process.exit(0);
}

const manifest = readJson(manifestPath).content ?? {};
const knownItems = new Set((manifest.items ?? []).map((entry) => entry.identifier));
const knownBlocks = new Set((manifest.blocks ?? []).map((entry) => entry.identifier));
const itemProfiles = {};
for (const file of walk(path.join(addonRoot, 'BP', 'items')).filter((file) => file.endsWith('.json'))) {
  const item = readJson(file)['minecraft:item'];
  const identifier = item?.description?.identifier;
  if (!identifier || !knownItems.has(identifier)) continue;
  const profile = itemProfile(identifier, item.components ?? {});
  if (profile) itemProfiles[identifier] = profile;
}
const generation = featureGeneration();
const blockProfiles = {};
for (const file of walk(path.join(addonRoot, 'BP', 'blocks')).filter((file) => file.endsWith('.json'))) {
  const block = readJson(file)['minecraft:block'];
  const identifier = block?.description?.identifier;
  if (!identifier || !knownBlocks.has(identifier)) continue;
  const profile = blockProfile(identifier, block, generation);
  if (profile) blockProfiles[identifier] = profile;
}

fs.writeFileSync(outputPath, `${JSON.stringify({items: itemProfiles, blocks: blockProfiles}, null, 2)}\n`);
console.log(`Generated ${Object.keys(itemProfiles).length} Ascendant item profiles and ${Object.keys(blockProfiles).length} block profiles.`);
