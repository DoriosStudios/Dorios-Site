---
id: autosieve
sidebar_label: AutoSieve
title: AutoSieve Drop Registration
---

# AutoSieve Drop Registration

The AutoSieve supports dynamic drop registration using ScriptEvents.\
Drops are sent as a JSON string after `worldLoad`, and UtilityCraft
parses and registers them automatically.

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

const newDrops = {
  "minecraft:gravel": [
    { item: "minecraft:string", amount: 1, chance: 0.05 },
    { item: "minecraft:bone_meal", amount: 1, chance: 0.15 }
  ]
};

world.afterEvents.worldLoad.subscribe(() => {
  system.sendScriptEvent(
    "utilitycraft:register_sieve_drop",
    JSON.stringify(newDrops)
  );
});
```

You must always:

-   Wait for `worldLoad`
-   Use `JSON.stringify`
-   Send through `utilitycraft:register_sieve_drop`

------------------------------------------------------------------------

## Drop Object Fields

Each block entry maps to an array of drops. Each drop may contain the
following properties:

-   **`item`**\
    Item identifier that can drop (namespace:item_name).

-   **`amount`**\
    How many items are granted on success.

-   **`chance`**\
    Drop probability from `0` to `1`.\
    Example: `0.25` means 25% chance.

-   **`tier`** *(optional)*\
    Minimum mesh tier required for the drop to be eligible.\
    If not defined, defaults to `0`.

------------------------------------------------------------------------

## Example Drop Object

``` js
const drops = {
  "minecraft:sand": [
    { item: "utilitycraft:copper_chunk", amount: 1, chance: 0.25, tier: 1 },
    { item: "minecraft:gunpowder", amount: 1, chance: 0.12 }
  ],
  "utilitycraft:crushed_netherrack": [
    { item: "utilitycraft:nether_quartz_chunk", amount: 1, chance: 0.33, tier: 1 }
  ]
};
```

------------------------------------------------------------------------

## Accepted Blocks and Basic Sieve Rules

UtilityCraft defines an `acceptedBlocks` list for the Basic Sieve (tier
0).

Important behavior:

-   The Basic Sieve ignores any input block not present in
    `acceptedBlocks`, even if the block has drops registered.
-   Higher tiers may accept additional blocks depending on UtilityCraft
    configuration.

If targeting tier 0 usage, ensure the input block is supported.

------------------------------------------------------------------------

## Notes

-   Drops are registered at runtime and do not require modifying
    UtilityCraft source files.
-   If a block entry does not exist, it will be created automatically.
-   Invalid drop definitions are ignored safely.
