import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

export default createGeneratedProject({
  manifest,
  id: "trees",
  name: "Bountiful Trees",
  repository: "https://github.com/DoriosStudios/Bountiful-Trees",
  overview: {
    description: "Craft an ore sapling from materials you already have, then grow it to harvest more of that resource. Breaking the leaves can return saplings for replanting.",
    heroImage: "/img/addons/trees/MCPEDL.png",
    heroImageAlt: "Bountiful Trees",
  },
});
