import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

export default createGeneratedProject({
  manifest,
  id: "pillars",
  name: "Effect Pillars",
  repository: "https://github.com/DoriosStudios/Effect-Pillars",
  overview: {
    description: "Build an Effect Pillar to apply a status effect around a base, mine or mob farm. You choose the effect, its level and its range independently.",
    heroImage: "/img/addons/pillars/MCPEDL.png",
    heroImageAlt: "Effect Pillars",
  },
});
