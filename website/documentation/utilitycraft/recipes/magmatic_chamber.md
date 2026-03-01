---
id: magmatic-chamber
sidebar_label: Magmatic Chamber
title: Magmatic Chamber (Melter) Recipe Registration
---

# Magmatic Chamber (Melter) Recipe Registration

The Magmatic Chamber (internally called Melter) supports dynamic liquid
recipe registration using ScriptEvents.

It converts solid items into liquids measured in millibuckets (mB).

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

const newRecipes = {
  "minecraft:ice": { liquid: "water", amount: 1000 }
};

world.afterEvents.worldLoad.subscribe(() => {
  system.sendScriptEvent(
    "utilitycraft:register_melter_recipe",
    JSON.stringify(newRecipes)
  );
});
```

------------------------------------------------------------------------

## Payload Format

The payload must be an object where:

-   **Key** → Input item identifier
-   **Value** → Liquid recipe definition

Example:

``` json
{
  "minecraft:cobblestone": { "liquid": "lava", "amount": 250 },
  "minecraft:ice": { "liquid": "water", "amount": 1000 }
}
```

------------------------------------------------------------------------

## Recipe Object Fields

Each Melter recipe supports:

-   **`liquid`** *(required)*\
    Resulting liquid type (e.g. `"lava"`, `"water"`).

-   **`amount`** *(required)*\
    Produced liquid amount in millibuckets (mB).

------------------------------------------------------------------------

## Behavior

-   New recipes are added automatically.
-   Existing recipes with the same input are replaced.
-   Invalid entries are ignored safely.
-   Recipes are registered at runtime.
-   Liquid amount is added to the machine's internal tank.

------------------------------------------------------------------------

## Example Recipe Object

``` js
const recipes = {
  "minecraft:obsidian": {
    liquid: "lava",
    amount: 500
  },
  "minecraft:packed_ice": {
    liquid: "water",
    amount: 1000
  }
};
```

------------------------------------------------------------------------

## Notes

-   The Magmatic Chamber must have available tank capacity to store
    produced liquid.
-   If the tank is full, processing will stop.
-   Energy consumption is handled by the machine configuration.
