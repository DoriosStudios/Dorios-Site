---
id: furnator
sidebar_label: Furnator
title: Furnator Block Component
---

# Furnator Block Component

The `utilitycraft:furnator` block component allows you to create
fuel-based generators that burn items to generate Dorios Energy (DE).

The Furnator consumes fuel from its internal slot and converts it into
energy automatically.

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:furnator": {
  "entity": {
    "name": "furnator",
    "type": "simple"
  },
  "generator": {
    "energy_cap": 256000,
    "rate_speed_base": 160
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

For the Furnator:

-   `type: "simple"`\
    Indicates the generator has **one fuel slot**.

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

Furnators must include `minecraft:tick` to process fuel and generate
energy.

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```

------------------------------------------------------------------------

## Example Advanced Furnator Block

``` json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:advanced_furnator",
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
      "utilitycraft:furnator": {
        "entity": {
          "name": "furnator",
          "type": "simple"
        },
        "generator": {
          "energy_cap": 256000,
          "rate_speed_base": 160
        }
      },
      "minecraft:geometry": "geometry.utilitycraft_block_2",
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_advanced_furnator_off",
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
      "tag:dorios:item": {},
      "tag:minecraft:is_pickaxe_item_destructible": {}
    }
  }
}
```
