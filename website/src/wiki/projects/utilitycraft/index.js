import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';
import machineProfiles from './machineProfiles';

const utilitycraft = createGeneratedProject({
  manifest,
  id: 'utilitycraft',
  name: 'UtilityCraft',
  repository: 'https://github.com/DoriosStudios/UtilityCraft',
  machineProfiles,
  machineFilter: (block) => block.componentKeys?.includes('tag:dorios:machine'),
  generatorFilter: (block) => block.componentKeys?.includes('tag:dorios:generator'),
  overview: {
    eyebrow: 'Core Dorios technology add-on',
    description: 'UtilityCraft is the shared industrial foundation for Dorios automation: machines, energy networks, generators, storage, transport, resources, and scalable utility systems.',
    heroImage: 'showcase/machines_render.png',
    heroImageAlt: 'UtilityCraft machine lineup',
    stepsTitle: 'From first machine to automated infrastructure.',
    steps: [
      {title: 'Generate energy', copy: 'Choose a furnator, solar panel, wind turbine, magmator, or thermo generator for the current tier.'},
      {title: 'Process resources', copy: 'Build machines such as the Crusher, Electro Press, Infuser, Autosieve, or Assembler.'},
      {title: 'Connect the network', copy: 'Expand with storage, transmitters, receivers, pipes, upgrades, and automated input and output.'},
    ],
  },
  mechanics: [
    {name: 'Dorios Energy', icon: 'E', description: 'Shared energy production, storage, transfer, and consumption.'},
    {name: 'Machine tiers', icon: 'T', description: 'Basic, Advanced, Expert, Ultimate, and Creative progression.'},
    {name: 'Energy networks', icon: 'N', description: 'Transmitters, receivers, batteries, and linked machine infrastructure.'},
    {name: 'Item and fluid transport', icon: '⇄', description: 'Pipes, tanks, filters, imports, exports, and automation.'},
    {name: 'Machine upgrades', icon: '↑', description: 'Speed, energy, capacity, range, and behavior upgrades.'},
    {name: 'Bonsai automation', icon: '♣', description: 'Automated renewable resources and specialized production trees.'},
  ],
  machineNotice: {
    title: 'Single-block industrial systems',
    copy: 'UtilityCraft machines use registered recipes and Dorios Energy. Their available upgrades, inventories, and throughput depend on the machine type and tier.',
  },
  mechanicsGuide: {
    eyebrow: 'Shared foundation',
    title: 'One core for machines, energy, fluids, and automation.',
    copy: 'UtilityCraft exposes the systems used by its own content and by official extensions such as Heavy Machinery and Ascendant Technology.',
    image: 'showcase/generators_render.png',
    imageAlt: 'UtilityCraft generators',
  },
});

export default utilitycraft;
