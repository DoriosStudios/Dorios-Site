import manifest from './manifest.json';
import processingRecipes from './processingRecipes.json';
import {createGeneratedProject} from '../createGeneratedProject';
import machineProfiles from './machineProfiles';
import documentationProfiles from './documentationProfiles.generated.json';
import itemEditorialProfiles from './itemEditorialProfiles';
import {howToPlayGuide} from './howToPlayGuide';

const GENERATOR_TIERS = [
  ['basic', 'Basic'],
  ['advanced', 'Advanced'],
  ['expert', 'Expert'],
  ['ultimate', 'Ultimate'],
];

// Player-facing block behavior that is implemented in scripts rather than in
// the Bedrock block component payload. Keep this local so the generated wiki
// can expose it through Block Details without turning utility blocks into
// machines.
const blockProfiles = {
  big_torch: {
    blockDetails: [['Illumination range', '14 blocks']],
  },
  lantern: {
    blockDetails: [['Illumination range', '14 blocks per projection · reaches 33 blocks on the outer axes']],
  },
  mechanic_hopper: {
    description: 'Transfers items between nearby inventories with configurable range, speed and whitelist or blacklist filtering.',
    blockDetails: [
      ['Configuration', 'Speed, range and filter mode'],
      ['Filter support', 'Whitelist or blacklist with a Filter Upgrade'],
      ['Automation role', 'Short-range inventory transfer'],
    ],
  },
  ender_hopper: {
    description: 'Collects nearby dropped items and routes them into its attached inventory.',
    blockDetails: [['Automation role', 'World-item collection'], ['Output', 'Attached inventory']],
  },
  waycenter: {
    description: 'Registers named destinations for Way Chips and handles validated travel and return routes between linked centers.',
    blockDetails: [['Network role', 'Destination registry'], ['Travel item', 'Configured Way Chip'], ['Safety', 'Destination is validated before teleporting']],
  },
  ...Object.fromEntries(['basic', 'advanced', 'expert', 'ultimate'].flatMap((tier) => [
    [`${tier}_fluid_tank`, {
      description: `${tier[0].toUpperCase()}${tier.slice(1)}-tier liquid storage with configurable input and output faces.`,
      blockDetails: [['Stored resource', 'One compatible liquid'], ['Automation', 'Per-face liquid I/O']],
    }],
    [`${tier}_gas_tank`, {
      description: `${tier[0].toUpperCase()}${tier.slice(1)}-tier gas storage with configurable input and output faces.`,
      blockDetails: [['Stored resource', 'One compatible gas'], ['Automation', 'Per-face gas I/O']],
    }],
  ])),
  ...Object.fromEntries(['item_importer', 'item_exporter'].flatMap((family) => ['', '_blue', '_purple', '_red', '_yellow'].map((suffix) => {
    const id = `${family}${suffix}`;
    const direction = family === 'item_importer' ? 'pulls items into' : 'pushes items out of';
    return [id, {
      description: `A channel-colored network endpoint that ${direction} connected inventories using configurable filtering.`,
      blockDetails: [['Filter support', 'Whitelist or blacklist'], ['Channel', suffix ? suffix.slice(1) : 'Default'], ['Configuration tool', 'Wrench or Copy/Paste Tool']],
    }];
  }))),
};

const meshProfiles = Object.fromEntries([
  ['string_mesh', 0, 0.75],
  ['flint_mesh', 1, 1],
  ['copper_mesh', 2, 1.25],
  ['iron_mesh', 3, 1.5],
  ['golden_mesh', 4, 2],
  ['emerald_mesh', 5, 2.5],
  ['diamond_mesh', 6, 3],
  ['netherite_mesh', 7, 4],
].map(([id, tier, multiplier]) => [id, {
  documentation: {
    description: `A Tier ${tier} sieve mesh that controls which Autosieve drops are eligible and scales each listed drop chance.`,
    statisticsTitle: 'Sieve Performance',
    statistics: [
      ['Mesh tier', `Tier ${tier}`],
      ['Drop chance multiplier', `×${multiplier}`],
    ],
  },
}]));

const generatorFamilies = [
  {family: 'Furnator', type: 'Active (Item)', fuel: 'Burnable items', ids: GENERATOR_TIERS.map(([id]) => `${id}_furnator`)},
  {family: 'Magmator', type: 'Active (Fluid)', fuel: 'Lava', ids: GENERATOR_TIERS.map(([id]) => `${id}_magmator`)},
  {family: 'Solar Panel', type: 'Passive', fuel: 'Sunlight', ids: GENERATOR_TIERS.map(([id]) => `${id}_solar_panel`)},
  {family: 'Thermo Generator', type: 'Active (Fluid + environment)', fuel: 'Water coolant and a heat source', ids: GENERATOR_TIERS.map(([id]) => `${id}_thermo_generator`)},
  {family: 'Wind Turbine', type: 'Passive', fuel: 'Open-sky wind conditions', ids: GENERATOR_TIERS.map(([id]) => `${id}_wind_turbine`)},
];

const generatorProfiles = Object.fromEntries([
  ...generatorFamilies.flatMap((family, familyOrder) => family.ids.map((id, tierOrder) => [id, {
    family: family.family,
    familyOrder,
    tier: GENERATOR_TIERS[tierOrder][1],
    tierOrder,
    generationType: family.type,
    fuel: family.fuel,
  }])),
  ...GENERATOR_TIERS.flatMap(([tierId, tier], tierOrder) => [
    [`${tierId}_battery`, {family: 'Energy Storage', familyOrder: 10, tier, tierOrder, systemType: 'Storage'}],
    [`${tierId}_energy_receiver`, {family: 'Energy Distribution', familyOrder: 11, tier, tierOrder, systemType: 'Transport'}],
    [`${tierId}_energy_transmitter`, {family: 'Energy Distribution', familyOrder: 11, tier, tierOrder: tierOrder + 4, systemType: 'Transport'}],
  ]),
  ['creative_battery', {family: 'Energy Storage', familyOrder: 10, tier: 'Creative', tierOrder: 4, systemType: 'Storage'}],
]);

for (const [id, profile] of Object.entries(generatorProfiles)) {
  if (/energy_receiver$/.test(id)) {
    profile.description = 'Receives Dorios Energy from the selected color-channel network and exposes nearest, farthest, or round-robin transfer behavior.';
    profile.risk = 'Primary, secondary and tertiary channels must match the intended network';
  } else if (/energy_transmitter$/.test(id)) {
    profile.description = 'Publishes Dorios Energy to the selected color-channel network and can be switched into receiver mode with the Wrench.';
    profile.risk = 'Transfer role and three color channels are configured with the Wrench';
  } else if (/battery$/.test(id)) {
    profile.description = 'Buffers Dorios Energy between generators and machines; capacity and transfer rate scale with the installed tier.';
  }
}

const itemProfileIds = new Set([
  ...Object.keys(documentationProfiles.items),
  ...Object.keys(meshProfiles),
  ...Object.keys(itemEditorialProfiles),
]);
const itemProfiles = Object.fromEntries([...itemProfileIds].map((identifier) => {
  const generated = documentationProfiles.items[identifier] ?? {};
  const mesh = meshProfiles[identifier] ?? {};
  const editorial = itemEditorialProfiles[identifier] ?? {};
  return [identifier, {
    ...generated,
    ...mesh,
    ...editorial,
    documentation: {
      ...(generated.documentation ?? {}),
      ...(mesh.documentation ?? {}),
      ...(editorial.documentation ?? {}),
      basic: {...(generated.documentation?.basic ?? {}), ...(mesh.documentation?.basic ?? {}), ...(editorial.documentation?.basic ?? {})},
      capabilities: {...(generated.documentation?.capabilities ?? {}), ...(mesh.documentation?.capabilities ?? {}), ...(editorial.documentation?.capabilities ?? {})},
    },
  }];
}));

const utilitycraft = createGeneratedProject({
  manifest,
  id: 'utilitycraft',
  name: 'UtilityCraft',
  repository: 'https://github.com/DoriosStudios/UtilityCraft',
  machineProfiles,
  blockProfiles,
  itemProfiles,
  howToPlay: howToPlayGuide,
  processingRecipes,
  generatorProfiles,
  generatorCategoryOrder: [...generatorFamilies.map(({family}) => family), 'Energy Storage', 'Energy Distribution'],
  machineFilter: (block) => block.componentKeys?.includes('tag:dorios:machine'),
  generatorFilter: (block) => block.componentKeys?.includes('tag:dorios:generator'),
  overview: {
    eyebrow: 'Core Dorios technology add-on',
    description: 'UtilityCraft is the shared industrial foundation for Dorios automation: machines, energy networks, generators, storage, transport, resources, and scalable utility systems.',
    heroImage: 'showcase/machines_render.png',
    heroImageAlt: 'UtilityCraft machine lineup',
    cardImage: 'renders/assembler.png',
    categoryImages: {
      items: 'textures/items/tools/wrench.png',
      blocks: 'renders/steel_block.png',
      machines: 'renders/seed_synthesizer.png',
      generators: 'renders/ultimate_wind_turbine.png',
      recipes: 'renders/workbench.png',
    },
    stepsTitle: 'From first machine to automated infrastructure.',
    steps: [
      {title: 'Generate energy', copy: 'Choose a furnator, solar panel, wind turbine, magmator, or thermo generator for the current tier.'},
      {title: 'Process resources', copy: 'Build machines such as the Crusher, Electro Press, Infuser, Autosieve, or Assembler.'},
      {title: 'Connect the network', copy: 'Expand with storage, transmitters, receivers, pipes, upgrades, and automated input and output.'},
    ],
  },
  mechanics: [
    {name: 'Dorios Energy', icon: 'bolt', description: 'The shared power system used to generate, store, transfer, and consume Dorios Energy across UtilityCraft networks.'},
    {name: 'Gas Management', icon: 'wind', description: 'The indexed gas-storage and transfer system, with configurable input and output modes for each supported machine side.'},
    {name: 'Machines', icon: 'tool', description: 'Powered processing blocks that run registered recipes and can handle configured item, liquid, gas, and upgrade slots.'},
    {name: 'Generators', icon: 'battery', description: 'Power-producing systems that convert fuels or environmental conditions into Dorios Energy and distribute it to nearby infrastructure.'},
  ],
  machineNotice: {
    title: 'Single-block industrial systems',
    copy: 'UtilityCraft machines use registered recipes and Dorios Energy. Their available upgrades, inventories, and throughput depend on the machine type and tier.',
  },
});

export default utilitycraft;
