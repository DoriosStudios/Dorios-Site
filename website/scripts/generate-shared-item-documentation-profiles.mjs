import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const siteRoot = path.resolve(import.meta.dirname, '..');
const bridgeRoot = process.env.BRIDGE_PROJECTS_PATH ?? path.join(
  os.homedir(), 'AppData', 'Local', 'com.bridge.dev', 'bridge', 'projects',
);

const projects = [
  {id: 'utilitycraft', name: 'UtilityCraft', source: 'UtilityCraft'},
  {id: 'heavy-machinery', name: 'Heavy Machinery', source: 'UtilityCraft-Heavy-Machinery'},
  {id: 'digital-storage', name: 'Digital Storage', source: 'UtilityCraft-Digital-Storage'},
];

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

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
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
    if (character === '"' || character === "'") { quote = character; output += character; continue; }
    if (character === '/' && next === '/') { while (index < source.length && source[index] !== '\n') index += 1; output += '\n'; continue; }
    if (character === '/' && next === '*') { index += 2; while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index += 1; index += 1; continue; }
    output += character;
  }
  return output;
}

function readJson(file) {
  return JSON.parse(stripJsonComments(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')));
}

function label(value) {
  return String(value ?? '').replace(/^.*:/, '').replace(/[_/-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function number(value) {
  return Number(value).toLocaleString('en-US');
}

function itemRole(identifier, components) {
  if (identifier.endsWith(':storage_cell') || identifier.endsWith('_storage_cell')) return 'Digital storage cell';
  if (components['minecraft:wearable']) return 'Armor';
  if (components['minecraft:digger']) return 'Tool';
  if (components['minecraft:food']) return 'Food';
  if (components['minecraft:projectile'] || components['minecraft:shooter']) return 'Ranged equipment';
  if (components['minecraft:durability']) return 'Durable equipment';
  return 'Item';
}

function toolRoles(tags, identifier) {
  const map = [
    ['minecraft:is_pickaxe', 'Pickaxe'], ['minecraft:is_shovel', 'Shovel'], ['minecraft:is_axe', 'Axe'],
    ['minecraft:is_hoe', 'Hoe'], ['minecraft:is_sword', 'Sword'],
  ];
  const roles = map.filter(([tag]) => tags.includes(tag)).map(([, role]) => role);
  if (/aiot|paxel/i.test(identifier)) roles.push(/aiot/i.test(identifier) ? 'AiOT' : 'Paxel');
  return [...new Set(roles)];
}

function miningTier(tags) {
  const tiers = [['netherite', 'Netherite'], ['diamond', 'Diamond'], ['iron', 'Iron'], ['stone', 'Stone'], ['wood', 'Wood']];
  return tiers.find(([tier]) => tags.some((tag) => tag.includes(`${tier}_tier`)))?.[1] ?? null;
}

function repairLabel(record) {
  const items = record?.items?.map(label).join(' + ');
  if (!items) return null;
  const formula = String(record.repair_amount ?? '');
  const ratio = formula.match(/\*\s*(0?\.\d+)/)?.[1];
  return ratio ? `${items} — ${Number(ratio) * 100}% of maximum durability` : (formula ? `${items} — ${formula}` : items);
}

function digSpeedLabel(digger) {
  const speeds = digger?.destroy_speeds ?? [];
  if (!speeds.length) return null;
  return speeds.map(({speed, block}) => {
    const target = typeof block === 'string' ? label(block) : 'Configured block tags';
    return `${speed}× — ${target}`;
  }).join('; ');
}

function storageCellCapacity(project, identifier) {
  if (project.id !== 'digital-storage') return null;
  const registry = path.join(bridgeRoot, project.source, 'BP', 'scripts', 'Machinery', 'storage', 'cell_store.js');
  if (!fs.existsSync(registry)) return null;
  const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = fs.readFileSync(registry, 'utf8').match(new RegExp(`"${escaped}"\\s*:\\s*(\\d+)`));
  return match ? Number(match[1]) : null;
}

function storageCellTiers(project) {
  if (project.id !== 'digital-storage') return [];
  const registry = path.join(bridgeRoot, project.source, 'BP', 'scripts', 'Machinery', 'storage', 'cell_store.js');
  if (!fs.existsSync(registry)) return [];
  return [...fs.readFileSync(registry, 'utf8').matchAll(/"(utilitycraft:[a-z_]*storage_cell)"\s*:\s*(\d+)/g)]
    .map(([, identifier, capacity]) => `${label(identifier)} — ${number(capacity)} items`)
    .sort((left, right) => Number(left.match(/[\d,]+/)?.[0]?.replace(',', '') ?? 0) - Number(right.match(/[\d,]+/)?.[0]?.replace(',', '') ?? 0));
}

function profileFor(project, identifier, components) {
  const tags = components['minecraft:tags']?.tags ?? [];
  const durability = components['minecraft:durability']?.max_durability;
  const enchantable = components['minecraft:enchantable'];
  const wearable = components['minecraft:wearable'];
  const digger = components['minecraft:digger'];
  const repairable = components['minecraft:repairable']?.repair_items ?? [];
  const food = components['minecraft:food'];
  const capacity = storageCellCapacity(project, identifier);
  const storageTiers = capacity ? storageCellTiers(project) : [];
  const attackDamage = components['minecraft:damage'];
  const protection = wearable?.protection;
  const type = itemRole(identifier, components);
  const hasDetails = durability || enchantable || wearable || digger || repairable.length || food || capacity || components['minecraft:cooldown'];
  if (!hasDetails) return {
    documentation: {
      basic: {itemType: type, maximumStack: components['minecraft:max_stack_size'] ?? 64},
    },
  };

  const statistics = [
    durability && ['Durability', number(durability)],
    attackDamage !== undefined && ['Attack damage', attackDamage?.value ?? attackDamage],
    protection !== undefined && ['Protection', protection?.value ?? protection],
    enchantable && ['Enchantability', `${enchantable.value} · ${label(enchantable.slot)} preset`],
    food?.nutrition !== undefined && ['Nutrition', food.nutrition],
    food?.saturation_modifier !== undefined && ['Saturation modifier', food.saturation_modifier],
    capacity && ['Item capacity', `${number(capacity)} stored items`],
  ].filter(Boolean);
  const properties = [
    digger && toolRoles(tags, identifier).length && ['Tool roles', toolRoles(tags, identifier).join(' · ')],
    digger && miningTier(tags) && ['Mining tier', miningTier(tags)],
    digger && ['Mining speed', digSpeedLabel(digger)],
    wearable?.slot && ['Wear slot', label(wearable.slot.replace('slot.armor.', 'armor_'))],
    repairable.length && ['Repair with', repairable.map(repairLabel).filter(Boolean).join('; ')],
    components['minecraft:fire_resistant'] && ['Fire resistant', 'Yes'],
    components['minecraft:cooldown']?.category && ['Cooldown category', label(components['minecraft:cooldown'].category)],
    components['minecraft:cooldown']?.duration && ['Cooldown', `${components['minecraft:cooldown'].duration} seconds`],
    food?.can_always_eat && ['Can always eat', 'Yes'],
    food?.using_converts_to && ['Used item becomes', label(food.using_converts_to)],
    components['minecraft:use_modifiers']?.use_duration && ['Use duration', `${components['minecraft:use_modifiers'].use_duration} seconds`],
    components['minecraft:use_animation'] && ['Use animation', label(components['minecraft:use_animation'])],
    capacity && ['Network behavior', 'Stores one item type per cell; capacity is shared when the cell is installed in a Storage Cell Drive.'],
  ].filter((entry) => entry && entry[1]);
  const sections = properties.length ? [{
    id: capacity ? 'storage-cell' : wearable ? 'equipment' : digger ? 'tool-properties' : 'properties',
    label: capacity ? 'Storage Cell' : wearable ? 'Equipment' : digger ? 'Tool Properties' : 'Properties',
    title: capacity ? 'Digital storage cell' : wearable ? 'Equipment properties' : digger ? 'Tool properties' : 'Item properties',
    copy: capacity ? 'Capacity is read from Digital Storage’s runtime cell registry.' : 'Values are read from the registered Bedrock item definition.',
    facts: properties,
    ...(storageTiers.length ? {entries: storageTiers} : {}),
  }] : [];
  const preset = enchantable ? ENCHANTMENT_PRESETS[enchantable.slot] ?? ['All compatible enchantments in the configured Bedrock slot preset.'] : [];
  if (enchantable) sections.push({
    id: 'enchantments', label: 'Enchantments', title: 'Enchantment preset',
    copy: `Bedrock slot preset: ${label(enchantable.slot)} · enchantability ${enchantable.value}.`, entries: preset,
  });
  if (food?.effects?.length) sections.push({
    id: 'food-effects', label: 'Food Effects', title: 'Food effects',
    entries: food.effects.map((effect) => `${label(effect.name ?? effect.effect)} · ${effect.chance === undefined ? 'always' : `${Math.round(effect.chance * 100)}% chance`}`),
  });
  return {
    documentation: {
      description: capacity
        ? `${label(identifier)} is a Digital Storage cell with a fixed item capacity documented from the runtime registry.`
        : `${label(identifier)} has its registered Bedrock item properties documented below.`,
      basic: {itemType: type, maximumStack: components['minecraft:max_stack_size'] ?? 64},
      statisticsTitle: type === 'Armor' ? 'Armor statistics' : type === 'Tool' ? 'Tool statistics' : 'Item statistics',
      statistics,
      sections,
    },
  };
}

for (const project of projects) {
  const root = path.join(bridgeRoot, project.source);
  const output = path.join(siteRoot, 'src', 'wiki', 'projects', project.id, 'documentationProfiles.generated.json');
  if (!fs.existsSync(root)) {
    console.warn(`${project.name} source was not found; preserving ${path.relative(siteRoot, output)}.`);
    continue;
  }
  const profiles = {};
  for (const file of walk(path.join(root, 'BP', 'items')).filter((file) => file.endsWith('.json') && !/[\\/]ui[\\/]/i.test(file))) {
    let item;
    try { item = readJson(file)['minecraft:item']; } catch { continue; }
    const identifier = item?.description?.identifier;
    if (!identifier) continue;
    profiles[identifier] = profileFor(project, identifier, item.components ?? {});
  }
  fs.writeFileSync(output, `${JSON.stringify({items: profiles}, null, 2)}\n`);
  console.log(`Generated ${Object.keys(profiles).length} ${project.name} item profiles.`);
}
