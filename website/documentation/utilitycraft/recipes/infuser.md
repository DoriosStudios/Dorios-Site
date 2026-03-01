---
id: infuser
sidebar_label: Infuser
title: Infuser Recipe Registration
---

# Infuser Recipe Registration

The Infuser supports dynamic recipe registration using ScriptEvents.

Recipes use a flat key format:

    catalyst|input

Both parts are required and separated by a vertical bar (`|`).

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

const newRecipes = {
  "minecraft:redstone|minecraft:iron_ingot": {
    output: "utilitycraft:energized_iron_ingot",
    required: 4,
    input_required: 1,
    amount: 1,
    cost: 1200
  }
};

world.afterEvents.worldLoad.subscribe(() => {
  system.sendScriptEvent(
    "utilitycraft:register_infuser_recipe",
    JSON.stringify(newRecipes)
  );
});
```

------------------------------------------------------------------------

## Recipe Key Format

-   Format: `catalyst|input`
-   Must contain exactly one `|`
-   Order matters (catalyst first, input second)

Example:

    minecraft:redstone|minecraft:iron_ingot

------------------------------------------------------------------------

## Recipe Object Fields

The Infuser recipe object supports:

-   **`output`** *(required)*\
    Resulting item identifier.

-   **`amount`** *(optional, default: 1)*\
    Number of output items produced per operation.

-   **`required`** *(optional, default: 1)*\
    Amount of catalyst consumed per operation.

-   **`input_required`** *(optional, default: 1)*\
    Amount of input item consumed per operation.

-   **`cost`** *(optional, default: machine energy_cost)*\
    Energy required to complete one operation.

------------------------------------------------------------------------

## Example Recipe Object

``` js
const recipes = {
  "minecraft:coal|minecraft:iron_ingot": {
    output: "utilitycraft:steel_ingot",
    required: 1,
    input_required: 1,
    amount: 1
  },
  "minecraft:redstone|minecraft:copper_ingot": {
    output: "utilitycraft:charged_copper_ingot",
    required: 2,
    input_required: 1,
    cost: 2000
  }
};
```

------------------------------------------------------------------------

## Notes

-   Recipes are registered at runtime.
-   Existing recipes are replaced if the key matches.
-   Invalid keys (without `|`) are ignored.
-   The machine automatically handles batching and energy scaling.
