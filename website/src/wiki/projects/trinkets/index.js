import manifest from './manifest.json';
import trinketProfiles from './trinketProfiles.json';
import categorySections from './categorySections.json';
import {createGeneratedProject} from '../createGeneratedProject';

const SLOT_LABELS = {
  head: 'Head',
  body: 'Body',
  feet: 'Feet',
  necklace: 'Necklaces',
  ring: 'Rings',
  charm: 'Charms',
  talisman: 'Talismans',
  gauntlet: 'Gauntlets',
  heartycharm: 'Hearty Charms',
  doll: 'Dolls',
  witherring: 'Rings',
  archaiccharm: 'Archaic Charms',
  amulet: 'Amulets',
};

const STAT_LABELS = {
  health: 'Max health',
  mana: 'Max mana',
  attack: 'Bonus damage',
  attackMulti: 'Attack multiplier',
  knockback: 'Knockback',
  knockbackRes: 'Knockback resistance',
  damageReduction: 'Damage reduction',
  speed: 'Movement speed',
  waterSpeed: 'Water speed',
  lavaSpeed: 'Lava speed',
  healthRegen: 'Health regeneration',
  lifeSteal: 'Life steal',
  manaRegen: 'Mana regeneration',
  manaSteal: 'Mana steal',
  critMulti: 'Critical multiplier',
  critChance: 'Critical chance',
  thorns: 'Thorns',
  fireAspect: 'Fire aspect',
  extraJumps: 'Extra jumps',
};

const PERCENT_STATS = new Set([
  'attackMulti', 'knockbackRes', 'damageReduction', 'speed', 'waterSpeed',
  'lavaSpeed', 'lifeSteal', 'manaSteal', 'critMulti', 'critChance', 'thorns',
]);

const CRAFTABLE_ITEMS = new Set(manifest.content.recipes.map((recipe) => recipe.result?.id).filter(Boolean));
const SPECIAL_ABILITIES = {
  'dorios:cloud_steps_boots': {name: 'Extra Jump', description: 'Adds one extra jump while the boots are equipped.', usage: 'Equip the boots in the Feet slot. The extra jump becomes available while they are worn.'},
  'dorios:lava_waders': {name: 'Lava Walking', description: 'Allows the wearer to walk above lava.', usage: 'Equip the waders in the Feet slot before crossing lava; the traversal behavior applies while worn.'},
  'dorios:bloodbound_emblem': {name: 'Bloodbound Strength', description: 'Grants Strength after the wearer defeats an entity.', usage: 'Equip the emblem before combat. Its bonus is triggered after defeating an entity.'},
  'dorios:frost_quiver': {name: 'Frost Arrows', description: 'Applies Slowness when an arrow hits a target.', usage: 'Equip the quiver before using a bow; its effect is applied by successful arrow hits.'},
  'dorios:molten_quiver': {name: 'Molten Arrows', description: 'Ignites targets struck by arrows.', usage: 'Equip the quiver before using a bow; targets are ignited when an arrow connects.'},
  'dorios:tideforged_carapace': {name: 'Underwater Guard', description: 'Grants Resistance while the wearer is underwater.', usage: 'Equip the carapace in its trinket slot. Its protection activates while underwater.'},
  'dorios:venom_quiver': {name: 'Venom Arrows', description: 'Applies Poison when an arrow hits a target.', usage: 'Equip the quiver before using a bow; its effect is applied by successful arrow hits.'},
};

const titleize = (value) => String(value)
  .replace(/^.*:/, '')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

function statSummary(stats = {}) {
  return Object.entries(stats).map(([stat, value]) => {
    const displayedValue = stat === 'health' ? `${value / 2} hearts` : PERCENT_STATS.has(stat) ? `${value}%` : value;
    const sign = Number(value) > 0 ? '+' : '';
    return `${STAT_LABELS[stat] ?? titleize(stat)} ${sign}${displayedValue}`;
  });
}

function attributeDetails(stats = {}) {
  return Object.entries(stats).map(([stat, value]) => {
    const displayedValue = stat === 'health' ? `${value / 2} hearts` : PERCENT_STATS.has(stat) ? `${value}%` : value;
    return {
      name: STAT_LABELS[stat] ?? titleize(stat),
      modifier: `${Number(value) > 0 ? '+' : ''}${displayedValue}`,
    };
  });
}

function effectDetails(effects = {}, mode) {
  return Object.entries(effects).map(([effect, level]) => ({
    name: `${titleize(effect)} ${level}`,
    description: mode === 'active'
      ? `Applies ${titleize(effect)} when this trinket's registered active condition is triggered.`
      : `Grants ${titleize(effect)} while this trinket's passive behavior is active.`,
  }));
}

function itemDescription(item, slotLabel, documentation) {
  const capabilities = documentation.capabilities;
  if (capabilities.specialAbility) return `${item.name} is an equippable trinket for the ${slotLabel} slot. ${capabilities.specialAbility.description}`;
  if (capabilities.passiveEffects.length) return `${item.name} is an equippable trinket for the ${slotLabel} slot that grants ${capabilities.passiveEffects.map(({name}) => name).join(' and ')}.`;
  if (capabilities.attributeModifiers.length) return `${item.name} is an equippable trinket for the ${slotLabel} slot that modifies ${capabilities.attributeModifiers.map(({name}) => name).join(' and ')}.`;
  const firstDrop = documentation.acquisition.entityDrops[0];
  if (firstDrop) return `${item.name} is an equippable trinket for the ${slotLabel} slot, primarily obtained from ${titleize(firstDrop.entity)} encounters.`;
  return `${item.name} is an equippable trinket for the ${slotLabel} slot, obtained through add-on exploration and progression.`;
}

function effectSummary(effects = {}) {
  return Object.entries(effects).map(([effect, level]) => `${titleize(effect)} ${level}`);
}

function primaryEffect(profile, useGreatPrefix = false) {
  const effects = [...Object.entries(profile.passives ?? {}), ...Object.entries(profile.actives ?? {})]
    .sort((left, right) => Number(right[1]) - Number(left[1]));
  if (effects.length) {
    const [effect, level] = effects[0];
    if (useGreatPrefix && Number(level) > 1) return `Great ${titleize(effect)}`;
    return `${titleize(effect)} ${level}`;
  }
  if (profile.immunities?.length) return `Immune to ${titleize(profile.immunities[0])}`;
  return 'No status effect';
}

function primaryAttribute(profile) {
  return statSummary(profile.stats)[0] ?? 'No attribute change';
}

function ringCategory(identifier) {
  if (identifier.includes(':heavy_')) return 'Heavy Rings';
  if (identifier.includes(':strong_')) return 'Strong Rings';
  return 'Rings';
}

function primaryAcquisition(identifier, profile) {
  if (CRAFTABLE_ITEMS.has(identifier)) return 'Crafting';
  const candidates = [
    ...(profile.drops ?? []).map(({entity, chance}) => ({chance, label: `${titleize(entity)} drop · ${chance * 100}%`})),
    ...(profile.loot?.structures ?? []).map(({structure, chance}) => ({chance, label: `${titleize(structure === 'default' ? 'dimension loot' : structure)} · ${chance * 100}%`})),
    ...(profile.loot?.biomes ?? []).map(({biome, chance}) => ({chance, label: `${titleize(biome)} biome · ${chance * 100}%`})),
  ];
  return candidates.sort((left, right) => right.chance - left.chance)[0]?.label ?? 'Add-on progression';
}

function categorySummary(identifier, profile, category) {
  const source = primaryAcquisition(identifier, profile);
  const specialAbility = SPECIAL_ABILITIES[identifier]?.name ?? primaryEffect(profile);
  if (profile.trinket === 'heartycharm') {
    const health = profile.stats?.health;
    const healthLabel = health === undefined ? 'No health bonus' : `${health > 0 ? '+' : ''}${health / 2} hearts`;
    const effects = [
      ...effectSummary(profile.passives),
      ...effectSummary(profile.actives),
      ...(profile.immunities ?? []).map((effect) => `Immune to ${titleize(effect)}`),
    ];
    return [['Health', healthLabel], ['Effects', effects.join(' · ') || 'None'], ['Best source', source]];
  }
  if (profile.trinket === 'feet') {
    const speed = profile.stats?.speed;
    return [['Speed', speed === undefined ? 'No speed bonus' : `+${speed}%`], ['Special ability', specialAbility], ['Best source', source]];
  }
  if (['Rings', 'Heavy Rings', 'Strong Rings'].includes(category)) {
    return [
      ['Main effect', primaryEffect(profile, category !== 'Rings')],
      ['Attribute', primaryAttribute(profile)],
      ['Best source', source],
    ];
  }
  const effectLabel = profile.trinket === 'gauntlet' ? 'Combat effect'
    : profile.trinket === 'body' ? 'Special effect'
      : 'Main effect';
  return [[effectLabel, specialAbility], ['Attribute', primaryAttribute(profile)], ['Best source', source]];
}

function acquisitionSummary(profile) {
  const sources = [];
  const drops = profile.drops ?? [];
  if (drops.length) {
    sources.push(`Mob drops: ${drops.map(({entity, chance}) => `${titleize(entity)} (${chance * 100}%)`).join(', ')}`);
  }
  const structures = profile.loot?.structures ?? [];
  if (structures.length) {
    sources.push(`Structure loot: ${structures.map(({structure, chance}) => `${titleize(structure)} (${chance * 100}%)`).join(', ')}`);
  }
  const biomes = profile.loot?.biomes ?? [];
  if (biomes.length) {
    const chances = biomes.map(({chance}) => chance * 100);
    const range = Math.min(...chances) === Math.max(...chances)
      ? `${chances[0]}%`
      : `${Math.min(...chances)}–${Math.max(...chances)}%`;
    sources.push(`Biome loot: ${biomes.length} supported biome${biomes.length === 1 ? '' : 's'} (${range})`);
  }
  return sources;
}

function auxiliaryCategory(item) {
  if (/_(?:helmet|chestplate|leggings|boots)$/.test(item.shortId)) return 'Armor Sets';
  if (/empty_ring/.test(item.shortId)) return 'Ring Materials';
  if (/scroll/.test(item.shortId)) return 'Utility Items';
  return item.category || 'Materials';
}

function decorateItem(item) {
  const profile = trinketProfiles[item.identifier];
  if (!profile) {
    return {
      ...item,
      category: auxiliaryCategory(item),
      itemType: 'Supporting item',
      summaryFacts: [
        ['Type', auxiliaryCategory(item)],
        ['Stack', /_(?:helmet|chestplate|leggings|boots)$|scroll|empty_ring/.test(item.shortId) ? '1' : 'Standard'],
      ],
      detailFacts: [
        ['Item type', auxiliaryCategory(item)],
        ['Equip slot', 'Not a trinket slot'],
      ],
      documentation: {
        description: `${item.name} is a supporting ${auxiliaryCategory(item).toLowerCase()} item used within Dorios' Trinkets progression.`,
        basic: {
          itemType: auxiliaryCategory(item),
          maximumStack: /_(?:helmet|chestplate|leggings|boots)$|scroll|empty_ring/.test(item.shortId) ? '1' : 'Standard',
        },
        capabilities: {},
        acquisition: {entityDrops: [], structures: [], biomes: []},
      },
    };
  }

  const attributes = statSummary(profile.stats);
  const passives = effectSummary(profile.passives);
  const actives = effectSummary(profile.actives);
  const immunities = profile.immunities ?? [];
  const acquisition = acquisitionSummary(profile);
  const slotLabel = SLOT_LABELS[profile.trinket] ?? titleize(profile.trinket);
  const category = ['ring', 'witherring'].includes(profile.trinket) ? ringCategory(item.identifier) : slotLabel;
  const summaryFacts = categorySummary(item.identifier, profile, category);
  const primarySource = primaryAcquisition(item.identifier, profile);
  const specialAbility = SPECIAL_ABILITIES[item.identifier];
  const documentation = {
    basic: {
      itemType: 'Equippable trinket',
      equipSlot: slotLabel.replace(/ Trinkets$/, ''),
      maximumStack: '1',
    },
    capabilities: {
      attributeModifiers: attributeDetails(profile.stats),
      passiveEffects: effectDetails(profile.passives, 'passive'),
      activeEffects: effectDetails(profile.actives, 'active'),
      specialAbility,
      immunities: (profile.immunities ?? []).map((immunity) => ({
        name: titleize(immunity),
        description: `Prevents ${titleize(immunity)} from affecting the wearer while this trinket is active.`,
      })),
    },
    acquisition: {
      entityDrops: profile.drops ?? [],
      structures: profile.loot?.structures ?? [],
      biomes: profile.loot?.biomes ?? [],
    },
    usage: specialAbility?.usage,
  };
  documentation.description = itemDescription(item, documentation.basic.equipSlot, documentation);

  return {
    ...item,
    category,
    itemType: 'Equippable trinket',
    trinketSlot: slotLabel,
    summaryFacts,
    documentation,
    detailFacts: [
      ['Item type', 'Equippable trinket'],
      ['Equip slot', slotLabel.replace(/ Trinkets$/, '')],
      ['Attribute bonuses', attributes.length ? attributes : 'None'],
      ['Passive effects', passives.length ? passives : 'None'],
      ['Active effects', actives.length ? actives : 'None'],
      ['Immunities', immunities.length ? immunities : 'None'],
      ['Primary source', primarySource],
      ['Acquisition', acquisition.length ? acquisition : 'Crafting or add-on progression'],
      ['Maximum stack', '1'],
    ],
  };
}

const project = createGeneratedProject({
  manifest,
  id: 'trinkets',
  name: "Dorios' Trinkets",
  repository: 'https://github.com/DoriosStudios/Dorios-Trinkets',
  includeBlockSection: false,
  itemCatalogColumns: 1,
  overview: {
    eyebrow: 'Accessory and character-build reference',
    description: 'A complete guide to equippable trinkets, dedicated accessory slots, attribute bonuses, status effects, immunities, loot sources, armor sets, and supporting items.',
    heroImage: 'textures/items/tideforged_ring.png',
    heroImageAlt: 'Tideforged Ring from Dorios’ Trinkets',
    stats: [
      {label: 'Items', value: manifest.counts.catalogItems},
      {label: 'Trinkets', value: Object.keys(trinketProfiles).length},
      {label: 'Slot types', value: new Set(Object.values(trinketProfiles).map(({trinket}) => trinket)).size},
      {label: 'Recipes', value: manifest.counts.recipes},
    ],
    stepsTitle: 'Build a loadout around dedicated slots.',
    steps: [
      {title: 'Choose a slot', copy: 'Browse head, body, ring, charm, amulet, gauntlet and other dedicated trinket categories.'},
      {title: 'Compare effects', copy: 'Review attribute bonuses, passive effects, active effects and immunities before equipping an item.'},
      {title: 'Find the item', copy: 'Use documented mob drops, structure loot, biome loot and crafting recipes to plan progression.'},
    ],
  },
  sectionDescriptions: {
    items: 'Trinkets grouped by their actual equipment slot, followed by armor sets, ring materials and utility items.',
    recipes: 'Crafting recipes for accessories, equipment and supporting materials.',
  },
  mechanics: [
    {name: 'Dedicated slots', icon: '◇', description: 'Thirteen accessory slots keep different trinket types separate.'},
    {name: 'Attribute bonuses', icon: '+', description: 'Equipped items can modify health, damage, speed, regeneration, critical stats and more.'},
    {name: 'Effects and immunities', icon: '✦', description: 'Trinkets can grant passive effects, apply active effects or protect against status conditions.'},
    {name: 'Loot progression', icon: '⌁', description: 'Accessories are distributed through mob drops, biome loot, structures and crafting.'},
  ],
});

const decoratedById = new Map(project.allItems.map(decorateItem).map((item) => [item.identifier, item]));
const decorateCollection = (items) => items.map((item) => decoratedById.get(item.identifier) ?? decorateItem(item));

project.items = decorateCollection(project.items);
project.allItems = decorateCollection(project.allItems);
project.lookupItems = decorateCollection(project.lookupItems);
project.wikiSections = project.wikiSections.filter(({id}) => !['blocks', 'entities'].includes(id));
project.blocks = [];
project.entities = [];
project.groupItemsByCategory = true;
project.itemCategoryOrder = [
  'Hearty Charms', 'Feet', 'Rings', 'Heavy Rings', 'Strong Rings', 'Head', 'Body',
  'Necklaces', 'Charms', 'Talismans', 'Gauntlets', 'Dolls',
  'Archaic Charms', 'Amulets', 'Armor Sets', 'Ring Materials', 'Utility Items',
];
project.itemCategorySections = categorySections;
const categoryNavigation = categorySections
  .filter(({label, categories}) => project.items.some((item) => (categories ?? [label]).includes(item.category)))
  .map((section) => ({...section, href: `${project.basePath}/${section.id}`}));
const itemsNavigationIndex = project.wikiSections.findIndex(({id}) => id === 'items');
project.wikiSections.splice(itemsNavigationIndex, 1, ...categoryNavigation);
categoryNavigation.forEach(({id, label, categories}) => {
  const categoryList = categories ?? [label];
  const categoryCopy = categoryList.length > 1 ? categoryList.join(', ') : label;
  project.pageMeta[id] = [`${project.name} ${label}`, `${categoryCopy} in ${project.name}, with effects, attributes and acquisition sources presented side by side.`];
  project.sectionDescriptions[id] = `${categoryCopy} organized in one dedicated trinket category, with the fields that matter for each ring type.`;
});
project.overview.shortcuts = categoryNavigation.map(({label, icon, href, categories}) => {
  const categoryList = categories ?? [label];
  const entries = project.items.filter((item) => categoryList.includes(item.category));
  return {
    label,
    icon,
    href,
    count: entries.length,
    image: entries.find((item) => item.image)?.image,
  };
});

export default project;
