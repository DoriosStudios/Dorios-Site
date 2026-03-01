---
id: electro-press
sidebar_label: Electro Press
title: Electro Press Recipe Registration
---

# Electro Press Recipe Registration

The Electro Press supports dynamic recipe registration using
ScriptEvents.\
Recipes are sent as a JSON string after `worldLoad`, and UtilityCraft
parses and registers them automatically.

Crusher, Incinerator, and Electro Press all use the same recipe
structure.

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

const newRecipes = {
  "minecraft:stone": {
    output: "minecraft:deepslate",
    required: 4
  }
};

world.afterEvents.worldLoad.subscribe(() => {
  system.sendScriptEvent(
    "utilitycraft:register_press_recipe",
    JSON.stringify(newRecipes)
  );
});
```

You must always:

-   Wait for `worldLoad`
-   Use `JSON.stringify`
-   Send through `utilitycraft:register_press_recipe`

------------------------------------------------------------------------

## Recipe Object Fields

Crusher, Incinerator, and Electro Press share the same fields:

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
  "minecraft:iron_ingot": {
    output: "utilitycraft:iron_plate",
    required: 1
  },
  "minecraft:stone": {
    output: "minecraft:deepslate",
    amount: 2,
    required: 4,
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
