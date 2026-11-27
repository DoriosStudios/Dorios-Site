import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

export default createGeneratedProject({
  manifest,
  id: "dummy",
  name: "Training Dummy",
  repository: "https://github.com/DoriosStudios/Training-Dummy",
  overview: {
    description: "Use the Training Dummy to measure how hard a hit lands and how much damage your attack rhythm delivers. Placing the Dummy Block spawns a stationary target in front of you.",
    heroImage: "/img/addons/dummy/MCPEDL.png",
    heroImageAlt: "Training Dummy",
  },
});
