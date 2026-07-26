---
title: Register an Upgrade
sidebar_position: 2
description: Define upgrade items, register their level perks through DoriosLib, and connect accepted types to machine slots and UI controls.
---

# Register an Upgrade

This page connects one complete upgrade pipeline, then registers all three standard examples used in the next tutorials.

## 1. Define the upgrade items

Create the Speed Upgrade item:

```json title="BP/items/examples/example_speed_upgrade.json"
{
  "format_version": "1.21.110",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:example_speed_upgrade",
      "menu_category": {
        "category": "items"
      }
    },
    "components": {
      "utilitycraft:machine_upgrade": {},
      "minecraft:icon": "utilitycraft_speed_upgrade",
      "minecraft:max_stack_size": 4,
      "minecraft:tags": {
        "tags": ["utilitycraft:is_upgrade"]
      }
    }
  }
}
```

Create the Efficiency and Batch items with the same structure and these values:

| Item ID | Icon | Maximum stack |
| --- | --- | ---: |
| `utilitycraft:example_efficiency_upgrade` | `utilitycraft_energy_upgrade` | `4` |
| `utilitycraft:example_batch_upgrade` | `utilitycraft_quantity_upgrade` | `4` |

The three icon keys are supplied by the UtilityCraft Resource Pack. A production extension can define its own item textures instead.

`utilitycraft:machine_upgrade` installs the held item into the compatible slot when it is used on a machine block. UtilityCraft registers that existing item component; the addon must not register another component with the same ID.

## 2. Add names

```properties title="RP/texts/en_US.lang"
item.utilitycraft:example_speed_upgrade=Example Speed Upgrade\n§o§9@UC: Addon Template
item.utilitycraft:example_efficiency_upgrade=Example Efficiency Upgrade\n§o§9@UC: Addon Template
item.utilitycraft:example_batch_upgrade=Example Batch Upgrade\n§o§9@UC: Addon Template

upgrade.utilitycraft:example_speed_upgrade.name=Example Speed Upgrade
upgrade.utilitycraft:example_efficiency_upgrade.name=Example Efficiency Upgrade
upgrade.utilitycraft:example_batch_upgrade.name=Example Batch Upgrade
```

The `item.*` keys name inventory items. The `upgrade.*.name` keys are used by UtilityCraft's localized installation messages.

## 3. Register categories and levels

Create or replace the upgrade registration module:

```js title="BP/scripts/config/upgrades.js"
// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerMachineUpgrade({
  "utilitycraft:example_speed_upgrade": {
    type: "speed",
    levels: {
      1: { speed: 0.25, energy_cost: 0.15 },
      2: { speed: 0.65, energy_cost: 0.35 },
      3: { speed: 1.25, energy_cost: 0.75 },
      4: { speed: 2.0, energy_cost: 1.25 },
    },
  },
  "utilitycraft:example_efficiency_upgrade": {
    type: "energy",
    levels: {
      1: { energy_efficiency: 0.25 },
      2: { energy_efficiency: 0.75 },
      3: { energy_efficiency: 1.5 },
      4: { energy_efficiency: 3.0 },
    },
  },
  "utilitycraft:example_batch_upgrade": {
    type: "batch",
    levels: {
      1: { process_batch: 1, energy_cost: 0.25 },
      2: { process_batch: 2, energy_cost: 0.6 },
      3: { process_batch: 4, energy_cost: 1.25 },
      4: { process_batch: 7, energy_cost: 2.25 },
    },
  },
});
```

Load it from the configuration index:

```js title="BP/scripts/config/index.js"
import "./upgrades.js";
```

The template's `main.js` already imports `./config/index.js` before its examples. Registration is queued through DoriosLib and distributed to the shared DoriosCore upgrade registry after the world loads.

## Registration fields

| Field | Type | Meaning |
| --- | --- | --- |
| Item ID key | namespaced string | Exact item that provides this upgrade. |
| `type` | string | Semantic category used for slot acceptance and duplicate prevention. |
| `levels` | numeric object or array | Perks available at every effective level. Level `1` is required. |
| `value` | positive number | Optional effective levels contributed by each item. Defaults to `1`. |

With the default `value: 1`, a stack of three items selects level `3`. Effective level is capped by the highest registered level.

Level entries describe the final additive contribution at that level; they are not added to each previous level again. Missing perk keys inherit their preceding value, which is useful for custom definitions but explicit tables are easier to read.

## 4. Declare accepted machine slots

Inside the Thermal Crusher's custom component parameters, add the ordered slots scanned by `Machine`:

```json title="BP/blocks/examples/example_thermal_crusher.json"
{
  "machine": {
    "energy_cap": 64000,
    "energy_cost": 800,
    "rate_speed_base": 40,
    "upgrades": [5, 6, 7]
  }
}
```

Then add the UtilityCraft machine-upgrade component beside the crusher component:

```json title="BP/blocks/examples/example_thermal_crusher.json"
{
  "utilitycraft:machine_upgrades": [
    { "type": "speed", "slot": 5, "max": 4 },
    { "type": "energy", "slot": 6, "max": 4 },
    { "type": "batch", "slot": 7, "max": 4 }
  ]
}
```

These two declarations have different jobs:

| Declaration | Job |
| --- | --- |
| `machine.upgrades` | Tells `MachineUpgradeRegistry` which inventory slots to scan for perks. |
| `utilitycraft:machine_upgrades` | Tells the installer which category belongs in each slot and the maximum accepted effective level. |

They must reference the same slots. Each slot and each semantic `type` should appear only once.

## 5. Display the accepted slots

Add the standard tab to `crusher_top.controls`:

```json title="RP/ui/first_machine_ui.json"
{
  "upgrades@uc.upgrades_tab": {
    "$upgrade_index_1": 5,
    "$upgrade_index_2": 6,
    "$upgrade_index_3": 7,
    "$upgrade_index_4": 8,
    "$has_first_upgrade": true,
    "$has_second_upgrade": true,
    "$has_third_upgrade": true,
    "$has_fourth_upgrade": false,
    "$upgrade_overlay_1": "textures/items/machinery/speed_upgrade",
    "$upgrade_overlay_2": "textures/items/machinery/energy_upgrade",
    "$upgrade_overlay_3": "textures/items/machinery/quantity_upgrade"
  }
}
```

The overlay textures are hints for empty slots. Acceptance comes from the block component, and perk values come from the DoriosLib registration.

## 6. Install and inspect an upgrade

1. Hold an Example Speed Upgrade.
2. Use it on the Thermal Crusher.
3. Confirm one item is placed into helper-entity slot `5`.
4. Sneak-use a stack to install as many levels as the slot allows.
5. Open the Upgrades tab and confirm the stack appears over the speed overlay.
6. Try an unsupported upgrade type and confirm UtilityCraft rejects it.

`Machine` is reconstructed on valid processing ticks, so it reads the current stacks and exposes the new values through `machine.boosts` without an addon-owned cache.

Continue with [Speed upgrades](./speed).
