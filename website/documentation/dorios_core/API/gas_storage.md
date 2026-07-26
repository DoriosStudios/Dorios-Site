---
id: gas-storage
title: GasStorage class
sidebar_label: GasStorage
sidebar_position: 7
description: Manage indexed gas storage, container interactions, displays, and transfers independently from liquids.
---

# GasStorage class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`GasStorage` manages one indexed gas tank on a helper entity. Its scores, type tags, registered items, IO documents, and displays are fully separate from [`FluidStorage`](./fluid-storage).

```js
import { GasStorage } from "DoriosCore/index.js";
```

The current display formatter uses the same bucket-derived units as liquids: `mB`, `B`, `KB`, `MB`, `GB`, `TB`, `PB`, and `EB`.

## Constructor

### new GasStorage(entity, index)

<div class="api-signature">

`new GasStorage(entity: Entity, index?: number)`

</div>

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `entity` | `Entity` | — | Entity owning the gas tanks. |
| `index` | `number` | `0` | Independent gas tank index represented by this wrapper. |

The constructor binds the gas objectives for `index`, reads type and capacity, and changes an empty nonfixed tank to type `empty`.

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Owner of this gas tank. |
| `index` | `number` | Gas index managed by the wrapper. |
| `scoreId` | `ScoreboardIdentity | undefined` | Entity scoreboard identity. |
| `scores` | `{ gas, gasExp, gasCap, gasCapExp }` | Four scoreboard objectives bound to this index. |
| `shouldUpdateUI` | `boolean` | Whether the entity UI was open when the wrapper was created. |
| `type` | `string` | Cached gas type or `empty`. |
| `cap` | `number` | Cached gas capacity. |

## Static properties

### GasStorage.itemGasStorages

`Record<string, GasContainerData>` defines exact item IDs that insert gas:

```ts
interface GasContainerData {
  amount: number;
  type: string;
  output?: string;
  infinite?: boolean;
}
```

### GasStorage.itemGasHolders

`Record<string, GasHolderData>` defines empty items that extract gas:

```ts
interface GasHolderData {
  types: Record<string, string>;
  required: number;
}
```

Register addon gases and containers through DoriosLib so definitions are shared across enabled extensions.

## Initialization methods

### GasStorage.initializeSingle(entity)

`GasStorage.initializeSingle(entity: Entity): GasStorage` returns tank index `0`.

### GasStorage.initializeMultiple(entity, count)

<div class="api-signature">

`GasStorage.initializeMultiple(entity: Entity, count: number): GasStorage[]`

</div>

Stores the supported count, initializes indices `0` through `count - 1`, and returns their wrappers.

| Parameter | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Entity receiving gas storage. |
| `count` | `number` | Positive number of indexed tanks. |

```js
const [hydrogen, exhaust] = GasStorage.initializeMultiple(entity, 2);
hydrogen.setCap(8_000);
exhaust.setCap(8_000);
hydrogen.setType("example_hydrogen");
exhaust.setType("example_exhaust");
```

### GasStorage.initializeObjectives(index)

`GasStorage.initializeObjectives(index?: number): void` creates or loads `maxGases` and the four gas objectives for `index`. The default index is `0`.

### GasStorage.initialize(entity)

`GasStorage.initialize(entity: Entity): void` bootstraps the base gas score for a newly spawned standalone gas entity.

### GasStorage.hasOpenUI(entity)

`GasStorage.hasOpenUI(entity: Entity): boolean` reads the shared open-player property and safely returns `false` for an invalid entity.

### GasStorage.getMaxGases(entity)

`GasStorage.getMaxGases(entity: Entity): number` reads the `maxGases` score, falls back to indexed `gas{index}Type:` tags, and returns at least `1`.

## Formatting and item helpers

### GasStorage.normalizeValue(amount)

`normalizeValue(amount: number): NormalizedValue` produces a scoreboard-safe mantissa and exponent.

### GasStorage.combineValue(value, exp)

`combineValue(value: number, exp: number): number` reconstructs `value × 10^exp`.

### GasStorage.formatGas(value)

`formatGas(value: number): string` formats a nonnegative gas amount with the current storage unit suffixes.

### GasStorage.getGasFromText(input)

<div class="api-signature">

`GasStorage.getGasFromText(input: string): { type: string; amount: number }`

</div>

Parses legacy gas display/lore text, including type names wrapped as `Gas (type)`. Failed parsing returns `{ type: "empty", amount: 0 }`.

### GasStorage.getContainerData(id)

`getContainerData(id: string): GasContainerData | null` returns registered insertion data for an exact item ID.

### GasStorage.getSelectedInventoryItem(player)

`getSelectedInventoryItem(player: Player): SelectedInventoryItem | null` returns the selected slot, inventory, and current item, or `null`.

### GasStorage.replaceHeldGasItem(player, expectedTypeId, nextTypeId)

<div class="api-signature">

`GasStorage.replaceHeldGasItem(player: Player, expectedTypeId: string, nextTypeId?: string): boolean`

</div>

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `player` | `Player` | Yes | Player whose selected item changes. Creative players succeed without mutation. |
| `expectedTypeId` | `string` | Yes | Exact input ID still expected in the selected slot. |
| `nextTypeId` | `string` | No | Result item ID; omit to consume the input. |

Stacks are decremented and the output is inserted separately. Overflow is dropped at the player. A single item is replaced in place.

### GasStorage.handleGasItemInteraction(player, entity, mainHand)

<div class="api-signature">

`GasStorage.handleGasItemInteraction(player: Player, entity: Entity, mainHand?: ItemStack): void`

</div>

Finds a compatible indexed tank, applies a registered gas item, shows the new amount on the action bar, and replaces the held item outside Creative mode.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `player` | `Player` | Yes | Interacting player. |
| `entity` | `Entity` | Yes | Entity containing gas tanks. |
| `mainHand` | `ItemStack` | No | Explicit interaction stack; otherwise the main hand is resolved. |

## Storage methods

### hasFixedGasType()

`hasFixedGasType(): boolean` returns whether the entity has `dorios:constant_gas_type`. Fixed gas tanks retain their type at zero.

### setCap(amount) / getCap()

`setCap(amount: number): void` writes maximum capacity and reduces an amount above the new cap. `getCap(): number` reads and caches capacity.

### set(amount) / get()

`set(amount: number): void` writes a raw normalized amount. `get(): number` returns the combined amount. Prefer capacity-aware methods for gameplay insertion and consumption.

### add(amount)

<div class="api-signature">

`add(amount: number): number`

</div>

Adds a signed amount and limits positive additions to free capacity. Returns the signed amount applied. Standalone UtilityCraft gas tank entities update their health representation and remove their empty resource entity when appropriate.

### consume(amount)

`consume(amount: number): number` consumes the full amount when available. Infinite and legacy creative storage tags report success without reducing storage. Returns the amount or `0`.

### getFreeSpace() / has(amount) / isFull()

| Method | Returns | Description |
| --- | --- | --- |
| `getFreeSpace()` | `number` | Remaining gas capacity. |
| `has(amount: number)` | `boolean` | Whether at least `amount` is available. |
| `isFull()` | `boolean` | Whether storage reached capacity. |

### getType() / setType(type)

<div class="api-signature">

`getType(): string`<br />
`setType(type: string): void`

</div>

Gas types use indexed tags such as `gas0Type:example_hydrogen`. `setType` replaces the previous tag and updates the cached property.

### tryInsert(type, amount)

`tryInsert(type: string, amount: number): boolean` inserts only when the positive amount fits completely and the tank is empty or already has the same type. An empty tank adopts `type`.

### gasItem(typeId)

<div class="api-signature">

`gasItem(typeId: string): string | false`

</div>

Processes a registered gas insertion or extraction item.

- Finite insertion adds the complete registered amount.
- Infinite insertion fills all available capacity.
- Holder extraction requires a type-specific output and its full registered amount.
- The return value is the resulting item ID, or `false` when the operation fails or has no result item.

## Transfer methods

### GasStorage.transferBetween(dim, sourceLoc, targetLoc, amount)

<div class="api-signature">

`GasStorage.transferBetween(dim: Dimension, sourceLoc: Vector3, targetLoc: Vector3, amount?: number): boolean`

</div>

Transfers gas index `0` between blocks tagged `dorios:gas` and creates an empty gas-tank entity when required.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `dim` | `Dimension` | — | Dimension containing both endpoints. |
| `sourceLoc` | `Vector3` | — | Source block position. |
| `targetLoc` | `Vector3` | — | Target block position. |
| `amount` | `number` | `100` | Maximum amount transferred. |

Returns `true` when gas moves.

### GasStorage.findType(entity, type)

`findType(entity: Entity, type: string): GasStorage | null` returns an existing matching index, then the first empty index with space, or `null`.

### transferTo(other, amount) / receiveFrom(other, amount)

`transferTo(other: GasStorage, amount: number): number` moves up to `amount` when the receiver is empty or holds the same type. `receiveFrom(other, amount)` delegates in the opposite direction. Both return the moved amount.

### transferGases(block, amount)

<div class="api-signature">

`transferGases(block: Block, amount?: number): boolean`

</div>

Transfers to the cached single gas output target.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `block` | `Block` | — | Source block paired with this gas entity. |
| `amount` | `number` | `100` | Maximum amount sent. |

Stale output targets are cleared. New six-face machines normally use `machine.processIO()`.

### transferToNetwork(speed, mode, nodes)

<div class="api-signature">

`transferToNetwork(speed: number, mode?: TransferMode, nodes?: Vector3[]): number`

</div>

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `speed` | `number` | — | Total maximum amount sent. |
| `mode` | `"nearest" \| "farthest" \| "round"` | `nearest` | Target processing mode. |
| `nodes` | `Vector3[]` | — | Precomputed UtilityCore network nodes. Empty or missing arrays return `0`. |

Returns total gas transferred. DoriosCore does not discover or own the network.

## Display and tank blocks

### display(slot)

<div class="api-signature">

`display(slot?: number): void`

</div>

While the UI is open, writes `utilitycraft:{type}_00` through `utilitycraft:{type}_48` to the selected inventory slot. Empty gas tanks use the neutral empty resource bar.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `slot` | `number` | `4` | Inventory slot used by the gas display. |

:::important Required resource files
Every custom gas needs 49 display-frame items and textures. Standalone tanks also require `utilitycraft:gas_tank_{type}` behavior/resource entities using the shared geometry and an addon-owned texture. Missing frames cause `Invalid item identifier` errors when `display()` runs.
:::

### GasStorage.addGasToTank(block, type, amount)

<div class="api-signature">

`GasStorage.addGasToTank(block: Block, type: string, amount: number): Entity | undefined | false`

</div>

Finds or spawns `utilitycraft:gas_tank_{type}`, initializes it, assigns the block tier capacity, sets its gas type, and adds `amount`. Empty or missing `type` returns `undefined`; failed spawning returns `false`.

### GasStorage.getTankCapacity(typeId)

`getTankCapacity(typeId: string): number` returns `8000`, `32000`, `128000`, or `512000` for the basic through ultimate gas tanks. Unknown IDs use the basic capacity.

## Example: two-gas process

```js
import { GasStorage } from "DoriosCore/index.js";

const [hydrogen, exhaust] = GasStorage.initializeMultiple(entity, 2);
hydrogen.setCap(8_000);
exhaust.setCap(8_000);

if (hydrogen.type === "empty") hydrogen.setType("example_hydrogen");
if (exhaust.type === "empty") exhaust.setType("example_exhaust");

if (hydrogen.has(250) && exhaust.getFreeSpace() >= 100) {
  hydrogen.consume(250);
  exhaust.add(100);
}

hydrogen.display(5);
exhaust.display(6);
```

See the complete [Gas Reactor](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/machines/gasReactor.js).
