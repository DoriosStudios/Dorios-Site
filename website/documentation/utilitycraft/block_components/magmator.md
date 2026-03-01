---
id: magmator
sidebar_label: Magmator
title: Magmator Block Component
---

# Magmator Block Component

The `utilitycraft:magmator` block component allows you to create
fluid-based generators that convert liquids into Dorios Energy (DE).

The Magmator consumes fluids stored internally and generates energy
automatically.

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:magmator": {
  "entity": {
    "name": "magmator",
    "type": "fluid"
  },
  "generator": {
    "energy_cap": 320000,
    "fluid_cap": 128000,
    "fluid_types": 1,
    "rate_speed_base": 200
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

-   **type** *(required)*\
    Defines the input configuration.

For the Magmator:

-   `type: "fluid"`\
    Indicates the generator consumes fluids instead of items.

------------------------------------------------------------------------

## Generator Configuration

-   **energy_cap** *(required)*\
    Maximum energy storage in DE.

-   **fluid_cap** *(required)*\
    Maximum internal fluid storage capacity.

-   **fluid_types** *(required)*\
    Number of different fluid types supported.

-   **rate_speed_base** *(required)*\
    Base energy generation per tick.

The system automatically adjusts internally to respect the world refresh
speed.

------------------------------------------------------------------------

## Required Tick Component

Magmators must include `minecraft:tick` to process fluid consumption and
generate energy.

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```

------------------------------------------------------------------------

## Example Advanced Magmator Block

``` json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:advanced_magmator",
      "menu_category": {
        "category": "construction"
      },
      "traits": {
        "minecraft:placement_direction": {
          "enabled_states": [
            "minecraft:cardinal_direction"
          ],
          "y_rotation_offset": 180
        }
      },
      "states": {
        "utilitycraft:on": [false, true]
      }
    },
    "components": {
      "utilitycraft:fluid_container": {},
      "utilitycraft:magmator": {
        "entity": {
          "name": "magmator",
          "type": "fluid"
        },
        "generator": {
          "energy_cap": 320000,
          "fluid_cap": 128000,
          "fluid_types": 1,
          "rate_speed_base": 200
        }
      },
      "minecraft:geometry": "geometry.utilitycraft_block_2",
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_advanced_magmator_off",
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
      "tag:dorios:generator": {},
      "tag:dorios:energy": {},
      "tag:dorios:fluid": {},
      "tag:minecraft:is_pickaxe_item_destructible": {}
    }
  }
}
```
