---
id: machine-io
title: Machine IO
sidebar_label: Overview
sidebar_position: 1
description: Configure item, liquid, and gas transfers independently on all six faces of a UtilityCraft machine.
---

# Machine IO

Machine IO controls how automation interacts with each face of a machine. A face can accept recipe inputs, expose completed outputs, or remain disabled without changing the machine's internal recipe logic.

This section uses the template's real machines:

| Machine | Resources | Purpose |
| --- | --- | --- |
| Example Thermal Crusher | Items | One input slot, one output slot, and six configurable faces. |
| Example Fluid Washer | Items and one liquid | Consumes Example Coolant from indexed liquid tank `0`. |
| Example Gas Reactor | Items and two gases | Consumes Hydrogen from gas index `0` and produces Exhaust in gas index `1`. |

All examples import public APIs from DoriosCore:

```js
import {
  FluidStorage,
  GasStorage,
  Machine,
  registerIOInterface,
} from "DoriosCore/index.js";
```

Your extension registers its policies from addon-owned scripts. It does not modify DoriosCore.

## The three parts of machine IO

```text
registerIOInterface()
    defines allowed slots, tanks, modes, and face buttons

machine.processIO()
    performs transfers with compatible adjacent containers

uc.io_tab
    displays and cycles the registered six-face buttons
```

All three parts must agree. A UI index that does not match its registered `buttonSlots` displays the wrong button or no valid outline.

## Slots and resource indices are different

The helper entity has an item inventory. Energy, liquids, and gases also have their own indexed storage systems.

| Value | Example | Meaning |
| --- | --- | --- |
| Item slot | `3` | Physical slot in `container_items`. |
| Display slot | `4` | Inventory slot containing a generated resource-bar frame item. |
| Liquid index | `0` | First liquid tank managed by `FluidStorage`. |
| Gas index | `1` | Second gas tank managed by `GasStorage`. |
| Button slot | `15` | Inventory slot reserved for one clickable IO face button. |

Liquid index `0` is not item slot `0`. The liquid's current level can be rendered at any free display slot by calling `fluid.display(slot)`.

## Relative faces and physical directions

Players configure faces as:

```text
top, left, front, right, bottom, back
```

DoriosCore converts those relative faces into the block's physical world directions using its placement state. The stored configuration uses absolute directions, so rotating the block at placement gives the visible front, left, and right their expected meaning.

## What processIO does not own

`machine.processIO()` moves allowed resources between compatible neighboring endpoints. It does not:

- execute recipes;
- decide which liquid or gas a recipe needs;
- create missing resource display items;
- register custom fluids or gases;
- own UtilityCore networks.

UtilityCore remains responsible for its networks. Machine recipes and storage validation remain addon-owned.

## Tutorial order

1. [Item inputs and outputs](./item-io)
2. [Configure the six faces](./six-faces)
3. [Liquid IO](./liquid-io)
4. [Gas IO](./gas-io)

The first two pages extend the crusher from the previous sections. The liquid and gas pages then use the template's specialized machines to show the extra storage requirements.

For the complete signatures and validation rules, see the technical [`registerIOInterface`](../../dorios_core/API/io-interface) and [`processIO`](../../dorios_core/API/process-io) references.

Start with [Item inputs and outputs](./item-io).

