---
id: getting-started
title: Get started with DoriosCore
sidebar_label: Get started
sidebar_position: 2
description: Set up a UtilityCraft extension, load DoriosCore correctly, and use a Machine runtime for the first time.
---

# Get started with DoriosCore

This guide explains the minimum project boundary and runtime pattern required to consume DoriosCore safely. Use the [UtilityCraft Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template) when you need complete behavior-pack, resource-pack, UI, entity, and Regolith files.

## Prerequisites

- UtilityCraft 3.5.0 or newer.
- A behavior pack with scripting enabled.
- DoriosLib and DoriosCore resolved as library aliases.
- Familiarity with Minecraft Bedrock custom components and `@minecraft/server`.

## Import the public entry point

Load DoriosCore once from your script entry point before installing DoriosLib registrations:

```js title="BP/scripts/main.js"
// Loads the public API and initializes DoriosCore listeners and services.
import "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

// Addon-owned registrations and concrete implementations.
import "ADDONNAME_CORE/index.js";
import "./config/index.js";
import "./machines/index.js";

// Install registrations after every module has declared its data.
DoriosLib.registry.install();
DoriosLib.container.initialize();
DoriosLib.linkNode.initializeLinkNodeIO();
```

Import only the members used by each module:

```js
import { Machine, registerIOInterface } from "DoriosCore/index.js";
```

Do not import internal paths such as `DoriosCore/machinery/machine.js`. The root entry point is the supported compatibility boundary.

## Machine lifecycle

A normal machine has two distinct phases:

1. **Placement:** `Machine.spawnEntity()` creates and initializes the helper entity associated with the block.
2. **Runtime ticks:** `new Machine(block, settings)` resolves that entity and exposes storage, inventory, upgrades, progress, UI, and IO helpers.
3. **Destruction:** `Machine.onDestroy()` releases scheduler state and preserves supported resources and inventory correctly.

The constructor can intentionally produce an invalid wrapper when the scheduler skips the current tick or required runtime state is unavailable. Always check `valid` before accessing the remaining runtime properties.

```js
import { Machine } from "DoriosCore/index.js";

function onMachineTick(block, settings) {
  const machine = new Machine(block, settings);
  if (!machine.valid) return;

  // Runtime properties are ready after the validity guard.
  machine.processIO();
  machine.displayEnergy();
  machine.displayProgress();
}
```

:::warning Required guard
`if (!machine.valid) return;` is part of the runtime contract. Do not treat an invalid wrapper as a broken machine; it commonly means this scheduler group should not process on the current tick.
:::

## Register face IO

`registerIOInterface()` defines which inventory slots are inputs and outputs and adds one configurable control for each block face. `buttonSlots` must resolve to exactly six valid container slots.

```js
import { registerIOInterface } from "DoriosCore/index.js";

const BLOCK_ID = "myaddon:crusher";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;

registerIOInterface(BLOCK_ID, {
  items: {
    // Inclusive range: 9, 10, 11, 12, 13, 14.
    buttonSlots: [9, 14],
    anyInputSlots: [INPUT_SLOT],
    anyOutputSlots: [OUTPUT_SLOT],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputSlots: [INPUT_SLOT] },
      { id: "output_1", outputSlots: [OUTPUT_SLOT] },
    ],
  },
});
```

The mode IDs must match the UI textures and translations supplied by UtilityCraft. Use actual supported IDs such as `disabled`, `input_1`, and `output_1`; do not invent arbitrary mode names.

## Place, tick, and destroy

The following custom-component callbacks show where the DoriosCore lifecycle calls belong. The exact registration wrapper and `settings` payload are supplied by your block component system.

```js
import { Machine } from "DoriosCore/index.js";

const crusherComponent = {
  beforeOnPlayerPlace(event, { params: settings }) {
    Machine.spawnEntity(event, settings, () => {
      // ignoreTick is useful only for immediate placement initialization.
      const machine = new Machine(event.block, {
        ...settings,
        ignoreTick: true,
      });

      if (!machine.valid) return;
      machine.setEnergyCost(settings.machine.energy_cost);
      machine.displayProgress();
      machine.displayEnergy();
    });
  },

  onTick({ block }, { params: settings }) {
    const machine = new Machine(block, settings);
    if (!machine.valid) return;

    machine.processIO();

    // Your addon validates inputs and completes its own recipe here.
    machine.showStatus("Ready");
    machine.displayProgress();
    machine.displayEnergy();
  },

  onPlayerBreak(event) {
    Machine.onDestroy(event);
  },
};
```

`Machine` provides the machinery runtime; your addon remains responsible for its recipe rules and item mutations when using a scripted process.

## Understand rates and scheduling

DoriosCore spreads closed-machine work across scheduler groups. `BasicMachine` converts the configured base rate into an effective rate for the current processing interval:

```text
effective rate = base rate × processing interval
```

Use `machine.rate` for work performed only on valid ticks. This keeps results consistent when the scheduler profile changes or when an open UI uses a shorter interval.

## Next steps

- [Extend DoriosCore](./extend-dorios-core) with addon-owned mechanics.
- Read the [`Machine` reference](./API/machine) for every property and method.
- Read the [`registerIOInterface` reference](./API/io-interface) for items, liquids, gases, and supported mode definitions.
- Study the [Thermal Crusher example](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/machines/thermalCrusher.js) for a complete scripted process with progress, energy, upgrades, UI, and IO.

