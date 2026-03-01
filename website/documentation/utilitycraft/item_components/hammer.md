---
id: hammer
sidebar_label: Hammer
title: Hammer Item Component
---

# Hammer Item Component

The `utilitycraft:hammer` component allows an item to function as a
UtilityCraft Hammer.

Hammers can:

-   Break blocks
-   Automatically apply Crusher recipes when mining
-   Crush blocks manually without using a machine

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:hammer": {
  "tier": 1
}
```

------------------------------------------------------------------------

## Fields

-   **tier** *(required)*\
    Defines which blocks the hammer can crush.

Higher tier hammers can crush blocks that require higher Crusher tiers.

The hammer automatically uses Crusher recipes internally. No additional
scripting or configuration is required.

------------------------------------------------------------------------

## Crusher Integration

When a hammer breaks a valid block:

-   The block is replaced with its Crusher output
-   Tier restrictions are enforced automatically

Hammer crushing respects:

-   Recipe `tier` requirements
-   Crusher recipe definitions

------------------------------------------------------------------------

## Example Item

``` json
{
  "format_version": "1.21.90",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:copper_hammer"
    },
    "components": {
      "utilitycraft:hammer": {
        "tier": 1
      }
    }
  }
}
```
