---
id: intro
title: DoriosLib documentation
sidebar_label: Overview
sidebar_position: 1
description: Use the shared Dorios utility library for blocks, entities, items, containers, dependency discovery, registries, link nodes, messages, math, text, time, and JSON.
keywords:
  - DoriosLib
  - UtilityCraft
  - Minecraft Bedrock scripting
  - addon library
---

<div class="dc-hero">
  <p class="dc-eyebrow">DORIOS ADDON DEVELOPMENT</p>
  <h1>DoriosLib</h1>
  <p class="dc-lead">The general-purpose library shared by UtilityCraft and Dorios addons. Work with blocks, inventories, items, dependency discovery, cross-addon registries, link nodes, commands, messages, time, math, text, and safe JSON through one stable public entry point.</p>
  <div class="dc-actions">
    <a class="button button--primary button--lg" href="./getting-started">Get started</a>
    <a class="button button--secondary button--lg" href="./API/">Browse the API</a>
  </div>
</div>

:::info Stable public entry point
Import DoriosLib as one namespace from `DoriosLib/index.js`. Deep imports from its internal folders are not part of the supported addon API.
:::

```js
import * as DoriosLib from "DoriosLib/index.js";

const label = DoriosLib.text.formatIdentifier("minecraft:diamond_sword");
const inventory = DoriosLib.entity.getInventory(player);
```

## What is DoriosLib?

DoriosLib is the shared JavaScript foundation used across Dorios Studios projects. It standardizes common operations that otherwise become duplicated and subtly incompatible between addons: safe inventory access, component registration, dependency discovery, cross-addon payload dispatch, block helpers, link-node resolution, messages, item construction, and utility functions.

It is correct to call its public surface an **API**. In this documentation, API means the namespaces, functions, constants, and type contracts that addon scripts can consume. DoriosLib is not an HTTP service and does not make web requests.

<div class="dc-card-grid">
  <article class="dc-card">
    <span class="dc-card-kicker">FOUNDATION</span>
    <h3>Blocks, entities, items, and players</h3>
    <p>Read states, resolve facing, manage inventories, health and equipment, create item stacks, apply durability, and safely give items.</p>
  </article>
  <article class="dc-card">
    <span class="dc-card-kicker">AUTOMATION</span>
    <h3>Containers and link nodes</h3>
    <p>Resolve inventories behind blocks or entities, enforce item IO policies, move stacks, and route physical multiblock ports to logical owners.</p>
  </article>
  <article class="dc-card">
    <span class="dc-card-kicker">INTEGRATION</span>
    <h3>Registries and dependencies</h3>
    <p>Register components, commands, UtilityCraft content, and addon metadata through stable cross-addon protocols.</p>
  </article>
  <article class="dc-card">
    <span class="dc-card-kicker">UTILITIES</span>
    <h3>Math, messages, text, time, and JSON</h3>
    <p>Use consistent formatting, scheduling, safe serialization, random helpers, coordinates, duration formatting, and player messaging.</p>
  </article>
</div>

## Responsibilities

| Project | Responsibility |
| --- | --- |
| **DoriosLib** | General Dorios utilities, startup registries, dependency discovery, item containers, and link-node infrastructure. |
| **DoriosCore** | Machinery runtime: machines, generators, energy, indexed liquids and gases, machinery IO, upgrades, scheduling, and multiblocks. |
| **UtilityCore** | UtilityCraft-owned gameplay systems, including machinery networks. |
| **Your addon** | Concrete gameplay behavior, content definitions, registrations, and addon-specific reusable systems. |

DoriosLib does not replace DoriosCore, and DoriosCore does not replace DoriosLib. A UtilityCraft extension normally uses both.

## Requirements

- A Minecraft Bedrock project using the Script API version supported by UtilityCraft.
- UtilityCraft **3.5.0 or newer** enabled in the world.
- The `DoriosLib` alias resolved by the project's build or Regolith configuration.
- `@minecraft/server` types when editor IntelliSense or type checking is required.

The [UtilityCraft Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template) provides a functional project with the correct dependency aliases, load order, registrations, machines, fluids, gases, UI, and multiblocks.

## Keep the library read-only

Addons consume DoriosLib; they do not patch it. Put addon-owned helpers in your own folder and import the public namespace where needed.

```text
BP/scripts/
├─ DoriosLib/          # Shared dependency: do not modify
├─ DoriosCore/         # Machinery dependency: do not modify
├─ MYADDON_CORE/       # Addon-owned reusable behavior
├─ config/             # Registrations and data
├─ features/           # Concrete gameplay features
└─ main.js             # Explicit startup order
```

## Recommended learning path

1. Follow [Get started](./getting-started) for imports, initialization, and load order.
2. Read [Library boundaries](./library-boundaries) before creating addon-owned wrappers or protocols.
3. Browse the [API overview](./API/) to choose the correct namespace.
4. Open the namespace page for complete signatures, parameter rules, return values, and examples.
5. Compare production use with [UtilityCraft](https://github.com/DoriosStudios/UtilityCraft) and the focused [Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template).

## API at a glance

| Namespace | Use it for |
| --- | --- |
| [`block`](./API/block) | Block states, facing, adjacency, entity lookup, and type checks. |
| [`container`](./API/container) | Item IO documents, resolution, insertion, and transfers. |
| [`entity`](./API/entity) | Inventories, health, and equipment. |
| [`item`](./API/item) | ItemStack creation, type checks, durability, and Unbreaking-aware damage. |
| [`linkNode`](./API/link-node) | Physical port resolution and per-port item, liquid, or gas IO overrides. |
| [`registry`](./API/registry) | UtilityCraft payloads, custom components, and custom commands. |
| [`dependencies`](./API/dependencies) | Addon discovery and minimum-version validation. |
| [`math`](./API/math), [`text`](./API/text), [`time`](./API/time), [`utils`](./API/utils) | General reusable helpers. |

The [complete API reference](./API/) tracks **186 runtime paths** and **43 type-only contracts** from the current `DoriosLib/index.js` declaration.
