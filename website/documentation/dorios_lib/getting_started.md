---
id: getting-started
title: Get started with DoriosLib
sidebar_label: Get started
sidebar_position: 2
description: Import DoriosLib, register addon content, install startup services, and use its shared helpers safely.
---

# Get started with DoriosLib

DoriosLib is exposed as a namespace object. Import it once wherever a module needs its helpers:

```js
import * as DoriosLib from "DoriosLib/index.js";
```

Do not use deep paths such as `DoriosLib/entity/index.js`. The root entry point is the compatibility boundary and guarantees that namespaces keep their documented shape.

## Suggested entry-point order

Registration definitions must be collected during initial script evaluation. Install the shared registry only after every module that registers components or commands has loaded.

```js title="BP/scripts/main.js"
import * as DoriosLib from "DoriosLib/index.js";

// These modules synchronously add definitions to DoriosLib.registry.
import "./config/registrations.js";
import "./features/exampleBlock.js";
import "./features/exampleItem.js";

// Installs collected components and commands during Script API startup.
DoriosLib.registry.install();

// These services own after-event listeners and may be initialized explicitly.
DoriosLib.container.initialize();
DoriosLib.linkNode.initializeLinkNodeIO();
```

:::warning Install only after defining registrations
Calling `DoriosLib.registry.install()` closes the shared registry. Adding another block component, item component, or command afterward throws an error.
:::

Importing the root also initializes dependency discovery for the installed UtilityCraft metadata. Calling `dependencies.initialize()` is still appropriate when your own addon must announce separate metadata.

## Register a custom component

Use a fully qualified identifier with the shared registrar:

```js title="BP/scripts/features/exampleBlock.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.blockComponent("example:inspectable", {
  onPlayerInteract({ block, player }) {
    const facing = DoriosLib.block.getFacingVector(block);
    DoriosLib.messages.send(
      player,
      `§r§7Facing vector: §f${JSON.stringify(facing)}`,
    );
  },
});
```

The block JSON must reference the same component ID. DoriosLib registers the script handler; it does not add the component to the block definition automatically.

## Register UtilityCraft content

Payload registries queue serialized data and dispatch it after world load. The payload schema belongs to the corresponding UtilityCraft feature.

```js title="BP/scripts/config/fuels.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerFuel({
  "example:compressed_biomass": 1600,
});
```

The helper validates that the top-level payload is an object and JSON serializable. Feature-specific validation happens in UtilityCraft when it receives the registration.

## Work with an entity inventory

```js
const result = DoriosLib.entity.tryAddItem(machineEntity, {
  item: "minecraft:iron_ingot",
  amount: 4,
  dropRemainder: false,
});

if (result.remainder) {
  console.warn(`${result.remainder.amount} items did not fit`);
}
```

`tryAddItem` clones supplied stacks, reports the inserted amount, and leaves overflow in `result.remainder` unless `dropRemainder` is enabled.

## Resolve an automation container

```js
const target = DoriosLib.container.resolveAt(block.dimension, block.location);

if (target) {
  const inserted = DoriosLib.container.insert(target, {
    item: DoriosLib.item.create({
      typeId: "minecraft:cobblestone",
      amount: 16,
    }),
    face: "up",
  });
}
```

Resolution supports vanilla block inventories, compatible entities, raw `Container` objects, and item-capable physical link-node blocks. IO rules determine which slots are available from the supplied face.

## Announce your addon

```js
const stopValidation = DoriosLib.dependencies.initialize(
  {
    name: "Example Machines",
    identifier: "example_machines",
    version: "1.0.0",
    author: "Example Studio",
    dependencies: {
      utilitycraft: {
        name: "UtilityCraft",
        version: "3.5.0",
        warning: "Install or update UtilityCraft before using this addon.",
      },
    },
  },
  { announceSuccess: true },
);
```

The returned function removes this local addon from future validation. It does not uninstall the shared event listeners.

## Error-handling conventions

DoriosLib uses three styles deliberately:

| Style | Examples | Meaning |
| --- | --- | --- |
| Safe fallback | `block.getState`, `entity.getInventory`, `container.resolve` | Returns `undefined`, `false`, `0`, or an empty array when absence is expected. |
| Explicit result | `utils.json.tryParse`, `entity.tryAddItem` | Returns a discriminated result that preserves failure or overflow information. |
| Throws for invalid configuration | `item.create`, `math.clamp`, registry definitions | Treats programmer/configuration mistakes as errors so they are visible during development. |

Read each reference method's return and remarks before deciding whether a `try/catch` is appropriate.

## Next steps

- [Library boundaries](./library-boundaries)
- [API overview](./API/)
- [Container API](./API/container)
- [Registry API](./API/registry)
- [UtilityCraft Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template)
