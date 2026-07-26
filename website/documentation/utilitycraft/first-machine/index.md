---
id: first-machine
title: Your First Machine
sidebar_label: Overview
sidebar_position: 1
description: Build a complete scripted UtilityCraft machine with a block, shared helper entity, safe recipe processing, and Dorios Energy consumption.
---

# Your First Machine

In this tutorial you will turn the template's Example Thermal Crusher into a small, understandable machine. It will accept Cobblestone, process it over time using Dorios Energy, and place Gravel in its output slot.

The finished machine uses public APIs only:

```js
import { Machine } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
```

No DoriosCore or DoriosLib file is modified.

## What you will build

```text
Cobblestone + 800 DE -> Gravel
Gravel      + 1000 DE -> Sand
```

The first version intentionally has:

- one item input at helper-entity slot `3`;
- one item output at slot `4`;
- an energy display at slot `0`;
- a status label at slot `1`;
- a progress display at slot `2`;
- no liquid or gas storage;
- no custom heat mechanic;
- no upgrades or configurable IO yet.

Those systems are added in later sections after the basic processing lifecycle is clear.

## Before you start

Complete [Getting Started](../getting-started/) first. You should have an unchanged copy of the template that builds and runs successfully.

This tutorial reuses the existing identifier and art:

```text
utilitycraft:example_thermal_crusher
```

Using the existing identifier lets the template's textures, language entry, item catalog entry, test function, and temporary machine UI continue to work. When you build your real addon, replace it with an identifier in your own namespace.

## Files used

| File | Responsibility |
| --- | --- |
| `BP/blocks/examples/example_thermal_crusher.json` | Block, component parameters, tick interval, states, tags, and textures. |
| `BP/scripts/examples/machines/thermalCrusher.js` | Addon-owned machine behavior and recipe table. |
| `BP/scripts/examples/machines/index.js` | Loads the machine module. |
| `BP/scripts/main.js` | Loads all registrations and installs DoriosLib once. |
| `RP/textures/terrain_texture.json` | Maps the existing crusher texture keys to PNG files. |
| `RP/texts/en_US.lang` | Names the block and its shared helper entity. |

The template's UI files already expose slots `0` through `4`, so you can test this first machine before learning how the JSON UI is assembled. The next course section will rebuild and explain that interface.

## Tutorial order

1. [Create the block](./create-block)
2. [Register its component](./register-component)
3. [Create the helper entity](./helper-entity)
4. [Process a recipe with script](./scripted-recipe)
5. [Consume energy](./consume-energy)
6. [Test the machine](./test-machine)

Each page starts from the result of the previous page. Do not skip directly to energy consumption unless the block, component, and helper entity already work.

Start with [Create the block](./create-block).

