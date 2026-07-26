---
title: Add Recipes to Existing Machines
sidebar_position: 2
description: Register Crusher, Electro Press, Infuser, Magmatic Chamber, Furnace, and Crafter recipes through DoriosLib.
---

# Add Recipes to Existing Machines

Use a recipe registry when UtilityCraft already provides the machine and your extension only needs to add valid inputs and outputs. Place these modules under `BP/scripts/config/recipes/` and import each one from `config/recipes/index.js`.

```js title="BP/scripts/config/recipes/index.js"
import "./crusher.js";
import "./press.js";
import "./infuser.js";
import "./melter.js";
import "./furnace.js";
import "./crafter.js";
```

## Crusher

The object key is the exact input item ID.

```js title="BP/scripts/config/recipes/crusher.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerCrusherRecipe({
  "utilitycraft:example_crystal_shard": {
    output: "minecraft:amethyst_shard",
    required: 1,
    amount: 2,
    tier: 2,
    cost: 1200,
  },
});
```

| Field | Type | Meaning |
| --- | --- | --- |
| Input key | namespaced string | Item consumed by the Crusher. |
| `output` | namespaced string | Item produced. Required. |
| `required` | positive integer | Input items consumed per operation. |
| `amount` | positive integer | Output items produced per operation. |
| `tier` | number | Minimum Hammer tier for manual crushing of this recipe. It does not restrict the Crusher itself. |
| `cost` | positive number | Dorios Energy required per operation. |

## Electro Press

The Press uses the same single-input shape:

```js title="BP/scripts/config/recipes/press.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerPressRecipe({
  "utilitycraft:example_crystal_shard": {
    output: "minecraft:amethyst_block",
    required: 4,
    amount: 1,
    cost: 1600,
  },
});
```

`required`, `amount`, and `cost` have the same meaning as in a Crusher recipe. Press recipes do not use `tier`.

## Infuser

The Infuser combines two ordinary items. Its key must be `catalyst|baseItem` in that order.

```js title="BP/scripts/config/recipes/infuser.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerInfuserRecipe({
  "minecraft:amethyst_shard|minecraft:copper_ingot": {
    output: "utilitycraft:example_energized_alloy",
    required: 2,
    input_required: 1,
    amount: 1,
    cost: 1800,
  },
  "minecraft:glowstone_dust|minecraft:iron_ingot": {
    output: "utilitycraft:example_crystal_shard",
    required: 1,
    input_required: 2,
    amount: 3,
    cost: 1200,
  },
});
```

| Field | Meaning |
| --- | --- |
| Key before `\|` | Catalyst item. |
| Key after `\|` | Base input item. |
| `required` | Catalyst items consumed. |
| `input_required` | Base items consumed. |
| `output` / `amount` | Produced item and count. |
| `cost` | Energy required for the complete operation. |

Reversing the two identifiers creates a different key and will not match the intended slots.

## Magmatic Chamber

`registerMelterRecipe()` feeds the UtilityCraft Magmatic Chamber. The object key is the input item, while `liquid` is the unnamespaced storage type.

```js title="BP/scripts/config/recipes/melter.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerMelterRecipe({
  "utilitycraft:example_biomass": {
    liquid: "example_biofuel",
    amount: 500,
    cost: 1000,
  },
  "utilitycraft:example_crystal_shard": {
    liquid: "example_coolant",
    amount: 250,
    cost: 1400,
  },
});
```

| Field | Meaning |
| --- | --- |
| Input key | Exactly one item is consumed by the current Magmatic Chamber handler. |
| `liquid` | Stored liquid type, for example `example_biofuel`, without `utilitycraft:`. |
| `amount` | Millibuckets produced. |
| `cost` | Dorios Energy consumed. |

The liquid also needs its items, holders, frames, and entities from [Fluids and gases](./fluids-gases).

## Furnace

The Furnace registration also uses a single input key:

```js title="BP/scripts/config/recipes/furnace.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerFurnaceRecipe({
  "utilitycraft:example_energized_alloy": {
    output: "minecraft:iron_ingot",
    required: 1,
    amount: 2,
    cost: 1200,
  },
});
```

## Crafter

The Crafter key describes all nine slots from left to right and top to bottom. Use local item names without namespaces and write `air` for an empty slot.

```js title="BP/scripts/config/recipes/crafter.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerCrafterRecipe({
  "iron_ingot,iron_ingot,iron_ingot,air,redstone,air,iron_ingot,iron_ingot,iron_ingot": {
    output: "utilitycraft:machine_case",
    amount: 1,
  },
});
```

The key must contain exactly nine comma-separated entries. `output` is a namespaced result item, `amount` is its count, and optional `leftover` is the item left by a compatible recipe after crafting.

## Optional placeholder expansion

External registrations must contain concrete keys. If several recipes share a pattern, an addon-owned helper can generate those concrete entries before registration:

```js
const woodRecipes = expandRecipePlaceholder(
  {
    "minecraft:{wood}_log": {
      output: "minecraft:{wood}_planks",
      required: 1,
      amount: 8,
      cost: 400,
    },
  },
  "wood",
  ["oak", "birch", "spruce"],
);

DoriosLib.registry.registerPressRecipe(woodRecipes);
```

The helper replaces `{wood}` in both keys and values and returns three normal recipe entries. The registry itself does not expand placeholders. For a first recipe, write the concrete object directly.

## Replacement and testing

Registering an existing input or pattern replaces that exact recipe. To avoid conflicts, prefer an addon-owned input item.

1. Confirm every referenced item exists.
2. Start a world and check the content log for registration warnings.
3. Insert the exact required counts into the intended UtilityCraft machine.
4. Confirm the output count and energy use.
5. For Crusher recipes with `tier`, test a lower and a sufficient Hammer tier.
6. Reload and confirm that the module is imported only once.

Continue with [Fuels and coolants](./fuels-coolants).
