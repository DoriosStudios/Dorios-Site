---
id: intro
title: DoriosCore documentation
sidebar_label: Overview
sidebar_position: 1
description: Build UtilityCraft-compatible machines, generators, storage, IO interfaces, upgrades, and multiblocks with the public DoriosCore API.
keywords:
  - DoriosCore
  - UtilityCraft
  - Minecraft Bedrock scripting
  - machinery API
---

<div class="dc-hero">
  <p class="dc-eyebrow">UTILITYCRAFT DEVELOPMENT</p>
  <h1>DoriosCore</h1>
  <p class="dc-lead">The machinery library shared by UtilityCraft and its extensions. Build compatible machines, generators, resource storage, configurable IO, upgrades, and multiblocks without changing the Core.</p>
  <div class="dc-actions">
    <a class="button button--primary button--lg" href="./getting-started">Get started</a>
    <a class="button button--secondary button--lg" href="./API/">Browse the API</a>
  </div>
</div>

:::info Stable public entry point
Every addon imports DoriosCore from `DoriosCore/index.js`. Imports from internal files are not part of the supported API.
:::

```js
import { Machine, EnergyStorage, registerIOInterface } from "DoriosCore/index.js";
```

## What is DoriosCore?

DoriosCore is a JavaScript library for Minecraft Bedrock machinery addons. It supplies the common runtime used to create machines and generators that follow the same lifecycle and storage rules as UtilityCraft.

It is appropriate to call this an **API**: the term refers to the public classes, functions, constants, and type contracts that addon scripts can use. It is not a web API and it does not make HTTP requests.

<div class="dc-card-grid">
  <article class="dc-card">
    <span class="dc-card-kicker">MACHINERY</span>
    <h3>Machines and generators</h3>
    <p>Use runtime wrappers with scheduling, progress, energy, inventories, UI labels, preserved resources, and safe placement and destruction.</p>
  </article>
  <article class="dc-card">
    <span class="dc-card-kicker">RESOURCES</span>
    <h3>Energy, liquids, and gases</h3>
    <p>Store large values, create multiple indexed tanks, render resource displays, and transfer resources between compatible containers.</p>
  </article>
  <article class="dc-card">
    <span class="dc-card-kicker">CONFIGURATION</span>
    <h3>IO and upgrades</h3>
    <p>Expose six-face item, liquid, and gas controls and consume standard or addon-defined upgrade perks in your own processing logic.</p>
  </article>
  <article class="dc-card">
    <span class="dc-card-kicker">STRUCTURES</span>
    <h3>Multiblocks</h3>
    <p>Detect structures, activate controllers, calculate component-based stats, route through ports, and restore blocks during deactivation.</p>
  </article>
</div>

## Responsibilities

Understanding the library boundary prevents incompatible addons and duplicated systems.

| Project | Responsibility |
| --- | --- |
| **DoriosLib** | Global Dorios utilities and registries used across different projects. |
| **DoriosCore** | Machinery runtime: machine classes, resource storage, IO documents, UI interfaces, upgrades, scheduling, rotation, and multiblocks. |
| **UtilityCore** | UtilityCraft-owned systems, including machinery networks. DoriosCore does **not** own the networks. |
| **Your addon core** | Custom reusable behavior that extends DoriosCore, such as heat, pressure, radiation, or a specialized recipe cycle. |

## Requirements

- A Minecraft Bedrock project using the Script API versions supported by the current UtilityCraft manifest.
- **UtilityCraft 3.5.0 or newer** enabled in the world.
- DoriosLib and DoriosCore available through UtilityCraft.
- A script bundler or Regolith configuration that resolves the public library aliases.

For a working starting point, clone the [UtilityCraft Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template). It includes functional blocks, entities, screens, IO, upgrades, liquids, gases, generators, and multiblocks.

## Library boundary

Treat the `DoriosCore` and `DoriosLib` dependency folders as read-only. Addons consume them; they do not patch them.

```text
BP/scripts/
├─ DoriosCore/          # Dependency: do not modify
├─ DoriosLib/           # Dependency: do not modify
├─ ADDONNAME_CORE/      # Your reusable subclasses and systems
├─ config/              # Registrations and shared data
├─ examples/            # Concrete blocks and gameplay behavior
└─ main.js              # Load order and initialization
```

When behavior does not belong in the shared machinery library, extend a public class in `ADDONNAME_CORE`:

```js
// BP/scripts/MYADDON_CORE/ThermalMachine.js
import { Machine } from "DoriosCore/index.js";

export class ThermalMachine extends Machine {
  getHeat() {
    return Number(this.entity.getDynamicProperty("myaddon:heat") ?? 0);
  }

  setHeat(value) {
    this.entity.setDynamicProperty("myaddon:heat", Math.max(0, value));
  }
}
```

See [Extend DoriosCore](./extend-dorios-core) for the complete pattern and rules.

## Recommended learning path

1. Follow [Get started](./getting-started) to understand load order and create a machine runtime safely.
2. Read [Machine lifecycle](./getting-started#machine-lifecycle) before implementing processing logic.
3. Learn [how to extend DoriosCore](./extend-dorios-core) without editing library code.
4. Browse the [complete API surface](./API/) and open the reference page for the system you need.
5. Compare your implementation with the public examples in the [Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template), [UtilityCraft](https://github.com/DoriosStudios/UtilityCraft), and [Heavy Machinery](https://github.com/DoriosStudios/UtilityCraft-Heavy-Machinery).

## API at a glance

| Area | Start with | Use it for |
| --- | --- | --- |
| Runtime | [`Machine`](./API/machine), [`Generator`](./API/generator) | Normal processing machines and energy generators. |
| Storage | [`EnergyStorage`](./API/energy-storage), [`FluidStorage`](./API/fluid-storage), `GasStorage` | Energy, liquid, and gas capacity and transfer. |
| IO | `registerIOInterface`, `IOInterface` | Six-face input/output configuration for items and indexed resources. |
| Upgrades | `MachineUpgradeRegistry` | Standard perks such as `speed`, `energy_cost`, `energy_efficiency`, and `process_batch`, plus addon-owned perks. |
| Runtime helpers | [`TickScheduler`](./API/tick-scheduler), [`OutputTracker`](./API/output-tracker), [`Rotation`](./API/rotation) | Efficient ticks, cached outputs, and block orientation. |
| Multiblocks | [`Multiblock`](./API/multiblock), `MultiblockMachine`, `MultiblockGenerator` | Component-based structures and controller runtimes. |

The [API reference](./API/) lists all **103 runtime exports** and **93 type-only contracts** currently exposed by `DoriosCore/index.js`.

## Source and examples

These documentation examples describe how to use the public API. They do not mirror private file locations or require consumers to understand DoriosCore internals.

- [UtilityCraft Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template) — recommended starting project and focused examples.
- [UtilityCraft](https://github.com/DoriosStudios/UtilityCraft) — production machinery implementations.
- [UtilityCraft Heavy Machinery](https://github.com/DoriosStudios/UtilityCraft-Heavy-Machinery) — multiblock controllers, components, and ports.
