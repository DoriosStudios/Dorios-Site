---
id: thermo-generator
sidebar_label: Thermo Generator
title: Thermo Generator Block Component
---

# Thermo Generator Block Component

The `utilitycraft:thermo_generator` block component allows you to create
fluid-based generators that convert specific heated liquids into Dorios
Energy (DE).

The Thermo Generator consumes fluids stored internally and generates
energy automatically.

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:thermo_generator": {
  "entity": {
    "name": "thermo_generator",
    "type": "fluid"
  },
  "generator": {
    "energy_cap": 128000,
    "fluid_cap": 8000,
    "fluid_types": 1,
    "rate_speed_base": 80
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

For the Thermo Generator:

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

Thermo Generators must include `minecraft:tick` to process fluid
consumption and generate energy.

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```

------------------------------------------------------------------------

## Example Advanced Thermo Generator Block

``` json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:advanced_thermo_generator",
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
      "utilitycraft:thermo_generator": {
        "entity": {
          "name": "thermo_generator",
          "type": "fluid"
        },
        "generator": {
          "energy_cap": 128000,
          "fluid_cap": 8000,
          "fluid_types": 1,
          "rate_speed_base": 80
        }
      },
      "minecraft:geometry": "geometry.utilitycraft_block_2",
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_advanced_thermo_generator_off",
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
