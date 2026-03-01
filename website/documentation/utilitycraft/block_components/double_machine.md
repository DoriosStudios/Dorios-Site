---
id: double-machine
sidebar_label: Double Machine
title: Double Machine Block Component
---

# Double Machine Block Component

The `utilitycraft:double_machine` component is used to create machines
that require **two input sources** to produce a result.

This is typically used for machines such as:

-   Infuser
-   Alloy-type machines
-   Catalyst-based processors

It works together with:

-   `utilitycraft:machine_recipes`

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:double_machine": {
  "entity": {
    "input_type": "simple",
    "output_type": "simple",
    "inventory_size": 8
  },
  "machine": {
    "energy_cap": 128000,
    "energy_cost": 1600,
    "rate_speed_base": 40,
    "upgrades": [5, 6]
  }
}
```

------------------------------------------------------------------------

## Entity Configuration

-   **input_type** *(required)*\
    Defines item input behavior.

-   **output_type** *(required)*\
    Defines item output behavior.

-   **inventory_size** *(required)*\
    Total inventory size of the machine entity.

Double Machines typically use:

-   1 primary input slot
-   1 secondary (catalyst) slot
-   1 output slot

Additional slots can be used for upgrades.

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

## Double Machine Recipes

Double machines use `utilitycraft:machine_recipes`.

### Using Predefined Type

``` json
"utilitycraft:machine_recipes": {
  "type": "infuser"
}
```

### Defining Recipes Directly (No `type`)

You can define recipes inline inside the block JSON.

Double recipe format uses a pipe (`|`) to separate inputs:

``` json
"utilitycraft:machine_recipes": {
  "utilitycraft:amethyst_dust|utilitycraft:obsidian_dust": {
    "output": "utilitycraft:stabilized_obsidian_dust",
    "required": 4
  },
  "utilitycraft:amethyst_dust|utilitycraft:crying_obsidian_dust": {
    "output": "utilitycraft:stabilized_obsidian_dust",
    "required": 1
  },
  "minecraft:redstone|minecraft:iron_ingot": {
    "output": "utilitycraft:energized_iron_ingot",
    "required": 4
  }
}
```

### Recipe Fields

-   **output** *(required)*\
    Item produced.

-   **required** *(optional, default: 1)*\
    Amount of input items required per operation.

-   **amount** *(optional, default: 1)*\
    Output item count per operation.

-   **cost** *(optional)*\
    Overrides default energy cost.

------------------------------------------------------------------------

## Required Tick Component

Double Machines must include `minecraft:tick` to process recipes.

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```
