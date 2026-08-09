const withCategory = (category, productionTypes) => Object.fromEntries(
  Object.entries(productionTypes).map(([id, productionType]) => [id, {category, productionType}]),
);

const machineProfiles = {
  ...withCategory('Superior Machines', {
    abyssal_fisher: 'Item',
    arc_press_forge: 'Item',
    centrifugal_siever: 'Item',
    dual_siever: 'Item',
    impact_crusher: 'Item',
    industrial_burner: 'Item',
    industrial_crucible: 'Fluid',
    pattern_placer: 'Other',
    pulverizer: 'Item',
    seismic_breaker: 'Other',
    verdant_cultivator: 'Item',
  }),
  ...withCategory('Unique Machines', {
    catalyst_weaver: 'Item',
    cryo_chamber: 'Fluid',
    cryo_freezer: 'Fluid',
    cryo_stabilizer: 'Fluid',
    cryofluid_synthesizer: 'Fluid',
    duplicator: 'Item',
    energizer: 'Item',
    genetic_seed_synthesizer: 'Item',
    laser_barrier: 'Other',
    liquifier: 'Fluid',
    residue_processor: 'Item',
    singularity_fabricator: 'Item',
    vaporworks_processor: 'Fluid',
  }),
  ...withCategory('Equipment Management Machines', {
    arcane_enchanter: 'Item',
    disenchanter: 'Item',
    enchantment_station: 'Item',
    refining_table: 'Item',
    reinforcement_anvil: 'Item',
  }),
  mob_magnet: {
    category: 'Mob Grinding Machines',
    productionType: 'Other',
    baseConsumption: 'Not required',
    energyCapacity: 'Not applicable',
    input: 'Nearby mobs matching its configured filter',
    output: 'Other',
    primaryResource: 'Mob targeting',
    description: 'Pulls nearby mobs toward a configurable point to consolidate automated mob farms and collection systems.',
    howItWorks: [
      'Place the Mob Magnet near the center of the intended grinding area.',
      'Configure its range, cooldown and mob whitelist or blacklist.',
      'Enable the magnet to pull matching nearby mobs toward the collection point.',
    ],
    specifications: [
      ['Base consumption', 'Not required'],
      ['Energy capacity', 'Not applicable'],
      ['Production type', 'Other'],
      ['Operation', 'Configurable mob attraction'],
    ],
    io: [
      ['Target', 'Nearby mobs matching the active filter'],
      ['Output', 'Mob movement toward the magnet'],
      ['Energy', 'Not required'],
    ],
  },
};

export default machineProfiles;
