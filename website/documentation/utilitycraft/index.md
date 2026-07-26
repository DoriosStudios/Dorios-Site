---
id: utilitycraft-documentation
title: Create UtilityCraft Extensions
sidebar_label: UtilityCraft Extensions
sidebar_position: 3
pagination_prev: null
description: Learn to create UtilityCraft machines, generators, integrations, and addon-owned systems with DoriosLib and DoriosCore.
---

# Create UtilityCraft Extensions

Build your own UtilityCraft extension one working feature at a time. This learning path starts with the official addon template and gradually introduces scripted machines, energy, UI, IO, upgrades, recipes, fluids, gases, generators, reusable components, and advanced machinery.

You do not need to understand UtilityCraft's private implementation. The examples use only the public DoriosLib and DoriosCore entry points that an extension is expected to use.

[Open the UtilityCraft Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template)

:::tip New to addon scripting?
Start at [Getting Started](./getting-started/). It explains every required pack, how to download the project, how to run it with or without Regolith, and which folders you are expected to edit.
:::

## The three parts of an extension

| Part | Responsibility |
| --- | --- |
| **Your addon** | Owns its blocks, items, entities, textures, recipes, scripts, namespace, and custom mechanics. |
| **DoriosLib** | Provides shared helpers and the public registries used to register components and UtilityCraft integrations. |
| **DoriosCore** | Provides the machinery-focused classes and systems used by machines, generators, storage, IO, ports, and interfaces. |

UtilityCraft supplies the runtime and shared assets expected by the template. UtilityCore owns networks; DoriosCore does not.

## What you will learn

The documentation is organized as a progressive course:

1. Prepare and run the official template.
2. Build a small scripted machine.
3. Give the machine a standard UtilityCraft UI and progress display.
4. Configure item, liquid, and gas IO.
5. Register and apply machine upgrades.
6. Add content to UtilityCraft registries through DoriosLib.
7. Reuse existing block and item components.
8. Create passive and active generators.
9. Move reusable addon behavior into an addon-owned core.
10. Build ports and multiblock machinery.

## Documentation map

| Section | Goal | Status |
| --- | --- | --- |
| [Getting Started](./getting-started/) | Install, inspect, and run the template safely. | Available |
| [Your First Machine](./first-machine/) | Build a complete beginner-friendly scripted machine. | Planned |
| [Machine UI](./machine-ui/) | Add slots, labels, progress, and standard tabs. | Planned |
| [Machine IO](./machine-io/) | Configure faces and item, liquid, and gas routing. | Planned |
| [Machine Upgrades](./machine-upgrades/) | Register and consume standard and addon-owned perks. | Planned |
| [UtilityCraft Registries](./registries/) | Register recipes, resources, plants, fuels, and drops with DoriosLib. | Planned |
| [Reusable Components](./reusable-components/) | Use existing block and item components correctly. | Planned |
| [Generators](./generators/) | Create passive, fuel, liquid, and gas generators. | Planned |
| [Advanced Examples](./advanced/) | Extend DoriosCore safely and build multiblocks and ports. | Planned |
| [Machine UI Core](./ui_core/) | Look up every shared `@uc.*` JSON UI element. | Reference available |

## Rules followed throughout this course

- Import DoriosCore only from `DoriosCore/index.js`.
- Import DoriosLib only from `DoriosLib/index.js`.
- Treat the template's `BP/scripts/DoriosCore` and `BP/scripts/DoriosLib` folders as read-only dependencies.
- Put reusable addon-owned code in an addon-owned core such as `MYADDON_CORE`.
- Keep concrete blocks, registrations, and examples outside DoriosCore.
- Use a unique namespace and unique manifest UUIDs for a real addon.
- Validate every example against the current UtilityCraft Addon Template.

Continue with [Getting Started](./getting-started/).
