---
id: assembler
sidebar_label: Assembler
title: Assembler (Autocrafter) Recipe Registration
---

# Assembler (Autocrafter) Recipe Registration

The Assembler supports dynamic
recipe registration using ScriptEvents.

It already supports all **vanilla crafting table recipes
automatically**.\
If you are using a **custom crafting table**, you must register its
recipes manually using the format below.

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

const newRecipes = {
  "iron_ingot,iron_ingot,iron_ingot,air,redstone,air,iron_ingot,iron_ingot,iron_ingot": {
    output: "utilitycraft:machine_case",
    amount: 1
  }
};

world.afterEvents.worldLoad.subscribe(() => {
  system.sendScriptEvent(
    "utilitycraft:register_crafter_recipe",
    JSON.stringify(newRecipes)
  );
});
```

------------------------------------------------------------------------

## Recipe Key Format

The key represents the **3×3 crafting grid**, ordered:

-   Left → Right\
-   Top → Bottom

Use `"air"` for empty slots.

Example:

    iron_ingot,iron_ingot,iron_ingot,air,redstone,air,iron_ingot,iron_ingot,iron_ingot

The pattern **must contain exactly 9 comma-separated entries**.

------------------------------------------------------------------------

## Recipe Object Fields

-   **`output`** *(required)*\
    Resulting item identifier.

-   **`amount`** *(optional, default: 1)*\
    Number of items produced.

-   **`leftover`** *(optional)*\
    Array of items returned after crafting.\
    Example: `["minecraft:bucket"]`

------------------------------------------------------------------------

## Example Recipe Object

``` js
const recipes = {
  "bucket,iron_ingot,bucket,iron_ingot,blast_furnace,iron_ingot,bucket,iron_ingot,bucket": {
    output: "utilitycraft:molten_core",
    amount: 1,
    leftover: ["minecraft:bucket"]
  }
};
```

------------------------------------------------------------------------

## Notes

-   New recipes are added automatically.
-   Existing recipes are replaced if the pattern matches.
-   Invalid patterns (not 9 slots) are ignored.
-   Vanilla crafting recipes do not need registration.
