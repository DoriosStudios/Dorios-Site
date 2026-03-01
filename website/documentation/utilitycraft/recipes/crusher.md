---
id: crusher
sidebar_label: Crusher
title: Crusher Recipe Registration
---

# Crusher Recipe Registration

The Crusher supports dynamic recipe registration using ScriptEvents.\
Recipes are sent as a JSON string after `worldLoad`, and UtilityCraft
parses and registers them automatically.

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

const newRecipes = {
    "minecraft:stone": {
      output: "minecraft:cobblestone",
      amount: 1
    }
};

world.afterEvents.worldLoad.subscribe(() => {
  system.sendScriptEvent(
    "utilitycraft:register_crusher_recipe",
    JSON.stringify(newRecipes)
  );
});
```

You must always:

-   Wait for `worldLoad`
-   Use `JSON.stringify`
-   Send through `utilitycraft:register_crusher_recipe`

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

- **`tier`** *(optional)*  
  Minimum **Hammer tool** tier required to crush the block when breaking it manually. 

------------------------------------------------------------------------

## Example Recipe Object

``` js
const recipes = {
  "minecraft:stone": {
    output: "minecraft:cobblestone",
    amount: 1,
    cost: 1000,
    tier: 1
  }
};
```

------------------------------------------------------------------------

## Notes

-   If a recipe already exists, it will be replaced.
-   Invalid fields are ignored safely.
-   Recipes are registered at runtime and do not require modifying
    UtilityCraft source files.
