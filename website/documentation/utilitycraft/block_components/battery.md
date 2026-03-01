---
id: battery
sidebar_label: Battery
title: Battery Block Component
---

# Battery Block Component

The `utilitycraft:battery` block component allows you to create energy
storage blocks that store and transfer Dorios Energy (DE).

Batteries automatically handle:

-   Energy storage
-   Energy transfer to adjacent blocks
-   Capacity-based visual state updates

------------------------------------------------------------------------

## Component Parameters

The component requires:

-   **energy_cap** *(required)*\
    Maximum energy storage in DE.

-   **rate_speed_base** *(required)*\
    Base transfer rate per tick.

`rate_speed_base` represents the energy transfer per tick.\
The system automatically adjusts internally to respect the world's
refresh speed.

Example:

``` json
"utilitycraft:battery": {
  "energy_cap": 1024000,
  "rate_speed_base": 400
}
```

------------------------------------------------------------------------

## Required Tick Component

Batteries must include `minecraft:tick` to update energy logic.

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```

------------------------------------------------------------------------

## Capacity State

Batteries use the block state:

-   `utilitycraft:capacity`

This state is automatically updated by the system to represent charge
levels visually.

------------------------------------------------------------------------

## Example Advanced Battery Block

``` json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:advanced_battery",
      "states": {
        "utilitycraft:capacity": [0,1,2,3,4,5,6]
      },
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "utilitycraft:battery": {
        "energy_cap": 1024000,
        "rate_speed_base": 400
      },
      "minecraft:geometry": "geometry.utilitycraft_battery",
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_battery_advanced_0",
          "render_method": "alpha_test"
        }
      },
      "minecraft:tick": {
        "interval_range": [2, 2]
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 1
      },
      "minecraft:destructible_by_explosion": false,
      "tag:dorios:energy": {},
      "tag:dorios:generator": {},
      "tag:minecraft:is_pickaxe_item_destructible": {}
    }
  }
}
```
