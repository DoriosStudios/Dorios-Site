---
title: Create the Helper Entity
sidebar_position: 4
description: Spawn, configure, find, and remove the shared UtilityCraft machine entity through the public Machine lifecycle.
---

# Create the Helper Entity

A normal single-block machine does not need an addon-owned entity definition. UtilityCraft already provides:

```text
utilitycraft:machine_entity
```

`Machine.spawnEntity()` spawns that shared entity, resizes its inventory, gives it the machine family, initializes energy, assigns its translated name, restores stored resources, and prepares registered interfaces.

:::danger Do not copy the shared entity
Do not copy `machine_entity.json` into the extension and do not invent an entity event such as `utilitycraft:simple_machine`. Use `entity.type: "machine"`, which resolves to the existing `utilitycraft:machine` event.
:::

## Add placement and destruction handlers

Update the component definition in `thermalCrusher.js`:

```js title="BP/scripts/examples/machines/thermalCrusher.js"
// @ts-check

import { Machine } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_thermal_crusher";

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    Machine.spawnEntity(event, settings, () => {
      const machine = new Machine(event.block, {
        ...settings,
        ignoreTick: true,
      });
      if (!machine.valid) return;

      machine.setEnergyCost(settings.machine.energy_cost);
      machine.setProgress(0, { display: false });
      machine.displayEnergy();
    });
  },

  onTick({ block }, { params: settings }) {
    const machine = new Machine(block, settings);
    if (!machine.valid) return;

    // Recipe behavior is added on the next page.
  },

  onPlayerBreak(event) {
    Machine.onDestroy(event);
  },
});
```

## Placement lifecycle

`beforeOnPlayerPlace` runs while Minecraft is placing the block. Pass the complete event and the component settings to:

```js
Machine.spawnEntity(event, settings, callback);
```

The method schedules initialization safely. Its callback runs after the shared entity exists and its final inventory size is available.

Inside the callback, construct the initial machine with:

```js
new Machine(event.block, {
  ...settings,
  ignoreTick: true,
});
```

`ignoreTick: true` is appropriate only for this controlled initialization callback. It bypasses scheduler throttling so the initial cost, progress, and display can be written immediately. Normal `onTick` construction must use the original `settings`.

## What the settings create

The block supplied:

```json
"entity": {
  "type": "machine",
  "inventory_size": 15
}
```

The public spawn lifecycle uses those values as follows:

| Setting | Result |
| --- | --- |
| No `entity.identifier` | Uses the default `utilitycraft:machine_entity`. |
| `type: "machine"` | Triggers the real `utilitycraft:machine` entity event. |
| `inventory_size: 15` | Triggers the shared inventory-size event for 15 slots. |
| No `entity.name` | Uses the block path: `example_thermal_crusher`. |

The helper entity's name becomes the localization key:

```text
entity.utilitycraft:example_thermal_crusher.name
```

The template already defines that key in `RP/texts/en_US.lang`. Its value is also used by the existing chest-screen route to select the temporary crusher UI.

## Slot map

The 15-slot inventory is a contract shared by script and UI:

| Slot | This tutorial | Later use |
| ---: | --- | --- |
| `0` | Energy display item | Same |
| `1` | Status label item | Same |
| `2` | Progress display item | Same |
| `3` | Recipe input | Item input 1 |
| `4` | Recipe output | Item output 1 |
| `5`-`8` | Unused | Upgrade slots |
| `9`-`14` | Unused | Six item-IO face buttons |

Do not place recipe items in slots `0`, `1`, or `2`. DoriosCore writes UI display items there.

## Initial energy and progress

`Machine.spawnEntity()` initializes the `EnergyStorage` capacity from `machine.energy_cap` and restores stored energy from a placed machine item when applicable.

The callback then sets:

```js
machine.setEnergyCost(settings.machine.energy_cost);
machine.setProgress(0, { display: false });
machine.displayEnergy();
```

- `setEnergyCost()` stores the progress maximum used by the machine.
- `setProgress()` resets persistent progress index `0`.
- `displayEnergy()` writes the correct energy-bar frame to slot `0`.

## Destruction lifecycle

```js
onPlayerBreak(event) {
  Machine.onDestroy(event);
}
```

The public destruction method:

- finds the helper entity at the block;
- releases its scheduler assignment;
- drops non-UI inventory contents;
- stores supported resources in the dropped machine item's lore;
- removes the helper entity;
- avoids duplicate normal block drops.

Do not call `entity.remove()` directly for a normal machine break, because that skips the shared inventory and resource cleanup.

At this point placing the block creates a valid energy-backed helper entity, but it does not process items. Continue with [Process a recipe with script](./scripted-recipe).

