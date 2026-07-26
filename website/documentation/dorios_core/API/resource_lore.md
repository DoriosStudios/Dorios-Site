---
id: resource-lore
title: Resource item lore
sidebar_label: Resource item lore
sidebar_position: 18
description: Preserve indexed energy, liquid, and gas storage in dropped machine and tank items.
---

# Resource item lore

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

The resource-lore API serializes energy, indexed liquids, and indexed gases into an `ItemStack`'s lore. DoriosCore uses it to preserve stored resources when machines, generators, and tanks are broken and to restore them when placed again.

```js
import {
  RESOURCE_LORE_MARKERS,
  buildEnergyLoreLine,
  buildFluidLoreLine,
  buildGasLoreLine,
  createResourceLore,
  getResourcesFromItem,
  parseResourceLore,
  restoreResourceSnapshot,
} from "DoriosCore/index.js";
```

:::tip
`Machine`, `Generator`, and the built-in tank lifecycle already preserve their resources. Use these functions directly when an addon-owned block or custom subclass has its own destruction or placement lifecycle.
:::

## Data contracts

```ts
interface StoredResourceEntry {
  index: number;
  type: string;
  amount: number;
}

interface StoredResourceSnapshot {
  energy: number;
  fluids: StoredResourceEntry[];
  gases: StoredResourceEntry[];
}
```

Entries are sorted by storage index when parsed. Empty, nonpositive, malformed, and invalid-index entries are omitted.

## Markers

<div class="api-signature">

`RESOURCE_LORE_MARKERS: Readonly<{ energy: "§e§r"; fluid: "§l§r"; gas: "§g§r" }>`

</div>

The marker at the beginning of a lore line identifies its resource category. Liquid and gas lines also encode their storage index in invisible formatting codes. Treat generated lines as an opaque persistence format; display text may change while the parser continues to recognize supported formats.

## Line builders

### buildEnergyLoreLine(amount, cap)

`buildEnergyLoreLine(amount: number, cap: number): string` returns a marked line containing formatted stored energy and capacity.

### buildFluidLoreLine(index, type, amount, cap)

<div class="api-signature">

`buildFluidLoreLine(index: number, type: string, amount: number, cap: number): string`

</div>

Returns an indexed liquid line. Underscores in `type` become spaces and words are capitalized. The special `xp` type displays its stored amount as integer millibuckets.

### buildGasLoreLine(index, type, amount, cap)

`buildGasLoreLine(index: number, type: string, amount: number, cap: number): string` returns an indexed gas line labeled `Gas (Type)` using `GasStorage.formatGas()`.

### Builder parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `index` | `number` | Zero-based liquid or gas storage index. Values are normalized to a nonnegative integer. |
| `type` | `string` | Registered resource type stored by the manager. |
| `amount` | `number` | Current stored amount. |
| `cap` | `number` | Storage capacity shown when the line fits. |

Each builder enforces Minecraft's 50-character lore-line limit. It first omits the capacity when necessary and throws `RangeError` if the stored-value form is still too long.

## Serialize an entity

### createResourceLore(entity, options)

<div class="api-signature">

`createResourceLore(entity: Entity, options?: { energy?: boolean; fluids?: boolean; gases?: boolean }): string[]`

</div>

Reads nonempty storages from an initialized helper entity and returns marked lore lines.

| Option | Default | Description |
| --- | --- | --- |
| `energy` | `true` | Includes energy when stored energy is greater than zero. |
| `fluids` | Auto-detected | Includes every nonempty indexed liquid storage. Auto-detection uses the fluid-container type family or indexed fluid type tags. |
| `gases` | Auto-detected | Includes every nonempty indexed gas storage. Auto-detection uses the gas-container type family or indexed gas type tags. |

Set a value explicitly to override auto-detection. Empty resources and the `empty` resource type are skipped. A result exceeding Minecraft's 20-line item-lore limit throws `RangeError`.

```js
const machineItem = new ItemStack(block.typeId);
const lore = createResourceLore(machine.entity, {
  energy: true,
  fluids: true,
  gases: true,
});

if (lore.length > 0) machineItem.setLore(lore);
```

## Parse item lore

### parseResourceLore(lore)

<div class="api-signature">

`parseResourceLore(lore: readonly string[]): StoredResourceSnapshot`

</div>

Decodes marked resource lines and returns a complete snapshot. It also recognizes the former single-resource formats for compatibility:

- an unmarked line beginning with `Energy:`;
- an unmarked line beginning with `Gas (` for gas index `0`;
- an unmarked liquid line containing a stored/capacity separator for liquid index `0`.

Missing or invalid input returns `{ energy: 0, fluids: [], gases: [] }`.

### getResourcesFromItem(item)

`getResourcesFromItem(item: ItemStack | undefined): StoredResourceSnapshot` reads `item.getLore()` and passes it to `parseResourceLore()`. `undefined` returns an empty snapshot.

```js
const snapshot = getResourcesFromItem(event.itemStack);
```

## Restore initialized managers

### restoreResourceSnapshot(snapshot, managers)

<div class="api-signature">

```ts
restoreResourceSnapshot(
  snapshot: StoredResourceSnapshot,
  managers?: {
    energy?: EnergyStorage;
    fluids?: FluidStorage[];
    gases?: GasStorage[];
  },
): void
```

</div>

Restores a snapshot into managers that the caller already created and configured.

- Energy is clamped from `0` through the target capacity.
- Each liquid or gas entry is matched to `managers.fluids[index]` or `managers.gases[index]`.
- Indexed amounts are clamped to the matching capacity.
- Missing managers, unsupported indexes, empty types, and nonpositive values are skipped.
- For valid indexed entries, the type is restored before the amount.

```js
import {
  EnergyStorage,
  FluidStorage,
  GasStorage,
  getResourcesFromItem,
  restoreResourceSnapshot,
} from "DoriosCore/index.js";

const snapshot = getResourcesFromItem(placedItem);

const energy = new EnergyStorage(entity);
energy.setCap(100_000);

const fluids = [new FluidStorage(entity, 0), new FluidStorage(entity, 1)];
fluids[0].setCap(4_000);
fluids[1].setCap(4_000);

const gases = [new GasStorage(entity, 0)];
gases[0].setCap(8_000);

restoreResourceSnapshot(snapshot, { energy, fluids, gases });
```

## Remarks

- Create and configure capacities before calling `restoreResourceSnapshot()`; a manager with zero capacity cannot receive stored data.
- Pass managers in their actual index order. The snapshot preserves sparse indexes and does not compact them.
- Do not parse the visible labels yourself. Use `parseResourceLore()` or `getResourcesFromItem()` so indexed and legacy formats remain supported.
