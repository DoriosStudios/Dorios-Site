---
id: intro
sidebar_label: Dorios Machinery Core
title: Dorios Machinery Core
---

# Dorios Machinery Core

**Dorios Machinery Core** is the shared scripting runtime used by UtilityCraft machinery and by addons that need compatible machines, generators, storage, fluid handling, UI buttons, scheduler control, rotation helpers, and multiblock controllers.

The current public entry point is:

```js
import {
  Machine,
  Generator,
  BasicMachine,
  EnergyStorage,
  FluidStorage,
  TickScheduler,
  OutputTracker,
  ButtonManager,
  Rotation,
  Multiblock,
  MultiblockMachine,
  MultiblockGenerator,
  addOpenUICount,
  removeOpenUICount,
} from "DoriosCore/index.js";
```

Importing `DoriosCore/index.js` also loads the Core initializer. That initializer creates the shared energy and fluid scoreboards, tracks the global machine tick counter, preloads the shared UI button item, and subscribes to Core script events.

---

## What The Core Provides

Dorios Machinery Core includes:

- machine and generator base classes
- scoreboard-backed Dorios Energy storage
- scoreboard-backed fluid storage with multi-tank support
- preserved drops for machines, generators, and tanks
- cached item and fluid output targets
- machine tick scheduling for open and closed UIs
- inventory button callbacks for machine UIs
- placement and wrench rotation helpers
- multiblock detection, activation, deactivation, and controller classes
- script events for integration between addons

The systems are designed to work together while still allowing each addon to define its own machines, recipes, blocks, entities, and UI layout.

---

## Runtime Model

Most machines follow this pattern:

1. A block component calls `Machine.spawnEntity()` or `Generator.spawnEntity()` during placement.
2. The Core spawns a helper entity at the block position.
3. Energy, fluid, inventory slot configuration, represented block id, and tick-group data are stored on that entity.
4. On block ticks, the addon creates a runtime wrapper such as `new Machine(block, settings)`.
5. If `runtime.valid` is false, the machine should skip work for that tick.
6. The machine reads input, consumes energy or fluid, writes output, and refreshes UI only when needed.
7. On break, `onDestroy()` drops inventory and returns the block item with stored energy/fluid lore.

```js
DoriosAPI.register.blockComponent("simple_machine", {
  beforeOnPlayerPlace(e, { params: settings }) {
    Machine.spawnEntity(e, settings);
  },

  onTick(e, { params: settings }) {
    const machine = new Machine(e.block, settings);
    if (!machine.valid) return;

    machine.setEnergyCost(settings.machine.energy_cost);

    if (!machine.energy.has(machine.rate)) {
      machine.showWarning("No Energy", { resetProgress: false });
      return;
    }

    machine.energy.consume(machine.rate);
    machine.addProgress(machine.rate);
    machine.displayProgress();
    machine.showStatus("Running");
  },

  onPlayerBreak(e) {
    Machine.onDestroy(e);
  },
});
```

---

## Settings Shape

Machine and generator configs are passed from block component params. The Core reads only the fields it needs, but the current UtilityCraft patterns use shapes like these:

```js
const machineSettings = {
  rotation: true,
  entity: {
    name: "Crusher",
    type: "simple",
    input_type: "simple",
    output_type: "simple",
    inventory_size: 9,
  },
  machine: {
    energy_cap: 32000,
    energy_cost: 800,
    rate_speed_base: 20,
    fluid_cap: 8000,
    fluid_types: 1,
    upgrades: [4, 5],
  },
};
```

```js
const generatorSettings = {
  entity: {
    name: "Furnator",
    inventory_size: 9,
  },
  generator: {
    energy_cap: 64000,
    rate_speed_base: 40,
    fluid_cap: 8000,
  },
};
```

`ignoreTick: true` may be added at the top level when a machine must bypass the scheduler for a specific tick path, such as placement setup.

---

## Main API Pages

- [BasicMachine](./API/basic-machine) - shared block/entity/runtime wrapper
- [Machine](./API/machine) - item-processing machine helper
- [Generator](./API/generator) - energy-producing machine helper
- [EnergyStorage](./API/energy-storage) - Dorios Energy storage
- [FluidStorage](./API/fluid-storage) - fluid storage and container interactions
- [TickScheduler](./API/tick-scheduler) - open/closed machine processing schedule
- [OutputTracker](./API/output-tracker) - cached item/fluid output targets
- [ButtonManager](./API/button-manager) - inventory UI buttons
- [Rotation](./API/rotation) - placement and wrench rotation helpers
- [Multiblock](./API/multiblock) - multiblock facade and controller classes
- [Script Events](./API/script-events) - Core script-event integration points

---

## Compatibility Notes

DoriosCore uses shared tags, scoreboards, dynamic properties, and script events so compatible addons can share machinery infrastructure. Energy and fluid values are stored with mantissa/exponent scoreboards to support values larger than normal scoreboard-safe ranges.

When building another addon on top of the Core, prefer importing from `DoriosCore/index.js` instead of deep internal paths. Deep paths are useful while developing the Core itself, but the index export is the stable integration surface.
