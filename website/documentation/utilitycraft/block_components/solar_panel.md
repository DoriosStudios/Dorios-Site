---
id: solar-panel
sidebar_label: Solar Panel
title: Solar Panel Block Component
---

# Solar Panel Block Component

The `utilitycraft:solar_panel` block component allows you to create
passive generators that produce Dorios Energy (DE) automatically based
on environmental conditions.

Solar Panels do not consume items or fluids. They generate energy
passively when the required conditions are met.

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:solar_panel": {
  "entity": {
    "name": "solar_panel",
    "type": "passive"
  },
  "generator": {
    "energy_cap": 128000,
    "rate_speed_base": 48
  }
}
```

------------------------------------------------------------------------

## Entity Configuration

-   **name** *(optional)*\
    Custom name assigned to the internal entity.\
    Used to link the block with its UI.\
    If omitted, the system uses the full block identifier as the entity
    name.

-   **type** *(required)*

For the Solar Panel:

-   `type: "passive"`\
    Indicates the generator produces energy automatically without
    consuming items or fluids.

------------------------------------------------------------------------

## Generator Configuration

-   **energy_cap** *(required)*\
    Maximum energy storage in DE.

-   **rate_speed_base** *(required)*\
    Base energy generation per tick.

The system automatically adjusts internally to respect the world refresh
speed.

------------------------------------------------------------------------

## Required Tick Component

Solar Panels must include `minecraft:tick` to update passive generation.

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```

------------------------------------------------------------------------

## Example Advanced Solar Panel Block

``` json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:advanced_solar_panel",
      "states": {
        "utilitycraft:on": [false, true]
      },
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "utilitycraft:solar_panel": {
        "entity": {
          "name": "solar_panel",
          "type": "passive"
        },
        "generator": {
          "energy_cap": 128000,
          "rate_speed_base": 48
        }
      },
      "minecraft:geometry": "geometry.utilitycraft_solar_panel",
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_advanced_solar_panel_off",
          "render_method": "alpha_test"
        }
      },
      "minecraft:tick": {
        "interval_range": [2, 2]
      },
      "minecraft:selection_box": {
        "origin": [-8, 0, -8],
        "size": [16, 5, 16]
      },
      "minecraft:collision_box": {
        "origin": [-8, 0, -8],
        "size": [16, 5, 16]
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 1
      },
      "minecraft:destructible_by_explosion": false,
      "tag:dorios:generator": {},
      "tag:dorios:energy": {},
      "tag:minecraft:is_pickaxe_item_destructible": {}
    }
  }
}
```
