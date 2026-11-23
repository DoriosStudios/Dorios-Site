// Exact source sprites. These paths are shared by the synchronizer and React UI.
export const ASCENDANT_UI_ICON_NAMES = Object.freeze([
  'brew', 'water', 'lava', 'steam', 'xp', 'cryofluid', 'liquified_aetherium', 'dark_matter', 'milk', 'blood', 'generic_fluid',
  'energy', 'pressure_meter', 'generic_speed', 'energy_upgrade', 'speed_upgrade', 'filter_upgrade',
  'quantity_upgrade', 'range_upgrade', 'stack_upgrade',
  'full_heart', 'half_heart', 'extra_damage', 'damage_reduction', 'iron_pickaxe', 'special_book', 'clock', 'hourglass',
  'catalyst', 'hyper_processing_upgrade', 'stats', 'info', 'recipe_book', 'progression', 'friends', 'map', 'new_item',
  'critical_chance', 'critical_multiplier', 'life_steal', 'ground_walking_speed', 'swimming_speed', 'lava_walking_speed',
  'furnace', 'gold_ingot', 'evasion', 'extra_arrow',
]);

export const VANILLA_EFFECT_NAMES = Object.freeze([
  'absorption', 'bad_omen', 'blindness', 'breath_of_the_nautilus', 'conduit_power', 'darkness', 'fire_resistance',
  'haste', 'health_boost', 'hunger', 'infested', 'invisibility', 'jump_boost', 'levitation', 'mining_fatigue',
  'nausea', 'night_vision', 'oozing', 'poison', 'raid_omen', 'regeneration', 'resistance', 'slow_falling',
  'slowness', 'speed', 'strength', 'trial_omen', 'village_hero', 'water_breathing', 'weakness', 'weaving', 'wind_charged', 'wither',
]);

const glyph = name => `/img/addons/ascendant/resources/glyphs/${name}.png`;
export const WIKI_UI_ICONS = Object.freeze(Object.fromEntries([
  ...ASCENDANT_UI_ICON_NAMES.map(name => [name, glyph(name)]),
  ...VANILLA_EFFECT_NAMES.map(name => [`effect:${name}`, `/img/wiki/ui/effects/${name}.png`]),
]));

const normalize = value => String(value ?? '').replace(/^minecraft:/, '').replace(/[_-]/g, ' ').trim().toLowerCase().replace(/\s+/g, ' ');
const metrics = {
  full_heart: ['Max health'], extra_damage: ['Bonus damage', 'Attack damage', 'Attack multiplier'],
  damage_reduction: ['Damage reduction', 'Knockback resistance', 'Armor', 'Defense'],
  energy: ['Energy capacity', 'Base energy consumption', 'Energy'],
  generic_fluid: ['Fluid capacity'], pressure_meter: ['Gas capacity'],
  clock: ['Base processing time', 'Nominal cycle', 'Time', 'Cooldown'],
  generic_speed: ['Processing speed', 'Mining speed', 'Base mining speed', 'Conversion speed'],
  iron_pickaxe: ['Mining tier', 'Tool tier'], stats: ['Durability', 'Capacity', 'Storage capacity'],
  special_book: ['Enchantability'], furnace: ['Fuel use', 'Coal-equivalent yield'],
  range_upgrade: ['Range'], catalyst: ['Catalyst slots'], new_item: ['Secondary output'],
  critical_chance: ['Critical chance'], critical_multiplier: ['Critical multiplier'], life_steal: ['Life steal'],
  ground_walking_speed: ['Movement speed'], swimming_speed: ['Water speed'], lava_walking_speed: ['Lava speed'],
  'effect:regeneration': ['Health regeneration'], 'effect:jump_boost': ['Extra jumps'],
  'effect:fire_resistance': ['Fire resistant'],
};
const metricKeys = new Map(Object.entries(metrics).flatMap(([key,labels]) => labels.map(label => [normalize(label),key])));
const effectKeys = new Map(VANILLA_EFFECT_NAMES.map(name => [normalize(name),`effect:${name}`]));
effectKeys.set('hero of the village', 'effect:village_hero');

// Resolve canonical source labels before translation; never infer effects from prose or item names.
export function wikiIconKey(label, kind = 'metric') {
  const key = normalize(label);
  return kind === 'effect' || kind === 'immunity'
    ? effectKeys.get(key.replace(/\s+(?:[ivx]+|\d+)$/i, '')) ?? null
    : metricKeys.get(key) ?? null;
}

export function wikiStatValue(label, value) {
  const icon = normalize(label) === 'fire resistant' && !isWikiPropertyFlag(label,value) ? null : wikiIconKey(label);
  // Health bonuses are already measured in hearts in the source data.
  // Never divide the value by two or infer a health unit from arbitrary text.
  const hearts = icon === 'full_heart' && String(value).match(/^([+-]?\s*\d+(?:[.,]\d+)?)\s+hearts?$/i);
  return {icon, value:hearts ? hearts[1].replace(/\s+/g, '') : value};
}

export function isWikiPropertyFlag(label, value) {
  return normalize(label) === 'fire resistant' && (value === true || /^(yes|true)$/i.test(String(value)));
}

export function wikiHeartIcons(label, value) {
  if (wikiIconKey(label) !== 'full_heart') return null;
  const match=String(value).match(/^([+-]?\s*\d+(?:[.,]\d+)?)\s+hearts?$/i);
  if (!match) return null;
  const amount=Math.abs(Number(match[1].replace(/\s+/g,'').replace(',','.')));
  // Fractional heart bonuses use the original half-heart sprite. Other units
  // remain textual rather than being rounded into an incorrect heart count.
  if (!Number.isFinite(amount) || !Number.isInteger(amount*2)) return null;
  return [...Array.from({length:Math.floor(amount)},()=>'full_heart'),...(amount%1?['half_heart']:[])];
}

export const WIKI_SECTION_ICONS = Object.freeze({
  details:'info', specs:'stats', recipes:'recipe_book', drops:'new_item', uses:'progression', related:'friends',
  notes:'info', locations:'map', modifiers:'stats', sieving:'iron_pickaxe',
});
export const WIKI_UPGRADE_ICONS = Object.freeze({
  speed:'speed_upgrade', energy:'energy_upgrade', hyper:'hyper_processing_upgrade', stack:'stack_upgrade',
  filter:'filter_upgrade', quantity:'quantity_upgrade', range:'range_upgrade',
});
