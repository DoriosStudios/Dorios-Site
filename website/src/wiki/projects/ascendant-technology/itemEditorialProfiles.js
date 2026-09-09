const recipe = (station, result, input) => ({station, result, input});

const itemEditorialProfiles = {
  'utilitycraft:aetherium_crystal': {
    documentation: {
      description: 'Aetherium Crystal is a rare crystalline resource harvested from Aetherium Ore in the Overworld and The End. It can also be assembled from Aetherium Shards obtained through high-tier sieving. The crystal is a key ingredient for Aetherium metal and refined crystal technology.',
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
          title: 'Aetherium Ore',
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
          type: 'Sieving',
          title: 'Crushed Endstone',
          description: 'Sieve Crushed Endstone for Aetherium Shards, then combine four shards into one crystal.',
          facts: [
            ['Minimum mesh tier', '5'],
            ['Shard chance', '10% per roll'],
            ['Conversion', '4 shards → 1 crystal'],
          ],
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
};

export default itemEditorialProfiles;
