import manifest from './manifest.json';
import processingRecipes from './processingRecipes.json';
import {createGeneratedProject} from '../createGeneratedProject';
import machineProfiles from './machineProfiles';

const GENERATOR_TIERS = [
  ['basic', 'Basic'],
  ['advanced', 'Advanced'],
  ['expert', 'Expert'],
  ['ultimate', 'Ultimate'],
];

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
    {name: 'Dorios Energy', icon: 'E', description: 'Shared energy production, storage, transfer, and consumption.'},
    {name: 'Machine tiers', icon: 'T', description: 'Basic, Advanced, Expert, Ultimate, and Creative progression.'},
    {name: 'Energy networks', icon: 'N', description: 'Transmitters, receivers, batteries, and linked machine infrastructure.'},
    {name: 'Item and fluid transport', icon: '⇄', description: 'Pipes, tanks, filters, imports, exports, and automation.'},
    {name: 'Machine upgrades', icon: '↑', description: 'Speed, energy, capacity, range, and behavior upgrades.'},
    {name: 'Bonsai automation', icon: '♣', description: 'Automated renewable resources and specialized production trees.'},
  ],
  machineNotice: {
    title: 'Single-block industrial systems',
    copy: 'UtilityCraft machines use registered recipes and Dorios Energy. Their available upgrades, inventories, and throughput depend on the machine type and tier.',
  },
  mechanicsGuide: {
    eyebrow: 'Shared foundation',
    title: 'One core for machines, energy, fluids, and automation.',
    copy: 'UtilityCraft exposes the systems used by its own content and by official extensions such as Heavy Machinery and Ascendant Technology.',
    image: 'showcase/generators_render.png',
    imageAlt: 'UtilityCraft generators',
  },
});

export default utilitycraft;
