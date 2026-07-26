---
title: Create a Custom Machine Class
sidebar_position: 3
description: Extend the public Machine class with persistent addon-owned heat behavior and custom upgrade perks.
---

# Create a Custom Machine Class

Extend `Machine` when several machines need the same additional mechanic. The subclass inherits the standard helper entity, inventory, energy, progress, scheduler, upgrades, UI helpers, and IO behavior. It adds only the rules owned by your addon.

This example adds heat:

- every completed craft can add heat;
- the machine cools while idle;
- processing pauses before it would overheat;
- addon-owned upgrade perks increase the heat limit and cooling rate.

## 1. Create the subclass

```js title="BP/scripts/MYADDON_CORE/machinery/ThermalMachine.js"
// @ts-check

import { Machine } from "DoriosCore/index.js";

const HEAT_PROPERTY = "myaddon:heat";

/**
 * Adds a persistent heat mechanic to DoriosCore's standard Machine runtime.
 */
export class ThermalMachine extends Machine {
  /**
   * @param {import("@minecraft/server").Block} block
   * @param {import("DoriosCore/index.js").MachineSettings & {
   *   thermal?: {
   *     maxHeat?: number,
   *     heatPerCraft?: number,
   *     passiveCooling?: number
   *   }
   * }} settings
   */
  constructor(block, settings) {
    super(block, settings);
    if (!this.valid) return;

    const thermal = settings.thermal ?? {};
    this.baseMaxHeat = Math.max(1, thermal.maxHeat ?? 100);
    this.heatPerCraft = Math.max(0, thermal.heatPerCraft ?? 8);
    this.passiveCooling = Math.max(0, thermal.passiveCooling ?? 1);
  }

  /** Returns the heat stored on the machine's helper entity. */
  getHeat() {
    return Number(this.entity.getDynamicProperty(HEAT_PROPERTY) ?? 0);
  }

  /** Returns the base limit plus the addon-owned max_heat upgrade perk. */
  getMaxHeat() {
    return this.baseMaxHeat + Number(this.boosts.max_heat ?? 0);
  }

  /** Adds heat and clamps it to the current effective limit. */
  addHeat(amount = this.heatPerCraft) {
    const added = Math.max(0, amount);
    const next = Math.min(this.getMaxHeat(), this.getHeat() + added);
    this.entity.setDynamicProperty(HEAT_PROPERTY, next);
    return next;
  }

  /** Removes passive heat, including the addon-owned cooling_rate perk. */
  coolDown(multiplier = 1) {
    const cooling = this.passiveCooling + Number(this.boosts.cooling_rate ?? 0);
    const next = Math.max(
      0,
      this.getHeat() - cooling * Math.max(0, multiplier),
    );
    this.entity.setDynamicProperty(HEAT_PROPERTY, next);
    return next;
  }

  /** Returns true when another batch would reach or exceed the limit. */
  wouldOverheat(craftCount = 1) {
    const crafts = Math.max(1, craftCount);
    return this.getHeat() + this.heatPerCraft * crafts >= this.getMaxHeat();
  }

  /** Returns a value from 0 through 100 for labels or custom displays. */
  getHeatPercent() {
    return Math.min(100, (this.getHeat() / this.getMaxHeat()) * 100);
  }
}
```

### What the constructor preserves

Calling `super(block, settings)` first is required. It constructs the normal `Machine` and exposes inherited values such as:

| Inherited member | Used for |
| --- | --- |
| `valid` | Stops work when no helper exists or this scheduled tick should be skipped. |
| `entity` | Stores addon-owned dynamic properties such as heat. |
| `container` | Reads and writes machine inventory slots. |
| `energy` | Consumes and displays Dorios Energy. |
| `rate` | Limits work performed during the current scheduled update. |
| `boosts` | Contains resolved standard and addon-owned upgrade perks. |
| `processIO()` | Applies the registered six-face IO configuration. |
| `setProgress()` and `displayProgress()` | Store and render process progress. |

Return immediately when `valid` is false. The subclass must not read `entity`, `container`, or settings-derived fields after a failed base construction.

## 2. Export the class

```js title="BP/scripts/MYADDON_CORE/index.js"
export * from "./machinery/ThermalMachine.js";
```

Concrete machine scripts should import this entry point instead of reaching into its internal folder:

```js
import { ThermalMachine } from "../../MYADDON_CORE/index.js";
```

## 3. Supply addon-owned settings

Custom keys can live beside the normal `entity` and `machine` settings in the block component parameters:

```json title="BP/blocks/my_thermal_crusher.json"
{
  "myaddon:thermal_crusher": {
    "entity": {
      "type": "machine",
      "inventory_size": 15
    },
    "machine": {
      "energy_cap": 64000,
      "energy_cost": 800,
      "rate_speed_base": 40,
      "upgrades": [5, 6, 7, 8]
    },
    "thermal": {
      "maxHeat": 100,
      "heatPerCraft": 8,
      "passiveCooling": 1
    }
  }
}
```

| Thermal field | Default | Meaning |
| --- | ---: | --- |
| `maxHeat` | `100` | Base heat limit before upgrades. |
| `heatPerCraft` | `8` | Heat added for each completed output operation. |
| `passiveCooling` | `1` | Heat removed by one call to `coolDown(1)`. |

These fields are interpreted only by `ThermalMachine`; DoriosCore safely ignores them.

## 4. Register custom upgrade perks

DoriosLib transports custom numeric perk names without requiring a DoriosCore modification:

```js title="BP/scripts/config/upgrades.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerMachineUpgrade({
  "myaddon:thermal_upgrade": {
    type: "thermal",
    levels: {
      1: { max_heat: 25, cooling_rate: 0.25 },
      2: { max_heat: 60, cooling_rate: 0.6 },
      3: { max_heat: 110, cooling_rate: 1.0 },
      4: { max_heat: 180, cooling_rate: 1.75 },
    },
  },
});
```

The machine block must accept type `thermal` in the same slot included in `machine.upgrades`:

```json
{
  "utilitycraft:machine_upgrades": [
    { "type": "thermal", "slot": 8, "max": 4 }
  ]
}
```

`Machine` resolves the installed upgrade and places its values in `this.boosts`. DoriosCore does not assign meaning to `max_heat` or `cooling_rate`; the subclass does that in `getMaxHeat()` and `coolDown()`.

## 5. Use the class in a machine tick

The machine-specific recipe loop remains in the concrete block module:

```js title="BP/scripts/examples/machines/thermalCrusher.js"
import { ItemStack } from "@minecraft/server";
import {
  advanceProcessCycle,
  getOutputCapacity,
  ThermalMachine,
} from "../../MYADDON_CORE/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "myaddon:thermal_crusher";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
const RECIPES = Object.freeze({
  "minecraft:cobblestone": {
    output: "minecraft:gravel",
    amount: 1,
    cost: 800,
  },
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    ThermalMachine.spawnEntity(event, settings);
  },

  onTick({ block }, { params: settings }) {
    const machine = new ThermalMachine(block, settings);
    if (!machine.valid) return;

    machine.processIO();
    machine.displayProgress();
    machine.coolDown(0.25);

    const input = machine.container.getItem(INPUT_SLOT);
    const recipe = input ? RECIPES[input.typeId] : undefined;
    if (!input || !recipe) {
      machine.off();
      machine.coolDown(1);
      machine.showWarning(input ? "Invalid Recipe" : "No Input", {
        resetProgress: false,
      });
      return;
    }

    if (machine.wouldOverheat()) {
      machine.off();
      machine.coolDown(2);
      machine.showWarning("Cooling Down", { resetProgress: false });
      return;
    }

    const outputCapacity = getOutputCapacity(
      machine.container,
      OUTPUT_SLOT,
      recipe.output,
    );
    const maxCrafts = Math.min(
      input.amount,
      Math.floor(outputCapacity / recipe.amount),
    );
    if (maxCrafts <= 0) {
      machine.off();
      machine.showWarning("Output Full", { resetProgress: false });
      return;
    }

    const result = advanceProcessCycle(machine, {
      energyCost: recipe.cost,
      maxCrafts,
      onComplete(craftCount) {
        DoriosLib.entity.changeItemAmount(machine.entity, {
          slot: INPUT_SLOT,
          amount: -craftCount,
        });

        const current = machine.container.getItem(OUTPUT_SLOT);
        if (current) {
          DoriosLib.entity.changeItemAmount(machine.entity, {
            slot: OUTPUT_SLOT,
            amount: craftCount * recipe.amount,
          });
        } else {
          machine.container.setItem(
            OUTPUT_SLOT,
            new ItemStack(recipe.output, craftCount * recipe.amount),
          );
        }

        machine.addHeat(craftCount * machine.heatPerCraft);
      },
    });

    if (result.state === "no_energy") {
      machine.off();
      machine.showWarning("No Energy", { resetProgress: false });
      return;
    }

    machine.on();
    machine.displayEnergy();
    machine.displayProgress();
    machine.setLabel([
      "§r§aThermal Crusher Running",
      `§r§7Heat: §f${machine.getHeat().toFixed(1)} / ${machine.getMaxHeat().toFixed(1)}`,
      `§r§7Heat load: §f${machine.getHeatPercent().toFixed(0)}%%`,
      `§r§7Batch: §fx${Math.max(1, Math.floor(machine.boosts.process_batch))}`,
    ]);
  },

  onPlayerBreak(event) {
    ThermalMachine.onDestroy(event);
  },
});
```

`advanceProcessCycle()` is the addon-owned helper exported by the template core. Recipe selection and output validation remain in the concrete machine, while the helper advances standard energy-backed progress and honors `process_batch` and consumption boosts.

Heat is added inside `onComplete`, after input and output mutations succeed. A blocked recipe therefore cannot heat the machine without crafting. See [Process a recipe with script](../first-machine/scripted-recipe) for the beginner version of the same validation order.

## Design rules for subclasses

- Extend a public root export, never a private DoriosCore file.
- Call `super()` before using `this` and guard `this.valid` immediately.
- Namespace persistent property IDs to your addon.
- Keep recipe tables and one-block registrations outside the reusable class.
- Give custom perks meaning in the addon subclass.
- Keep inherited progress, energy, IO, and teardown behavior unless there is a specific reason to override it.
- Prefer a new method over overriding a base method whose full contract you do not need to replace.

The complete template implementation is available in [`ExampleCore/machinery/ThermalMachine.js`](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/ExampleCore/machinery/ThermalMachine.js).

Continue with [Ports and Link Nodes](./ports-link-nodes).
