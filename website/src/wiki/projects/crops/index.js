import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

export default createGeneratedProject({
  manifest,
  id: "crops",
  name: "Bountiful Crops",
  repository: "https://github.com/DoriosStudios/Bountiful-Crops",
  overview: {
    description: "Turn resources you already have into crops you can harvest repeatedly. Start with a Base Seed, craft the seed for your chosen resource and plant it on the soil that matches its tier.",
    heroImage: "/img/addons/crops/MCPEDL.png",
    heroImageAlt: "Bountiful Crops",
  },
});
