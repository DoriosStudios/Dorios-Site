const itemDocumentation = (description, itemType, properties, usage, relatedItems = []) => ({
  documentation: {
    description,
    basic: {itemType},
    properties,
    usage,
    relatedItems,
  },
});

const upgradeProfiles = {
  base_upgrade: ['Upgrade component', 'Crafting component', 'Used as the common base when assembling specialized machine upgrades. It is not installed directly into a machine.'],
  speed_upgrade: ['Speed', 'Machine upgrade', 'Raises processing speed in machines that expose a Speed slot. Faster operation can increase instantaneous energy demand.'],
  energy_upgrade: ['Energy', 'Machine upgrade', 'Improves the energy behavior of compatible machines through their dedicated Energy upgrade slot.'],
  range_upgrade: ['Range', 'Machine upgrade', 'Expands the working area of compatible automation machines. Each machine defines its own maximum useful range.'],
  filter_upgrade: ['Filter', 'Machine upgrade', 'Unlocks whitelist and blacklist controls on compatible transport systems and allows copied filters to be pasted.'],
  quantity_upgrade: ['Quantity', 'Machine upgrade', 'Raises the amount handled per operation in compatible machines and transport systems.'],
  damage_upgrade: ['Damage', 'Machine upgrade', 'Raises damage dealt by compatible automation systems that expose a Damage slot.'],
  ultimate_upgrade: ['Ultimate', 'Composite upgrade', 'A late-game upgrade component used by systems that accept the combined Ultimate upgrade type.'],
};

const itemEditorialProfiles = {
  'utilitycraft:wrench': itemDocumentation(
    'The Wrench is UtilityCraft’s primary configuration tool. It rotates compatible machines, toggles pipe faces, changes energy nodes between receiver and transmitter modes, selects transfer strategies, and configures the three network color channels.',
    'Configuration tool',
    [
      ['Normal use', 'Open machine or energy-node controls'],
      ['Sneak use', 'Rotate blocks or open basic network channels'],
      ['Pipe use', 'Enable or disable the selected connection face'],
      ['Energy transfer modes', 'Nearest, farthest, or round robin'],
    ],
    'Use the Wrench on the face you want to configure. Energy receivers and transmitters expose their role and transfer mode; sneaking exposes the primary, secondary, and tertiary channel controls or rotates other compatible blocks.',
    ['utilitycraft:copy_paste_tool'],
  ),
  'utilitycraft:copy_paste_tool': itemDocumentation(
    'The Copy/Paste Tool records a compatible machine’s direction, item I/O, fluid I/O, gas I/O, and filters, then applies the selected settings to another compatible block.',
    'Configuration tool',
    [
      ['Selectable data', 'Direction, item I/O, fluid I/O, gas I/O, filters'],
      ['Filter requirement', 'The destination needs a Filter Upgrade before filters can be pasted'],
      ['Compatibility', 'Only settings supported by the destination are applied'],
    ],
    'Use the tool menu to choose which settings are included. Copy from the configured source block, switch to paste mode, then use it on the destination. Clear the stored profile before copying a different setup.',
    ['utilitycraft:wrench', 'utilitycraft:filter_upgrade'],
  ),
  ...Object.fromEntries(Object.entries(upgradeProfiles).map(([id, [type, itemType, description]]) => [
    `utilitycraft:${id}`,
    itemDocumentation(
      description,
      itemType,
      [
        ['Semantic type', type],
        ['Installation', 'Use on a machine with the matching upgrade slot'],
        ['Stacking rule', 'Effective level is capped by the receiving machine'],
      ],
      id === 'base_upgrade'
        ? 'Use it as the center component in specialized upgrade recipes.'
        : 'Hold the upgrade and use it on a compatible machine. Sneak-use installs as many as the slot can accept; ordinary use installs one.',
    ),
  ])),
};

const hammerTiers = [
  ['wooden', 'Wooden', 0],
  ['stone', 'Stone', 1],
  ['copper', 'Copper', 2],
  ['iron', 'Iron', 3],
  ['golden', 'Golden', 4],
  ['diamond', 'Diamond', 5],
  ['steel', 'Steel', 6],
  ['netherite', 'Netherite', 7],
];

for (const [id, label, tier] of hammerTiers) {
  itemEditorialProfiles[`utilitycraft:${id}_hammer`] = itemDocumentation(
    `A ${label} hammer used to break registered materials into crushed or siftable forms. Its Tier ${tier} mining level determines which transformations are available.`,
    'Hammer',
    [
      ['Hammer tier', `Tier ${tier}`],
      ['Primary use', 'Create crushed and siftable blocks'],
      ['Drop rules', 'Follow the target block’s documented hammer requirement'],
    ],
    'Mine a registered hammer-compatible block directly. Higher-tier blocks require a hammer whose tier meets or exceeds the listed requirement.',
  );
}

const fishingNetTiers = [
  ['string', 'String', 0],
  ['copper', 'Copper', 2],
  ['iron', 'Iron', 3],
  ['golden', 'Golden', 4],
  ['emerald', 'Emerald', 5],
  ['diamond', 'Diamond', 6],
  ['netherite', 'Netherite', 7],
];

for (const [id, label, tier] of fishingNetTiers) {
  itemEditorialProfiles[`utilitycraft:${id}_fishing_net`] = itemDocumentation(
    `A Tier ${tier} ${label} fishing net installed in the Auto Fisher. Net parameters control eligible loot, roll speed, chance, amount, rolls, and luck.`,
    'Auto Fisher component',
    [
      ['Net tier', `Tier ${tier}`],
      ['Machine', 'Auto Fisher'],
      ['Controls', 'Loot eligibility and fishing roll modifiers'],
    ],
    'Install the net in the Auto Fisher’s dedicated secondary input while the machine has adjacent water and Dorios Energy.',
  );
}

export default itemEditorialProfiles;

