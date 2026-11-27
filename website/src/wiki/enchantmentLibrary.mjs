const mining = ['Efficiency', 'Fortune', 'Silk Touch'];
const weapon = ['Sharpness', 'Smite', 'Bane of Arthropods'];
const armor = ['Protection', 'Fire Protection', 'Blast Protection', 'Projectile Protection', 'Thorns'];
const common = ['Unbreaking', 'Mending', 'Curse of Vanishing'];
const slots = {
  pickaxe: mining, hoe: mining, shovel: mining, axe: [...mining, ...weapon], shears: ['Efficiency', 'Silk Touch'],
  sword: [...weapon, 'Fire Aspect', 'Looting', 'Knockback'],
  armor_head: [...armor, 'Respiration', 'Aqua Affinity', 'Curse of Binding'],
  armor_torso: [...armor, 'Curse of Binding'],
  armor_legs: [...armor, 'Swift Sneak', 'Curse of Binding'],
  armor_feet: [...armor, 'Feather Falling', 'Depth Strider', 'Frost Walker', 'Soul Speed', 'Curse of Binding'],
  bow: ['Power', 'Punch', 'Flame', 'Infinity'],
  crossbow: ['Multishot', 'Piercing', 'Quick Charge'],
  trident: ['Impaling', 'Loyalty', 'Riptide', 'Channeling'],
  fishing_rod: ['Luck of the Sea', 'Lure'],
  shield: [],
  elytra: [],
};

const levels = {
  Efficiency: 5, Fortune: 3, 'Silk Touch': 1, Sharpness: 5, Smite: 5, 'Bane of Arthropods': 5,
  'Fire Aspect': 2, Looting: 3, Knockback: 2, Protection: 4, 'Fire Protection': 4,
  'Blast Protection': 4, 'Projectile Protection': 4, Thorns: 3, Respiration: 3,
  'Aqua Affinity': 1, 'Curse of Binding': 1, 'Swift Sneak': 3, 'Feather Falling': 4,
  'Depth Strider': 3, 'Frost Walker': 2, 'Soul Speed': 3, Power: 5, Punch: 2, Flame: 1,
  Infinity: 1, Multishot: 1, Piercing: 4, 'Quick Charge': 3, Impaling: 5, Loyalty: 3,
  Riptide: 3, Channeling: 1, 'Luck of the Sea': 3, Lure: 3, Unbreaking: 3, Mending: 1, 'Curse of Vanishing': 1,
};
const conflictSets = [
  ['Fortune', 'Silk Touch'], weapon, armor.filter(name => name !== 'Thorns'),
  ['Depth Strider', 'Frost Walker'], ['Infinity', 'Mending'], ['Multishot', 'Piercing'],
  ['Riptide', 'Loyalty'], ['Riptide', 'Channeling'],
];

export function enchantmentLibrary(profile) {
  if (!profile?.slot) return [];
  const compatible = slots[profile.slot];
  if (!compatible) return [];
  return [...compatible, ...common].map(name => ({name, maxLevel: levels[name]}));
}

export function enchantmentConflicts(active, name) {
  return Object.keys(active).filter(other => other !== name && conflictSets.some(group => group.includes(name) && group.includes(other)));
}
