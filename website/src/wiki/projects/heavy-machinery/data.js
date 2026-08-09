// Heavy Machinery's hand-curated adapter. Generated manifests can replace this module later.
export const assetRoot = '/img/wiki/heavy-machinery';

export const wikiSections = [
  {id: 'overview', label: 'Overview', icon: '⌂', href: '/wiki/heavy-machinery'},
  {id: 'items', label: 'Items', icon: '◇', href: '/wiki/heavy-machinery/items'},
  {id: 'blocks', label: 'Blocks', icon: '◆', href: '/wiki/heavy-machinery/blocks'},
  {id: 'machines', label: 'Machines', icon: '▦', href: '/wiki/heavy-machinery/machines'},
  {id: 'generators', label: 'Generators', icon: '◉', href: '/wiki/heavy-machinery/generators'},
  {id: 'entities', label: 'Entities', icon: '◎', href: '/wiki/heavy-machinery/entities'},
  {id: 'recipes', label: 'Recipes', icon: '▤', href: '/wiki/heavy-machinery/recipes'},
  {id: 'mechanics', label: 'Mechanics', icon: '⚙', href: '/wiki/heavy-machinery/mechanics'},
];

const item = (id, name, category, description, imageId = id) => ({
  id: `utilitycraft:${id}`,
  slug: id,
  name,
  category,
  description,
  image: id.startsWith('utility_exo_') ? `equipment/${imageId}.png` : `items/${imageId}.png`,
});

export const items = [
  item('bronze_ingot', 'Bronze Ingot', 'Ingots', 'A structural alloy used throughout bronze-tier multiblocks.'),
  item('tin_ingot', 'Tin Ingot', 'Ingots', 'A refined metal used in plates, casings, and industrial components.'),
  item('uranium_ingot', 'Uranium Ingot', 'Ingots', 'Refined uranium for late-game nuclear production chains.'),
  item('bronze_dust', 'Bronze Dust', 'Dusts', 'Pulverized bronze ready for smelting or material processing.'),
  item('tin_dust', 'Tin Dust', 'Dusts', 'Pulverized tin produced by the Crusher Factory.', 'raw_tin_dust'),
  item('uranium_dust', 'Uranium Dust', 'Dusts', 'Processed uranium material used before enrichment.'),
  item('bronze_plate', 'Bronze Plate', 'Plates', 'Pressed alloy plate for reinforced industrial construction.'),
  item('tin_plate', 'Tin Plate', 'Plates', 'Pressed tin used by machine and casing recipes.'),
  item('bronze_nugget', 'Bronze Nugget', 'Nuggets', 'A compact bronze unit for smaller crafting requirements.'),
  item('tin_nugget', 'Tin Nugget', 'Nuggets', 'A compact tin unit used in material conversions.'),
  item('brute_bronze', 'Brute Bronze', 'Raw materials', 'An unfinished copper-and-tin alloy that can be refined into bronze.'),
  item('raw_tin', 'Raw Tin', 'Raw materials', 'Unrefined tin recovered from chunks and autosieve processing.'),
  item('raw_uranium', 'Raw Uranium', 'Raw materials', 'Unrefined radioactive material for the nuclear chain.'),
  item('tin_chunk', 'Tin Chunk', 'Ore chunks', 'A tin-bearing chunk obtained through high-tier sieving.'),
  item('deepslate_tin_chunk', 'Deepslate Tin Chunk', 'Ore chunks', 'Dense tin-bearing material extracted from crushed deepslate.'),
  item('deepslate_uranium_chunk', 'Deepslate Uranium Chunk', 'Ore chunks', 'A rare uranium-bearing chunk from deep industrial processing.'),
  item('uranium_pellet', 'Uranium Pellet', 'Nuclear', 'Compressed uranium prepared for rod production.'),
  item('enriched_uranium_pellet', 'Enriched Uranium Pellet', 'Nuclear', 'Enriched fuel material for advanced nuclear infrastructure.'),
  item('uranium_rod', 'Uranium Rod', 'Nuclear', 'A formed uranium component used by reactor systems.'),
  item('enriched_uranium_rod', 'Enriched Uranium Rod', 'Nuclear', 'High-density reactor fuel for late-game generation.'),
  item('darloonite_crystal', 'Darloonite Crystal', 'Crystals', 'A synthetic crystal created by infusing echo and amethyst materials.'),
  item('charged_darloonite_crystal', 'Charged Darloonite Crystal', 'Crystals', 'An energized crystal used in high-cost controllers and machines.'),
  item('control_panel', 'Control Panel', 'Components', 'The primary interface component used to craft multiblock controllers.'),
  item('saline_coolant_bucket', 'Saline Coolant Bucket', 'Fluids', 'Dedicated coolant for stabilizing the Thermal Reactor.'),
  item('utility_exo_helmet', 'Utility Exo Helmet', 'Equipment', 'The helmet component of the modular Utility Exo set.'),
  item('utility_exo_chestplate', 'Utility Exo Chestplate', 'Equipment', 'The armored chest component of the Utility Exo set.'),
  item('utility_exo_leggings', 'Utility Exo Leggings', 'Equipment', 'The leg component of the Utility Exo set.'),
  item('utility_exo_boots', 'Utility Exo Boots', 'Equipment', 'The boot component of the Utility Exo set.'),
];

const uniformFaces = (texture) => ({top: texture, left: texture, right: texture});
const directionalFaces = (folder, id, leftSuffix = 'side') => ({
  top: `${folder}/${id}_up.png`,
  left: `${folder}/${id}_${leftSuffix}.png`,
  right: `${folder}/${id}_north.png`,
});
const block = (id, name, category, tier, texture, description, faces) => ({
  id: `utilitycraft:${id}`,
  slug: id,
  name,
  category,
  tier,
  description,
  faces: faces ?? uniformFaces(texture),
});

const casingDescription = (tier, role) => `${tier} multiblock ${role.toLowerCase()} for modular industrial structures.`;

export const blocks = [
  block('brute_bronze_block', 'Block of Brute Bronze', 'Materials', 'Material', 'blocks/brute_bronze_block.png', 'Compact storage for unfinished bronze alloy.'),
  block('raw_tin_block', 'Block of Raw Tin', 'Materials', 'Material', 'blocks/block_of_raw_tin.png', 'Compact raw tin storage that can be unpacked for processing.'),
  block('raw_uranium_block', 'Block of Raw Uranium', 'Materials', 'Material', 'blocks/block_of_raw_uranium.png', 'Dense raw uranium storage for nuclear production lines.'),
  block('tin_block', 'Block of Tin', 'Materials', 'Material', 'blocks/block_of_tin.png', 'Refined tin storage and industrial building material.'),
  block('tin_plated_block', 'Tin Plated Block', 'Materials', 'Material', 'blocks/block_of_tin_plate.png', 'A plated tin construction block.'),
  block('uranium_block', 'Block of Uranium', 'Materials', 'Material', 'blocks/block_of_uranium.png', 'Refined uranium storage block.'),
  block('controller_case', 'Controller Case', 'Controllers', 'Component', 'blocks/controller_case.png', 'Base casing used to assemble specialized machine controllers.', directionalFaces('blocks', 'controller_case')),

  ...[
    ['bronze_block', 'Block of Bronze', 'Structure'],
    ['bronze_bricks', 'Bronze Bricks', 'Structure'],
    ['bronze_case', 'Bronze Casing', 'Casing'],
    ['bronze_energy_port', 'Bronze Energy Port', 'Energy port'],
    ['bronze_fluid_port', 'Bronze Liquid Port', 'Liquid port'],
    ['bronze_hazard_block', 'Bronze Hazard Block', 'Structure'],
    ['bronze_item_port', 'Bronze Item Port', 'Item port'],
    ['bronze_plated_block', 'Bronze Plated Block', 'Structure'],
    ['bronze_vent_panel', 'Bronze Vent Panel', 'Vent'],
    ['reinforced_bronze_glass', 'Reinforced Bronze Glass', 'Glass'],
    ['tempered_bronze_glass', 'Tempered Bronze Glass', 'Glass'],
  ].map(([id, name, role]) => block(id, name, 'Bronze casings', 'Bronze', `blocks/multiblock/bronze/${id}.png`, casingDescription('Bronze', role))),
  block('bronze_controller_case', 'Bronze Controller Case', 'Bronze casings', 'Bronze', 'blocks/multiblock/bronze/bronze_steel_case.png', casingDescription('Bronze', 'controller casing'), directionalFaces('blocks/multiblock/bronze', 'bronze_steel_case', 'west')),

  ...[
    ['reinforced_steel_glass', 'Reinforced Steel Glass', 'Glass'],
    ['steel_bricks', 'Steel Bricks', 'Structure'],
    ['steel_case', 'Steel Casing', 'Casing'],
    ['steel_energy_port', 'Steel Energy Port', 'Energy port'],
    ['steel_fluid_port', 'Steel Liquid Port', 'Liquid port'],
    ['steel_hazard_block', 'Steel Hazard Block', 'Structure'],
    ['steel_item_port', 'Steel Item Port', 'Item port'],
    ['steel_plated_block', 'Steel Plated Block', 'Structure'],
    ['steel_vent_panel', 'Steel Vent Panel', 'Vent'],
    ['tempered_steel_glass', 'Tempered Steel Glass', 'Glass'],
  ].map(([id, name, role]) => block(id, name, 'Steel casings', 'Steel', `blocks/multiblock/steel/${id}.png`, casingDescription('Steel', role))),

  ...[
    ['netherite_bricks', 'Netherite Bricks', 'Structure'],
    ['netherite_case', 'Netherite Casing', 'Casing'],
    ['netherite_energy_port', 'Netherite Energy Port', 'Energy port'],
    ['netherite_fluid_port', 'Netherite Liquid Port', 'Liquid port'],
    ['netherite_hazard_block', 'Netherite Hazard Block', 'Structure'],
    ['netherite_item_port', 'Netherite Item Port', 'Item port'],
    ['netherite_plated_block', 'Netherite Plated Block', 'Structure'],
    ['netherite_vent_panel', 'Netherite Vent Panel', 'Vent'],
    ['reinforced_netherite_glass', 'Reinforced Netherite Glass', 'Glass'],
    ['stamped_netherite_plate', 'Stamped Netherite Plate', 'Structure'],
    ['tempered_netherite_glass', 'Tempered Netherite Glass', 'Glass'],
  ].map(([id, name, role]) => block(id, name, 'Netherite casings', 'Netherite', `blocks/multiblock/netherite/${id}.png`, casingDescription('Netherite', role))),

  ...[
    ['efficiency_module', 'Efficiency Module', 'Reduces machine energy consumption.'],
    ['energy_cell', 'Energy Cell', 'Expands internal Dorios Energy storage.'],
    ['fluid_cell', 'Liquid Cell', 'Expands machine liquid storage.'],
    ['fluid_controller', 'Liquid Controller', 'Coordinates multiblock liquid storage.'],
    ['fuel_assemblies', 'Fuel Assemblies', 'Holds nuclear fuel inside a reactor structure.'],
    ['processing_module', 'Processing Module', 'Raises the number of operations completed per cycle.'],
    ['rod_control', 'Rod Control', 'Controls fuel assembly behavior in nuclear structures.'],
    ['speed_module', 'Speed Module', 'Raises processing speed at a higher energy cost.'],
  ].map(([id, name, description]) => block(id, name, 'Components', 'Module', `blocks/multiblock/${id}.png`, description,
    ['efficiency_module', 'energy_cell', 'processing_module', 'rod_control', 'speed_module'].includes(id)
      ? directionalFaces('blocks/multiblock', id, id === 'rod_control' ? 'side' : 'west')
      : id === 'fluid_cell' ? {top: 'blocks/multiblock/fluid_cell_up.png', left: 'blocks/multiblock/fluid_cell_side.png', right: 'blocks/multiblock/fluid_cell_side.png'}
        : id === 'fluid_controller' ? directionalFaces('blocks/multiblock', id) : undefined)),

  ...[
    ['autosieve_controller', 'Autosieve Controller'],
    ['crusher_controller', 'Crusher Controller'],
    ['electro_press_controller', 'Electro Press Controller'],
    ['incinerator_controller', 'Incinerator Controller'],
    ['infuser_controller', 'Infuser Controller'],
    ['magmatic_chamber_controller', 'Magmatic Chamber Controller'],
    ['nuclear_reactor_controller', 'Nuclear Reactor Controller'],
    ['reaction_chamber_controller', 'Reaction Chamber Controller'],
  ].map(([id, name]) => block(id, name, 'Controllers', 'Machine', `blocks/multiblock/${id}.png`, `Activates and controls the ${name.replace(' Controller', '')} multiblock.`,
    directionalFaces('blocks/multiblock', id === 'reaction_chamber_controller' ? 'matter_condenser_controller' : id))),

  ...[
    ['basic_power_condenser_unit', 'Basic Power Condenser Unit', 'basic_energy_condenser'],
    ['advanced_power_condenser_unit', 'Advanced Power Condenser Unit', 'advanced_energy_condenser'],
    ['expert_power_condenser_unit', 'Expert Power Condenser Unit', 'expert_energy_condenser'],
    ['ultimate_power_condenser_unit', 'Ultimate Power Condenser Unit', 'ultimate_energy_condenser'],
  ].map(([id, name, texture]) => block(id, name, 'Power storage', 'Condenser', `blocks/multiblock/${texture}.png`, 'Adds scalable energy capacity and transfer throughput to a Power Condenser Matrix.', {
    top: `blocks/multiblock/${texture}_up.png`, left: `blocks/multiblock/${texture}_side.png`, right: `blocks/multiblock/${texture}_side.png`,
  })),
  block('power_condenser_controller', 'Power Condenser Controller', 'Controllers', 'Generator', 'blocks/multiblock/power_condenser_controller.png', 'Activates a modular Power Condenser Matrix.', directionalFaces('blocks/multiblock', 'power_condenser_controller')),
  block('heat_conductor', 'Heat Conductor', 'Thermal reactor', 'Reactor', 'blocks/multiblock/heat_conductor.png', 'Increases heat dissipation inside a Thermal Reactor.', {top: 'blocks/multiblock/heat_conductor_up.png', left: 'blocks/multiblock/heat_conductor_side.png', right: 'blocks/multiblock/heat_conductor_side.png'}),
  block('thermo_core', 'Thermo Core', 'Thermal reactor', 'Reactor', 'blocks/multiblock/thermo_core.png', 'Required core component for Thermal Reactor operation.', {top: 'blocks/multiblock/thermo_core_up.png', left: 'blocks/multiblock/thermo_core_side.png', right: 'blocks/multiblock/thermo_core_side.png'}),
  block('thermo_reactor_controller', 'Thermal Reactor Controller', 'Controllers', 'Generator', 'blocks/multiblock/bronze/thermal_reactor_controller.png', 'Configures burn rate and controls Thermal Reactor operation.', directionalFaces('blocks/multiblock/bronze', 'thermal_reactor_controller', 'west')),
];

export const machines = [
  {id: 'crusher', name: 'Crusher Factory', controller: 'Crusher Controller', tier: 'Steel', recipe: 'Crusher', cost: '800 DE base', input: '9 input slots', output: '9 output slots', description: 'Processes crusher recipes in one to three chained stages. Higher modes continue crushing the previous result.', modules: ['Processing', 'Speed', 'Efficiency', 'Energy Cell'], image: 'blocks/multiblock/crusher_controller.png'},
  {id: 'incinerator', name: 'Incinerator Factory', controller: 'Incinerator Controller', tier: 'Steel', recipe: 'Furnace', cost: '800 DE base', input: '9 input slots', output: '9 output slots', description: 'Smelts registered furnace recipes in parallel using Dorios Energy.', modules: ['Processing', 'Speed', 'Efficiency', 'Energy Cell'], image: 'blocks/multiblock/incinerator_controller.png'},
  {id: 'electro-press', name: 'Electro Press Factory', controller: 'Electro Press Controller', tier: 'Steel', recipe: 'Press', cost: '800 DE base', input: '9 input slots', output: '9 output slots', description: 'Presses registered materials in parallel for plates, rods, and compressed components.', modules: ['Processing', 'Speed', 'Efficiency', 'Energy Cell'], image: 'blocks/multiblock/electro_press_controller.png'},
  {id: 'infuser', name: 'Infuser Factory', controller: 'Infuser Controller', tier: 'Steel', recipe: 'Infuser', cost: '1,600 DE base', input: 'Catalyst + material grids', output: '9 output slots', description: 'Combines a base material with a catalyst using registered infusion recipes.', modules: ['Processing', 'Speed', 'Efficiency', 'Energy Cell'], image: 'blocks/multiblock/infuser_controller.png'},
  {id: 'autosieve', name: 'Autosieve Factory', controller: 'Autosieve Controller', tier: 'Steel', recipe: 'Sieve', cost: '6,400 DE base', input: 'Material grid + mesh', output: '15 output slots', description: 'Sieves blocks with reusable meshes. Mesh tier unlocks drops while modifiers improve chance and amount.', modules: ['Processing', 'Speed', 'Efficiency', 'Energy Cell'], image: 'blocks/multiblock/autosieve_controller.png'},
  {id: 'reaction-chamber', name: 'Reaction Chamber', controller: 'Reaction Chamber Controller', tier: 'Steel', recipe: 'Reaction', cost: 'Recipe dependent', input: 'Items + liquid reactant', output: 'Items + product liquid', description: 'Combines solid inputs with a liquid reactant and can produce items, liquid, or both.', modules: ['Processing', 'Speed', 'Efficiency', 'Energy Cell', 'Liquid Cell'], image: 'blocks/multiblock/matter_condenser_controller.png'},
  {id: 'magmatic-chamber', name: 'Magmatic Chamber', controller: 'Magmatic Chamber Controller', tier: 'Steel', recipe: 'Melter', cost: 'Recipe dependent', input: 'Material grid', output: 'Molten liquid tank', description: 'Melts registered items into liquids while enforcing a compatible output tank.', modules: ['Processing', 'Speed', 'Efficiency', 'Energy Cell', 'Liquid Cell'], image: 'blocks/multiblock/magmatic_chamber_controller.png'},
];

export const generators = [
  {id: 'thermal-reactor', name: 'Thermal Reactor', status: 'Operational', tier: 'Bronze multiblock', fuel: 'Lava + saline coolant', output: 'Up to 2,000 DE per mB before efficiency', risk: 'Overheating above 1,000 K; critical at 1,200 K', description: 'Burns lava to create Dorios Energy. Temperature, pressure, coolant, vents, conductors, and burn rate must remain balanced.', image: 'guide/thermal_reactor_ui.png', components: ['Thermo Core', 'Heat Conductors', 'Liquid Cells', 'Energy Units', 'Top Vents']},
  {id: 'power-condenser', name: 'Power Condenser Matrix', status: 'Operational', tier: 'Steel multiblock', fuel: 'External energy input', output: 'Automatic network transfer', risk: 'Requires at least one condenser unit', description: 'Stores Dorios Energy and automatically sends it to the connected network. Capacity and transfer scale with installed condenser units.', image: 'guide/components_showcase.png', components: ['Controller', 'Condenser Units', 'Energy Ports', 'Steel Casings']},
  {id: 'nuclear-reactor', name: 'Nuclear Reactor', status: 'Experimental', tier: 'Netherite infrastructure', fuel: 'Uranium assemblies', output: 'Under active development', risk: 'Controller and reactor components are present; behavior is not finalized', description: 'The repository includes its controller, fuel assemblies, rod control, and liquid control blocks. Runtime documentation will be finalized with the reactor implementation.', image: 'guide/controllers_showcase.png', components: ['Nuclear Controller', 'Fuel Assemblies', 'Rod Control', 'Liquid Controller']},
];

export const entities = [
  {id: 'multiblock_machine', identifier: 'utilitycraft:multiblock_machine', name: 'Multiblock Machine Entity', category: 'Runtime controller', image: 'guide/controllers_showcase.png', description: 'Internal entity used to persist inventory, energy, components, progress, and interface state for active multiblock machines.'},
  {id: 'power_condenser', identifier: 'utilitycraft:power_condenser', name: 'Power Condenser Entity', category: 'Energy runtime', image: 'guide/components_showcase.png', description: 'Runtime anchor for the Power Condenser Matrix, including energy capacity and automatic network transfer state.'},
  {id: 'thermo_reactor', identifier: 'utilitycraft:thermo_reactor', name: 'Thermal Reactor Entity', category: 'Generator runtime', image: 'guide/thermal_reactor_ui.png', description: 'Stores Thermal Reactor fuel, coolant, temperature, pressure, efficiency, burn rate, and operating state.'},
  {id: 'fluid_tank_saline_coolant', identifier: 'utilitycraft:fluid_tank_saline_coolant', name: 'Saline Coolant Tank Entity', category: 'Fluid runtime', image: 'items/saline_coolant_bucket.png', description: 'Internal fluid entity representing saline coolant storage used by reactor and liquid systems.'},
];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const processingRecipes = [
  ['Crusher', 'Deepslate Tin Chunk', 'Raw Tin', '800 DE base'],
  ['Crusher', 'Tin Chunk', 'Raw Tin', '800 DE base'],
  ['Crusher', 'Raw Tin', '2× Tin Dust', '800 DE base'],
  ['Crusher', 'Tin Ingot', 'Tin Dust', '800 DE base'],
  ['Crusher', 'Tin Plate', 'Tin Dust', '800 DE base'],
  ['Crusher', 'Block of Raw Tin', '12× Tin Dust', '800 DE base'],
  ['Crusher', 'Block of Tin', '6× Tin Dust', '800 DE base'],
  ['Crusher', 'Deepslate Uranium Chunk', 'Raw Uranium', '800 DE base'],
  ['Crusher', 'Raw Uranium', '2× Uranium Dust', '800 DE base'],
  ['Crusher', 'Uranium Ingot', 'Uranium Dust', '800 DE base'],
  ['Crusher', 'Block of Raw Uranium', '12× Uranium Dust', '800 DE base'],
  ['Crusher', 'Block of Uranium', '6× Uranium Dust', '800 DE base'],
  ['Crusher', 'Brute Bronze', '2× Bronze Dust', '800 DE base'],
  ['Crusher', 'Bronze Ingot', 'Bronze Dust', '800 DE base'],
  ['Crusher', 'Bronze Plate', 'Bronze Dust', '800 DE base'],
  ['Crusher', 'Block of Brute Bronze', '12× Bronze Dust', '800 DE base'],
  ['Crusher', 'Block of Bronze', '6× Bronze Dust', '800 DE base'],
  ['Electro Press', 'Tin Ingot', 'Tin Plate', '800 DE base'],
  ['Electro Press', 'Uranium Ingot', 'Uranium Rod', '800 DE base'],
  ['Electro Press', 'Bronze Ingot', 'Bronze Plate', '800 DE base'],
  ['Infuser', 'Steel Dust + Glass', '8× Tempered Steel Glass', 'Default cost'],
  ['Infuser', 'Echo Shard + Amethyst Shard', 'Darloonite Crystal', '6,400 DE'],
  ['Infuser', 'Diamond Dust + Darloonite Crystal', 'Charged Darloonite Crystal', '128,000 DE'],
  ['Infuser', 'Tin Dust + 2× Copper Ingot', '5× Brute Bronze', '6,400 DE'],
  ['Infuser', 'Tin Dust + 2× Copper Dust', '5× Brute Bronze', '6,400 DE'],
  ['Infuser', 'Bronze Dust + Glass', '8× Tempered Bronze Glass', 'Default cost'],
  ['Incinerator', 'Tin Dust', 'Tin Ingot', '800 DE base'],
  ['Incinerator', 'Raw Tin', 'Tin Ingot', '800 DE base'],
  ['Incinerator', 'Block of Raw Tin', 'Block of Tin', '800 DE base'],
  ['Incinerator', 'Uranium Dust', 'Uranium Ingot', '800 DE base'],
  ['Incinerator', 'Raw Uranium', 'Uranium Ingot', '800 DE base'],
  ['Incinerator', 'Block of Raw Uranium', 'Block of Uranium', '800 DE base'],
  ['Incinerator', 'Bronze Dust', 'Bronze Ingot', '800 DE base'],
  ['Incinerator', 'Brute Bronze', 'Bronze Ingot', '800 DE base'],
  ['Incinerator', 'Block of Brute Bronze', 'Block of Bronze', '800 DE base'],
  ['Autosieve', 'Gravel + tier 4 mesh', 'Tin Chunk (5%)', '6,400 DE base'],
  ['Autosieve', 'Compressed Gravel + tier 4 mesh', '9× Tin Chunk (5%)', '6,400 DE base'],
  ['Autosieve', 'Crushed Cobbled Deepslate + tier 4 mesh', 'Tin Chunk (5%) / Uranium Chunk (1%)', '6,400 DE base'],
  ['Autosieve', 'Compressed Crushed Deepslate + tier 4 mesh', '9× Tin Chunk (5%) / 9× Uranium Chunk (1%)', '6,400 DE base'],
].map(([type, input, output, cost]) => ({
  id: `${slugify(type)}-${slugify(input)}`,
  identifier: `utilitycraft:process/${slugify(type)}/${slugify(input)}`,
  type,
  category: `${type} processing`,
  station: slugify(type),
  slotCount: input.split(' + ').length,
  input,
  output,
  cost,
}));

const titleFromId = (id) => id.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
const craftingGroups = {
  'Bronze conversions': [
    'bronze_block_to_ingot', 'bronze_ingot_to_block', 'bronze_ingot_to_nugget',
    'bronze_nugget_to_ingot', 'brute_bronze_block_to_brute', 'brute_bronze_to_block',
  ],
  'Bronze casings': [
    'bronze_bricks', 'bronze_case', 'bronze_energy_port', 'bronze_fluid_port',
    'bronze_hazard', 'bronze_item_port', 'bronze_plated_block', 'bronze_vent_panel',
    'reinforced_bronze_glass',
  ],
  'Steel casings': [
    'reinforced_steel_glass', 'steel_bricks', 'steel_case', 'steel_energy_port',
    'steel_fluid_port', 'steel_hazard', 'steel_item_port', 'steel_plated_block',
    'steel_vent_panel',
  ],
  'Controllers & modules': [
    'autosieve_controller', 'bronze_controller_case', 'control_panel', 'controller_case',
    'crusher_controller', 'electro_press', 'energy_cell', 'incinerator_controller',
    'infuser_controller', 'magmatic_chamber_controller', 'power_condenser_controller',
    'reaction_chamber_controller', 'thermal_controller', 'efficiency_module', 'fluid_cell',
    'heat_conductor', 'processing_module', 'speed_module', 'thermo_core',
  ],
  'Condenser units': [
    'advanced_power_condenser_unit', 'basic_power_condenser_unit',
    'expert_power_condenser_unit', 'ultimate_power_condenser_unit',
  ],
  'Tin processing': [
    'deepslate_tin_chunk_to_raw', 'raw_tin_block_to_raw', 'raw_tin_to_block',
    'tin_block_to_ingot', 'tin_chunk_to_raw', 'tin_ingot_to_block',
    'tin_ingot_to_nugget', 'tin_nugget_to_ingot', 'tin_plated_block',
  ],
  'Uranium processing': [
    'raw_uranium_block_to_raw', 'raw_uranium_to_block',
    'uranium_block_to_ingot', 'uranium_ingot_to_block',
  ],
};

export const craftingRecipes = Object.entries(craftingGroups).flatMap(([category, ids]) =>
  ids.map((id) => ({id, category, name: titleFromId(id), station: 'UtilityCraft Workbench'}))
);

export const mechanics = [
  {name: 'Modular multiblocks', icon: '▦', description: 'Build expandable industrial structures from a controller, tier-compatible casing, ports, and internal components.'}
];
