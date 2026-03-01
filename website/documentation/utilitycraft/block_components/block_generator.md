---
id: block-generator
sidebar_label: Block Generator
title: Block Generator Block Component
---

# Block Generator Block Component

The `utilitycraft:block_generator` block component allows you to
create a passive generator that produces items and attempts to insert
them into the block it is facing.

This component can be reused to create higher tiers or material variants
without rewriting logic.

------------------------------------------------------------------------

## Required Components

You must include:

-   `utilitycraft:block_generator`
-   `minecraft:tick`

Production speed is controlled through the tick interval.

Example:

``` json
"minecraft:tick": {
  "interval_range": [5, 5]
}
```

------------------------------------------------------------------------

## Parameters

The component supports optional parameters:

-   **amount** *(optional, default: 1)*\
    Items generated per tick cycle.

-   **material** *(optional, default: "minecraft:cobblestone")*\
    Item identifier that will be generated.

Example:

``` json
"utilitycraft:block_generator": {
  "amount": 4,
  "material": "minecraft:cobblestone"
}
```

------------------------------------------------------------------------

## Internal Storage

If insertion into the facing container fails, the generator stores items
internally using the block states:

-   `utilitycraft:e0`
-   `utilitycraft:e1`

Maximum internal storage: **64 items**.

Players can collect stored items by interacting with the block using an
empty main hand.

------------------------------------------------------------------------

## Example Generator Block

``` json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:deepslate_generator",
      "traits": {
        "minecraft:placement_direction": {
          "enabled_states": [
            "minecraft:facing_direction"
          ]
        }
      },
      "menu_category": {
        "category": "construction"
      },
      "states": {
        "utilitycraft:e0": [0,1,2,3,4,5,6,7,8,9,10],
        "utilitycraft:e1": [0,1,2,3,4,5,6,7,8,9,10]
      }
    },
    "components": {
      "utilitycraft:block_generator": {
        "amount": 2,
        "material": "minecraft:deepslate"
      },
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_block_gen_diamond",
          "render_method": "alpha_test"
        }
      },
      "minecraft:geometry": "geometry.utilitycraft_block_gen",
      "minecraft:tick": {
        "interval_range": [5, 5]
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 2.5
      },
      "tag:minecraft:is_pickaxe_item_destructible": {}
    }
  }
}
```
