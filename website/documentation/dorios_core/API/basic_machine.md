---
id: basic-machine
title: BasicMachine class
sidebar_label: BasicMachine
sidebar_position: 2
description: Base scheduled runtime for DoriosCore machines and generators.
---

# BasicMachine class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`BasicMachine` is the base runtime wrapper shared by machines and generators. It resolves the block's helper entity, applies scheduler rules, exposes its inventory and energy storage, prepares item/liquid/gas IO documents, and provides common UI and progress helpers.

```js
import { BasicMachine } from "DoriosCore/index.js";
```

## Definition

<div class="api-signature">

`class BasicMachine`

</div>

Inheritance:

```text
BasicMachine
├─ Machine
│  └─ MultiblockMachine
└─ Generator
   └─ MultiblockGenerator
```

Most addons instantiate [`Machine`](./machine) or [`Generator`](./generator). Extend `BasicMachine` directly only when the runtime is neither a processing machine nor an energy generator.

## Constructor

### new BasicMachine(block, options)

<div class="api-signature">

`new BasicMachine(block: Block, options: BasicMachineOptions)`

</div>

Creates a runtime wrapper for the helper entity associated with `block`.

#### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `block` | `Block` | Yes | Machine block in the world. |
| `options` | `BasicMachineOptions` | Yes | Runtime rate and scheduler behavior. |
| `options.rate` | `number` | Yes | Base rate designed for ordinary 20 TPS logic. DoriosCore does not provide a fallback at this level. |
| `options.ignoreTick` | `boolean` | No | When `true`, bypasses scheduler throttling for this instance. Defaults to `false`. |

The constructor sets `valid` to `false` before resolving runtime state. It becomes `true` only after the helper entity, scheduler check, inventory, energy manager, effective rate, and IO documents have been prepared.

```js
const runtime = new BasicMachine(block, { rate: 20 });
if (!runtime.valid) return;
```

:::warning
Always guard `valid`. An invalid wrapper usually means the scheduler did not select this machine on the current tick; it is not necessarily an error.
:::

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `valid` | `boolean` | Whether the runtime is ready for this processing tick. |
| `entity` | `Entity` | Helper entity paired with the block. Use only after the validity guard. |
| `block` | `Block` | Block represented by this runtime. |
| `dimension` | `Dimension` | Dimension containing the block. |
| `container` | `Container` | Inventory container exposed by the helper entity. |
| `energy` | [`EnergyStorage`](./energy-storage) | Energy manager bound to the helper entity. |
| `shouldUpdateUI` | `boolean` | Whether a player currently has this container UI open. |
| `baseRate` | `number` | Rate before scheduler-interval scaling. |
| `processingInterval` | `number` | Effective interval returned by `TickScheduler`. |
| `rate` | `number` | `baseRate × processingInterval`. Use this for work done on valid ticks. |
| `itemIOReady` | `boolean` | Whether the persisted complex item IO document is ready locally. |
| `fluidIOReady` | `boolean` | Whether the indexed-liquid IO document is ready locally. |
| `gasIOReady` | `boolean` | Whether the indexed-gas IO document is ready locally. |

## Methods

### setRate(baseRate)

<div class="api-signature">

`setRate(baseRate: number): void`

</div>

Updates `baseRate` and recalculates `rate` with the current `processingInterval`.

| Parameter | Type | Description |
| --- | --- | --- |
| `baseRate` | `number` | New unscaled processing or generation rate. |

### setLabel(text, slot)

<div class="api-signature">

`setLabel(text: string | string[], slot?: number): void`

</div>

Writes the machine label item while `shouldUpdateUI` is `true`.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string \| string[]` | — | A string becomes the item name. In an array, the first entry is the name and remaining entries become lore. |
| `slot` | `number` | `1` | Inventory slot used by the label. Existing items in the slot are reused. |

```js
machine.setLabel([
  "§r§aCrusher Running",
  "§r§7Input: §fCobblestone",
  "§r§7Output: §fGravel",
]);
```

### on()

<div class="api-signature">

`on(): void`

</div>

Sets the block state `utilitycraft:on` to `true`. The block definition and resource pack can use this state for its active texture.

### off()

<div class="api-signature">

`off(): void`

</div>

Sets the block state `utilitycraft:on` to `false`.

### addProgress(amount, index)

<div class="api-signature">

`addProgress(amount: number, index?: number): void`

</div>

Adds `amount` to one dynamic progress channel.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `amount` | `number` | — | Value added to the current progress. May be negative. |
| `index` | `number` | `0` | Progress channel stored as `dorios:progress_{index}`. |

### getProgress(index)

<div class="api-signature">

`getProgress(index?: number): number`

</div>

Returns the current value of a progress channel, or `0` when it has not been set.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Progress channel to read. |

### setProgress(value, maxValue, options)

<div class="api-signature">

`setProgress(value: number, maxValue?: number, options?: ProgressOptions): void`

</div>

Stores a nonnegative progress value and optionally redraws its bar.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | New progress value. Values below zero are stored as zero. |
| `maxValue` | `number` | `800` | Value represented by a full bar. |
| `options.slot` | `number` | `2` | Inventory slot containing the progress item. |
| `options.type` | `string` | `progress_right_big_bar` | Item-ID suffix for modern progress frames. |
| `options.display` | `boolean` | `true` | Whether to call `displayProgress()` after storing. |
| `options.index` | `number` | `0` | Progress channel. |
| `options.scale` | `number` | `16` when passed through this method | Maximum visual frame forwarded to the renderer. |
| `options.legacy` | `boolean` | `false` | Uses non-padded legacy frame IDs when true. |

### displayProgress(maxValue, options)

<div class="api-signature">

`displayProgress(maxValue?: number, options?: ProgressOptions): void`

</div>

Draws the selected progress channel as an item frame while the UI is open. It returns without changing the container when `maxValue` is zero or negative.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `maxValue` | `number` | `800` | Value represented by a full bar. |
| `options.slot` | `number` | `2` | Destination inventory slot. |
| `options.type` | `string` | `progress_right_big_bar` | Modern frame prefix; legacy mode defaults to `arrow_right`. |
| `options.index` | `number` | `0` | Progress channel to render. |
| `options.scale` | `number` | `22` modern, `16` legacy | Highest visual frame number. |
| `options.legacy` | `boolean` | `false` | Chooses legacy non-padded IDs. |

Modern IDs are padded, for example `utilitycraft:progress_right_big_bar_00`. Legacy IDs use names such as `utilitycraft:arrow_right_0`.

### displayEnergy(slot)

<div class="api-signature">

`displayEnergy(slot?: number): void`

</div>

Calls `energy.display(slot)` only while the UI is open.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `slot` | `number` | `0` | Inventory slot for the energy bar. |

### processIO(limits)

<div class="api-signature">

`processIO(limits?: ProcessIOLimits): ProcessIOSummary`

</div>

Processes enabled item, liquid, and gas faces using the registered IO documents. Resource indices are independent from inventory slots.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `limits.maxInputSlotsScannedPerTick` | `number` | `9` | External inventory slots examined per enabled input face. |
| `limits.maxOutputSlotsMovedPerTick` | `number` | `9` | Machine output slots attempted per enabled output face. |
| `limits.maxFluidMovedPerTick` | `number` | `2500` | Total liquid amount moved during the call. |
| `limits.maxGasMovedPerTick` | `number` | `2500` | Total gas amount moved during the call. |

Returns:

```ts
interface ProcessIOSummary {
  itemsMoved: number;
  inputSlotsScanned: number;
  fluidMoved: number;
  gasMoved: number;
}
```

Invalid runtimes return a summary containing four zeros. Item input scanning maintains a rotating cursor so large neighboring inventories are scanned fairly across ticks.

See [Process machine IO](./process-io) for processing order, face resolution, fallbacks, fairness, and adapter selection.

```js
const moved = machine.processIO({
  maxFluidMovedPerTick: 1000,
  maxGasMovedPerTick: 500,
});
```

### blockSlots(slots)

<div class="api-signature">

`blockSlots(slots: number[]): void`

</div>

Fills each empty slot with the standard blocker item. Existing items are not replaced.

| Parameter | Type | Description |
| --- | --- | --- |
| `slots` | `number[]` | Inventory slot indices to reserve. |

### unblockSlots(slots)

<div class="api-signature">

`unblockSlots(slots: number[]): void`

</div>

Clears only slots containing the standard blocker item; ordinary items are preserved.

## Example

```js
import { BasicMachine } from "DoriosCore/index.js";

const machine = new BasicMachine(block, { rate: 20 });
if (!machine.valid) return;

machine.processIO();
machine.addProgress(machine.rate);
machine.displayEnergy();
machine.displayProgress(800);

if (machine.getProgress() >= 800) {
  machine.setProgress(0, 800);
}
```

## Remarks

- Construct a new runtime only in the machine's tick path; do not retain it between ticks.
- UI methods are intentionally skipped while the container is closed.
- Networks remain owned by UtilityCore. `processIO()` operates through compatible container and neighbor abstractions exposed to DoriosCore.
