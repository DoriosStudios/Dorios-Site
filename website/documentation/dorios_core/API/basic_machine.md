---
id: basic-machine
sidebar_label: BasicMachine
title: BasicMachine Class
sidebar_position: 0
---

# BasicMachine

:::info
`BasicMachine` is the base runtime wrapper for a machine block and its helper entity.

It resolves the machine entity, checks the scheduler, exposes the entity inventory, creates an `EnergyStorage` instance, and provides common UI/progress helpers. Most addons use [`Machine`](./machine) or [`Generator`](./generator), but both are built on this class.
:::

Hierarchy:

```text
BasicMachine
|- Machine
|- Generator
`- MultiblockMachine
```

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#valid">valid</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#entity">entity</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#block">block</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#dimension">dimension</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#container">container</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#energy">energy</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#shouldupdateui">shouldUpdateUI</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#baserate">baseRate</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#processinginterval">processingInterval</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#rate">rate</a></div>

</div>

## Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#setrate">setRate</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setlabel">setLabel</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#on">on</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#off">off</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#addprogress">addProgress</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getprogress">getProgress</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setprogress">setProgress</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#displayprogress">displayProgress</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#displayenergy">displayEnergy</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#blockslots">blockSlots</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#unblockslots">unblockSlots</a></div>

</div>

---

# Constructor

## new BasicMachine

<div class="api-signature">

`new BasicMachine(block: Block, options: { rate?: number, ignoreTick?: boolean })`

</div>

Creates a runtime wrapper for the machine at `block`.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">block</span>
<span class="param-type">Block</span>

The machine block in the world.
</li>

<li>
<span class="param-name">options.rate</span>
<span class="param-type">number</span>

Base rate designed around 20 TPS logic. `Machine` reads this from `settings.machine.rate_speed_base`; `Generator` reads it from `settings.generator.rate_speed_base`.
</li>

<li>
<span class="param-name">options.ignoreTick</span>
<span class="param-type">boolean</span>

When `true`, bypasses `TickScheduler.shouldProcessMachine()` for this wrapper instance.
</li>

</ul>

### Behavior

1. Sets `valid` to `false`.
2. Resolves the helper entity from the block.
3. Checks whether the UI is open with `Utils.hasOpenUI(entity)`.
4. Skips the tick unless `ignoreTick` is true or the scheduler allows processing.
5. Creates `EnergyStorage`.
6. Reads the entity inventory container.
7. Calculates `processingInterval` and effective `rate`.
8. Sets `valid` to `true`.

Typical usage:

```js
const machine = new BasicMachine(block, { rate: 20 });
if (!machine.valid) return;
```

---

# Properties

## valid

Type: `boolean`

Whether this runtime wrapper is ready to run logic on the current tick.

`valid` is `false` if the helper entity is missing, the scheduler skipped this tick, or the entity inventory cannot be read.

## entity

Type: `Entity`

The helper entity associated with the machine block. It stores inventory, dynamic properties, tags, energy data, fluid data, and tick group state.

## block

Type: `Block`

The machine block represented by this runtime.

## dimension

Type: `Dimension`

The block's dimension.

## container

Type: `Container`

The inventory container from the helper entity.

## energy

Type: `EnergyStorage`

Energy manager attached to the helper entity.

## shouldUpdateUI

Type: `boolean`

`true` when at least one player has the machine UI open. UI-rendering helpers return early when this is false.

## baseRate

Type: `number`

The unscaled machine rate supplied through `options.rate`.

## processingInterval

Type: `number`

The tick interval returned by `TickScheduler.getProcessingInterval(entity)`. Open UIs currently use a short interval; closed machines use the active scheduler profile interval.

## rate

Type: `number`

Effective per-run rate:

```js
rate = baseRate * processingInterval;
```

Use this value for work performed only when `valid` is true.

---

# Methods

## setRate

<div class="api-signature">

`setRate(baseRate: number): void`

</div>

Updates `baseRate` and recalculates `rate` using the current `processingInterval`.

## setLabel

<div class="api-signature">

`setLabel(text: string | string[], slot?: number): void`

</div>

Writes a label item into the machine inventory. The default slot is `1`.

If `text` is a string, it becomes the item `nameTag`. If `text` is an array, the first item becomes `nameTag` and the remaining items become lore lines.

This method only updates while `shouldUpdateUI` is true.

## on

<div class="api-signature">

`on(): void`

</div>

Sets the block state `utilitycraft:on` to `true`.

## off

<div class="api-signature">

`off(): void`

</div>

Sets the block state `utilitycraft:on` to `false`.

## addProgress

<div class="api-signature">

`addProgress(amount: number, index?: number): void`

</div>

Adds to the dynamic property `dorios:progress_{index}`. The default index is `0`.

## getProgress

<div class="api-signature">

`getProgress(index?: number): number`

</div>

Reads `dorios:progress_{index}`. Returns `0` when unset.

## setProgress

<div class="api-signature">

`setProgress(value: number, maxValue?: number, options?: ProgressDisplayOptions): void`

</div>

Stores progress and optionally redraws the progress item.

```ts
type ProgressDisplayOptions = {
  slot?: number;      // default 2
  type?: string;      // default "progress_right_big_bar"
  display?: boolean;  // default true
  index?: number;     // default 0
  scale?: number;     // default 22 modern, 16 legacy
  legacy?: boolean;   // default false
};
```

`value` is clamped to at least `0`.

## displayProgress

<div class="api-signature">

`displayProgress(maxValue?: number, options?: ProgressDisplayOptions): void`

</div>

Displays the progress bar in the entity inventory.

Modern progress uses padded frame ids like:

```text
utilitycraft:progress_right_big_bar_00
utilitycraft:progress_right_big_bar_22
```

When `legacy: true`, it uses the older non-padded frame naming:

```text
utilitycraft:arrow_right_0
utilitycraft:arrow_right_16
```

## displayEnergy

<div class="api-signature">

`displayEnergy(slot?: number): void`

</div>

Delegates to `this.energy.display(slot)`. The default slot is `0`. This method only updates while `shouldUpdateUI` is true.

## blockSlots

<div class="api-signature">

`blockSlots(slots: number[]): void`

</div>

Fills empty inventory slots with the blocker item `utilitycraft:arrow_right_0`.

## unblockSlots

<div class="api-signature">

`unblockSlots(slots: number[]): void`

</div>

Clears blocker items from the given slots.

---

# Example

```js
const machine = new BasicMachine(block, { rate: 20 });
if (!machine.valid) return;

machine.displayEnergy();
machine.addProgress(machine.rate);

if (machine.getProgress() >= 800) {
  machine.setProgress(0);
}
```
