---
id: incinerator
sidebar_label: Incinerator
title: Incinerator (Furnace) Recipe Registration
---

# Incinerator (Furnace) Recipe Registration

The Incinerator supports dynamic recipe registration using
ScriptEvents.\
Recipes are sent as a JSON string after `worldLoad`, and UtilityCraft
parses and registers them automatically.

The Incinerator shares its ScriptEvent channel with Better Smelters
furnaces.\
Any recipe registered through this event will also be available to
compatible Better Smelters furnaces.

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

const newRecipes = {
  "minecraft:stone": {
    output: "minecraft:smooth_stone"
  }
};

world.afterEvents.worldLoad.subscribe(() => {
  system.sendScriptEvent(
    "utilitycraft:register_furnace_recipe",
    JSON.stringify(newRecipes)
  );
});
```

You must always:

-   Wait for `worldLoad`
-   Use `JSON.stringify`
-   Send through `utilitycraft:register_furnace_recipe`

------------------------------------------------------------------------

## Recipe Object Fields

Incinerator uses the same structure as Crusher and Electro Press:

-   **`output`** *(required)*\
    Item produced by the machine.

-   **`amount`** *(optional, default: 1)*\
    Number of output items produced per operation.

-   **`required`** *(optional, default: 1)*\
    Amount of input items required per operation.

-   **`cost`** *(optional, default: 800 DE)*\
    Energy cost per operation.

If optional fields are omitted, machine defaults are applied
automatically.

------------------------------------------------------------------------

## Example Recipe Object

``` js
const recipes = {
  "minecraft:iron_dust": {
    output: "minecraft:iron_ingot"
  },
  "minecraft:rotten_flesh": {
    output: "strat:coagulated_blood",
    cost: 1200
  }
};
```

------------------------------------------------------------------------

## Notes

-   If a recipe already exists, it will be replaced.
-   Invalid fields are ignored safely.
-   Recipes are registered at runtime and do not require modifying
    UtilityCraft source files.
-   Registered recipes are shared with Better Smelters furnaces via the
    same ScriptEvent channel.
