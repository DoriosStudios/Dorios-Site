---
id: simple-machine-liquid
sidebar_label: Simple Machine Liquid
title: Simple Machine Liquid Block Component
---

# Simple Machine Liquid Block Component

The `utilitycraft:simple_machine_liquid` component is used to create
processing machines that consume energy and interact with fluids.

This is used for machines such as:

-   Magmatic Chamber
-   Melter-type machines
-   Any machine that processes items into liquids or consumes liquids

This component works together with:

-   `utilitycraft:machine_recipes`

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:simple_machine_liquid": {
  "entity": {
    "fluid": true,
    "input_type": "simple",
    "inventory_size": 7
  },
  "machine": {
    "energy_cap": 640000,
    "energy_cost": 8000,
    "fluid_cap": 32000,
    "fluid_types": 1,
    "rate_speed_base": 40,
    "upgrades": [5, 6]
  }
}
```

------------------------------------------------------------------------

## Liquid Machine Recipes

Liquid machines use the `utilitycraft:machine_recipes` component.

### Using Predefined Type

``` json
"utilitycraft:machine_recipes": {
  "type": "melter"
}
```

### Defining Recipes Directly (No `type`)

You can define the liquid recipes directly inside the block JSON by
removing `type` and writing them inline:

``` json
"utilitycraft:machine_recipes": {
  "minecraft:cobblestone": { "liquid": "lava", "amount": 250 },
  "minecraft:stone": { "liquid": "lava", "amount": 250 },
  "minecraft:diorite": { "liquid": "lava", "amount": 250 },
  "minecraft:granite": { "liquid": "lava", "amount": 250 },
  "minecraft:blackstone": { "liquid": "lava", "amount": 250 },
  "minecraft:netherrack": { "liquid": "lava", "amount": 1000 },
  "minecraft:magma": { "liquid": "lava", "amount": 1000 },
  "minecraft:magma_cream": { "liquid": "lava", "amount": 250 }
}
```

### Liquid Recipe Fields

-   **liquid** *(required)*\
    Name of the liquid produced.

-   **amount** *(required)*\
    Amount of liquid produced per operation.

------------------------------------------------------------------------

## Required Components

Liquid machines must include:

-   `utilitycraft:fluid_container`
-   `minecraft:tick`

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```
