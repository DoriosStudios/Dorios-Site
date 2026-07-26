---
id: library-boundaries
title: DoriosLib boundaries and ownership
sidebar_label: Library boundaries
sidebar_position: 3
description: Understand what DoriosLib owns, what belongs to DoriosCore or UtilityCore, and where addon-specific code should live.
---

# DoriosLib boundaries and ownership

DoriosLib is designed to be consumed unchanged. Its value comes from every enabled Dorios addon using the same contracts instead of shipping incompatible copies of common infrastructure.

## What DoriosLib owns

- General helpers for blocks, entities, items, players, text, time, math, messages, and JSON.
- Generic item-container resolution and item IO documents.
- Physical link-node discovery and per-port item, liquid, or gas selections.
- Shared startup registration for custom block components, item components, and commands.
- Serialized registration dispatch to UtilityCraft-owned registries.
- Addon metadata discovery and minimum-version validation.

## What it does not own

| System | Owner | Use instead |
| --- | --- | --- |
| Machine processing lifecycle | DoriosCore | `Machine`, `Generator`, storage wrappers, and machinery IO. |
| Energy, liquid, and gas storage implementations | DoriosCore | `EnergyStorage`, `FluidStorage`, and `GasStorage`. |
| Machinery networks | UtilityCore | UtilityCore's network APIs and components. |
| Recipe payload schemas | UtilityCraft feature registries | The corresponding UtilityCraft registration reference. |
| Your heat, pressure, purity, radiation, or custom gameplay | Your addon | An addon-owned module such as `MYADDON_CORE`. |

DoriosLib may carry registration payloads or expose link-node data used by these systems without owning their complete behavior.

## Wrap; do not patch

If your addon wants a convenience helper, write it outside DoriosLib:

```js title="BP/scripts/MYADDON_CORE/inventory.js"
import * as DoriosLib from "DoriosLib/index.js";

export function consumeInputs(entity, requirements) {
  for (const [typeId, amount] of Object.entries(requirements)) {
    if (!DoriosLib.entity.hasItem(entity, typeId, amount)) return false;
  }

  for (const [typeId, amount] of Object.entries(requirements)) {
    DoriosLib.entity.removeItem(entity, typeId, amount);
  }

  return true;
}
```

This preserves the shared dependency while giving your project a clear place for policy that DoriosLib should not impose.

## Public paths only

Supported:

```js
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.entity.getInventory(entity);
```

Unsupported:

```js
// Do not couple addon code to the library's internal file layout.
import { getInventory } from "DoriosLib/entity/index.js";
```

The namespace import also makes ownership visible at every call site and prevents collisions between generic names such as `create`, `get`, `send`, or `initialize`.

## Startup ownership

Some modules are pure helpers; others install listeners or queue work.

| Operation | Effect |
| --- | --- |
| Import `DoriosLib/index.js` | Exposes namespaces and initializes UtilityCraft's dependency announcement. |
| `registry.install()` | Subscribes collected component and command definitions to Script API startup. |
| `container.initialize()` | Installs item IO update and entity-cache cleanup listeners. |
| `linkNode.initializeLinkNodeIO()` | Installs per-port IO update and cleanup listeners. |
| `dependencies.initialize(metadata)` | Adds another local addon to discovery and delayed validation. |

Initialization methods are idempotent: they return `false` when already active. Their matching shutdown methods are primarily useful for controlled tests or runtime teardown.

## Compatibility rules

1. Treat the installed `DoriosLib` folder as read-only.
2. Import through `DoriosLib/index.js`.
3. Use documented registries rather than manually duplicating script-event IDs.
4. Keep registrations JSON serializable.
5. Use exact namespaces and fully qualified component/command identifiers.
6. Store addon-specific abstractions in your own core folder.
7. Do not describe DoriosLib as the owner of UtilityCore networks or DoriosCore machinery.
