import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

export default createGeneratedProject({
  manifest,
  id: "compressy",
  name: "Compressy",
  repository: "https://github.com/DoriosStudios/Compressy",
  overview: {
    description: "Compressy combines stacks of common materials into blocks or bundles that you can unpack later. These recipes come from version 1.0.3.",
    heroImage: "/img/wiki/utilitycraft/renders/compressed_blocks/compressed_netherrack.png",
    heroImageAlt: "Compressy",
  },
});
