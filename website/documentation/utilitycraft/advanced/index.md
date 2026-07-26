---
id: advanced-examples
title: Advanced Examples
sidebar_label: Overview
sidebar_position: 1
description: Organize addon-owned systems, extend DoriosCore safely, configure link-node ports, and build multiblock machinery.
---

# Advanced Examples

This section moves repeated behavior out of individual block scripts and into systems owned by your addon. You will create a small public core, extend `Machine` without changing DoriosCore, expose multiblock storage through configurable ports, and build a complete processing multiblock.

These guides use the working implementations in the [UtilityCraft Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template) and the larger controllers in [UtilityCraft Heavy Machinery](https://github.com/DoriosStudios/UtilityCraft-Heavy-Machinery) as their source patterns.

## Before you begin

Complete these sections first:

- [Your First Machine](../first-machine/)
- [Machine UI](../machine-ui/)
- [Machine IO](../machine-io/)
- [Machine Upgrades](../machine-upgrades/)
- [Generators](../generators/)

Multiblocks reuse the same storage, progress, label, and IO concepts. The difference is that one controller represents a validated structure instead of one block.

## Ownership model

```text
Your machine script
    imports reusable addon behavior from MYADDON_CORE
        extends public classes from DoriosCore/index.js

Your registrations and block components
    use DoriosLib/index.js

Physical ports
    are associated with the active controller by DoriosLib

Logical IO groups and multiblock lifecycle
    are handled by DoriosCore

Networks
    are owned by UtilityCore
```

:::warning Keep the shared libraries read-only
Never add an addon class to `DoriosCore`, edit a DoriosCore class, or place addon-specific rules inside `DoriosLib`. A reusable mechanic that belongs only to your addon goes in an addon-owned folder such as `MYADDON_CORE`.
:::

## What you will build

| Guide | Result |
| --- | --- |
| [Create an Addon Core](./addon-core) | A stable addon-owned entry point for reusable classes and helpers. |
| [Create a Custom Machine Class](./custom-machine-class) | A `ThermalMachine` that adds persistent heat and custom upgrade perks. |
| [Ports and Link Nodes](./ports-link-nodes) | Item, liquid, gas, and energy ports that activate with a multiblock. |
| [Multiblock Machines](./multiblocks) | A wrench-activated Factory Crusher with casing validation, internal components, energy, progress, ports, and teardown. |

Start with [Create an Addon Core](./addon-core).

