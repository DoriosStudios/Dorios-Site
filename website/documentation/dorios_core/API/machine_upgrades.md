---
id: machine-upgrades
title: MachineUpgradeRegistry
sidebar_label: Machine upgrades
sidebar_position: 7
description: Register machine upgrade items and resolve standard and addon-owned perks.
---

# MachineUpgradeRegistry

`MachineUpgradeRegistry` stores compiled upgrade definitions and converts installed upgrade stacks into one flat set of numeric boosts. Most addons register upgrades through DoriosLib and read the result from `machine.boosts`.

## Import

```js
import { MachineUpgradeRegistry } from "DoriosCore/index.js";
```

:::tip Recommended registration path
Use `DoriosLib.registry.registerMachineUpgrade()` for normal addon registrations. It distributes the definition through the shared registration protocol. Call `MachineUpgradeRegistry` directly only when building lower-level tooling or testing compiled definitions.
:::

## Standard boosts

Every `Machine` starts with these resolved values:

| Property | Base value | Description |
| --- | ---: | --- |
| `speed` | `1` | Final processing-speed multiplier. |
| `energy_cost` | `1` | Final energy-cost multiplier before efficiency. |
| `energy_efficiency` | `1` | Efficiency multiplier used in consumption calculation. |
| `process_batch` | `1` | Operations produced by a completed process. |
| `overclock` | Runtime value | Current overclock level read from the helper entity. |
| `consumption` | Calculated | Energy-consumption multiplier; lower values are more efficient. |

Custom registered perk names are preserved directly on the boosts object.

## Register upgrades with DoriosLib

```js
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerMachineUpgrade({
  "myaddon:speed_upgrade": {
    type: "speed",
    levels: {
      1: { speed: 0.25, energy_cost: 0.15 },
      2: { speed: 0.65, energy_cost: 0.35 },
      3: { speed: 1.25, energy_cost: 0.75 },
      4: { speed: 2.00, energy_cost: 1.25 },
    },
  },
  "myaddon:efficiency_upgrade": {
    type: "energy",
    levels: {
      1: { energy_efficiency: 0.25 },
      2: { energy_efficiency: 0.75 },
    },
  },
  "myaddon:batch_upgrade": {
    type: "batch",
    levels: {
      1: { process_batch: 1, energy_cost: 0.25 },
      2: { process_batch: 2, energy_cost: 0.60 },
    },
  },
});
```

The entries inside each level are additive contributions. `Machine` combines them with its base values when it creates `machine.boosts`.

## MachineUpgradeRegistration

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `string` | Yes | Semantic category used to prevent equivalent upgrades from stacking. |
| `levels` | `Record<number, Record<string, number>> \| Array<Record<string, number>>` | Yes | Numeric perk contributions for each effective level. Level 1 is required. |
| `value` | `number` | No | Effective levels contributed by each item in the stack. Defaults to `1` and must be greater than zero. |

Missing numeric levels inherit the preceding level. Perk values must be finite numbers.

Only the first installed upgrade category encountered in the configured ordered upgrade slots contributes. Two different item IDs with the same `type` do not stack.

## register

<div class="api-signature">

`MachineUpgradeRegistry.register(itemTypeId: string, registration: MachineUpgradeRegistration): CompiledMachineUpgrade`

</div>

Compiles and stores one exact upgrade item ID.

### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `itemTypeId` | `string` | Exact namespaced item identifier. Empty and duplicate IDs are rejected. |
| `registration` | `MachineUpgradeRegistration` | Category, level table, and optional per-item level value. |

### Returns

A `CompiledMachineUpgrade` containing `itemTypeId`, `type`, numeric `typeIndex`, `value`, `maxLevel`, and the dense inherited `levels` table.

### Exceptions

- `TypeError` for a missing item ID or type, invalid value, missing level 1, or nonnumeric perk.
- `Error` when the item ID has already been registered in the local runtime.

## get

<div class="api-signature">

`MachineUpgradeRegistry.get(itemTypeId: string): CompiledMachineUpgrade | undefined`

</div>

Returns the compiled definition for an exact item ID, or `undefined` when that item is not registered.

## resolveBoosts

<div class="api-signature">

`MachineUpgradeRegistry.resolveBoosts(container: Container, slots: number[] | undefined, defaults?: Record<string, number>): Record<string, number>`

</div>

Scans the supplied slots in order and adds the accepted upgrade perks to a new boosts object.

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `container` | `Container` | Yes | Entity inventory containing upgrade items. |
| `slots` | `number[] \| undefined` | Yes | Ordered slot list. Invalid or out-of-range slots are skipped. |
| `defaults` | `Record<string, number>` | No | Initial values copied into the returned object. |

The effective level for a stack is:

```text
min(maxLevel, floor(item amount × upgrade value))
```

### Example

```js
const boosts = MachineUpgradeRegistry.resolveBoosts(
  machine.container,
  [6, 7, 8],
  { speed: 1, process_batch: 1 },
);

const operations = Math.max(1, Math.floor(boosts.process_batch));
```

## Add custom perks

Custom perks do not modify DoriosCore automatically. Register numeric values and interpret them in an addon-owned subclass:

```js
const maximumHeat = baseMaximumHeat + Number(machine.boosts.max_heat ?? 0);
const coolingRate = baseCoolingRate + Number(machine.boosts.cooling_rate ?? 0);
```

See [Extend DoriosCore](../extend-dorios-core) for a complete subclass pattern.

