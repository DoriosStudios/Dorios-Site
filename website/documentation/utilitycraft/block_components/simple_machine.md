---
id: simple-machine
sidebar_label: Simple Machine
title: Simple Machine Block Component
---

# Simple Machine Block Component

The `utilitycraft:simple_machine` block component is used to create
processing machines such as:

-   Crusher
-   Incinerator
-   Electro Press

These machines consume energy to process items according to defined
recipes.

Simple Machines work together with:

-   `utilitycraft:machine_recipes` (for recipe definition)

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:simple_machine": {
  "entity": {
    "input_type": "simple",
    "output_type": "simple"
  },
  "machine": {
    "energy_cap": 64000,
    "energy_cost": 800,
    "rate_speed_base": 20,
    "upgrades": [4, 5]
  }
}
```
------------------------------------------------------------------------

## Entity Configuration

-   **input_type** *(required)*\
    Defines how the machine receives items.

-   **output_type** *(required)*\
    Defines how the machine outputs items.

For standard machines:

-   `"simple"` --- One input slot and one output slot.

------------------------------------------------------------------------

## Machine Configuration

-   **energy_cap** *(required)*\
    Maximum energy storage in DE.

-   **energy_cost** *(required)*\
    Energy required per operation.

-   **rate_speed_base** *(required)*\
    Base processing speed per tick.

-   **upgrades** *(required)*\
    Array defining supported upgrade slots.

The system automatically adjusts internally to respect the world refresh
speed.

------------------------------------------------------------------------

## Recipes

Simple Machines rely on the `utilitycraft:machine_recipes` component to
define how items are processed.

You can either:

-   Use a predefined recipe type (e.g. `"type": "crusher"`)
-   Define custom recipes directly inside the block JSON

Example:

``` json
"utilitycraft:machine_recipes": {
  "type": "crusher"
}
```

See the [Machine Recipes documentation](./machine-recipes).

------------------------------------------------------------------------

## Required Tick Component

Simple Machines must include `minecraft:tick` to process recipes.

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```

------------------------------------------------------------------------

## Example Crusher Block

``` json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:crusher",
      "menu_category": {
        "category": "construction"
      },
      "states": {
        "utilitycraft:on": [false, true]
      }
    },
    "components": {
      "utilitycraft:simple_machine": {
        "entity": {
          "input_type": "simple",
          "output_type": "simple"
        },
        "machine": {
          "energy_cap": 64000,
          "energy_cost": 800,
          "rate_speed_base": 20,
          "upgrades": [4, 5]
        }
      },
      "utilitycraft:machine_recipes": {
        "type": "crusher"
      },
      "minecraft:geometry": "geometry.utilitycraft_block_2",
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_crusher_off",
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
      "tag:dorios:machine": {},
      "tag:dorios:energy": {},
      "tag:dorios:item": {},
      "tag:minecraft:is_pickaxe_item_destructible": {}
    }
  }
}
```
