---
id: basic-machine
sidebar_label: BasicMachine
title: BasicMachine Class
---

# BasicMachine

:::info
`BasicMachine` is the foundational class of **Dorios Machinery Core**.

It provides the base infrastructure required for machine logic including:

- machine entity access
- inventory container access
- progress tracking
- energy integration
- refresh‑speed tick validation
:::

Both higher level machine classes extend this base:

```
BasicMachine
├─ Machine
└─ Generator
```

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#entity">entity</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#block">block</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#dimension">dimension</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#container">container</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#energy">energy</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#baserate">baseRate</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#rate">rate</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#valid">valid</a></div>

</div>

---

## Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#new-basicmachine">constructor</a></div>
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

`new BasicMachine(block: Block, rate: number)`

</div>

Creates a new machine instance bound to a machine block.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">block</span>
<span class="param-type">Block</span>

The block representing the machine in the world.
</li>

<li>
<span class="param-name">rate</span>
<span class="param-type">number</span>

Base energy processing rate defined by the machine configuration.
</li>

</ul>

---

# Properties

## entity

Type: `Entity`

Reference to the machine entity associated with the block.

```js
const entity = machine.entity
```

This entity stores runtime machine data such as:

- dynamic properties
- progress values
- machine inventory

---

## block

Type: `Block`

Block representing the machine in the world.

```js
const block = machine.block
```

Used for block state manipulation and machine visuals.

---

## dimension

Type: `Dimension`

Dimension where the machine exists.

```js
const dimension = machine.dimension
```

Useful when interacting with nearby entities or spawning items.

---

## container

Type: `Container`

Inventory container attached to the machine entity.

```js
const container = machine.container
```

Used for:

- input items
- output items
- UI display items

---

## energy

Type: `EnergyStorage`

Energy manager associated with the machine.

```js
const energy = machine.energy
```

Handles:

- energy capacity
- energy transfer
- energy UI display

---

## baseRate

Type: `number`

Base processing rate defined by the machine configuration.

```js
const baseRate = machine.baseRate
```

This value represents the **energy or progress rate per tick**, assuming normal Minecraft tick speed.

Example:

```
baseRate = 20
```

Means the machine processes **20 units per tick**.

---

## rate

Type: `number`

Effective processing rate used internally by the machine.

```js
const rate = machine.rate
```

The rate is automatically scaled using the addon's **refresh speed**.

```
rate = baseRate * tickSpeed
```

Example:

```
baseRate = 20
tickSpeed = 20
rate = 400
```

This ensures machines keep the same behavior even when the addon processes logic less frequently.

---

## valid

Type: `boolean`

Indicates whether the machine should process logic during the current tick.

```js
const valid = machine.valid
```

The machine becomes invalid if:

- the machine entity cannot be found
- the current tick is skipped due to refresh‑speed optimization

Typical usage:

```js
if (!machine.valid) return
```

---

# Methods

## setRate

<div class="api-signature">

`setRate(baseRate: number): void`

</div>

Updates the machine base rate and recalculates the effective rate.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">baseRate</span>
<span class="param-type">number</span>

New base processing rate.
</li>

</ul>

---

## setLabel

<div class="api-signature">

`setLabel(text: string, slot?: number): void`

</div>

Displays a label inside the machine inventory using a placeholder item.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">text</span>
<span class="param-type">string</span>

Text displayed in the label.
</li>

<li>
<span class="param-name">slot</span>
<span class="param-type">number</span>

Inventory slot used for the label.
</li>

</ul>

---

## addProgress

<div class="api-signature">

`addProgress(amount: number, index?: number): void`

</div>

Adds progress to the machine.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">amount</span>
<span class="param-type">number</span>

Amount of progress added to the machine.
</li>

<li>
<span class="param-name">index</span>
<span class="param-type">number</span>

Optional progress index used when machines track multiple progress values.
</li>

</ul>

---

## getProgress

<div class="api-signature">

`getProgress(index?: number): number`

</div>

Returns the current progress value stored in the machine.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">index</span>
<span class="param-type">number</span>

Progress index to retrieve.
</li>

</ul>

---

## setProgress

<div class="api-signature">

`setProgress(value: number, options?: object): void`

</div>

Sets the machine progress value and optionally updates the visual progress bar.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">value</span>
<span class="param-type">number</span>

New progress value.
</li>

<li>
<span class="param-name">options</span>
<span class="param-type">object</span>

Optional display configuration.

Supported options:

```
slot?: number
type?: string
display?: boolean
index?: number
```
</li>

</ul>

### Options

<ul class="api-params">

<li>
<span class="param-name">slot</span>
<span class="param-type">number</span>

Inventory slot used to render the progress item.
</li>

<li>
<span class="param-name">type</span>
<span class="param-type">string</span>

Texture type used for the progress indicator.

Example:

```
arrow_right
arrow_left
```
</li>

<li>
<span class="param-name">display</span>
<span class="param-type">boolean</span>

Whether the progress bar should update visually.
</li>

<li>
<span class="param-name">index</span>
<span class="param-type">number</span>

Progress index used when multiple progress bars exist.
</li>

</ul>

---

## displayProgress

<div class="api-signature">

`displayProgress(maxValue: number, options?: object): void`

</div>

Displays the machine progress visually inside the machine inventory.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">maxValue</span>
<span class="param-type">number</span>

Maximum progress value used to normalize the visual scale.
</li>

<li>
<span class="param-name">options</span>
<span class="param-type">object</span>

Display configuration options.

```
slot?: number
type?: string
index?: number
scale?: number
```
</li>

</ul>

### Options

<ul class="api-params">

<li>
<span class="param-name">slot</span>
<span class="param-type">number</span>

Inventory slot used to display the progress item.
</li>

<li>
<span class="param-name">type</span>
<span class="param-type">string</span>

Progress bar texture identifier.
</li>

<li>
<span class="param-name">index</span>
<span class="param-type">number</span>

Progress index to read from.
</li>

<li>
<span class="param-name">scale</span>
<span class="param-type">number</span>

Maximum visual progress scale.

Example:

```
scale = 16
```

Creates a progress bar with **16 visual steps**.
</li>

</ul>

---

## displayEnergy

<div class="api-signature">

`displayEnergy(slot?: number): void`

</div>

Displays the current machine energy using `EnergyStorage.display()`.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">slot</span>
<span class="param-type">number</span>

Inventory slot used to display the energy bar.
</li>

</ul>

---

## blockSlots

<div class="api-signature">

`blockSlots(slots: number[]): void`

</div>

Blocks inventory slots using a placeholder item.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">slots</span>
<span class="param-type">number[]</span>

Array of slot indices to block.
</li>

</ul>

---

## unblockSlots

<div class="api-signature">

`unblockSlots(slots: number[]): void`

</div>

Removes placeholder items used for blocked slots.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">slots</span>
<span class="param-type">number[]</span>

Array of slot indices to unblock.
</li>

</ul>

---

# Example

```js
const machine = new BasicMachine(block, 20)

if (!machine.valid) return

machine.displayEnergy()

machine.addProgress(machine.rate)

if (machine.getProgress() >= 200) {
  machine.setProgress(0)
}
```

---

# Notes

`BasicMachine` is designed as the core infrastructure class of Dorios Machinery Core.

Higher‑level machine behavior is implemented in:

- `Machine`
- `Generator`
