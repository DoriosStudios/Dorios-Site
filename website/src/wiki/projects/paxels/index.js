import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';
import toolProfiles from './toolProfiles.json';
export default createGeneratedProject({
  manifest,
  id: "paxels",
  name: "Paxels & AIOTs",
  repository: "https://github.com/DoriosStudios/Paxels-and-AIOTs",
  itemProfiles: toolProfiles,
  overview: {
    description: "A Paxel combines a pickaxe, axe and shovel. An AIOT (All-In-One Tool) adds the sword and hoe functions, including a 3×3 farming action. This guide uses the item definitions from version 1.0.5.",
    heroImage: "/img/projects/paxels/pack_icon.png",
    heroImageAlt: "Paxels & AIOTs",
  },
});
