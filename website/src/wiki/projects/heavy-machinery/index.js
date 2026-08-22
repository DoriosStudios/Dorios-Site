import * as data from './data.js';
import {craftingRecipeDetails} from './recipeData.js';
import processingRecipes from './processingRecipes.json';
import {vanillaStationMeta} from '../vanillaStationMeta.js';

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
};

const machineControllerIds = {
  crusher: 'crusher_controller',
  incinerator: 'incinerator_controller',
  'electro-press': 'electro_press_controller',
  infuser: 'infuser_controller',
  autosieve: 'autosieve_controller',
  'reaction-chamber': 'reaction_chamber_controller',
  'magmatic-chamber': 'magmatic_chamber_controller',
};

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
  stationMeta,
  machineControllerIds,
  items: data.items,
  allItems: data.items,
  blocks: data.blocks,
  allBlocks: data.blocks,
  machines: data.machines,
  generators: data.generators,
  mechanics: data.mechanics,
  craftingRecipes: data.craftingRecipes,
  craftingRecipeDetails,
  processingRecipes,
  groupItemsByCategory: true,
  recipeFallbackFace: 'recipe-faces/utilitycraft_workbench.png',
  fallbackImage: 'items/control_panel.png',
  overview: {
    eyebrow: 'Official UtilityCraft extension',
    description: 'Technical documentation for large-scale multiblock machinery, high-cost infrastructure, and complex late-game industrial processes.',
    heroImage: 'guide/casings_showcase.png',
    heroImageAlt: 'Heavy Machinery multiblock casing tiers',
    dependencyName: 'UtilityCraft base add-on',
    dependencyCopy: 'Heavy Machinery is not standalone. It uses the public UtilityCraft core for energy, machines, fluids, recipe registration, and multiblock systems.',
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
