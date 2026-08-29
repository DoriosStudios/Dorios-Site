import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';
import dependency0 from '../utilitycraft';
import documentationProfiles from './documentationProfiles.generated.json';

const project = createGeneratedProject({
  manifest,
  id: "digital-storage",
  name: "Digital Storage",
  repository: "https://github.com/DoriosStudios/UtilityCraft-Digital-Storage",
  dependencyProjects: [dependency0],
  itemProfiles: documentationProfiles.items,
  machineFilter: (block) => block.componentKeys?.includes('tag:dorios:machine'),
  overview: {
    eyebrow: 'Generated add-on reference',
    description: "Generated reference for Digital Storage, mapped directly from its behavior pack, resource pack, recipes, entities, blocks, items, and project assets.",
    stepsTitle: 'Explore the mapped project content.',
    steps: [
      {title: 'Browse content', copy: 'Inspect registered items, blocks, entities, and their source categories.'},
      {title: 'Review systems', copy: 'Open detected machines, generators, interfaces, and technical properties.'},
      {title: 'Check recipes', copy: 'Follow normalized crafting inputs, stations, and outputs from the behavior pack.'},
    ],
  },
});

export default project;
