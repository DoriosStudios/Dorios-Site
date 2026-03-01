---
id: dig-pebble
sidebar_label: Dig Pebble
title: Dig Pebble Item Component
---

# Dig Pebble Item Component

The `utilitycraft:dig_pebble` component allows a hammer to generate
Pebbles when interacting with dirt or grass blocks.

All UtilityCraft hammers include this component.

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:dig_pebble": {}
```

------------------------------------------------------------------------

## Behavior

When a player interacts with:

-   Dirt
-   Grass
-   Similar natural blocks

The hammer has a chance to:

-   Produce Pebbles
-   Trigger minor durability usage

This provides early-game resource generation without requiring machines.

------------------------------------------------------------------------

## Notes

-   This component is automatically compatible with all hammers.
-   No configuration fields are required.
-   It is independent of Crusher logic.
