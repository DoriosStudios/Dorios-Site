---
id: fuel
sidebar_label: Fuel Registration
title: Fuel Registration (Generators)
---

# Fuel Registration (Generators)

UtilityCraft generators that consume solid fuel (such as the Furnator)\
support dynamic fuel registration using ScriptEvents.

External addons can register new fuels or override existing ones at
runtime.

------------------------------------------------------------------------

## Sending the ScriptEvent

``` js
import { system, world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
  const newFuels = {
    "utilitycraft:bio_fuel": 12000,
    "minecraft:bamboo_block": 4000
  };

  system.sendScriptEvent(
    "utilitycraft:register_fuel",
    JSON.stringify(newFuels)
  );
});
```

------------------------------------------------------------------------

## Payload Format

The payload must be an object where:

-   **Key** → Item identifier (or keyword pattern)
-   **Value** → Dorios Energy (DE) produced

Example:

``` json
{
  "utilitycraft:bio_fuel": 12000,
  "minecraft:coal": 10000
}
```

------------------------------------------------------------------------

## Fuel Object Fields

Each fuel entry consists of:

-   **`id`**\
    Item identifier or keyword pattern (e.g. `"coal"`, `"plank"`).

-   **`de`**\
    Dorios Energy (DE) produced when consumed.

------------------------------------------------------------------------

## Behavior

-   New fuels are added automatically.
-   Existing fuels with the same ID are replaced.
-   Invalid entries are ignored safely.
-   Changes apply to all compatible solid-fuel generators.

------------------------------------------------------------------------

## Notes

-   Fuel registration is processed at runtime.
-   This system is intended for generators (not crafting machines).
-   Patterns like `"plank"` or `"log"` may match multiple item variants
    internally.
