import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

const project = createGeneratedProject({
  manifest,
  id: 'excavate',
  name: "Dorios' Excavate",
  repository: 'https://github.com/DoriosStudios/Dorios-Excavate',
  overview: {
    eyebrow: 'Vein mining',
    description: 'Sneak and break an eligible block to mine matching blocks in one action. Choose how the extra blocks are selected in the Excavate Settings book.',
    stepsTitle: 'Configure vein mining',
    steps: [
      {title: 'Mine a vein', copy: 'Hold sneak while breaking a block that is enabled for vein mining.'},
      {title: 'Choose a mining pattern', copy: 'Use the settings book to toggle vein mining, choose a shape, and set your block limit.'},
      {title: 'Configure eligible blocks', copy: 'Edit your personal block list in the settings book. World administrators can change the default list and global block limit.'},
    ],
  },
  itemProfiles: {
    settings_item: {
      name: 'Excavate Settings',
      description: 'Use this book to configure vein mining for your player. Craft it with paper and a wooden pickaxe.',
    },
  },
  sectionDescriptions: {
    items: 'The settings book controls vein mining and the blocks you can mine together.',
    recipes: 'Craft the settings book with paper and a wooden pickaxe.',
  },
});

export default project;
