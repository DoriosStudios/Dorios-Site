const recipe = (station, result, input) => ({station, result, input});

const itemEditorialProfiles = {
  'utilitycraft:aetherium_crystal': {
    documentation: {
      description: 'Aetherium Crystal is obtained directly by mining Aetherium Ore without Silk Touch or assembled from Aetherium Shards recovered through high-tier sieving. The crystal is a key ingredient for Aetherium metal and refined crystal technology.',
      basic: {itemType: 'Crystal', maximumStack: 64},
      tier: 'Aetherium',
      properties: [
        ['Resource family', 'Crystalline Aetherium'],
        ['Primary progression', 'Aetherium technology'],
      ],
      primarySources: [
        {
          id: 'world-generation',
          type: 'World generation',
          title: 'Aetherium Crystals from Ore',
          items: ['utilitycraft:deepslate_aetherium_ore', 'utilitycraft:end_aetherium_ore'],
          output: 'utilitycraft:aetherium_crystal',
          emphasizeFacts: true,
          description: 'Mine Aetherium Ore without Silk Touch. Fortune increases the crystal yield.',
          facts: [
            ['Dimensions', 'The End and Overworld'],
            ['End height', 'Y 16–72'],
            ['Overworld dense deposits', 'Y −60 to −8'],
            ['Dense deposit bonus', '25% chance for one Crystal Block at the center'],
          ],
        },
        {
          id: 'advanced-sieving',
          type: 'Intermediate · Sieving',
          title: 'Aetherium Shards from Crushed Endstone',
          item: 'utilitycraft:crushed_endstone',
          station: 'autosieve',
          output: 'utilitycraft:aetherium_shard',
          minimumMeshTier: 5,
          description: 'Sieve Crushed Endstone to obtain Aetherium Shards, then combine four shards in the crafting step below. Sieving does not produce the crystal directly.',
          facts: [
            ['Shard chance', '10% per roll'],
          ],
        },
        {
          id: 'crystal-crafting',
          type: 'Crafting',
          title: 'Assemble the Crystal',
          item: 'utilitycraft:aetherium_shard',
          description: 'Combine four Aetherium Shards in a 2×2 grid to create one Aetherium Crystal.',
          recipe: {id: 'aetherium_crystal'},
        },
      ],
      mainUses: [
        {
          id: 'aetherium-ingot',
          item: 'utilitycraft:aetherium',
          title: 'Aetherium Ingot',
          description: 'The principal metal route for Aetherium machines, components, tools and armor.',
          recipe: recipe('catalyst_weaver', 'utilitycraft:aetherium', 'utilitycraft:aetherium_crystal'),
        },
        {
          id: 'refined-crystal',
          item: 'utilitycraft:refined_aetherium_crystal',
          title: 'Refined Aetherium Crystal',
          description: 'A refined catalyst used by enchantment and advanced component systems.',
          recipe: recipe('catalyst_weaver', 'utilitycraft:refined_aetherium_crystal', 'utilitycraft:aetherium_crystal'),
        },
      ],
      relatedItems: [
        'utilitycraft:aetherium',
        'utilitycraft:aetherium_crystal_block',
        'utilitycraft:absolute_chip',
        'utilitycraft:aetherium_aiot',
      ],
      trivia: [
        'The large crystal artwork originally represented the shard resource. The progression split it into Aetherium Crystal and the smaller Aetherium Shard so each form has a distinct role.',
      ],
    },
  },
  'utilitycraft:aetherium': {
    documentation: {
      description: 'Aetherium Ingot is the principal metal of Aetherium technology. It is produced in the Catalyst Weaver from advanced metals, Ender Pearl Dust, lava and a crystalline Aetherium source, then used throughout late-game equipment and infrastructure.',
      basic: {itemType: 'Metal ingot', maximumStack: 64},
      tier: 'Aetherium',
      primarySources: [{
        id: 'catalyst-weaver',
        type: 'Machine processing',
        title: 'Catalyst Weaver',
        station: 'catalyst_weaver',
        description: 'Combines the metal base with Aetherium Crystal or Crystal Dust and 8,000 mB of lava.',
        recipe: recipe('catalyst_weaver', 'utilitycraft:aetherium', 'utilitycraft:aetherium_crystal'),
      }],
      relatedItems: ['utilitycraft:aetherium_crystal', 'utilitycraft:aetherium_dust', 'utilitycraft:aetherium_block', 'utilitycraft:aetherium_aiot'],
    },
  },
  'utilitycraft:aetherium_shard': {
    documentation: {
      description: 'Aetherium Shard is a crystalline fragment obtained from high-tier sieving, ore processing and residue processing. Four shards can be assembled into an Aetherium Crystal, making shards an alternate entry point into crystalline Aetherium progression.',
      basic: {itemType: 'Crystal fragment', maximumStack: 64},
      tier: 'Aetherium',
      properties: [['Conversion', '4 shards → 1 Aetherium Crystal']],
      relatedItems: ['utilitycraft:aetherium_crystal', 'utilitycraft:aetherium_crystal_dust', 'utilitycraft:refined_aetherium_crystal'],
    },
  },
  'utilitycraft:cryofluid_capsule': {
    documentation: {
      description: 'Cryofluid Capsules carry measured amounts of Cryofluid between compatible Ascendant Technology machines and storage. The grouped entry covers eight filled levels and the reusable Infinite variant.',
      basic: {itemType: 'Fluid capsule', maximumStack: 64},
      properties: [
        ['Filled capacities', '1,000–8,000 mB'],
        ['Infinite transfer', 'Up to 512,000 mB at a time'],
        ['After transfer', 'Standard capsules return an Empty Liquid Capsule'],
      ],
      usage: 'Choose the level that matches the amount of Cryofluid you need to move. The Infinite variant remains available after transferring its contents.',
    },
  },
  'utilitycraft:titanium': {
    documentation: {
      description: 'Titanium Ingot is the durable mid-to-late-game metal between UtilityCraft infrastructure and Aetherium technology. It supports titanium tools, armor, meshes, conveyors, and advanced machine components.',
      basic: {itemType: 'Metal ingot', maximumStack: 64},
      tier: 'Titanium',
      properties: [['Progression role', 'Bridge into Aetherium technology'], ['Equipment family', 'Tools, armor, mesh and conveyors']],
      relatedItems: ['utilitycraft:raw_titanium', 'utilitycraft:titanium_dust', 'utilitycraft:titanium_plate', 'utilitycraft:titanium_mesh'],
    },
  },
  'utilitycraft:tungsten': {
    documentation: {
      description: 'Tungsten Ingot is a heat-resistant technical metal recovered from Nether and deepslate ore chains. It is used in high-energy, cryogenic, and reinforced machine components.',
      basic: {itemType: 'Technical metal ingot', maximumStack: 64},
      tier: 'Tungsten',
      properties: [['Primary role', 'Heat-resistant machine components'], ['Sources', 'Nether and deepslate tungsten ore chains']],
      relatedItems: ['utilitycraft:raw_tungsten', 'utilitycraft:tungsten_dust', 'utilitycraft:tungsten_plate'],
    },
  },
  'utilitycraft:hyper_processing_upgrade': {
    documentation: {
      description: 'The Hyper Processing Upgrade raises late-game processing throughput in Ascendant machines that expose a Hyper slot.',
      basic: {itemType: 'Machine upgrade', maximumStack: 64},
      tier: 'Ascendant',
      properties: [['Semantic type', 'Hyper processing'], ['Compatibility', 'Machines with a Hyper upgrade slot']],
      usage: 'Use the upgrade directly on a compatible machine. The receiving machine controls the effective level cap.',
    },
  },
  'utilitycraft:multi_processing_upgrade': {
    documentation: {
      description: 'The Multi Processing Upgrade enables compatible systems to handle additional operations or lanes during one processing cycle.',
      basic: {itemType: 'Machine upgrade', maximumStack: 64},
      tier: 'Ascendant',
      properties: [['Semantic type', 'Multi processing'], ['Compatibility', 'Machine-specific']],
      usage: 'Install it only in a machine that lists Multi Processing among its accepted upgrades.',
    },
  },
  'utilitycraft:resource_efficiency_upgrade': {
    documentation: {
      description: 'The Resource Efficiency Upgrade improves material usage in compatible Ascendant machines and is separate from ordinary energy-efficiency upgrades.',
      basic: {itemType: 'Machine upgrade', maximumStack: 64},
      tier: 'Ascendant',
      properties: [['Semantic type', 'Resource efficiency'], ['Effect', 'Machine-defined material savings']],
      usage: 'Install it in the dedicated Resource Efficiency slot of a compatible machine.',
    },
  },
  'utilitycraft:energy_capacity_upgrade': {
    documentation: {
      description: 'The Energy Capacity Upgrade expands the internal Dorios Energy buffer of compatible late-game machines.',
      basic: {itemType: 'Capacity upgrade', maximumStack: 64},
      tier: 'Ascendant',
      properties: [['Stored resource', 'Dorios Energy'], ['Effect', 'Machine-defined internal capacity increase']],
    },
  },
  'utilitycraft:liquid_capacity_upgrade': {
    documentation: {
      description: 'The Liquid Capacity Upgrade expands the internal liquid tanks of compatible Ascendant machines.',
      basic: {itemType: 'Capacity upgrade', maximumStack: 64},
      tier: 'Ascendant',
      properties: [['Stored resource', 'Liquids'], ['Compatibility', 'Fluid-capable machines']],
    },
  },
  'utilitycraft:gas_capacity_upgrade': {
    documentation: {
      description: 'The Gas Capacity Upgrade expands the internal gas tanks of compatible Ascendant machines.',
      basic: {itemType: 'Capacity upgrade', maximumStack: 64},
      tier: 'Ascendant',
      properties: [['Stored resource', 'Gases'], ['Compatibility', 'Gas-capable machines']],
    },
  },
};

export default itemEditorialProfiles;
