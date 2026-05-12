const utilityCraftMachineRecipeData = {
  solar_panel: {
    recipes: [
      {
        resultId: 'utilitycraft:basic_solar_panel',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_ingot', amount: 2 },
          { id: 'utilitycraft:basic_chip', amount: 3 },
          { id: 'minecraft:gold_ingot', amount: 3 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:advanced_solar_panel',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:advanced_chip', amount: 3 },
          { id: 'utilitycraft:basic_solar_panel', amount: 1 },
          { id: 'utilitycraft:energized_iron_plate', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:expert_solar_panel',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:expert_chip', amount: 3 },
          { id: 'utilitycraft:advanced_solar_panel', amount: 1 },
          { id: 'utilitycraft:diamond_dust', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:ultimate_solar_panel',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:ultimate_chip', amount: 3 },
          { id: 'utilitycraft:expert_solar_panel', amount: 1 },
          { id: 'utilitycraft:netherite_plate', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
    ],
  },
  wind_turbine: {
    recipes: [
      {
        resultId: 'utilitycraft:basic_wind_turbine',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_ingot', amount: 2 },
          { id: 'utilitycraft:basic_chip', amount: 3 },
          { id: 'utilitycraft:fan', amount: 1 },
          { id: 'utilitycraft:machine_case', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:advanced_wind_turbine',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:advanced_chip', amount: 3 },
          { id: 'utilitycraft:basic_wind_turbine', amount: 1 },
          { id: 'utilitycraft:energized_iron_plate', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:expert_wind_turbine',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:expert_chip', amount: 3 },
          { id: 'utilitycraft:advanced_wind_turbine', amount: 1 },
          { id: 'utilitycraft:diamond_dust', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:ultimate_wind_turbine',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:ultimate_chip', amount: 3 },
          { id: 'utilitycraft:expert_wind_turbine', amount: 1 },
          { id: 'utilitycraft:netherite_plate', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
    ],
  },
  thermo_generator: {
    recipes: [
      {
        resultId: 'utilitycraft:basic_thermo_generator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:copper_block', amount: 3 },
          { id: 'utilitycraft:copper_plate', amount: 1 },
          { id: 'utilitycraft:basic_chip', amount: 2 },
          { id: 'utilitycraft:basic_fluid_tank', amount: 1 },
          { id: 'utilitycraft:gold_plate', amount: 2 },
        ],
      },
      {
        resultId: 'utilitycraft:advanced_thermo_generator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:copper_block', amount: 3 },
          { id: 'utilitycraft:advanced_fluid_tank', amount: 1 },
          { id: 'utilitycraft:advanced_chip', amount: 2 },
          { id: 'utilitycraft:basic_thermo_generator', amount: 1 },
          { id: 'utilitycraft:energized_iron_plate', amount: 2 },
        ],
      },
      {
        resultId: 'utilitycraft:expert_thermo_generator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:copper_block', amount: 3 },
          { id: 'utilitycraft:expert_fluid_tank', amount: 1 },
          { id: 'utilitycraft:expert_chip', amount: 2 },
          { id: 'utilitycraft:advanced_thermo_generator', amount: 1 },
          { id: 'utilitycraft:diamond_dust', amount: 2 },
        ],
      },
      {
        resultId: 'utilitycraft:ultimate_thermo_generator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:copper_block', amount: 3 },
          { id: 'utilitycraft:ultimate_fluid_tank', amount: 1 },
          { id: 'utilitycraft:ultimate_chip', amount: 2 },
          { id: 'utilitycraft:expert_thermo_generator', amount: 1 },
          { id: 'utilitycraft:netherite_plate', amount: 2 },
        ],
      },
    ],
  },
  furnator: {
    recipes: [
      {
        resultId: 'utilitycraft:basic_furnator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_ingot', amount: 2 },
          { id: 'utilitycraft:basic_chip', amount: 3 },
          { id: 'minecraft:blast_furnace', amount: 1 },
          { id: 'minecraft:iron_ingot', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:advanced_furnator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:advanced_chip', amount: 3 },
          { id: 'utilitycraft:basic_furnator', amount: 1 },
          { id: 'utilitycraft:energized_iron_plate', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:expert_furnator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:expert_chip', amount: 3 },
          { id: 'utilitycraft:advanced_furnator', amount: 1 },
          { id: 'utilitycraft:diamond_dust', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
      {
        resultId: 'utilitycraft:ultimate_furnator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:ultimate_chip', amount: 3 },
          { id: 'utilitycraft:expert_furnator', amount: 1 },
          { id: 'utilitycraft:netherite_plate', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
    ],
  },
  magmator: {
    recipes: [
      {
        resultId: 'utilitycraft:basic_magmator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:gold_plate', amount: 2 },
          { id: 'utilitycraft:basic_fluid_tank', amount: 1 },
          { id: 'utilitycraft:basic_chip', amount: 3 },
          { id: 'minecraft:furnace', amount: 1 },
          { id: 'utilitycraft:steel_plate', amount: 2 },
        ],
      },
      {
        resultId: 'utilitycraft:advanced_magmator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:energized_iron_plate', amount: 2 },
          { id: 'utilitycraft:advanced_fluid_tank', amount: 1 },
          { id: 'utilitycraft:advanced_chip', amount: 3 },
          { id: 'utilitycraft:basic_magmator', amount: 1 },
          { id: 'utilitycraft:steel_plate', amount: 2 },
        ],
      },
      {
        resultId: 'utilitycraft:expert_magmator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:diamond_dust', amount: 2 },
          { id: 'utilitycraft:expert_fluid_tank', amount: 1 },
          { id: 'utilitycraft:expert_chip', amount: 3 },
          { id: 'utilitycraft:advanced_magmator', amount: 1 },
          { id: 'utilitycraft:steel_plate', amount: 2 },
        ],
      },
      {
        resultId: 'utilitycraft:ultimate_magmator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:netherite_plate', amount: 4 },
          { id: 'utilitycraft:ultimate_fluid_tank', amount: 1 },
          { id: 'utilitycraft:ultimate_chip', amount: 3 },
          { id: 'utilitycraft:expert_magmator', amount: 1 },
        ],
      },
    ],
  },
  assembler: {
    recipes: [
      {
        resultId: 'utilitycraft:assembler',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:iron_plate', amount: 2 },
          { id: 'utilitycraft:expert_chip', amount: 3 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'minecraft:crafter', amount: 1 },
        ],
      },
    ],
  },
  autofisher: {
    recipes: [
      {
        resultId: 'utilitycraft:autofisher',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:redstone', amount: 4 },
          { id: 'minecraft:fishing_rod', amount: 1 },
          { id: 'utilitycraft:basic_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'utilitycraft:steel_block', amount: 1 },
        ],
      },
    ],
  },
  autosieve: {
    recipes: [
      {
        resultId: 'utilitycraft:autosieve',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:redstone', amount: 4 },
          { id: 'utilitycraft:sieve', amount: 1 },
          { id: 'utilitycraft:chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:gold_block', amount: 1 },
        ],
      },
    ],
  },
  block_breaker: {
    recipes: [
      {
        resultId: 'utilitycraft:block_breaker',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:redstone', amount: 4 },
          { id: 'minecraft:iron_pickaxe', amount: 1 },
          { id: 'utilitycraft:chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'utilitycraft:iron_plate', amount: 1 },
        ],
      },
    ],
  },
  block_placer: {
    recipes: [
      {
        resultId: 'utilitycraft:block_placer',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:redstone', amount: 4 },
          { id: 'minecraft:dropper', amount: 1 },
          { id: 'utilitycraft:chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'utilitycraft:iron_plate', amount: 1 },
        ],
      },
    ],
  },
  crusher: {
    recipes: [
      {
        resultId: 'utilitycraft:crusher',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:redstone', amount: 4 },
          { id: 'utilitycraft:iron_hammer', amount: 1 },
          { id: 'utilitycraft:chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:gold_ingot', amount: 1 },
        ],
      },
    ],
  },
  digitizer: {
    recipes: [
      {
        resultId: 'utilitycraft:digitizer',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:iron_plate', amount: 2 },
          { id: 'utilitycraft:expert_chip', amount: 3 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:blueprint_paper', amount: 1 },
        ],
      },
    ],
  },
  electro_press: {
    recipes: [
      {
        resultId: 'utilitycraft:electro_press',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:redstone', amount: 4 },
          { id: 'minecraft:piston', amount: 1 },
          { id: 'utilitycraft:chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'utilitycraft:compressed_cobblestone', amount: 1 },
        ],
      },
    ],
  },
  harvester: {
    recipes: [
      {
        resultId: 'utilitycraft:harvester',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:gold_plate', amount: 4 },
          { id: 'minecraft:iron_hoe', amount: 1 },
          { id: 'utilitycraft:advanced_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
    ],
  },
  incinerator: {
    recipes: [
      {
        resultId: 'utilitycraft:incinerator',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:gold_plate', amount: 4 },
          { id: 'minecraft:blast_furnace', amount: 1 },
          { id: 'utilitycraft:basic_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
    ],
  },
  induction_anvil: {
    recipes: [
      {
        resultId: 'utilitycraft:induction_anvil',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:gold_plate', amount: 4 },
          { id: 'minecraft:anvil', amount: 1 },
          { id: 'utilitycraft:advanced_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
    ],
  },
  infuser: {
    recipes: [
      {
        resultId: 'utilitycraft:infuser',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:redstone', amount: 4 },
          { id: 'minecraft:lapis_lazuli', amount: 1 },
          { id: 'utilitycraft:basic_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
    ],
  },
  magmatic_chamber: {
    recipes: [
      {
        resultId: 'utilitycraft:magmatic_chamber',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:gold_plate', amount: 2 },
          { id: 'utilitycraft:copper_plate', amount: 1 },
          { id: 'utilitycraft:advanced_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:redstone_block', amount: 2 },
          { id: 'utilitycraft:netherite_plate', amount: 1 },
        ],
      },
    ],
  },
  seed_synthesizer: {
    recipes: [
      {
        resultId: 'utilitycraft:seed_synthesizer',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:gold_plate', amount: 4 },
          { id: 'minecraft:amethyst_shard', amount: 1 },
          { id: 'utilitycraft:expert_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:redstone_block', amount: 1 },
        ],
      },
    ],
  },
  way_center: {
    recipes: [
      {
        title: 'Way Center',
        resultId: 'utilitycraft:waycenter',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:ender_eye', amount: 2 },
          { id: 'minecraft:echo_shard', amount: 1 },
          { id: 'utilitycraft:expert_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:lapis_block', amount: 2 },
          { id: 'utilitycraft:diamond_dust', amount: 1 },
        ],
      },
      {
        title: 'Way Chip',
        resultId: 'utilitycraft:way_chip',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:lapis_lazuli', amount: 4 },
          { id: 'utilitycraft:ender_pearl_dust', amount: 4 },
          { id: 'utilitycraft:base_upgrade', amount: 1 },
        ],
      },
      {
        title: 'Way Carpet',
        resultId: 'utilitycraft:waycarpet',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:ender_eye', amount: 1 },
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:expert_chip', amount: 1 },
        ],
      },
    ],
  },
  xp_condenser: {
    recipes: [
      {
        resultId: 'utilitycraft:xp_condenser',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'utilitycraft:steel_plate', amount: 2 },
          { id: 'utilitycraft:emerald_dust', amount: 3 },
          { id: 'utilitycraft:expert_chip', amount: 2 },
          { id: 'utilitycraft:machine_case', amount: 1 },
          { id: 'minecraft:lapis_block', amount: 1 },
        ],
      },
    ],
  },
  mechanical_spawner: {
    recipes: [
      {
        title: 'Mechanical Spawner',
        resultId: 'utilitycraft:mechanical_spawner',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:crying_obsidian', amount: 4 },
          { id: 'minecraft:diamond', amount: 1 },
          { id: 'minecraft:iron_bars', amount: 3 },
          { id: 'utilitycraft:spawner_core', amount: 1 },
        ],
      },
      {
        title: 'Spawner Core',
        resultId: 'utilitycraft:spawner_core',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:redstone_block', amount: 4 },
          { id: 'minecraft:soul_sand', amount: 4 },
          { id: 'minecraft:diamond_block', amount: 1 },
        ],
      },
    ],
  },
  mob_grinder: {
    recipes: [
      {
        resultId: 'utilitycraft:mob_grinder',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:iron_ingot', amount: 1 },
          { id: 'minecraft:iron_sword', amount: 2 },
          { id: 'minecraft:redstone_block', amount: 1 },
          { id: 'minecraft:cobblestone', amount: 3 },
        ],
      },
    ],
  },
  xp_magnet: {
    recipes: [
      {
        title: 'XP Magnet',
        resultId: 'utilitycraft:xp_magnet',
        craftedIn: 'UtilityCraft Workbench',
        items: [
          { id: 'minecraft:experience_bottle', amount: 8 },
          { id: 'minecraft:ender_eye', amount: 1 },
        ],
      },
    ],
  },
};

export default utilityCraftMachineRecipeData;
