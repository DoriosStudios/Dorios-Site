import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

const project = createGeneratedProject({
  manifest,
  id: "excavate",
  name: "Dorios' Excavate",
  repository: "https://github.com/DoriosStudios/Dorios-Excavate",
  overview: {
    eyebrow: 'Generated add-on reference',
    description: "Generated reference for Dorios' Excavate, mapped directly from its behavior pack, resource pack, recipes, entities, blocks, items, and project assets.",
    stepsTitle: 'Explore the mapped project content.',
    steps: [
      {title: 'Browse content', copy: 'Inspect registered items, blocks, entities, and their source categories.'},
      {title: 'Review systems', copy: 'Open detected machines, generators, interfaces, and technical properties.'},
      {title: 'Check recipes', copy: 'Follow normalized crafting inputs, stations, and outputs from the behavior pack.'},
    ],
  },
});

export default project;
