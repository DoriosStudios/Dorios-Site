import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

export default createGeneratedProject({
  manifest,
  id: "cobblestone-generators",
  name: "Cobblestone Generators",
  repository: "https://github.com/DoriosStudios/Cobble-Gens",
  overview: {
    description: "The Copper Cobblestone Generator is the first tier. It produces one cobblestone every four seconds and sends its output directly into an adjacent container. Each of the five upgrades uses the previous generator as an ingredient.",
    heroImage: "/img/projects/cobblestone-generators/pack_icon.png",
    heroImageAlt: "Cobblestone Generators",
  },
});
