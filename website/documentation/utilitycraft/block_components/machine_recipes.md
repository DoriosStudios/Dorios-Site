---
id: machine-recipes
sidebar_label: Machine Recipes
title: Machine Recipes Block Component
---

# Machine Recipes Block Component

The `utilitycraft:machine_recipes` component allows you to define
machine recipes directly inside the block JSON.

It works with:

-   `utilitycraft:simple_machine`
-   `utilitycraft:simple_machine_liquid`
-   `utilitycraft:double_machine`

This removes the need for scripting when defining recipes.

------------------------------------------------------------------------

# 1- Simple Machine Recipes

Used by:

-   Crusher
-   Incinerator
-   Electro Press

## Predefined Type

``` json
"utilitycraft:machine_recipes": {
  "type": "crusher"
}
```

## Custom Recipe Format

``` json
"utilitycraft:machine_recipes": {
  "minecraft:cobblestone": {
    "output": "minecraft:gravel",
    "amount": 1
  }
}
```

### Fields

-   **output** *(required)* --- Item produced.
-   **amount** *(optional, default: 1)* --- Output amount.
-   **required** *(optional, default: 1)* --- Input amount required.
-   **cost** *(optional)* --- Overrides machine energy cost.

------------------------------------------------------------------------

# 2- Simple Machine Liquid Recipes

Used by:

-   Melter
-   Magmatic Chamber
-   Any liquid-producing processor

## Predefined Type

``` json
"utilitycraft:machine_recipes": {
  "type": "melter"
}
```

## Custom Liquid Recipe Format

``` json
"utilitycraft:machine_recipes": {
  "minecraft:cobblestone": {
    "liquid": "lava",
    "amount": 250
  },
  "minecraft:netherrack": {
    "liquid": "lava",
    "amount": 1000
  }
}
```

### Liquid Fields

-   **liquid** *(required)* --- Liquid produced.
-   **amount** *(required)* --- Liquid amount per operation.

------------------------------------------------------------------------

# 3- Double Machine Recipes

Used by:

-   Infuser
-   Alloy machines
-   Catalyst-based processors

## Predefined Type

``` json
"utilitycraft:machine_recipes": {
  "type": "infuser"
}
```

## Custom Double Recipe Format

Double recipes use a pipe (`|`) to separate inputs:

``` json
"utilitycraft:machine_recipes": {
  "utilitycraft:amethyst_dust|utilitycraft:obsidian_dust": {
    "output": "utilitycraft:stabilized_obsidian_dust",
    "required": 4
  },
  "minecraft:redstone|minecraft:iron_ingot": {
    "output": "utilitycraft:energized_iron_ingot",
    "required": 4
  }
}
```

### Double Fields

-   **output** *(required)* --- Item produced.
-   **required** *(optional, default: 1)* --- Input amount required.
-   **amount** *(optional, default: 1)* --- Output amount.
-   **cost** *(optional)* --- Overrides default energy cost.

------------------------------------------------------------------------

## Notes

-   Custom recipes override predefined `type` recipes if both are
    defined.
-   Recipes are parsed automatically at block initialization.
-   No scripting is required when using this component.
