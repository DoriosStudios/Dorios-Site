---
id: seed-synthesizer
sidebar_label: Seed Synthesizer
title: Seed Synthesizer Plant Registration
---

# Seed Synthesizer Plant Registration

The Seed Synthesizer supports dynamic plant registration using
ScriptEvents.\
Plant definitions are sent as a JSON string after `worldLoad`, and
UtilityCraft parses and registers them automatically.

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

const newPlants = {
    "utilitycraft:example_crop": {
      cost: 64000,
      drops: [
        { item: "minecraft:iron_ingot", amount: [1,3], chance: 1 },
        { item: "utilitycraft:example_seed", amount: 1, chance: 0.05 }
      ]
    }
};

world.afterEvents.worldLoad.subscribe(() => {
  system.sendScriptEvent(
    "utilitycraft:register_plant",
    JSON.stringify(newPlants)
  );
});
```

You must always:

-   Wait for `worldLoad`
-   Use `JSON.stringify`
-   Send through `utilitycraft:register_plant`

------------------------------------------------------------------------

## Plant Object Fields

Each plant definition supports the following fields:

-   **`cost`** *(required)*\
    Energy required to complete one growth cycle.

-   **`drops`** *(required)*\
    Array of drop definitions produced when the cycle completes.

Each drop entry supports:

-   **`item`** *(required)*\
    Item produced by the plant.

-   **`amount`** *(required)*\
    Fixed number OR range `[min,max]`.

-   **`chance`** *(required)*\
    Probability between `0` and `1`.

If fields are omitted or invalid, they are ignored safely.

------------------------------------------------------------------------

## Example Plant Object

``` js
const plants = {
  "utilitycraft:coal_seeds": {
    cost: 64000,
    drops: [
      { item: "minecraft:coal", amount: [2,4], chance: 1 },
      { item: "utilitycraft:coal_seeds", amount: 1, chance: 0.05 }
    ]
  }
};
```

------------------------------------------------------------------------

## Notes

-   If a plant already exists, it will be replaced.
-   Invalid fields are ignored safely.
-   Plants are registered at runtime and do not require modifying
    UtilityCraft source files.
