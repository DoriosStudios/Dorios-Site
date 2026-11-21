import * as data from './data.js';
import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject.js';
import utilitycraft from '../utilitycraft/index.js';
import processingRecipes from './processingRecipes.json';
import {vanillaStationMeta} from '../vanillaStationMeta.js';
import documentationProfiles from './documentationProfiles.generated.json';
import itemEditorialProfiles from './itemEditorialProfiles.js';

const pageMeta = {
  overview: ['Heavy Machinery Wiki', 'Technical reference for UtilityCraft: Heavy Machinery.'],
  items: ['Heavy Machinery Items', 'Materials, components, fluids, and equipment in Heavy Machinery.'],
  blocks: ['Heavy Machinery Blocks', 'Casings, controllers, ports, modules, and storage blocks in Heavy Machinery.'],
  machines: ['Heavy Machinery Machines', 'Multiblock factories and industrial processing machines in Heavy Machinery.'],
  generators: ['Heavy Machinery Generators', 'Energy generation and storage multiblocks in Heavy Machinery.'],
  recipes: ['Heavy Machinery Recipes', 'Crafting and industrial processing recipes in Heavy Machinery.'],
  mechanics: ['Heavy Machinery Mechanics', 'Energy, multiblock, modularity, fluid, and automation systems.'],
};

const sectionDescriptions = {
  items: 'Materials, components, nuclear fuel, fluids, and equipment used across the extension.',
  blocks: 'Every registered block, organized by construction tier and industrial role.',
  machines: 'Modular multiblock factories that turn Dorios Energy into high-throughput processing.',
  generators: 'Large-scale systems for producing, storing, and distributing Dorios Energy.',
  recipes: 'Construction recipes and machine processes indexed directly from the add-on structure.',
  mechanics: 'The shared systems that make machines, generators, ports, and modules work together.',
};

const stationMeta = {
  ...vanillaStationMeta,
  utilitycraft_workbench: {label: 'UtilityCraft Workbench', face: 'recipe-faces/utilitycraft_workbench.png'},
  crusher: {label: 'Crusher', face: 'blocks/multiblock/crusher_controller_north.png'},
  'electro-press': {label: 'Electro Press', face: 'blocks/multiblock/electro_press_controller_north.png'},
  electro_press: {label: 'Electro Press', face: 'blocks/multiblock/electro_press_controller_north.png'},
  infuser: {label: 'Infuser', face: 'blocks/multiblock/infuser_controller_north.png'},
  incinerator: {label: 'Incinerator', face: 'blocks/multiblock/incinerator_controller_north.png'},
  autosieve: {label: 'Autosieve', face: 'blocks/multiblock/autosieve_controller_north.png'},
  'reaction-chamber': {label: 'Reaction Chamber', face: 'blocks/multiblock/matter_condenser_controller_north.png'},
  'magmatic-chamber': {label: 'Magmatic Chamber', face: 'blocks/multiblock/magmatic_chamber_controller_north.png'},
  'isotope-centrifuge': {label: 'Isotope Centrifuge', face: 'blocks/machines/isotope_centrifuge_north.png'},
  'chemical-processor': {label: 'Chemical Processor', face: 'blocks/machines/chemical_processor_north.png'},
};

const machineControllerIds = {
  crusher: 'crusher_controller',
  incinerator: 'incinerator_controller',
  'electro-press': 'electro_press_controller',
  infuser: 'infuser_controller',
  autosieve: 'autosieve_controller',
  'reaction-chamber': 'reaction_chamber_controller',
  'magmatic-chamber': 'magmatic_chamber_controller',
  'isotope-centrifuge': 'isotope_centrifuge',
  'chemical-processor': 'chemical_processor',
  'liquid-tank-controller': 'liquid_tank_controller',
  'gas-tank-controller': 'gas_tank_controller',
  reinforced_induction_anvil: 'reinforced_induction_anvil',
};

const itemProfiles = Object.fromEntries(manifest.content.items.map((item) => {
  const generated = documentationProfiles.items[item.identifier] ?? {};
  const editorial = itemEditorialProfiles[item.identifier] ?? {};
  const description = data.items.find((entry) => entry.id === item.identifier)?.description;
  return [item.identifier, {
    ...(description ? {description} : {}),
    ...generated,
    ...editorial,
    documentation: {
      ...(generated.documentation ?? {}),
      ...(editorial.documentation ?? {}),
      basic: {...(generated.documentation?.basic ?? {}), ...(editorial.documentation?.basic ?? {})},
      capabilities: {...(generated.documentation?.capabilities ?? {}), ...(editorial.documentation?.capabilities ?? {})},
    },
  }];
}));

const reference = createGeneratedProject({
  manifest, id: 'heavy-machinery', name: 'Heavy Machinery',
  repository: 'https://github.com/DoriosStudios/UtilityCraft-Heavy-Machinery',
  dependencyProjects: [utilitycraft], itemProfiles, processingRecipes,
  machineProfiles: {
    reinforced_induction_anvil: {
      description: 'Repairs compatible equipment and recharges tagged energy containers. Charging transfers up to 1,000,000 DE/t before machine modifiers; the machine stores 640,000,000 DE.',
      input: 'Repairable equipment or a compatible energy container',
      output: 'Repaired or recharged equipment',
      specifications: [['Charging rate', '1,000,000 DE/t before machine modifiers']],
    },
  },
  blockProfiles: Object.fromEntries(data.blocks.map(({id, category, tier, description}) => (
    [id, {category, tier, description}]
  ))),
  overview: {description: sectionDescriptions.overview ?? pageMeta.overview[1]},
});
const blocksById = new Map(reference.allBlocks.map((block) => [block.shortId, block]));
const machines = [
  ...data.machines,
  ...reference.machines.filter((machine) => ['reaction_chamber', 'reinforced_induction_anvil'].includes(machine.id)),
].map((machine) => {
  const blockSlug = machine.blockSlug ?? machineControllerIds[machine.id];
  const block = blocksById.get(blockSlug);
  return {...machine, blockSlug, image: block?.render ?? block?.itemImage ?? block?.faces?.right ?? machine.image};
});
const generators = data.generators.map((generator) => {
  const blockSlug = {
    'thermal-reactor': 'thermal_controller', 'power-condenser': 'power_condenser_controller',
    'nuclear-reactor': 'nuclear_reactor_controller', 'gas-turbine': 'gas_turbine_controller',
    'combustion-chamber': 'combustion_chamber_controller',
  }[generator.id];
  const block = blocksById.get(blockSlug);
  return {...generator, blockSlug, image: block?.render ?? block?.itemImage ?? block?.faces?.right ?? generator.image};
});
const controllerPages = new Map([
  ...machines.map((machine) => [machine.blockSlug, {entryType: 'machines', catalogSlug: machine.id}]),
  ...generators.map((generator) => [generator.blockSlug, {entryType: 'generators', catalogSlug: generator.id}]),
].filter(([blockSlug]) => blockSlug));
const lookupBlocks = reference.lookupBlocks.map((block) => {
  if (block.basePath && block.basePath !== '/wiki/heavy-machinery') return block;
  const page = controllerPages.get(block.slug) ?? controllerPages.get(block.shortId);
  return page ? {...block, ...page} : block;
});

const heavyMachineryProject = {
  id: 'heavy-machinery',
  name: 'Heavy Machinery',
  wikiName: 'Heavy Machinery Wiki',
  basePath: '/wiki/heavy-machinery',
  repository: 'https://github.com/DoriosStudios/UtilityCraft-Heavy-Machinery',
  assetRoot: data.assetRoot,
  wikiSections: data.wikiSections,
  pageMeta,
  sectionDescriptions,
  stationMeta: {...reference.stationMeta, ...stationMeta},
  machineControllerIds,
  items: reference.items,
  allItems: reference.allItems,
  lookupItems: reference.lookupItems,
  lookupBlocks,
  blocks: reference.allBlocks,
  allBlocks: reference.allBlocks,
  machines,
  generators,
  mechanics: data.mechanics,
  craftingRecipes: reference.craftingRecipes,
  craftingRecipeDetails: reference.craftingRecipeDetails,
  processingRecipes,
  groupItemsByCategory: true,
  recipeFallbackFace: 'recipe-faces/utilitycraft_workbench.png',
  fallbackImage: 'items/control_panel.png',
  overview: {
    eyebrow: 'Official UtilityCraft extension',
    description: 'Technical documentation for large-scale multiblock machinery, high-cost infrastructure, and complex late-game industrial processes.',
    heroImage: 'guide/casings_showcase.png',
    heroImageAlt: 'Heavy Machinery multiblock casing tiers',
    cardImage: 'blocks/multiblock/crusher_controller.png',
    categoryImages: {
      items: 'items/enriched_uranium_rod.png',
      blocks: 'blocks/block_of_uranium.png',
      machines: 'blocks/multiblock/crusher_controller.png',
      generators: 'blocks/multiblock/bronze/thermal_reactor_controller.png',
      recipes: 'items/charged_darloonite_crystal.png',
    },
    dependencyName: 'UtilityCraft base add-on',
    dependencyCopy: 'Requires UtilityCraft 3.6.2 or newer. Energy Cells, Liquid Cells, Gas Cells, Processing Modules, Speed Modules and Efficiency Modules are supplied by UtilityCraft; Heavy Machinery supplies casings, ports, controllers and specialized components.',
    stepsTitle: 'From component to factory.',
    steps: [
      {title: 'Choose a system', copy: 'Pick a machine or generator based on the process your base needs.'},
      {title: 'Build the shell', copy: 'Use a compatible casing tier, one controller, and the required ports.'},
      {title: 'Tune the interior', copy: 'Add storage and modules to balance throughput, energy, and fluids.'},
    ],
  },
  machineNotice: {
    title: 'Shared structure rule',
    copy: 'Basic factories use steel-tier casings and require at least one Processing Module and one Energy Cell. Reaction and Magmatic chambers add liquid storage requirements.',
  },
  mechanicsGuide: {
    eyebrow: 'Construction rule',
    title: 'One controller. One valid shell. Your choice of internals.',
    copy: 'The controller indexes every compatible component inside the detected structure. This makes size and module distribution part of the machine design rather than a fixed recipe.',
    image: 'guide/components_showcase.png',
    imageAlt: 'Heavy Machinery internal multiblock components',
  },
};

export default heavyMachineryProject;
