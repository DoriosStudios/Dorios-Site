---
id: mesh
sidebar_label: Mesh
title: Mesh Item Component
---

# Mesh Item Component

The `utilitycraft:mesh` component is used to create custom meshes for
the **Autosieve**.

Meshes modify the drop rate and processing efficiency of the Autosieve.

⚠ This component does NOT work with the Basic Sieve.

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:mesh": {
  "tier": 2,
  "multiplier": 1.25
}
```

------------------------------------------------------------------------

## Fields

-   **tier** *(required)*\
    Defines the mesh tier.

-   **multiplier** *(required)*\
    Multiplies loot chances or processing effectiveness.

------------------------------------------------------------------------

## Example Item

``` json
{
  "format_version": "1.21.90",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:copper_mesh",
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "minecraft:icon": "utilitycraft_copper_mesh",
      "utilitycraft:mesh": {
        "tier": 2,
        "multiplier": 1.25
      }
    }
  }
}
```
