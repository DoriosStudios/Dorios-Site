import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

export default createGeneratedProject({
  manifest,
  id: "basics",
  name: "Dorios' Basics",
  repository: "https://github.com/DoriosStudios/Dorios-Basics",
  overview: {
    description: "Dorios’ Basics adds tools and workstations for making early resources from common blocks. Dig up fragments with a hammer, sift blocks for materials and make water or lava as your world expands.",
    heroImage: "/img/projects/basics/pack_icon.png",
    heroImageAlt: "Dorios' Basics",
  },
});
