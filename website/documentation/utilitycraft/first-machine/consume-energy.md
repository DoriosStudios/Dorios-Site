---
title: Consume Energy
sidebar_position: 6
description: Convert the safe recipe operation into a timed process that consumes Dorios Energy and preserves progress.
---

# Consume Energy

The final beginner machine treats consumed energy as process progress. A recipe costing `800` DE completes after the machine has successfully consumed a total of `800` DE for that input.

Replace the immediate script with this completed version:

```js title="BP/scripts/examples/machines/thermalCrusher.js"
// @ts-check

import { ItemStack } from "@minecraft/server";
import { Machine } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_thermal_crusher";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
const ACTIVE_RECIPE_PROPERTY = "utilitycraft:example_active_recipe";

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
  } else {
    machine.container.setItem(
      OUTPUT_SLOT,
      new ItemStack(recipe.output, recipe.amount),
    );
  }
}

/** @param {Machine} machine */
function resetProcess(machine) {
  machine.entity.setDynamicProperty(ACTIVE_RECIPE_PROPERTY, undefined);
  machine.setProgress(0, { display: false });
  machine.displayProgress();
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
    const recipe = input ? RECIPES[input.typeId] : undefined;

    if (!input || !recipe) {
      resetProcess(machine);
      machine.showWarning(input ? "Invalid Recipe" : "No Input", {
        resetProgress: false,
      });
      return;
    }

    if (input.amount < recipe.required) {
      resetProcess(machine);
      machine.showWarning("Not Enough Input", {
        resetProgress: false,
      });
      return;
    }

    const outputCapacity = getOutputCapacity(
      machine.container,
      OUTPUT_SLOT,
      recipe.output,
    );
    if (outputCapacity < recipe.amount) {
      machine.off();
      machine.showWarning("Output Full", {
        resetProgress: false,
      });
      return;
    }

    const activeRecipe = machine.entity.getDynamicProperty(
      ACTIVE_RECIPE_PROPERTY,
    );
    if (activeRecipe !== input.typeId) {
      machine.entity.setDynamicProperty(
        ACTIVE_RECIPE_PROPERTY,
        input.typeId,
      );
      machine.setProgress(0, { display: false });
    }

    machine.setEnergyCost(recipe.cost);

    let progress = machine.getProgress();
    const remaining = Math.max(0, recipe.cost - progress);
    if (remaining > 0) {
      const requestedEnergy = Math.min(
        machine.energy.get(),
        machine.rate,
        remaining,
      );
      const consumedEnergy = machine.energy.consume(requestedEnergy);

      if (consumedEnergy <= 0) {
        machine.off();
        machine.showWarning("No Energy", {
          resetProgress: false,
        });
        return;
      }

      progress += consumedEnergy;
    }

    if (progress >= recipe.cost) {
      completeRecipe(machine, recipe);
      progress -= recipe.cost;

      const nextInput = machine.container.getItem(INPUT_SLOT);
      if (!nextInput || nextInput.typeId !== input.typeId) {
        machine.entity.setDynamicProperty(
          ACTIVE_RECIPE_PROPERTY,
          undefined,
        );
        progress = 0;
      }
    }

    machine.setProgress(progress, { display: false });
    machine.on();
    machine.displayEnergy();
    machine.displayProgress();
    machine.setLabel([
      "§r§aCrusher Running",
      `§r§7Input: §f${input.typeId}`,
      `§r§7Output: §f${recipe.output}`,
      `§r§7Cost: §f${recipe.cost} DE`,
    ]);
  },

  onPlayerBreak(event) {
    Machine.onDestroy(event);
  },
});
```

## Set the active recipe

Progress is stored on the helper entity. Without an active-recipe marker, a player could partially process Cobblestone, replace it with Gravel, and reuse the previous progress toward a different recipe.

```js
const activeRecipe = machine.entity.getDynamicProperty(
  ACTIVE_RECIPE_PROPERTY,
);
```

When the input type changes, the script stores the new identifier and resets progress. Invalid or missing input also clears both values.

The output-full branch is different: it preserves progress because the recipe has not changed. Processing can continue after the output becomes available.

## Use the recipe cost as progress maximum

```js
machine.setEnergyCost(recipe.cost);
```

`Machine.displayProgress()` uses the stored energy cost as 100% progress. This lets the `800` DE and `1000` DE recipes share the same display frames while advancing at different rates.

## Calculate one safe energy step

```js
if (remaining > 0) {
  const requestedEnergy = Math.min(
    machine.energy.get(),
    machine.rate,
    remaining,
  );
}
```

The machine requests no more than:

- the energy currently stored;
- its scheduler-adjusted processing rate;
- the amount still required to complete the recipe.

`machine.rate` already accounts for the base rate and the current processing interval. Do not multiply it by the block's four-tick interval.

## Consume before adding progress

```js
const consumedEnergy = machine.energy.consume(requestedEnergy);
progress += consumedEnergy;
```

Only energy actually removed from storage becomes progress. If nothing can be consumed, the machine turns off and retains partial progress.

This ordering prevents free processing and prevents progress from advancing beyond the energy that was available.

## Complete the operation

Input and output are changed only after accumulated progress reaches `recipe.cost`. The capacity checks were performed before consuming the current step, so a completion cannot silently overflow its output.

After a craft:

- one required input amount is removed;
- one complete output amount is inserted;
- one recipe cost is subtracted from progress;
- the active recipe is cleared if no matching input remains.

## Refresh visible state

```js
machine.setProgress(progress, { display: false });
machine.on();
machine.displayEnergy();
machine.displayProgress();
```

Progress is stored first without an automatic redraw, then the energy and progress items are refreshed together. `setLabel()` updates only while the machine interface is open.

All label lines begin with `§r`, including the first line.

The machine implementation is complete. Continue with [Test the machine](./test-machine).
