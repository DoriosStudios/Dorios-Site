---
id: energy-storage
sidebar_label: EnergyStorage
title: EnergyStorage Class
sidebar_position: 3
---

# EnergyStorage

:::info
`EnergyStorage` is the utility class responsible for managing **Dorios Energy (DE)** for entities.

It provides a scoreboard‑based energy system that allows machines, generators, batteries, and other energy containers to:

- store energy
- consume energy
- transfer energy between entities
- display energy visually
- manage large values safely using mantissa/exponent storage

Unlike `Machine` or `Generator`, this class is **not tied to blocks**.  
Instead, it operates directly on **entities that represent energy containers**.
:::

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#entity">entity</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#scoreid">scoreId</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#cap">cap</a></div>

</div>

---

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#initializeobjectives">initializeObjectives</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#normalizevalue">normalizeValue</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#combinevalue">combineValue</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#formatenergytotext">formatEnergyToText</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getenergyfromtext">getEnergyFromText</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setcap-static">setCap</a></div>

</div>

---

## Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#setcap">setCap</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getcap">getCap</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getcapnormalized">getCapNormalized</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#set">set</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#get">get</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getnormalized">getNormalized</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getfreespace">getFreeSpace</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#add">add</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#display">display</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#consume">consume</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#has">has</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#isfull">isFull</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#rebalance">rebalance</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getpercent">getPercent</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transferto">transferTo</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transfertoentity">transferToEntity</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#receivefrom">receiveFrom</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#receivefromentity">receiveFromEntity</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transfertonetwork">transferToNetwork</a></div>

</div>

---

# Constructor

## new EnergyStorage

<div class="api-signature">

`new EnergyStorage(entity: Entity)`

</div>

Creates a new energy manager attached to the given entity.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">entity</span>
<span class="param-type">Entity</span>

Entity used as the energy container.
</li>

</ul>

### Behavior

1. Stores a reference to the entity.
2. Retrieves the entity scoreboard identity.
3. If the entity is not initialized, calls `initializeEntity()`.
4. Reads and caches the entity energy capacity.

---

# Properties

## entity

Type: `Entity`

Reference to the entity whose energy is managed.

```js
const entity = energy.entity
```

This entity represents the machine, generator, or battery storing energy.

---

## scoreId

Type: `ScoreboardIdentity`

The scoreboard identity associated with the entity.

```js
const id = energy.scoreId
```

All energy values are stored using this scoreboard identity.

---

## cap

Type: `number`

Cached maximum energy capacity of the entity.

```js
const capacity = energy.cap
```

This value is retrieved from scoreboard objectives.

---

# Static Methods

## initializeObjectives

<div class="api-signature">

`EnergyStorage.initializeObjectives(): void`

</div>

Initializes and caches the scoreboard objectives used for energy storage.

This method must be executed **once after world load**.

Loaded objectives:

- energy
- energyExp
- energyCap
- energyCapExp

---

## normalizeValue

<div class="api-signature">

`EnergyStorage.normalizeValue(amount: number)`

</div>

Converts a large number into mantissa/exponent format to stay within scoreboard limits.

Example:

```js
EnergyStorage.normalizeValue(25600000)
// → { value: 25600, exp: 3 }
```

---

## combineValue

<div class="api-signature">

`EnergyStorage.combineValue(value: number, exp: number)`

</div>

Reconstructs a full number from mantissa and exponent.

---

## formatEnergyToText

<div class="api-signature">

`EnergyStorage.formatEnergyToText(value: number): string`

</div>

Formats Dorios Energy values into human readable units.

Units supported:

- DE
- kDE
- MDE
- GDE
- TDE
- PDE

Example:

```js
EnergyStorage.formatEnergyToText(15300)
// → "15.3 kDE"
```

---

## getEnergyFromText

<div class="api-signature">

`EnergyStorage.getEnergyFromText(input: string, index?: number): number`

</div>

Parses a formatted energy string and returns the numeric DE value.

Example:

```js
EnergyStorage.getEnergyFromText("Energy: 12.5 kDE / 256 kDE", 0)
// → 12500
```

---

## setCap (static)

<div class="api-signature">

`EnergyStorage.setCap(entity: Entity, amount: number): void`

</div>

Sets the energy capacity directly for an entity.

---

# Methods

## setCap

Sets the maximum energy capacity for the entity.

---

## getCap

Returns the entity's maximum energy capacity.

---

## getCapNormalized

Returns the capacity using mantissa/exponent values.

---

## set

Sets the current energy value.

---

## get

Returns the current stored energy.

---

## getNormalized

Returns the normalized energy value `{ value, exp }`.

---

## getFreeSpace

Returns how much energy capacity remains.

---

## add

Adds energy to the entity while respecting capacity limits.

---

## display

Displays a **48‑frame energy bar item** inside the entity inventory.

---

## consume

Consumes energy from the entity.

---

## has

Checks if the entity has at least the specified energy.

---

## isFull

Returns true if the entity energy is at capacity.

---

## rebalance

Normalizes the energy value to maintain optimal mantissa/exponent scale.

---

## getPercent

Returns the energy level as a percentage of capacity.

---

## transferTo

Transfers energy to another `EnergyStorage` instance.

---

## transferToEntity

Transfers energy directly to another entity.

---

## receiveFrom

Receives energy from another `EnergyStorage` instance.

---

## receiveFromEntity

Receives energy from another entity.

---

## transferToNetwork

Transfers energy to connected machines within the energy network.

Supported modes:

- nearest
- farthest
- round

This method is used by generators and batteries to distribute energy automatically.

---

# Example

```js
const energy = new EnergyStorage(entity)

energy.setCap(25600000)
energy.set(5000000)

if (energy.has(1000)) {
  energy.consume(1000)
}

energy.display()
```

---

# Notes

`EnergyStorage` is the **core energy system** used across the Dorios machinery ecosystem.

It is used by:

- `Machine`
- `Generator`
- batteries
- energy networks

All Dorios Energy values are stored using **scoreboards with mantissa/exponent scaling** to safely support extremely large energy values.
