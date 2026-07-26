---
id: project-structure
title: Understand the Project Structure
sidebar_label: Understand the project structure
sidebar_position: 5
description: Learn where addon scripts, registrations, blocks, entities, UI, resources, types, and build tooling belong.
---

# Understand the Project Structure

The template is intentionally larger than one machine example. A working UtilityCraft extension needs both packs, shared libraries, addon-owned scripts, resource definitions, UI routing, and validation tools.

## Root structure

```text
UtilityCraft-Addon-Template/
├── BP/                 Behavior Pack source
├── RP/                 Resource Pack source
├── data/               Regolith project data
├── docs/               Template-specific implementation notes
├── tools/              Build and validation scripts
├── types/              Editor types for public libraries
├── build/              Generated complete pack exports
├── dist/               Generated script-only bundle
├── config.json         Regolith project and profiles
├── jsconfig.json       JavaScript checking and import aliases
├── package.json        Validation and bundle commands
└── README.md           Repository overview
```

Edit source files under `BP`, `RP`, and the relevant root configuration. Do not edit generated output under `build`, `dist`, or `.regolith`; the next build can replace it.

## Behavior Pack

```text
BP/
├── blocks/             Block definitions
├── entities/           Machine helpers, resources, and multiblock entities
├── functions/          Test functions such as example/kit
├── items/              Tools, upgrades, capsules, and UI display items
├── item_catalog/       Creative inventory organization
├── loot_tables/        Loot used by examples
├── recipes/            Normal Minecraft crafting recipes
├── scripts/
│   ├── DoriosCore/     Read-only machinery library snapshot
│   ├── DoriosLib/      Read-only shared library snapshot
│   ├── ExampleCore/    Reusable code owned by this addon
│   ├── config/         Registrations sent to UtilityCraft
│   ├── examples/       Concrete blocks and runtime examples
│   └── main.js         Script entry and initialization order
└── manifest.json       BP identity, script module, APIs, and dependencies
```

### `scripts/main.js`

The entry point establishes the order in which the project starts:

```js
import "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

import "ExampleCore/index.js";
import "./config/index.js";
import "./examples/index.js";

DoriosLib.registry.install();
DoriosLib.container.initialize();
DoriosLib.linkNode.initializeLinkNodeIO();
```

Registrations are imported before `DoriosLib.registry.install()` is called. This lets every module declare its block components, item components, and integration payloads before the registry installs them.

### `scripts/config`

This folder contains data registered into public UtilityCraft systems, including recipes, upgrades, fluids, gases, fuels, loot, plants, and related integrations.

Use DoriosLib from its public root:

```js
import * as DoriosLib from "DoriosLib/index.js";
```

### `scripts/examples`

This folder contains concrete runtime behavior:

- component-driven utility blocks;
- scripted machines;
- passive and active generators;
- agriculture examples;
- multiblock controllers and ports.

When creating a real addon, rename this organizational layer if a different name makes its purpose clearer.

### `scripts/ExampleCore`

`ExampleCore` demonstrates reusable logic owned by the extension, including custom subclasses based on public DoriosCore classes.

For a real project:

1. Rename it to something explicit such as `MYADDON_CORE`.
2. Update its alias in `config.json`, `jsconfig.json`, `tools/bundle.mjs`, and `tools/regolith-bundle.mjs`.
3. Import only your own public files from concrete machine scripts.

Never place addon behavior inside `DoriosCore` or `DoriosLib`.

## Resource Pack

```text
RP/
├── entity/             Client entities for fluids, gases, and helpers
├── models/             Block geometries
├── texts/              Language files and language list
├── textures/           Block, item, entity, and UI textures
├── ui/
│   ├── _ui_defs.json   Registers addon-owned UI files
│   ├── chest_screen.json
│   └── example_machinery.json
├── blocks.json         Block sound and visual registration
└── manifest.json       RP identity and dependencies
```

The addon does not copy UtilityCraft's `ui_core.json`. Its own UI files reference shared controls directly with names such as `@uc.machine_name`, `@uc.energy_bar`, and `@uc.io_tab`.

Use the [Machine UI Core reference](../ui_core/) when a UI tutorial asks you to select or configure a shared control.

## Types and editor support

```text
types/
├── DoriosCore/index.d.ts
└── DoriosLib/index.d.ts
```

These declarations help the editor understand public methods, parameters, and return values. They do not replace the runtime folders under `BP/scripts`.

`jsconfig.json` connects public import names to the corresponding declarations and addon-owned source folders.

## Build and verification tools

| File or command | Purpose |
| --- | --- |
| `config.json` | Regolith packs, compiler plugins, aliases, and build profiles. |
| `npm run check` | JavaScript type check plus resource and catalog verification. |
| `npm run verify:imports` | Rejects private or relative DoriosCore imports. |
| `tools/regolith-bundle.mjs` | Bundles scripts inside a Regolith build. |
| `tools/bundle.mjs` | Creates the standalone `dist/scripts/main.js` bundle. |
| `tools/generate-resource.ps1` | Scaffolds complete liquid or gas display resources. |

## Ownership rule

| Location | May your addon modify it? |
| --- | --- |
| `BP/scripts/DoriosCore` | No. Update the dependency as a complete library snapshot. |
| `BP/scripts/DoriosLib` | No. Update the dependency as a complete library snapshot. |
| `BP/scripts/ExampleCore` | Yes. Rename and develop it as addon-owned code. |
| `BP/scripts/config` | Yes. Own your registrations and payloads. |
| `BP/scripts/examples` | Yes. Replace examples with your actual content. |
| `BP/blocks`, `entities`, `items`, `recipes` | Yes. Use your own identifiers and definitions. |
| `RP` addon assets and UI files | Yes. Use your namespace and licensed assets. |
| `build`, `dist`, `.regolith` | No. These are generated outputs. |

## Ready for the first machine

You are ready to continue when you can answer:

- Which file starts the addon scripts?
- Where should a concrete machine component be registered?
- Where should a reusable custom machine class live?
- Which two library folders must remain unmodified?
- Which two pack folders must be enabled in the world?

The next course section, [Your First Machine](../first-machine/), will build on this structure.

