import manifest from './manifest.json';
import processingRecipes from './processingRecipes.json';
import {createGeneratedProject} from '../createGeneratedProject';
import machineProfiles from './machineProfiles';
import documentationProfiles from './documentationProfiles.generated.json';
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

const utilitycraft = createGeneratedProject({
  manifest,
  id: 'utilitycraft',
  name: 'UtilityCraft',
  repository: 'https://github.com/DoriosStudios/UtilityCraft',
  machineProfiles,
  blockProfiles,
  itemProfiles: {...documentationProfiles.items, ...meshProfiles},
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
