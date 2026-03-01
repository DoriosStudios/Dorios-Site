---
id: fishing-net
sidebar_label: Fishing Net
title: Fishing Net Item Component
---

# Fishing Net Item Component

The `utilitycraft:fishing_net` component is used to create custom
Fishing Nets for the **Autofisher**.

Fishing Nets define fishing performance scaling through multiple
parameters such as speed, luck, and drop multipliers.

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:fishing_net": {
  "tier": 1,
  "speed": 1,
  "chance_multiplier": 1.25,
  "amount_multiplier": 1.0,
  "rolls": 1,
  "luck": 0
}
```

------------------------------------------------------------------------

## Fields

-   **tier** *(required)*\
    Defines the net tier.

-   **speed** *(required)*\
    Multiplier affecting fishing cycle speed.

-   **chance_multiplier** *(required)*\
    Multiplies the chance of obtaining loot.

-   **amount_multiplier** *(required)*\
    Multiplies the quantity of loot obtained.

-   **rolls** *(required)*\
    Number of loot rolls per fishing cycle.

-   **luck** *(required)*\
    Additional luck modifier.

------------------------------------------------------------------------

## Example Item

``` json
{
  "format_version": "1.21.90",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:copper_fishing_net",
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "minecraft:icon": "utilitycraft_copper_fishing_net",
      "utilitycraft:fishing_net": {
        "tier": 1,
        "speed": 1,
        "chance_multiplier": 1.25,
        "amount_multiplier": 1.0,
        "rolls": 1,
        "luck": 0
      }
    }
  }
}
```
