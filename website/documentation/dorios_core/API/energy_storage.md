---
id: energy-storage
title: EnergyStorage class
sidebar_label: EnergyStorage
sidebar_position: 5
description: Store, format, display, consume, and transfer Dorios Energy on a helper entity.
---

# EnergyStorage class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`EnergyStorage` manages Dorios Energy (DE) on a helper entity. It uses scoreboard-safe mantissa and exponent values so large capacities remain usable through ordinary numeric methods.

```js
import { EnergyStorage } from "DoriosCore/index.js";
```

## Definition

<div class="api-signature">

`class EnergyStorage`

</div>

## Constructor

### new EnergyStorage(entity)

<div class="api-signature">

`new EnergyStorage(entity: Entity)`

</div>

Creates an energy manager and ensures the entity has a scoreboard identity.

| Parameter | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Helper or storage entity whose energy values are managed. |

```js
const energy = new EnergyStorage(entity);
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Entity that owns the stored energy. |
| `scoreId` | `ScoreboardIdentity | undefined` | Identity used by the energy objectives. |
| `cap` | `number` | Cached capacity last loaded or assigned by the manager. |

## Static methods

### EnergyStorage.initializeObjectives()

<div class="api-signature">

`EnergyStorage.initializeObjectives(): void`

</div>

Creates or loads the `energy`, `energyExp`, `energyCap`, and `energyCapExp` scoreboard objectives. DoriosCore calls this during initialization; normal addons do not need to call it.

### EnergyStorage.normalizeValue(amount)

<div class="api-signature">

`EnergyStorage.normalizeValue(amount: number): NormalizedValue`

</div>

Converts a number into a scoreboard-safe pair.

| Parameter | Type | Description |
| --- | --- | --- |
| `amount` | `number` | Raw energy amount to normalize. Nonfinite values are normalized safely by the storage implementation. |

Returns:

```ts
interface NormalizedValue {
  value: number; // mantissa
  exp: number;   // base-10 exponent
}
```

### EnergyStorage.combineValue(value, exp)

<div class="api-signature">

`EnergyStorage.combineValue(value: number, exp: number): number`

</div>

Reconstructs `value × 10^exp`.

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `number` | Stored mantissa. |
| `exp` | `number` | Stored base-10 exponent. |

### EnergyStorage.formatEnergyToText(value)

<div class="api-signature">

`EnergyStorage.formatEnergyToText(value: number): string`

</div>

Formats energy using `DE`, `kDE`, `MDE`, `GDE`, `TDE`, or `PDE`.

```js
EnergyStorage.formatEnergyToText(1_500_000); // "1.50 MDE"
```

### EnergyStorage.getEnergyFromText(input, index)

<div class="api-signature">

`EnergyStorage.getEnergyFromText(input: string, index?: number): number | undefined`

</div>

Parses a formatted energy amount from display or preserved-lore text.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `input` | `string` | — | Text containing one or more formatted DE values. |
| `index` | `number` | `0` | Zero-based formatted value to return. For preserved `stored / capacity` text, `0` selects stored energy and `1` selects capacity. |

Returns `undefined` when the requested value cannot be parsed.

### EnergyStorage.setCap(entity, amount)

<div class="api-signature">

`EnergyStorage.setCap(entity: Entity, amount: number): void`

</div>

Sets capacity without retaining a manager instance.

| Parameter | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Entity receiving the new capacity. |
| `amount` | `number` | Maximum DE amount. |

## Instance methods

### setCap(amount)

<div class="api-signature">

`setCap(amount: number): void`

</div>

Stores a new maximum capacity and updates the cached `cap` value.

### getCap()

<div class="api-signature">

`getCap(): number`

</div>

Reads, combines, caches, and returns maximum capacity.

### getCapNormalized()

<div class="api-signature">

`getCapNormalized(): NormalizedValue`

</div>

Returns the capacity mantissa and exponent without combining them.

### set(amount)

<div class="api-signature">

`set(amount: number): void`

</div>

Normalizes and stores the raw current energy amount. Use `add()` or `consume()` when capacity and availability must be enforced.

| Parameter | Type | Description |
| --- | --- | --- |
| `amount` | `number` | Raw stored amount. |

### get()

<div class="api-signature">

`get(): number`

</div>

Returns current stored energy as a regular number.

### getNormalized()

<div class="api-signature">

`getNormalized(): NormalizedValue`

</div>

Returns current stored energy as a mantissa/exponent pair.

### getFreeSpace()

<div class="api-signature">

`getFreeSpace(): number`

</div>

Returns `max(0, capacity - stored)`.

### add(amount)

<div class="api-signature">

`add(amount: number): number`

</div>

Adds energy without exceeding free capacity for positive requests. Negative values subtract directly, so callers should use `consume()` when insufficient storage must fail safely.

| Parameter | Type | Description |
| --- | --- | --- |
| `amount` | `number` | Requested signed energy change. |

Returns the signed amount actually applied.

### consume(amount)

<div class="api-signature">

`consume(amount: number): number`

</div>

Consumes the full requested amount only when it is available. Entities tagged `dorios:infinite_storage` or with the legacy `creative` tag report success without reducing their value.

| Parameter | Type | Description |
| --- | --- | --- |
| `amount` | `number` | Positive amount required by the operation. |

Returns `amount` on success and `0` for nonpositive or insufficient requests.

### has(amount)

<div class="api-signature">

`has(amount: number): boolean`

</div>

Returns whether stored energy is at least `amount`.

### isFull()

<div class="api-signature">

`isFull(): boolean`

</div>

Returns whether no free capacity remains.

### rebalance()

<div class="api-signature">

`rebalance(): void`

</div>

Reads and rewrites the current amount to restore the preferred mantissa/exponent scale.

### getPercent()

<div class="api-signature">

`getPercent(): number`

</div>

Returns fill percentage from `0` through `100`.

### display(slot)

<div class="api-signature">

`display(slot?: number): void`

</div>

Writes the correct 48-frame `utilitycraft:energy_00` through `utilitycraft:energy_48` item into the entity inventory. The item label includes stored energy, capacity, and percentage.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `slot` | `number` | `0` | Destination inventory slot. |

### transferTo(other, amount)

<div class="api-signature">

`transferTo(other: EnergyStorage, amount: number): number`

</div>

Moves up to `amount`, limited by source contents and target free space.

| Parameter | Type | Description |
| --- | --- | --- |
| `other` | `EnergyStorage` | Receiving storage. |
| `amount` | `number` | Maximum DE to move. |

Returns the transferred amount.

### transferToEntity(entity, amount)

<div class="api-signature">

`transferToEntity(entity: Entity, amount: number): number`

</div>

Creates an `EnergyStorage` wrapper for `entity` and transfers up to `amount` into it.

### receiveFrom(other, amount)

<div class="api-signature">

`receiveFrom(other: EnergyStorage, amount: number): number`

</div>

Moves energy from `other` into this storage. The amount is limited by the source and this storage's free space.

### receiveFromEntity(entity, amount)

<div class="api-signature">

`receiveFromEntity(entity: Entity, amount: number): number`

</div>

Creates a source wrapper for `entity` and receives up to `amount`.

### transferToNetwork(speed, mode)

<div class="api-signature">

`transferToNetwork(speed: number, mode?: TransferMode): number`

</div>

Sends energy to node positions supplied by UtilityCore's network system. DoriosCore performs the storage transfers; UtilityCore owns network discovery and connectivity.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `speed` | `number` | — | Total maximum DE sent by this call. |
| `mode` | `"nearest" \| "farthest" \| "round"` | Entity `transferMode`, then `nearest` | Target ordering or distribution behavior. |

Stale cached node positions and tags are removed when they no longer resolve to energy containers. Returns total transferred energy.

## Example

```js
import { EnergyStorage } from "DoriosCore/index.js";

const energy = new EnergyStorage(entity);
energy.setCap(256_000);

const accepted = energy.add(5_000);

if (energy.has(800)) {
  energy.consume(800);
}

energy.transferToNetwork(4_000, "nearest");
energy.display(0);
```

## Remarks

- `Machine` and `Generator` automatically create an energy manager as `runtime.energy`.
- Normal addon code does not manipulate scoreboard objectives directly.
- Call `display()` only for a slot backed by the required UtilityCraft resource-pack frames.
