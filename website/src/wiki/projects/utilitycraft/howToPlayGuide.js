const guideAsset = (name) => `how-to-play/${name}.png`;

const machine = (id, title, copy) => ({
  title,
  copy,
  image: `renders/${id}.png`,
});

const generator = (id, title, copy, rates) => ({
  title,
  copy,
  image: guideAsset(`${id}_render`),
  stats: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'].map((tier, index) => [tier, `${rates[index]} DE/t`]),
});

export const howToPlayGuide = {
  title: 'How To Play',
  description: 'A complete, step-by-step UtilityCraft survival guide, adapted from the in-game How To Play manual.',
  pages: [
    {
      id: 'introduction',
      label: 'Introduction',
      eyebrow: 'UtilityCraft field guide',
      title: 'Progression from the ground up.',
      intro: 'UtilityCraft reshapes survival from the first day onward: start with simple tools and renewable resources, then grow into powered machines, storage, transport, and full automation.',
      hero: guideAsset('title'),
      sections: [
        {
          title: 'Resources, tools and utility',
          paragraphs: [
            'Begin with hammers, pebbles, sieves, and mesh progression. Those early loops become a reliable source of ores, seeds, and building materials.',
            'Crops, tools, cobblestone generators, and utility blocks reduce repetitive work while keeping the survival progression intact.',
          ],
          images: [guideAsset('basics_render'), guideAsset('meshes_flipbook'), guideAsset('tools_render'), guideAsset('cobble_gens_render')],
        },
        {
          title: 'Machines and energy',
          paragraphs: [
            'Machines, generators, batteries, and upgrades form the heart of UtilityCraft automation. Process items, route Dorios Energy, and scale a small workshop into a factory.',
            'Liquid tanks and mob-grinding systems extend the same production network with fluid storage, automated drops, and experience handling.',
          ],
          images: [guideAsset('machines_render'), guideAsset('generators_render'), guideAsset('batteries_render'), guideAsset('fluid_tanks_render'), guideAsset('mob_grinding_render')],
        },
        {
          title: 'Your progression path',
          steps: [
            'Gather pebbles and loose materials with a Wooden or Stone Hammer.',
            'Craft a Flint Knife, String Mesh, and Sieve to unlock renewable resources.',
            'Scale sieving, produce Water and Lava, then prepare Steel.',
            'Craft the UtilityCraft Workbench and enter the Machinery Era.',
            'Generate Dorios Energy, power machines, and automate your production lines.',
          ],
        },
      ],
    },
    {
      id: 'getting-started',
      label: 'Getting Started',
      eyebrow: 'Stage 01 · Early survival',
      title: 'Tools, pebbles, and your first Sieve.',
      intro: 'Secure the basic tools that turn ordinary blocks into a renewable resource loop.',
      hero: guideAsset('basics_render'),
      sections: [
        {
          title: '1. Craft a Hammer',
          paragraphs: [
            'Save at least one log from your first tree. Use planks, logs, and sticks to craft a Wooden Hammer; upgrade to Stone when you can.',
            'While holding the Hammer, sneak and interact with Dirt or Grass to find pebbles and loose materials. Combine four matching pebbles to rebuild their full block.',
          ],
          image: guideAsset('hammers_render'),
          table: {
            headers: ['Special find', 'Amount', 'Source block', 'Chance'],
            rows: [
              ['Sand Handful', '1', 'Dirt / Grass', '20%'],
              ['Mud Ball', '1', 'Mud', '50%'],
              ['Red Sand Handful', '1', 'Red Sand / Terracotta', '50%'],
            ],
          },
        },
        {
          title: '2. Make a Flint Knife',
          paragraphs: [
            'Use a Flint Knife to break Leaves and collect Fiber. Craft Fiber into String for your first Mesh.',
            'If Flint is scarce, combine three Gravel to craft one. Without String, the Sieve cannot be used.',
          ],
          image: guideAsset('flint_knife_render'),
        },
        {
          title: '3. Build the Sieve loop',
          paragraphs: [
            'Craft a Sieve and a String Mesh, place the mesh inside, then process Gravel, Dirt, or Sand. Better meshes later unlock stronger drops and multipliers.',
            'Use the Hammer to reduce blocks in order: Cobblestone → Gravel → Dirt → Sand. Combine hammering with sieving for a fully renewable early-game loop.',
          ],
          images: [guideAsset('sieve_render'), guideAsset('sieve_mesh_render'), guideAsset('breaking_blocks_render')],
          steps: [
            'Break Cobblestone into Gravel.',
            'Sieve Gravel for ore chunks, Lapis, and gem shards.',
            'Break Gravel into Dirt and sieve it for seeds and saplings.',
            'Break Dirt into Sand and sieve it for Redstone and other resources.',
          ],
        },
        {
          title: '4. Check your foundation',
          paragraphs: ['Before moving on, keep a Hammer, a Flint Knife, and a Sieve fitted with a String Mesh. You should now have renewable String, Gravel, Dirt, Sand, ores, and seeds.'],
          image: guideAsset('sieve_gravel_render'),
        },
      ],
    },
    {
      id: 'expanding-resources',
      label: 'Expanding Resources',
      eyebrow: 'Stage 02 · Scale the loop',
      title: 'Faster sieving, better meshes.',
      intro: 'Increase throughput before automation by expanding the Sieve setup and choosing the right efficiency tradeoff.',
      hero: guideAsset('sieve_scaling_render'),
      sections: [
        {
          title: 'Scale up Sieving',
          paragraphs: [
            'Place Sieves next to one another to grow from a single Sieve into a 3×3 and finally a 5×5 array. Up to 25 Sieves can work together.',
            'A larger array processes stacks of Gravel, Dirt, or Sand much faster. Collect extra Gravel early so you can craft the next Flint Mesh tier.',
          ],
          images: [guideAsset('sieve_3x3_render'), guideAsset('sieve_5x5_render')],
        },
        {
          title: 'Upgrade Meshes',
          paragraphs: ['Higher-tier Meshes improve eligible drops and output multipliers. Upgrade as the world expands so rare resources do not become a bottleneck.'],
          image: guideAsset('meshes_flipbook'),
          steps: ['String', 'Flint', 'Copper', 'Iron', 'Gold', 'Emerald', 'Diamond', 'Netherite'],
        },
        {
          title: 'Process compressed resources',
          paragraphs: [
            'Compress Cobblestone, Gravel, Dirt, or Sand for bulk handling. Hammers reduce compressed blocks through the same material sequence.',
            'The Sieve accepts compressed blocks and processes them faster, but the in-game guide notes an output of roughly 50% compared with normal blocks. Use this when speed matters more than efficiency.',
          ],
          images: [guideAsset('breaking_blocks_comp_render'), guideAsset('sieve_gravel_comp_render')],
        },
      ],
    },
    {
      id: 'water-and-lava',
      label: 'Water & Lava',
      eyebrow: 'Stage 03 · Essential fluids',
      title: 'Create Water, Lava, and Obsidian.',
      intro: 'These fluid loops unlock early automation, farming, Nether access, and the path to your first generator.',
      hero: guideAsset('crucible_eg_render'),
      sections: [
        {
          title: '1. Obtain Water',
          steps: [
            'Craft a Mortar with three Cobblestone and one Stone Pebble.',
            'Combine the Mortar, one Glass Bottle, and two Saplings to make a Water Bottle. The Mortar is not consumed.',
            'Use three Water Bottles on a Cauldron, then collect the water with a Bucket.',
          ],
          images: [guideAsset('water_bottle_recipe'), guideAsset('cauldron_water_process_render')],
        },
        {
          title: '2. Craft the Crucible',
          paragraphs: [
            'The Crucible requires four Bricks and four Mud Bricks. Smelt Clay for Bricks; Clay comes from sieving Sand.',
            'Use a Water Bottle on placed Dirt to create Mud, combine Mud with Wheat for Packed Mud, then craft four Packed Mud into one Mud Brick.',
          ],
          images: [guideAsset('crucible_recipe_render'), guideAsset('getting_mud_render')],
        },
        {
          title: '3. Produce Lava',
          paragraphs: ['Place the Crucible above a heat source and insert four Cobblestone to slowly produce one bucket of Lava. Stronger heat sources finish faster.'],
          image: guideAsset('crucible_lava_render'),
          table: {
            headers: ['Heat source', 'Heat value'],
            rows: [
              ['Lava / Flowing Lava', '4'],
              ['Soul Fire / Soul Torch / Soul Campfire', '4'],
              ['Fire / Campfire / Magma Block', '3'],
              ['Torch', '1'],
            ],
          },
        },
        {
          title: '4. Make Obsidian',
          paragraphs: ['Interact with a Crucible using a Water Bucket to create Obsidian instantly. Stable Water and Lava production now gives you the foundation for energy generation.'],
          image: guideAsset('crucible_obsidian_process_render'),
        },
      ],
    },
    {
      id: 'first-steps-to-steel',
      label: 'First Steps to Steel',
      eyebrow: 'Stage 04 · Metallurgy',
      title: 'Enter the Machinery Era.',
      intro: 'Turn renewable early resources into Steel, unlock the Workbench, and prepare the materials needed for powered production.',
      hero: guideAsset('workbench_render'),
      sections: [
        {
          title: '1. Craft the SmeltFlare',
          paragraphs: ['The SmeltFlare combines raw materials directly in your inventory. Obtain Paper by sieving Dirt for Sugar Cane, then craft the Sugar Cane into Paper.'],
          image: guideAsset('smeltflare_recipe_render'),
        },
        {
          title: '2. Create Brute Steel',
          paragraphs: [
            'Keep a SmeltFlare, Raw Iron, and Coal together in your inventory to form Brute Steel.',
            'Smelt Brute Steel in a Furnace or use another SmeltFlare to produce Steel Ingots. You can combine nine Brute Steel into a block and smelt the full batch at once.',
          ],
          image: guideAsset('brute_steel_recipe'),
        },
        {
          title: '3. Craft the Workbench',
          paragraphs: ['Every UtilityCraft Machine, Generator, and machine Upgrade is crafted inside the Workbench. Keep Steel, Iron, Copper, Redstone, and Coal stocked for the next stage.'],
          images: [guideAsset('workbench_render'), guideAsset('workbench_recipe')],
        },
        {
          title: '4. Power your first system',
          steps: [
            'Craft an early generator, such as the Basic Furnator.',
            'Connect or place a powered Machine in the Dorios Energy network.',
            'Buffer excess power in a Battery.',
            'Add Speed or Energy upgrades only after generation is stable.',
          ],
        },
      ],
    },
    {
      id: 'machines',
      label: 'Machines',
      eyebrow: 'Stage 05 · Powered production',
      title: 'Build your first production lines.',
      intro: 'Most UtilityCraft machines consume Dorios Energy, can output toward a configured side, and accept upgrades for speed or efficiency.',
      hero: guideAsset('machines_render'),
      sections: [
        {
          title: 'Machine directory',
          cards: [
            machine('assembler', 'Assembler', 'Repeats a crafting pattern stored on a Blueprint made by the Digitizer. Accepts Speed and Energy upgrades.'),
            machine('autosieve', 'Autosieve', 'Processes sieveable blocks with a Mesh. Better Meshes unlock stronger drops and multipliers.'),
            machine('autofisher', 'Autofisher', 'Generates fishing loot with Fishing Nets. Better Nets improve rolls, luck, and rare drops.'),
            machine('block_breaker', 'Block Breaker', 'Uses an installed Pickaxe to break the block directly in front of it.'),
            machine('block_placer', 'Block Placer', 'Places inventory blocks into the space ahead; pair it with a Block Breaker for loops.'),
            machine('crusher', 'Crusher', 'Turns ores into dust and applies specialized yields to mineral resources.'),
            machine('digitizer', 'Digitizer', 'Records crafting layouts on Blueprint Paper for use in an Assembler.'),
            machine('electro_press', 'Electro Press', 'Automates plates, compression, ore reconstruction, and complete-gem assembly.'),
            machine('harvester', 'Harvester', 'Harvests mature crops and resets growth. Range upgrades expand the work area.'),
            machine('incinerator', 'Incinerator', 'Smelts valid inputs with Dorios Energy instead of furnace fuel.'),
            machine('induction_anvil', 'Induction Anvil', 'Repairs tools, armor, and other durable items using Energy.'),
            machine('infuser', 'Infuser', 'Combines an input with a catalyst to create infused materials and components.'),
            machine('magmatic_chamber', 'Magmatic Chamber', 'Handles heat and lava processing with both item and liquid support.'),
            machine('seed_synthesizer', 'Seed Synthesizer', 'Creates special seeds through high-energy powered synthesis.'),
          ],
        },
      ],
    },
    {
      id: 'generators',
      label: 'Generators',
      eyebrow: 'Stage 06 · Dorios Energy',
      title: 'Generate and buffer reliable power.',
      intro: 'Every generator family has four progression tiers. Choose fuel and placement around the production line you want to sustain.',
      hero: guideAsset('generators_render'),
      sections: [
        {
          title: 'Generator families',
          cards: [
            generator('furnator', 'Furnator', 'Burns solid fuel into Energy and is the simplest early generator.', [40, 160, 640, 4000]),
            generator('magmator', 'Magmator', 'Turns Lava into Energy and pairs naturally with Crucibles and fluid transport.', [50, 200, 800, 5000]),
            generator('solar_panel', 'Solar Panel', 'Produces passive, fuel-free Energy when it has clear access to sunlight.', [12, 48, 192, 1200]),
            generator('thermo_generator', 'Thermo Generator', 'Produces steady Energy from heat sources without consuming item fuel.', [20, 80, 320, 2000]),
            generator('wind_turbine', 'Wind Turbine', 'Generates passive Energy in open areas where placement conditions are met.', [8, 32, 128, 800]),
          ],
        },
        {
          title: 'Store excess Energy',
          paragraphs: ['Batteries keep machines working when generation slows. Their Tier 1–4 capacities are 256k, 1.024M, 4.096M, and 25.6M DE.'],
          image: guideAsset('batteries_render'),
        },
      ],
    },
    {
      id: 'drop-tables',
      label: 'Drop Tables',
      eyebrow: 'Reference · Plan your setup',
      title: 'Choose the right Mesh or Net.',
      intro: 'Tiers decide which results are eligible, while multipliers increase output or the chance of successful rolls.',
      hero: guideAsset('meshes_flipbook'),
      sections: [
        {
          title: 'Sieve Mesh multipliers',
          paragraphs: ['Compressed blocks use their matching base-block table and produce ×9 amounts. Registered addon integrations may add more drops than the base guide lists.'],
          table: {
            headers: ['Mesh', 'Tier', 'Multiplier', 'Guide note'],
            rows: [
              ['String', '0', '0.75×', 'Basic drops'], ['Flint', '1', '1.00×', 'Iron + Quartz'],
              ['Copper', '2', '1.25×', 'Redstone + Clay'], ['Iron', '3', '1.50×', 'Gold + Lapis'],
              ['Gold', '4', '2.00×', 'Diamond-tier drops'], ['Emerald', '5', '2.50×', 'Ancient Debris'],
              ['Diamond', '6', '3.00×', 'High output'], ['Netherite', '7', '4.00×', 'Best output'],
            ],
          },
        },
        {
          title: 'Key Sieve drops',
          tables: [
            {label: 'Gravel', headers: ['Result', 'Amount', 'Base chance', 'Minimum Mesh'], rows: [
              ['Coal Chunk', '1', '25%', 'String'], ['Iron Chunk', '1', '15%', 'Flint'], ['Gold Chunk', '1', '5%', 'Iron'],
              ['Lapis Lazuli', '4', '2.5%', 'Iron'], ['Emerald Shard', '1', '2%', 'Gold'], ['Diamond Shard', '1', '1%', 'Gold'],
            ]},
            {label: 'Sand', headers: ['Result', 'Amount', 'Base chance', 'Minimum Mesh'], rows: [
              ['Copper Chunk', '1', '25%', 'Flint'], ['Redstone', '4', '20%', 'Copper'], ['Clay Ball', '1', '10%', 'Copper'],
              ['Blaze Powder', '1', '10%', 'Iron'], ['Conduit', '1', '0.5%', 'Gold'], ['Charged Certus', '1', '1%', 'Gold'],
            ]},
            {label: 'Netherrack', headers: ['Result', 'Amount', 'Base chance', 'Minimum Mesh'], rows: [
              ['Nether Quartz Chunk', '1', '33%', 'Flint'], ['Nether Gold Chunk', '1', '33%', 'Iron'],
              ['Ancient Debris Chunk', '1', '2.5%', 'Emerald'], ['Ender Pearl', '1', '0.5%', 'Emerald'],
            ]},
            {label: 'End Stone', headers: ['Result', 'Amount', 'Base chance', 'Minimum Mesh'], rows: [
              ['Chorus Fruit', '1', '80%', 'Gold'], ['Chorus Flower', '1', '1%', 'Gold'],
              ['Ender Pearl', '1', '16%', 'Diamond'], ['Shulker Shell Shard', '1', '0.5%', 'Diamond'],
            ]},
          ],
          links: [{label: 'Open every Autosieve recipe', href: '/wiki/utilitycraft/machines/autosieve'}],
        },
        {
          title: 'Autofisher Nets',
          table: {
            headers: ['Net', 'Tier', 'Chance multiplier', 'Rolls'],
            rows: [
              ['String', '0', '1.00×', '1'], ['Copper', '1', '1.25×', '1'], ['Iron', '2', '1.50×', '2'],
              ['Gold', '3', '2.00×', '2'], ['Emerald', '4', '2.50×', '3'], ['Diamond', '5', '3.00×', '3'],
              ['Netherite', '6', '4.00×', '4'],
            ],
          },
          links: [{label: 'Open the complete Autofisher loot table', href: '/wiki/utilitycraft/machines/autofisher'}],
        },
      ],
    },
  ],
};

export function getHowToPlayPage(pageId = 'introduction') {
  return howToPlayGuide.pages.find(({id}) => id === pageId) ?? howToPlayGuide.pages[0];
}

