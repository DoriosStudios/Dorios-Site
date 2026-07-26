---
title: Register Its Component
sidebar_position: 3
description: Register an addon-owned block component with DoriosLib and load it before the registry is installed.
---

# Register Its Component

The block now refers to `utilitycraft:example_thermal_crusher`, but Minecraft does not know which JavaScript object implements that component. Register it through DoriosLib.

Open:

```text
BP/scripts/examples/machines/thermalCrusher.js
```

For this step, replace the advanced template script with the following minimal registration:

```js title="BP/scripts/examples/machines/thermalCrusher.js"
// @ts-check

import { Machine } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_thermal_crusher";

DoriosLib.registry.blockComponent(BLOCK_ID, {
  onTick({ block }, { params: settings }) {
    const machine = new Machine(block, settings);
    if (!machine.valid) return;

    // Recipe behavior is added after the helper entity exists.
  },
});
```

## Imports

```js
import { Machine } from "DoriosCore/index.js";
```

`Machine` provides access to the block's helper entity, inventory, energy, progress, state, labels, upgrades, and shared lifecycle methods.

Always import it from the public root. Do not import `DoriosCore/machinery/machine.js` or use a relative path into the library.

```js
import * as DoriosLib from "DoriosLib/index.js";
```

The `registry` namespace owns custom-component registration. Other DoriosLib namespaces will later provide safe inventory helpers.

## Register the exact component ID

```js
DoriosLib.registry.blockComponent(BLOCK_ID, definition);
```

`BLOCK_ID` must match the custom component key used in the block JSON. Registration is performed while the module loads; it is not repeated for every block.

## Event arguments

The tick handler receives two useful objects:

```js
onTick({ block }, { params: settings }) {}
```

| Value | Contains |
| --- | --- |
| `block` | The exact placed block receiving this tick. |
| `settings` | The `entity` and `machine` data written inside the custom block component. |

Construct a `Machine` for the current event only:

```js
const machine = new Machine(block, settings);
if (!machine.valid) return;
```

Do not keep a `Machine` instance in a global map. Blocks, entities, chunks, and scheduler groups can change between ticks. Constructing it again resolves the current shared entity and storage handles.

`machine.valid` can be false when:

- the helper entity does not exist yet;
- its inventory is not ready;
- the machine's scheduler group should not process during this event;
- the entity or block was removed.

Returning is normal and prevents code from accessing missing state.

## Load the module

Confirm the machine index contains:

```js title="BP/scripts/examples/machines/index.js"
import "./thermalCrusher.js";
```

That index is loaded by:

```js title="BP/scripts/examples/index.js"
import "./machines/index.js";
```

Finally, `BP/scripts/main.js` imports all definitions before installing the registry:

```js title="BP/scripts/main.js"
import "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

import "ExampleCore/index.js";
import "./config/index.js";
import "./examples/index.js";

DoriosLib.registry.install();
DoriosLib.container.initialize();
DoriosLib.linkNode.initializeLinkNodeIO();
```

:::warning Install once, after imports
Do not call `DoriosLib.registry.install()` inside `thermalCrusher.js`. Every component module registers its definition first, and the entry point installs the collected definitions once.
:::

The component is registered, but `new Machine()` cannot become valid until placement creates its helper entity. Continue with [Create the helper entity](./helper-entity).

