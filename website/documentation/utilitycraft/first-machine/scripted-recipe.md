---
title: Process a Recipe with Script
sidebar_position: 5
description: Define an addon-owned recipe table, validate inputs and output capacity, and complete a safe processing operation.
---

# Process a Recipe with Script

The recipe belongs to this addon and is evaluated directly by its machine script. Start with an immediate version so each validation branch is easy to see. The next page will turn the same operation into an energy-backed process that advances over time.

Replace `thermalCrusher.js` with:

```js title="BP/scripts/examples/machines/thermalCrusher.js"
// @ts-check

import { ItemStack } from "@minecraft/server";
import { Machine } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_thermal_crusher";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;

const RECIPES = Object.freeze({
  "minecraft:cobblestone": {
    output: "minecraft:gravel",
    required: 1,
    amount: 1,
    cost: 800,
  },
  "minecraft:gravel": {
    output: "minecraft:sand",
    required: 1,
    amount: 1,
    cost: 1000,
  },
});

/**
 * Returns how many matching output items can still fit in one slot.
 *
 * @param {import("@minecraft/server").Container} container
 * @param {number} slot
 * @param {string} outputTypeId
 */
function getOutputCapacity(container, slot, outputTypeId) {
  const output = container.getItem(slot);
  if (!output) return 64;
  if (output.typeId !== outputTypeId) return 0;
  return Math.max(0, output.maxAmount - output.amount);
}

/**
 * Consumes the recipe input and inserts its output.
 * Call this only after every amount and capacity check succeeds.
 *
 * @param {Machine} machine
 * @param {{ output: string, required: number, amount: number, cost: number }} recipe
 */
function completeRecipe(machine, recipe) {
  DoriosLib.entity.changeItemAmount(machine.entity, {
    slot: INPUT_SLOT,
    amount: -recipe.required,
  });

  const output = machine.container.getItem(OUTPUT_SLOT);
  if (output) {
    DoriosLib.entity.changeItemAmount(machine.entity, {
      slot: OUTPUT_SLOT,
      amount: recipe.amount,
    });
    return;
  }

  machine.container.setItem(
    OUTPUT_SLOT,
    new ItemStack(recipe.output, recipe.amount),
  );
}

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    Machine.spawnEntity(event, settings, () => {
      const machine = new Machine(event.block, {
        ...settings,
        ignoreTick: true,
      });
      if (!machine.valid) return;

      machine.setEnergyCost(settings.machine.energy_cost);
      machine.setProgress(0, { display: false });
      machine.displayEnergy();
    });
  },

  onTick({ block }, { params: settings }) {
    const machine = new Machine(block, settings);
    if (!machine.valid) return;

    const input = machine.container.getItem(INPUT_SLOT);
    if (!input) {
      machine.showWarning("No Input");
      return;
    }

    const recipe = RECIPES[input.typeId];
    if (!recipe) {
      machine.showWarning("Invalid Recipe");
      return;
    }

    if (input.amount < recipe.required) {
      machine.showWarning("Not Enough Input");
      return;
    }

    const outputCapacity = getOutputCapacity(
      machine.container,
      OUTPUT_SLOT,
      recipe.output,
    );
    if (outputCapacity < recipe.amount) {
      machine.showWarning("Output Full");
      return;
    }

    completeRecipe(machine, recipe);
    machine.on();
    machine.setLabel([
      "§r§aCrusher Running",
      `§r§7Input: §f${input.typeId}`,
      `§r§7Output: §f${recipe.output}`,
    ]);
  },

  onPlayerBreak(event) {
    Machine.onDestroy(event);
  },
});
```

## Recipe table

The input type ID is the object key:

```js
const recipe = RECIPES[input.typeId];
```

| Field | Type | Meaning |
| --- | --- | --- |
| `output` | `string` | Exact item identifier produced. |
| `required` | positive integer | Input items consumed per operation. |
| `amount` | positive integer | Output items produced per operation. |
| `cost` | positive number | Dorios Energy required by the timed version. It is stored now and used on the next page. |

`Object.freeze()` prevents accidental replacement of the top-level recipe entries at runtime. The script still owns this table; UtilityCraft source is not modified.

## Validate before mutating inventory

The handler checks conditions in this order:

1. The helper entity and inventory are valid.
2. Slot `3` contains an item.
3. The input identifier has a recipe.
4. The input stack contains the required amount.
5. Slot `4` is empty or contains the same output type.
6. The output has room for the complete result.
7. Only then are input and output changed.

This order prevents item loss. Never consume the input and then discover that the output cannot fit.

## Output capacity

An output slot is usable in two cases:

- it is empty, so this tutorial treats its capacity as `64`;
- it contains the recipe output and has free stack space.

It is blocked when it contains a different item. `output.maxAmount` is used for an existing stack instead of assuming every item stacks to 64.

## Change item amounts safely

```js
DoriosLib.entity.changeItemAmount(machine.entity, {
  slot: INPUT_SLOT,
  amount: -recipe.required,
});
```

A negative amount consumes items. A positive amount grows an existing matching output stack. If the output is empty, create its first stack with `ItemStack` and `container.setItem()`.

The capacity check guarantees that the positive change cannot exceed the stack maximum.

## Machine state and label

`machine.on()` sets the block's `utilitycraft:on` state to `true`, selecting the active textures from the block permutation.

`machine.showWarning()` turns it off and writes a standard warning. The custom success label is an array: the first line becomes the label item's name and the remaining lines become lore.

Every formatted line begins with `§r` so a color or style inherited from another item cannot leak into the new line.

## Why this version is temporary

This machine completes one recipe whenever its scheduled tick reaches the handler. It does not yet consume energy or preserve partial progress. Keep it only long enough to verify recipe selection and inventory safety.

Continue with [Consume energy](./consume-energy) to replace immediate completion with the final timed process.

