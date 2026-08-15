import manifest from './manifest.json';
import {createGeneratedProject} from '../createGeneratedProject';
import utilitycraft from '../utilitycraft';
import machineProfiles from './machineProfiles';

// Conveyor movement and bridge reach are implemented by the transportation
// runtime, rather than by a Bedrock block component. Keep these player-facing
// values with the project configuration so a remap cannot erase them.
const conveyorTiers = {
  copper: {label: 'Copper', speed: '1 block/s', bridgeRange: '8 blocks'},
  titanium: {label: 'Titanium', speed: '2 blocks/s', bridgeRange: '16 blocks'},
  aetherium: {label: 'Aetherium', speed: '5 blocks/s', bridgeRange: '32 blocks'},
};

const conveyorProfiles = Object.fromEntries(Object.entries(conveyorTiers).flatMap(([tierId, tier]) => [
  ...['horizontal', 'inclined', 'declined', 'vertical'].map((shape) => [`${tierId}_conveyor_${shape}`, {
    blockType: 'Conveyor',
    tier: tier.label,
    blockDetails: [
      ['Conveyor speed', tier.speed],
    ],
  }]),
  ...['bridge_transmitter', 'bridge_receiver', 'bridge_path'].map((part) => [`${tierId}_conveyor_${part}`, {
    blockType: 'Conveyor bridge',
    tier: tier.label,
    blockDetails: [
      ['Conveyor speed', tier.speed],
      ['Bridge range', tier.bridgeRange],
    ],
  }]),
]));

const ascendantTechnology = createGeneratedProject({
  manifest,
  id: 'ascendant-technology',
  name: 'Ascendant Technology',
  repository: 'https://github.com/DoriosStudios/Ascendant-Technology',
  dependencyProjects: [utilitycraft],
  machineProfiles,
  blockProfiles: conveyorProfiles,
  machineCategoryOrder: [
    'Superior Machines',
    'Unique Machines',
    'Equipment Management Machines',
    'Mob Grinding Machines',
  ],
  additionalMachineIds: ['mob_magnet'],
  additionalGeneratorIds: ['cobble_gen_6'],
  overview: {
    eyebrow: 'Official UtilityCraft end-game expansion',
    description: 'Ascendant Technology extends UtilityCraft with absolute-tier infrastructure, superior machines, advanced materials, fluid capsules, overclock networks, and deliberate late-game optimization.',
    heroImage: 'showcase/singularity_fabricator.png',
    heroImageAlt: 'Ascendant Technology Singularity Fabricator',
    dependencyName: 'UtilityCraft base add-on',
    dependencyCopy: 'Ascendant Technology is not standalone. It shares the UtilityCraft namespace, Dorios Energy core, machine framework, fluids, recipes, and network systems.',
    stepsTitle: 'Progress beyond the UtilityCraft end game.',
    steps: [
      {title: 'Reach the absolute tier', copy: 'Refine Aetherium, superior components, modules, and infrastructure from the UtilityCraft progression.'},
      {title: 'Build superior machines', copy: 'Use specialized processors for cryogenics, genetics, singularities, catalysts, fluids, and high-density production.'},
      {title: 'Optimize the network', copy: 'Combine absolute generators, Power Beacons, Overclock systems, capsules, conveyors, and advanced storage.'},
    ],
  },
  mechanics: [
    {name: 'Absolute Tier', icon: 'V', description: 'The fifth tier of Generators, with 8 times more power.'},
    {name: 'Superior Machines', icon: 'S', description: 'Upgraded machines with advanced inputs, outputs, fluids, and gases.'},
    {name: 'Overclocking', icon: 'O', description: 'Towers and relays that coordinate late-game machine optimization and boosts everything.'},
    {name: 'Refinement', icon: 'R', description: 'Refine your weapon, tool or armor to unlock its full potential and evolve it.'},
    {name: 'Power Beacons (WIP)', icon: 'P', description: 'Tiered energy infrastructure shared with the UtilityCraft network.'},
  ],
  machineNotice: {
    title: 'Superior machine rule',
    copy: 'Ascendant machines extend the UtilityCraft core. Each system owns a specialized registry and can combine items, energy, fluids, gases, catalysts, chances, or secondary outputs.',
  },
  mechanicsGuide: {
    eyebrow: 'End-game architecture',
    title: 'Specialized machines, shared industrial core.',
    copy: 'Ascendant Technology raises infrastructure costs and process complexity while keeping energy, fluids, recipes, and machine state compatible with UtilityCraft.',
    image: 'showcase/catalyst_weaver.png',
    imageAlt: 'Ascendant Technology Catalyst Weaver',
  },
});

export default ascendantTechnology;
