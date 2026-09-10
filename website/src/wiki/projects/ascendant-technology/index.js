import manifest from './manifest.json';
import processingRecipes from './processingRecipes.json';
import {createGeneratedProject} from '../createGeneratedProject';
import utilitycraft from '../utilitycraft';
import machineProfiles from './machineProfiles';
import documentationProfiles from './documentationProfiles.generated.json';
import itemEditorialProfiles from './itemEditorialProfiles';

const itemProfiles = Object.fromEntries([...new Set([
  ...Object.keys(documentationProfiles.items),
  ...Object.keys(itemEditorialProfiles),
])].map((identifier) => {
  const generated = documentationProfiles.items[identifier] ?? {};
  const editorial = itemEditorialProfiles[identifier] ?? {};
  return [identifier, {
    ...generated,
    ...editorial,
    documentation: {
      ...(generated.documentation ?? {}),
      ...(editorial.documentation ?? {}),
      basic: {...(generated.documentation?.basic ?? {}), ...(editorial.documentation?.basic ?? {})},
      capabilities: {...(generated.documentation?.capabilities ?? {}), ...(editorial.documentation?.capabilities ?? {})},
    },
  }];
}));

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
    description: `Moves dropped items along a ${shape} conveyor route at ${tier.speed}. Orientation controls the travel direction.`,
    blockDetails: [
      ['Conveyor speed', tier.speed],
    ],
  }]),
  ...['bridge_transmitter', 'bridge_receiver', 'bridge_path'].map((part) => [`${tierId}_conveyor_${part}`, {
    blockType: 'Conveyor bridge',
    tier: tier.label,
    description: `${part === 'bridge_transmitter' ? 'Sends' : part === 'bridge_receiver' ? 'Receives' : 'Carries'} items through a ${tier.label} conveyor bridge with a maximum linked reach of ${tier.bridgeRange}.`,
    blockDetails: [
      ['Conveyor speed', tier.speed],
      ['Bridge range', tier.bridgeRange],
    ],
  }]),
]));

const routingProfiles = {
  conveyor_router: {description: 'Distributes incoming items across available forward, left, and right routes using a rotating output choice.', blockType: 'Conveyor routing'},
  conveyor_sorter: {description: 'Uses one configured item filter while preferring the forward route for matches and alternating side routes for other items.', blockType: 'Conveyor routing'},
  conveyor_inverted_sorter: {description: 'Inverts the ordinary sorter priority so matching items prefer alternating side routes before the forward route.', blockType: 'Conveyor routing'},
  conveyor_smart_router: {description: 'Stores separate item filters for the left, front, and right outputs, then sends each item to its preferred available route.', blockType: 'Conveyor routing'},
  conveyor_overflow: {description: 'Uses the forward route first and alternates between side routes only when the main path is blocked.', blockType: 'Conveyor routing'},
  conveyor_underflow: {description: 'Tries to insert items into side inventories first, alternating sides, then forwards anything that cannot be inserted.', blockType: 'Conveyor routing'},
  conveyor_junction: {description: 'Keeps items moving straight through an intersection according to the direction from which they entered.', blockType: 'Conveyor routing'},
};

const powerBeaconProfiles = Object.fromEntries([
  ['basic', 'Basic'], ['advanced', 'Advanced'], ['expert', 'Expert'], ['ultimate', 'Ultimate'], ['absolute', 'Absolute'],
].map(([id, tier], tierOrder) => [`${id}_power_beacon`, {
  family: 'Power Beacons',
  familyOrder: 20,
  tier,
  tierOrder,
  systemType: 'Transport',
  generationType: 'Wireless distribution',
  fuel: 'Stored Dorios Energy',
  output: 'Wireless energy delivery to associated targets',
  description: 'Caches compatible targets in range and distributes stored Dorios Energy without requiring a direct cable connection. Range and throughput scale by tier.',
  risk: 'Targets must remain inside the beacon network and have compatible energy storage',
}]));

const ascendantTechnology = createGeneratedProject({
  manifest,
  id: 'ascendant-technology',
  name: 'Ascendant Technology',
  repository: 'https://github.com/DoriosStudios/Ascendant-Technology',
  dependencyProjects: [utilitycraft],
  processingRecipes,
  machineProfiles,
  generatorProfiles: powerBeaconProfiles,
  blockProfiles: {...documentationProfiles.blocks, ...conveyorProfiles, ...routingProfiles},
  itemProfiles,
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
    heroImage: 'showcase/machines_render.png',
    heroImageAlt: 'Complete Ascendant Technology machine lineup',
    cardImage: 'renders/catalyst_weaver.png',
    categoryImages: {
      items: 'textures/items/ores/aetherium_crystal.png',
      blocks: 'renders/aetherium_block.png',
      machines: 'renders/catalyst_weaver.png',
      generators: 'renders/absolute_wind_turbine.png',
      recipes: 'textures/items/ores/aetherium_ingot.png',
    },
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
    {name: 'Dorios Energy', icon: 'bolt', description: 'The shared power network used by Ascendant machines, storage, relays, Power Beacons, and absolute-tier infrastructure.'},
    {name: 'Gas Management', icon: 'wind', description: 'The gas input, storage, processing, and output system used by supported superior machines and recipes.'},
    {name: 'Superior Machines', icon: 'tool', description: 'Advanced processors with specialized item, liquid, gas, catalyst, and upgrade slots for late-game production.'},
    {name: 'Absolute Generators', icon: 'battery', description: 'The fifth generator tier, built to supply high-output Dorios Energy for Ascendant industrial networks.'},
    {name: 'Cryogenic Branches', icon: 'droplet', description: 'Cryogenic work is split between the Cryo Freezer, Cryofluid Synthesizer, and Cryo Stabilizer so each production lane can scale independently.'},
    {name: 'Overclock Network', icon: 'bolt', description: 'An Overclock Tower consumes fuel, Reinforced Cable carries the network, and Overclock Relays distribute the selected boost to supported machines.'},
    {name: 'Progression Status', icon: 'settings', description: 'Aetherium, Titanium, and Tungsten are documented current materials. Niobium, Singularities, and Kyarium remain planned progression; the Singularity Fabricator is pending rework.'},
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
