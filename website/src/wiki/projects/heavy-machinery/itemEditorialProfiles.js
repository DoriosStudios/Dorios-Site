const profile = (description, itemType, properties = [], usage) => ({
  documentation: {
    description,
    basic: {itemType},
    properties,
    usage,
  },
});

const itemEditorialProfiles = {
  'utilitycraft:raw_uranium': profile(
    'Raw Uranium begins the Heavy Machinery nuclear chain. It is refined into dust and ingots before later chemical processing and fuel preparation.',
    'Radioactive raw material',
    [['Progression', 'Ore processing → uranium products → enrichment → reactor fuel']],
  ),
  'utilitycraft:uranium_dust': profile(
    'Uranium Dust is the processed feedstock used to prepare uranium compounds and nuclear fuel components.',
    'Nuclear material',
    [['Source', 'Crusher processing'], ['Next stage', 'Chemical processing or smelting']],
  ),
  'utilitycraft:uranium_pellet': profile(
    'Uranium Pellets compact processed uranium into the form required for standard Uranium Fuel Rod production.',
    'Nuclear fuel component',
    [['Fuel grade', 'Standard uranium'], ['Next stage', 'Uranium Fuel Rod']],
  ),
  'utilitycraft:enriched_uranium_pellet': profile(
    'Enriched Uranium Pellets are produced after isotope separation and form the high-density fuel used by Enriched Uranium Fuel Rods.',
    'Enriched nuclear fuel component',
    [['Fuel grade', 'Enriched uranium'], ['Next stage', 'Enriched Uranium Fuel Rod']],
  ),
  'utilitycraft:uranium_rod': profile(
    'A standard Uranium Fuel Rod accepted by the Nuclear Reactor fuel system.',
    'Nuclear fuel',
    [['Machine', 'Nuclear Reactor'], ['Resource unit', 'Fuel units consumed at the configured FU/t rate']],
    'Insert rods through the reactor interface or a configured Item Port, then set the fuel-use rate from the reactor keypad.',
  ),
  'utilitycraft:enriched_uranium_rod': profile(
    'A high-density Enriched Uranium Fuel Rod accepted by the Nuclear Reactor for extended late-game generation.',
    'Enriched nuclear fuel',
    [['Machine', 'Nuclear Reactor'], ['Resource unit', 'Fuel units consumed at the configured FU/t rate']],
    'Insert rods through the reactor interface or a configured Item Port. Balance the selected burn rate against Rod Control capacity and coolant throughput.',
  ),
  'utilitycraft:saline_coolant_bucket': profile(
    'Saline Coolant is a dedicated reactor coolant. Registered coolant removes heat while the Nuclear Reactor operates and is consumed during cooling.',
    'Coolant container',
    [['Machine', 'Thermal and Nuclear Reactor systems'], ['Role', 'Heat removal']],
    'Supply coolant through a compatible liquid input and provide enough tank capacity and Heat Conductors for the intended reactor rate.',
  ),
  'utilitycraft:high_speed_rotor': profile(
    'A precision rotor required to construct the Isotope Centrifuge. It represents the high-speed separation stage of the uranium enrichment chain.',
    'Machine component',
    [['Machine', 'Isotope Centrifuge'], ['Role', 'Construction component']],
  ),
};

for (const piece of ['helmet', 'chestplate', 'leggings', 'boots']) {
  itemEditorialProfiles[`utilitycraft:utility_exo_${piece}`] = profile(
    `The Utility Exo ${piece[0].toUpperCase() + piece.slice(1)} is part of the extremely durable Utility Exo equipment set. The current item provides wearable durability and damage-absorption behavior; no extra scripted ability is claimed until one is implemented.`,
    'Utility Exo armor',
    [['Maximum stack', '1'], ['Durability', '10,000'], ['Current behavior', 'Wearable equipment and damage absorption']],
  );
  itemEditorialProfiles[`utilitycraft:hazmat_${piece}`] = profile(
    `The Hazmat ${piece[0].toUpperCase() + piece.slice(1)} is repairable protective equipment tagged for shared hazard-system integration.`,
    'Hazmat armor',
    [['Maximum stack', '1'], ['Repair material', 'Rubber Sheet'], ['System tag', 'utilitycraft:hazmat_armor']],
    'Wear the complete tagged set when a compatible add-on checks for Hazmat protection. Individual armor values and durability depend on the piece.',
  );
}

export default itemEditorialProfiles;

