import manifest from './manifest.json';
import furnaceData from './furnaceData.generated.json';
import {createGeneratedProject} from '../createGeneratedProject';

const project = createGeneratedProject({
  manifest,
  id: "smelters",
  name: "Better Smelters",
  repository: "https://github.com/DoriosStudios/Better-Smelters",
  overview: {
    eyebrow: 'Tiered furnace reference',
    description: 'A complete Better Smelters reference covering every furnace tier, its processing statistics, upgrade path, automation behavior, crafting recipe, and registered smelting catalog.',
    stepsTitle: 'Choose the furnace that fits your production line.',
    steps: [
      {title: 'Compare furnaces', copy: 'Review speed, cycle time, fuel use, coal-equivalent yield, inventory, and special behavior for all eleven tiers.'},
      {title: 'Plan upgrades', copy: 'Follow the direct crafting and upgrade recipes from the early Oak, Copper, and Iron furnaces to late-game tiers.'},
      {title: 'Browse smelting', copy: 'Open the registered input and output catalog shared by every Better Smelters furnace.'},
    ],
  },
  machineFilter: (block) => block.componentKeys?.includes('tag:better_smelters:furnace')
    || block.componentKeys?.includes('better_smelters:furnace'),
  machineProfiles: furnaceData.machineProfiles,
  machineCategoryOrder: ['Furnaces'],
  processingRecipes: furnaceData.processingRecipes,
  sectionDescriptions: {
    machines: 'Every Better Smelters furnace with its real speed, cycle time, fuel efficiency, automation faces, and special behavior.',
    recipes: 'Crafting, upgrade, and registered smelting recipes used by Better Smelters.',
  },
});

export default project;
