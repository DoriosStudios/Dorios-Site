export const primitiveForgeGuide = {
  id: 'primitive-forge',
  label: 'Primitive Forge',
  eyebrow: 'Early metallurgy · Solid fuel',
  title: 'Build a Primitive Forge and make Steel.',
  intro: 'Assemble eight forge blocks, add solid fuel, and use the two ingredient slots to smelt materials or combine Iron Dust with carbon. No generator is required.',
  hero: 'renders/primitive_forge.png',
  sections: [
    {
      title: '1. Craft eight forge blocks',
      paragraphs: ['Use a Crafting Table. Each craft makes four Primitive Forge blocks; craft twice for a complete structure.'],
      table: {
        headers: ['Ingredient', 'Per craft', 'Complete forge'],
        rows: [['Brick', '4', '8'], ['Clay Ball', '3', '6'], ['Mud Brick Slab', '1', '2']],
      },
      steps: ['Top row: Brick · Clay Ball · Brick.', 'Middle row: Clay Ball · empty · Clay Ball.', 'Bottom row: Brick · Mud Brick Slab · Brick.'],
      links: [{label: 'Open the forge crafting recipe', href: '/wiki/utilitycraft/recipes/crafting-primitive_forge'}],
    },
    {
      title: '2. Assemble the 2×2×2 structure',
      steps: ['Place four Primitive Forge blocks in a 2×2 square.', 'Place four more directly above them to fill a second 2×2 layer. Leave no hollow space.', 'The structure forms automatically when you place the last block. Its facing follows that block. Interact with the front to open the forge.'],
    },
    {
      title: '3. Add ingredients and fuel',
      paragraphs: ['The interface has two ingredient slots, a separate solid-fuel slot, a progress arrow, a fuel indicator, and four output slots in a 2×2 grid.', 'Start with Coal or Charcoal in the fuel slot. Logs, Planks, Sticks, and other registered solid fuels also work. The forge burns fuel only while processing; unused fuel time is saved while idle.', 'Carbon in an ingredient slot is part of the Steel recipe. Supply additional fuel in the fuel slot.'],
    },
    {
      title: '4. Smelt ordinary materials',
      paragraphs: ['Place a compatible smelting ingredient in either input. With two compatible inputs and no combined recipe, both can smelt during the same cycle.', 'Each input runs one recipe per cycle. A normal cycle takes 40 ticks (2 seconds at 20 ticks/s); filling a slot with a stack queues more cycles. Four output slots provide storage, rather than four recipes per input.'],
      table: {
        headers: ['Input', 'Result', 'Cycle'],
        rows: [['1 Iron Dust', '1 Iron Ingot', '40 ticks · 2 s'], ['1 Raw Steel', '1 Steel Ingot', '40 ticks · 2 s']],
      },
    },
    {
      title: '5. Make Raw Steel, then Steel Ingots',
      steps: ['Put Iron Dust in one ingredient slot.', 'Put Coal, Charcoal, Coal Dust, or Charcoal Dust in the other. Either ingredient order works.', 'Supply separate solid fuel and keep output space free. The combined recipe takes priority over ordinary smelting.', 'After 160 ticks (8 seconds at 20 ticks/s), collect one Raw Steel for each Iron Dust and carbon item consumed.', 'Remove the carbon ingredient and put Raw Steel in either input. Smelt it for 40 ticks to obtain a Steel Ingot.'],
      paragraphs: ['Before alloying, mine Iron Ore or Deepslate Iron Ore with a compatible Hammer to obtain Iron Dust. A powered Crusher can also produce it later.', 'Use Iron Dust for the combination; Raw Iron and Iron Ingots are not substitutes in this forge recipe.'],
      links: [{label: 'Browse all Primitive Forge recipes', href: '/wiki/utilitycraft/machines/primitive_forge/recipes'}, {label: 'Find Iron Dust recipes', href: '/wiki/utilitycraft/items/iron-dust/recipes'}],
    },
    {
      title: '6. Keep the forge running',
      paragraphs: ['If processing stops, check that all eight blocks are assembled, the ingredients match a listed recipe, fuel is available, and the outputs have room. A reserved cycle pauses if its results cannot fit.', 'Changing the recipe or removing ingredients reserved for the active cycle restarts progress. Breaking a forge block dismantles the structure and drops the stored ingredients, fuel items, and products. Empty it before moving it.'],
      links: [{label: 'View forge specifications', href: '/wiki/utilitycraft/machines/primitive_forge/specs'}, {label: 'Continue to the Machinery Era', href: '/wiki/utilitycraft/how-to-play/first-steps-to-steel'}],
    },
  ],
};
