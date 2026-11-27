import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';

export default createGeneratedProject({
  manifest,
  id: "lamps",
  name: "Redstone Lamps Plus",
  repository: undefined,
  overview: {
    description: "Redstone Lamps Plus brings the lamp designs of LicitLettuce’s Java Edition project to Minecraft Bedrock. Use them for switchable lighting in builds with redstone wiring.",
    heroImage: "/img/addons/lamps/MCPEDL.png",
    heroImageAlt: "Redstone Lamps Plus",
  },
});
