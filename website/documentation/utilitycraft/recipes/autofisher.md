---
id: autofisher
sidebar_label: AutoFisher
title: AutoFisher Drop Registration
---

# AutoFisher Drop Registration

The AutoFisher supports dynamic loot registration using ScriptEvents.

External addons can add new fishing drops at runtime without modifying
UtilityCraft source files.

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
  const newDrops = [
    {
      item: "minecraft:apple",
      amount: 1,
      chance: 0.05,
      tier: 0
    }
  ];

  system.sendScriptEvent(
    "utilitycraft:register_autofisher_drop",
    JSON.stringify(newDrops)
  );
});
```

------------------------------------------------------------------------

## Drop Object Fields

Each drop may contain:

-   **`item`** *(required)*\
    Item identifier (`namespace:item_name`).

-   **`amount`** *(optional, default: 1)*\
    Fixed number or range `[min, max]`.

-   **`chance`** *(optional, default: 0.1)*\
    Drop probability between `0` and `1`.

-   **`tier`** *(optional, default: 0)*\
    Minimum fishing net tier required.

------------------------------------------------------------------------

## Example (Single Object)

``` js
system.sendScriptEvent(
  "utilitycraft:register_autofisher_drop",
  JSON.stringify({
    item: "minecraft:diamond",
    amount: 1,
    chance: 0.01,
    tier: 5
  })
);
```

------------------------------------------------------------------------

## Advanced Features (Built-in System)

The AutoFisher system also supports:

-   Tier-based drop restrictions
-   Amount ranges
-   Random enchantments
-   Scripted enchantments
-   Durability damage ranges
-   Luck-based enchant scaling
-   Equipment-specific behavior (bows, rods, etc.)

These features are optional and handled automatically when defined.

------------------------------------------------------------------------

## Notes

-   Multiple drops can be registered at once (array format).
-   Invalid payloads are ignored safely.
-   Drops are appended to the existing loot table.
