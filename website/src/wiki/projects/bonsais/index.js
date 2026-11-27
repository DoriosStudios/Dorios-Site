import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

const project = createGeneratedProject({
  manifest,
  id: "bonsais",
  name: "Bountiful Bonsais",
  repository: undefined,
  overview: {
    description: 'Plant a sapling or seed in a Bonsai Pot. Soil and plant type determine the growth time and resources it produces.',
    heroImage: '/img/addons/bonsais/bonsai_on_barrel_and_chest.jpg',
    heroImageAlt: 'Bonsai Pots on a barrel and a chest',
  },
});

export default project;
