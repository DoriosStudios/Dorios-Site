---
id: energy-storage
sidebar_label: EnergyStorage
title: EnergyStorage Class
sidebar_position: 3
---

# EnergyStorage

:::info
`EnergyStorage` manages Dorios Energy (DE) for entities using scoreboards.

It stores both current energy and capacity as mantissa/exponent pairs, allowing very large values while staying within scoreboard-safe ranges.
:::

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#entity">entity</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#scoreid">scoreId</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#cap">cap</a></div>

</div>

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#initializeobjectives">initializeObjectives</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#normalizevalue">normalizeValue</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#combinevalue">combineValue</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#formatenergytotext">formatEnergyToText</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getenergyfromtext">getEnergyFromText</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setcap-static">setCap</a></div>

</div>

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

Creates an energy manager for an entity. If the entity does not yet have a scoreboard identity, the Core attempts to initialize it first.

---

# Properties

## entity

Type: `Entity`

Entity whose energy is managed.

## scoreId

Type: `ScoreboardIdentity`

Scoreboard identity used for all energy objectives.

## cap

Type: `number`

Cached capacity loaded from `getCap()`.

---

# Static Methods

## initializeObjectives

<div class="api-signature">

`EnergyStorage.initializeObjectives(): void`

</div>

Loads or creates the shared objectives:

- `energy`
- `energyExp`
- `energyCap`
- `energyCapExp`

This is called automatically by the DoriosCore initializer on `worldLoad`.

## normalizeValue

<div class="api-signature">

`EnergyStorage.normalizeValue(amount: number): { value: number, exp: number }`

</div>

Converts a raw value to a scoreboard-safe mantissa/exponent pair.

```js
EnergyStorage.normalizeValue(25_600_000);
// { value: 25600000, exp: 0 }
```

Values are only shifted when the mantissa would exceed `1e9`.

## combineValue

<div class="api-signature">

`EnergyStorage.combineValue(value: number, exp: number): number`

</div>

Reconstructs the raw value:

```js
EnergyStorage.combineValue(25600, 3); // 25600000
```

## formatEnergyToText

<div class="api-signature">

`EnergyStorage.formatEnergyToText(value: number): string`

</div>

Formats values as `DE`, `kDE`, `MDE`, `GDE`, `TDE`, or `PDE`.

## getEnergyFromText

<div class="api-signature">

`EnergyStorage.getEnergyFromText(input: string, index?: number): number | undefined`

</div>

Parses a formatted lore/status string and returns the selected DE value. `index` selects which number to read; `0` is current energy and `1` is capacity in preserved machine lore.

## setCap (static)

<div class="api-signature">

`EnergyStorage.setCap(entity: Entity, amount: number): void`

</div>

Sets capacity directly for an entity.

---

# Methods

## setCap

<div class="api-signature">

`setCap(amount: number): void`

</div>

Sets maximum capacity for this entity.

## getCap

<div class="api-signature">

`getCap(): number`

</div>

Reads and caches maximum capacity.

## getCapNormalized

<div class="api-signature">

`getCapNormalized(): { value: number, exp: number }`

</div>

Reads capacity without combining mantissa and exponent.

## set

<div class="api-signature">

`set(amount: number): void`

</div>

Sets current energy.

## get

<div class="api-signature">

`get(): number`

</div>

Returns current energy.

## getNormalized

<div class="api-signature">

`getNormalized(): { value: number, exp: number }`

</div>

Returns current energy as stored.

## getFreeSpace

<div class="api-signature">

`getFreeSpace(): number`

</div>

Returns remaining capacity.

## add

<div class="api-signature">

`add(amount: number): number`

</div>

Adds energy while respecting capacity. Negative values are allowed internally for subtraction. Returns the amount applied.

## display

<div class="api-signature">

`display(slot?: number): void`

</div>

Writes a 48-frame energy bar item into the entity inventory. The default slot is `0`.

## consume

<div class="api-signature">

`consume(amount: number): number`

</div>

Consumes energy only if the full amount is available. Returns `0` when insufficient. Entities tagged with the Core creative tag act as if the amount was consumed without reducing storage.

## has

<div class="api-signature">

`has(amount: number): boolean`

</div>

Returns whether current energy is at least `amount`.

## isFull

<div class="api-signature">

`isFull(): boolean`

</div>

Returns whether free space is `0`.

## rebalance

<div class="api-signature">

`rebalance(): void`

</div>

Rewrites current energy through `set(get())` to normalize mantissa/exponent storage.

## getPercent

<div class="api-signature">

`getPercent(): number`

</div>

Returns storage percentage from `0` to `100`.

## transferTo

<div class="api-signature">

`transferTo(other: EnergyStorage, amount: number): number`

</div>

Transfers up to `amount` into another storage, limited by source energy and target free space.

## transferToEntity

<div class="api-signature">

`transferToEntity(entity: Entity, amount: number): number`

</div>

Creates a temporary `EnergyStorage` for the target entity and transfers to it.

## receiveFrom

<div class="api-signature">

`receiveFrom(other: EnergyStorage, amount: number): number`

</div>

Consumes from another storage and adds to this one.

## receiveFromEntity

<div class="api-signature">

`receiveFromEntity(entity: Entity, amount: number): number`

</div>

Creates a temporary `EnergyStorage` for the source entity and receives from it.

## transferToNetwork

<div class="api-signature">

`transferToNetwork(speed: number, mode?: "nearest" | "farthest" | "round"): number`

</div>

Transfers energy to connected energy containers.

Current behavior:

- Reads cached network nodes from dynamic property `dorios:energy_nodes`.
- Rebuilds the cache from `pos:[x,y,z]` and `net:[x,y,z]` tags when needed.
- Removes stale network tags and stale cached nodes.
- Uses the entity dynamic property `transferMode` when `mode` is not supplied.

---

# Example

```js
const energy = new EnergyStorage(entity);

energy.setCap(256000);
energy.add(5000);

if (energy.has(800)) {
  energy.consume(800);
}

energy.transferToNetwork(energy.get(), "nearest");
energy.display();
```
