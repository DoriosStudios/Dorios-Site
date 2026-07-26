---
id: extend-dorios-core
title: Extend DoriosCore safely
sidebar_label: Extend DoriosCore
sidebar_position: 3
description: Add custom machine mechanics in an addon-owned core without modifying DoriosCore.
---

# Extend DoriosCore safely

Create subclasses when several machines in your addon share behavior that DoriosCore should not own. Examples include heat, pressure, chemical purity, rotor wear, radiation, or an addon-specific processing cycle.

## Keep DoriosCore read-only

Do not place custom code inside `BP/scripts/DoriosCore`. Editing the dependency makes upgrades harder, creates different Core copies between addons, and breaks the shared compatibility boundary.

Use an addon-owned module instead:

```text
BP/scripts/ADDONNAME_CORE/
├─ index.js
├─ machinery/
│  └─ ThermalMachine.js
└─ processing/
   └─ processCycle.js
```

`ExampleCore` in the [Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/tree/main/BP/scripts/ExampleCore) is designed to be renamed to this folder.

## Extend a machine class

```js title="BP/scripts/MYADDON_CORE/machinery/ThermalMachine.js"
import { Machine } from "DoriosCore/index.js";

const HEAT_PROPERTY = "myaddon:heat";

export class ThermalMachine extends Machine {
  constructor(block, settings) {
    super(block, settings);
    if (!this.valid) return;

    this.baseMaxHeat = Math.max(1, settings.thermal?.maxHeat ?? 100);
    this.heatPerCraft = Math.max(0, settings.thermal?.heatPerCraft ?? 8);
  }

  getHeat() {
    return Number(this.entity.getDynamicProperty(HEAT_PROPERTY) ?? 0);
  }

  getMaxHeat() {
    // max_heat is an addon-owned upgrade perk.
    return this.baseMaxHeat + Number(this.boosts.max_heat ?? 0);
  }

  addHeat(amount = this.heatPerCraft) {
    const value = Math.min(this.getMaxHeat(), this.getHeat() + Math.max(0, amount));
    this.entity.setDynamicProperty(HEAT_PROPERTY, value);
    return value;
  }

  wouldOverheat(crafts = 1) {
    return this.getHeat() + this.heatPerCraft * Math.max(1, crafts) >= this.getMaxHeat();
  }
}
```

### Why call `super()` first?

The `Machine` constructor resolves the helper entity, applies scheduling, exposes the inventory and energy manager, and resolves upgrade boosts. The subclass can use those properties only after `super()` and the `valid` guard.

### What belongs in the subclass?

- Reusable state stored on the helper entity.
- Methods shared by multiple addon machines.
- Interpretation of addon-owned upgrade perks.
- Reusable process helpers that operate on the public `Machine` API.

Concrete recipe tables, block identifiers, and one-off registration callbacks generally stay outside the subclass.

## Export the addon-owned API

```js title="BP/scripts/MYADDON_CORE/index.js"
export { ThermalMachine } from "./machinery/ThermalMachine.js";
```

Concrete machines import the custom class from your alias while continuing to import DoriosCore members from its public root:

```js
import { registerIOInterface } from "DoriosCore/index.js";
import { ThermalMachine } from "MYADDON_CORE/index.js";
```

## Use standard and custom upgrade perks

Machine upgrades are registered through DoriosLib. DoriosCore's `Machine` runtime automatically resolves the installed items into `machine.boosts`.

```js
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerMachineUpgrade({
  "myaddon:speed_upgrade": {
    type: "speed",
    levels: {
      1: { speed: 0.25, energy_cost: 0.15 },
      2: { speed: 0.65, energy_cost: 0.35 },
    },
  },
  "myaddon:batch_upgrade": {
    type: "batch",
    levels: {
      1: { process_batch: 1, energy_cost: 0.25 },
      2: { process_batch: 2, energy_cost: 0.60 },
    },
  },
  "myaddon:thermal_upgrade": {
    type: "thermal",
    levels: {
      1: { max_heat: 25, cooling_rate: 0.25 },
      2: { max_heat: 60, cooling_rate: 0.60 },
    },
  },
});
```

| Perk | Owner | Meaning |
| --- | --- | --- |
| `speed` | DoriosCore | Increases process speed through the machine's effective boosts. |
| `energy_cost` | DoriosCore | Adds the registered energy-cost modifier. |
| `energy_efficiency` | DoriosCore | Reduces effective energy consumption according to the machine calculation. |
| `process_batch` | DoriosCore | Adds crafts to a completed processing batch. |
| `max_heat` | Your addon | Has no meaning until `ThermalMachine` reads and applies it. |
| `cooling_rate` | Your addon | Has no meaning until your cooling logic applies it. |

Custom numeric perks are supported because the compiled boosts preserve registered values. Defining a perk does not automatically create gameplay behavior; the addon-owned class must interpret it.

## Rules for compatible extensions

1. Import DoriosCore only from `DoriosCore/index.js`.
2. Never edit the dependency to add addon-specific mechanics.
3. Check `valid` immediately after constructing a runtime wrapper.
4. Keep custom properties namespaced to your addon.
5. Use DoriosLib registries for cross-addon registration data.
6. Use UtilityCore APIs for networks; DoriosCore is not the network owner.
7. Preserve `spawnEntity()` and `onDestroy()` lifecycle calls unless a reference page explicitly documents another flow.

## Complete reference

- [ThermalMachine source](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/ExampleCore/machinery/ThermalMachine.js)
- [ExampleCore overview](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/tree/main/BP/scripts/ExampleCore)
- [`Machine` API](./API/machine)
- [Machine upgrades API](./API/machine-upgrades)

