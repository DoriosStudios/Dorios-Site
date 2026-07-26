---
id: machine
title: Machine class
sidebar_label: Machine
sidebar_position: 3
description: Processing-machine runtime with energy, progress, upgrades, IO, placement, and destruction helpers.
---

# Machine class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`Machine` is the primary runtime class for processing machinery. It adds upgrade boosts, operation costs, item transfer helpers, status labels, and the standard placement and destruction lifecycle to [`BasicMachine`](./basic-machine).

```js
import { Machine } from "DoriosCore/index.js";
```

## Definition

<div class="api-signature">

`class Machine extends BasicMachine`

</div>

Inheritance:

```text
BasicMachine
└─ Machine
   └─ MultiblockMachine
```

## Constructor

### new Machine(block, settings)

<div class="api-signature">

`new Machine(block: Block, settings: MachineSettings)`

</div>

Creates a scheduled runtime for a placed machine.

| Parameter | Type | Description |
| --- | --- | --- |
| `block` | `Block` | Machine block in the world. |
| `settings` | `MachineSettings` | Entity, rotation, storage, rate, and upgrade configuration. |

`settings.machine.rate_speed_base` defaults to `0`. After the base runtime becomes valid, the constructor resolves installed upgrade perks and calculates:

```text
consumption = max(0.01, energy_cost / energy_efficiency)
adjusted base rate = configured base rate × speed × consumption
effective rate = adjusted base rate × scheduler interval
```

Overclock contributes `35%` speed and `25%` energy cost per level unless `settings.machine.overclock` is `false`.

```js
const machine = new Machine(block, settings);
if (!machine.valid) return;
```

## MachineSettings

```ts
interface MachineSettings {
  entity: MachineEntityConfig;
  machine: MachineRuntimeConfig;
  spawn_offset?: Vector3;
  rotation?: boolean;
  ignoreTick?: boolean;
  requirements?: Record<string, Requirement>;
  required_case?: string;
}
```

### MachineEntityConfig

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `inventory_size` | `number` | Yes | Inventory-size event suffix used by the helper entity. |
| `identifier` | `string` | No | Helper entity identifier. Uses DoriosCore's default when omitted. |
| `name` | `string` | No | Localization/name suffix for the helper entity. |
| `input_range` | `[number, number]` | No | Inclusive item input range for compatible container setup. |
| `output_range` | `[number, number]` | No | Inclusive item output range. |
| `input_slot` | `number` | No | Single input-slot shortcut. |
| `output_slot` | `number` | No | Single output-slot shortcut. |
| `fixed_fluid_types` | `boolean` | No | Keeps indexed liquid types when their amount reaches zero. |
| `fixed_gas_types` | `boolean` | No | Keeps indexed gas types when their amount reaches zero. |
| `type` | `string` | No | Optional helper-entity event suffix triggered after spawn. |

### MachineRuntimeConfig

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `rate_speed_base` | `number` | No | Base work/energy rate before scheduler and upgrade scaling. Defaults to `0`. |
| `energy_cap` | `number` | No | Maximum energy stored by the helper entity. |
| `fluid_cap` | `number` | No | Capacity assigned to every indexed liquid tank. |
| `fluid_types` | `number` | No | Number of liquid tanks. Defaults to `1` when `fluid_cap` is set. |
| `gas_cap` | `number` | No | Capacity assigned to every indexed gas tank. |
| `gas_types` | `number` | No | Number of gas tanks. Defaults to `1` when `gas_cap` is set. |
| `upgrades` | `number[]` | No | Ordered inventory slots scanned by `MachineUpgradeRegistry`. |
| `overclock` | `boolean` | No | Set to `false` to ignore the helper entity's overclock property. |

Additional addon-owned fields can be placed in a subclass-specific settings contract.

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `settings` | `MachineSettings` | Original settings supplied to the constructor. |
| `boosts` | `MachineBoosts` | Standard and addon-defined numeric perks resolved from upgrade slots. |

`Machine` also inherits every property from [`BasicMachine`](./basic-machine#properties).

### boosts

| Property | Base | Description |
| --- | ---: | --- |
| `speed` | `1` | Processing-speed multiplier. |
| `energy_cost` | `1` | Energy-cost multiplier before efficiency. |
| `energy_efficiency` | `1` | Efficiency divisor. |
| `process_batch` | `1` | Operations per completed process. |
| `overclock` | Entity property | Current overclock level. |
| `consumption` | Calculated | `energy_cost / energy_efficiency`, clamped to at least `0.01`. |

See [`MachineUpgradeRegistry`](./machine-upgrades) for registration and duplicate-category rules.

## Static methods

### Machine.spawnEntity(event, config, callback)

<div class="api-signature">

`Machine.spawnEntity(event: PlacementEventLike, config: MachineSettings, callback?: (entity: Entity) => void): void`

</div>

Queues creation and initialization of the helper entity.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `event.block` | `Block` | Yes | Block receiving the helper entity. |
| `event.player` | `Player` | Yes | Player placing the machine. Used for held-item restoration and optional rotation. |
| `event.permutationToPlace` | `BlockPermutation` | Yes | Original placement permutation. |
| `event.cancel` | `boolean` | No | Set to `true` internally when manual rotation placement is enabled. |
| `config` | `MachineSettings` | Yes | Entity and machine configuration. |
| `callback` | `(entity: Entity) => void` | No | Runs after storage and IO initialization, before interface buttons are finalized. |

The method:

1. Reads preserved energy, liquid, and gas data from the placed item lore.
2. Applies manual facing when `rotation` is enabled.
3. Spawns the configured helper entity.
4. Sets energy capacity.
5. Creates all configured liquid and gas tanks and applies their capacities.
6. Restores every preserved resource index.
7. Prepares item, liquid, and gas IO documents.
8. Runs `callback` and installs registered interface buttons.
9. Notifies adjacent UtilityCore-managed networks that the block changed.

```js
beforeOnPlayerPlace(event, { params: settings }) {
  Machine.spawnEntity(event, settings, () => {
    const machine = new Machine(event.block, { ...settings, ignoreTick: true });
    if (!machine.valid) return;
    machine.setEnergyCost(settings.machine.energy_cost);
    machine.displayProgress();
  });
}
```

### Machine.onDestroy(event)

<div class="api-signature">

`Machine.onDestroy(event: DestroyEventLike): boolean`

</div>

Queues cleanup for the machine at the broken block location.

| Parameter | Type | Description |
| --- | --- | --- |
| `event.block` | `Block` | Block being destroyed. |
| `event.brokenBlockPermutation` | `BlockPermutation` | Original permutation; its type ID becomes the preserved block item. |
| `event.player` | `Player | undefined` | Player responsible for the break when available. |
| `event.dimension` | `Dimension` | Dimension containing the block and helper entity. |

Returns `false` when no helper entity is found. Otherwise returns `true` immediately after cleanup is queued. Cleanup serializes energy and all indexed liquid/gas values, releases the scheduler group, drops non-interface inventory, removes the helper entity, and spawns the preserved block item.

## Instance methods

### transferItems()

<div class="api-signature">

`transferItems(): boolean`

</div>

Transfers registered output slots into the cached item output target. The target's opposite face policy is respected. Stale cached targets are cleared. Returns `true` when at least one item moves.

For new machines with configurable six-face IO, prefer inherited [`processIO()`](./basic-machine) to process inputs and outputs together.

### hasOutputItems()

<div class="api-signature">

`hasOutputItems(): boolean`

</div>

Returns whether at least one no-face output slot currently contains an item.

### pullItemsFromAbove(targetSlot)

<div class="api-signature">

`pullItemsFromAbove(targetSlot: number): boolean`

</div>

Attempts to move items from the compatible container directly above the machine into one machine slot. The source's down-face output policy is respected.

| Parameter | Type | Description |
| --- | --- | --- |
| `targetSlot` | `number` | Machine inventory slot that should receive the item. |

Returns `true` after the first successful transfer; otherwise `false`.

### setProgress(value, options)

<div class="api-signature">

`setProgress(value: number, options?: ProgressOptions): void`

</div>

Stores progress using `options.maxValue` or the selected energy cost as the full value.

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `number` | New nonnegative progress value. |
| `options` | `ProgressOptions` | Progress slot, type, display, index, scale, legacy mode, and optional `maxValue`. |

### displayProgress(options)

<div class="api-signature">

`displayProgress(options?: ProgressOptions): void`<br />
`displayProgress(maxValue: number, options?: ProgressOptions): void`

</div>

Draws progress using the selected energy cost by default. Supply `maxValue` explicitly for a different process scale. All `ProgressOptions` fields and defaults are documented by [`BasicMachine.displayProgress()`](./basic-machine).

### setEnergyCost(value, index)

<div class="api-signature">

`setEnergyCost(value: number, index?: number): void`

</div>

Stores the full operation cost in the dynamic property `dorios:energy_cost_{index}`.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Operation cost. Values below `1` are stored as `1`. |
| `index` | `number` | `0` | Cost/progress channel. |

### getEnergyCost(index)

<div class="api-signature">

`getEnergyCost(index?: number): number`

</div>

Returns the stored cost for `index`, or `800` when unset.

### displayEnergy(slot)

<div class="api-signature">

`displayEnergy(slot?: number): void`

</div>

Calls `energy.display(slot)`.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `slot` | `number` | `0` | Inventory slot containing the energy display item. |

### showWarning(message, options)

<div class="api-signature">

`showWarning(message: string, options?: WarningOptions): void`

</div>

Shows a yellow status label, redraws energy, turns the block off, and resets progress unless disabled.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `string` | — | Warning text. The standard label appends an exclamation mark. |
| `options.resetProgress` | `boolean` | `true` | Whether to set progress to zero. |
| `options.displayProgress` | `boolean` | `true` | Whether resetting progress redraws the bar. |
| Remaining options | `ProgressOptions` | See progress API | Selects slot, type, index, scale, and legacy rendering. |

Use `{ resetProgress: false }` for temporary conditions such as missing energy when partial work should remain.

### showStatus(message)

<div class="api-signature">

`showStatus(message: string): void`

</div>

Shows a green running label containing the supplied message, speed, effective efficiency, energy cost, and base rate. It also redraws energy and does not change progress.

## Processing example

```js
import { Machine } from "DoriosCore/index.js";

function tick(block, settings) {
  const machine = new Machine(block, settings);
  if (!machine.valid) return;

  machine.processIO();
  machine.setEnergyCost(800);

  const energyStep = machine.rate * machine.boosts.consumption;
  if (!machine.energy.has(energyStep)) {
    machine.showWarning("No Energy", { resetProgress: false });
    return;
  }

  machine.energy.consume(energyStep);
  machine.addProgress(machine.rate);

  if (machine.getProgress() >= machine.getEnergyCost()) {
    const crafts = Math.max(1, Math.floor(machine.boosts.process_batch));
    // Validate and mutate recipe inputs/outputs for `crafts` operations.
    machine.setProgress(0);
  }

  machine.on();
  machine.displayProgress();
  machine.showStatus("Running");
}
```

For a complete capacity-safe scripted recipe, see the [Thermal Crusher](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/machines/thermalCrusher.js).
