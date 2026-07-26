---
title: Create an Addon Core
sidebar_position: 2
description: Rename ExampleCore and expose reusable addon-owned classes and helpers through one public entry point.
---

# Create an Addon Core

An addon core is an ordinary script folder owned by your extension. It centralizes behavior shared by several machines without changing DoriosCore.

The template calls this folder `ExampleCore` so its purpose is visible. Rename it for a real project, for example:

```text
ExampleCore       -> MYADDON_CORE
ThermalMachine    -> keep this name or choose an addon-specific class name
```

`MYADDON_CORE` is a naming convention, not another required dependency. It is compiled and distributed as part of your Behavior Pack.

## What belongs in it

| Put in the addon core | Keep in a concrete feature folder |
| --- | --- |
| Classes reused by multiple addon machines | One block's component registration |
| Addon-wide processing helpers | One machine's recipe table |
| Shared formulas and validation | Block, item, and entity JSON |
| Addon-owned storage mechanics | UI JSON and localization |
| Small public exports | Registrations that must run at startup |

Registration modules normally stay outside the core because importing a class should not unexpectedly register blocks or content.

## 1. Create the folder structure

Use the template structure as a starting point:

```text title="BP/scripts/MYADDON_CORE"
MYADDON_CORE/
├── index.js
├── README.md
├── machinery/
│   ├── ThermalMachine.js
│   └── MyGasGenerator.js
└── processing/
    ├── processCycle.js
    └── recipeTemplates.js
```

The folder name should be unique enough that it cannot be confused with DoriosCore. Do not rename or replace the `BP/scripts/DoriosCore` dependency folder.

## 2. Define one public entry point

Only export modules intended for other addon scripts:

```js title="BP/scripts/MYADDON_CORE/index.js"
export * from "./machinery/ThermalMachine.js";
export * from "./machinery/MyGasGenerator.js";
export * from "./processing/processCycle.js";
export * from "./processing/recipeTemplates.js";
```

This gives concrete machines one stable import path:

```js
import { ThermalMachine, advanceProcessCycle } from "../../MYADDON_CORE/index.js";
```

The relative path depends on where the importing file is located. DoriosCore remains a package import because Regolith exposes it as a dependency:

```js
import { Machine } from "DoriosCore/index.js";
```

## 3. Document the boundary

Add a short README that tells future contributors where changes belong:

```md title="BP/scripts/MYADDON_CORE/README.md"
# MYADDON_CORE

This folder contains reusable behavior owned by this addon.

- Classes may extend public exports from `DoriosCore/index.js`.
- Helpers may use public exports from `DoriosLib/index.js`.
- Concrete blocks and registrations stay in their feature folders.
- DoriosCore and DoriosLib are read-only dependencies.
```

This is especially useful when the project is used as a team template.

## 4. Update imports after renaming

Find every old folder reference:

```powershell
rg "ExampleCore" BP/scripts
```

Then update only your addon imports. A template path such as:

```js
import { ThermalMachine } from "../../ExampleCore/index.js";
```

becomes:

```js
import { ThermalMachine } from "../../MYADDON_CORE/index.js";
```

Do not change imports like `DoriosCore/index.js` or `DoriosLib/index.js`.

## 5. Keep startup explicit

The Behavior Pack entry point should load registrations and concrete examples deliberately:

```js title="BP/scripts/main.js"
import "./config/index.js";
import "./examples/index.js";
```

Concrete modules can import classes from `MYADDON_CORE`, but `main.js` does not need to import the core by itself. An exported class has no startup effect until another module uses it.

## Dependency direction

Keep imports flowing in one direction:

```text
main.js
  -> config and feature modules
       -> MYADDON_CORE
            -> DoriosCore and DoriosLib public entry points
```

Avoid importing concrete feature modules back into `MYADDON_CORE`. That circular dependency makes initialization order harder to understand and can run registrations before their configuration is ready.

## Checklist

- The addon-owned folder has a project-specific name.
- `index.js` exports only reusable public modules.
- Concrete block registration stays outside the core.
- Imports from the core use a correct relative path.
- DoriosCore imports always use `DoriosCore/index.js`.
- DoriosLib imports always use `DoriosLib/index.js`.
- No shared dependency file was modified.

Continue with [Create a Custom Machine Class](./custom-machine-class).

