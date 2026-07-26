---
id: fluid-storage
title: FluidStorage class
sidebar_label: FluidStorage
sidebar_position: 6
description: Manage indexed liquid storage, container interactions, displays, and transfers.
---

# FluidStorage class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`FluidStorage` manages one indexed liquid tank on a helper entity. It provides large-value storage, liquid type tags, registered item interactions, UI frames, tank block entities, direct transfers, and integration with UtilityCore-managed liquid networks.

```js
import { FluidStorage } from "DoriosCore/index.js";
```

Liquid amounts use millibuckets (`mB`): `1000 mB = 1 B`.

## Constructor

### new FluidStorage(entity, index)

<div class="api-signature">

`new FluidStorage(entity: Entity, index?: number)`

</div>

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `entity` | `Entity` | — | Entity owning the liquid tanks. |
| `index` | `number` | `0` | Independent tank index managed by this instance. |

The constructor binds the four objectives for `index`, reads type and capacity, and resets an empty tank to type `empty` unless the entity has the fixed-type tag.

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Owner of this liquid tank. |
| `index` | `number` | Indexed tank managed by this wrapper. |
| `scoreId` | `ScoreboardIdentity | undefined` | Entity scoreboard identity. |
| `scores` | `{ fluid, fluidExp, fluidCap, fluidCapExp }` | Objectives bound to this index. Each value can be `undefined` before initialization. |
| `shouldUpdateUI` | `boolean` | Whether a player had the entity UI open when this wrapper was created. |
| `type` | `string` | Cached type, such as `water`, `lava`, `example_coolant`, or `empty`. |
| `cap` | `number` | Cached capacity in mB. |

## Static properties

### FluidStorage.itemFluidStorages

<div class="api-signature">

`Record<string, FluidContainerData>`

</div>

Insertion items keyed by exact item identifier.

```ts
interface FluidContainerData {
  amount: number;
  type: string;
  output?: string;
  infinite?: boolean;
}
```

### FluidStorage.itemFluidHolders

<div class="api-signature">

`Record<string, FluidHolderData>`

</div>

Empty holders that extract a supported liquid into a resulting item.

```ts
interface FluidHolderData {
  types: Record<string, string>;
  required: number;
}
```

Use the corresponding DoriosLib registry for normal cross-addon registration rather than mutating these maps directly.

## Initialization methods

### FluidStorage.initializeSingle(entity)

<div class="api-signature">

`FluidStorage.initializeSingle(entity: Entity): FluidStorage`

</div>

Returns a wrapper for tank index `0`.

### FluidStorage.initializeMultiple(entity, count)

<div class="api-signature">

`FluidStorage.initializeMultiple(entity: Entity, count: number): FluidStorage[]`

</div>

Stores the supported tank count, initializes objectives for indices `0` through `count - 1`, and returns their wrappers.

| Parameter | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Entity receiving the indexed tanks. |
| `count` | `number` | Number of tank indices to create. Use a positive integer. |

```js
const [inputTank, outputTank] = FluidStorage.initializeMultiple(entity, 2);
inputTank.setCap(8_000);
outputTank.setCap(8_000);
```

### FluidStorage.initializeObjectives(index)

<div class="api-signature">

`FluidStorage.initializeObjectives(index?: number): void`

</div>

Creates or loads `maxLiquids` and the amount/exponent/capacity objectives for `index`. The normal spawn lifecycle initializes these automatically.

### FluidStorage.initialize(entity)

<div class="api-signature">

`FluidStorage.initialize(entity: Entity): void`

</div>

Bootstraps the base liquid scoreboard identity for a newly spawned standalone liquid entity.

### FluidStorage.hasOpenUI(entity)

<div class="api-signature">

`FluidStorage.hasOpenUI(entity: Entity): boolean`

</div>

Returns whether the entity's open-player property is greater than zero. Invalid entities return `false`.

### FluidStorage.getMaxLiquids(entity)

<div class="api-signature">

`FluidStorage.getMaxLiquids(entity: Entity): number`

</div>

Returns the declared tank count. It uses the `maxLiquids` score, then indexed type tags, and always returns at least `1`.

## Formatting and item helpers

### FluidStorage.normalizeValue(amount)

`normalizeValue(amount: number): NormalizedValue` converts a raw amount to a scoreboard-safe mantissa and base-10 exponent.

### FluidStorage.combineValue(value, exp)

`combineValue(value: number, exp: number): number` reconstructs `value × 10^exp`.

### FluidStorage.formatFluid(value)

`formatFluid(value: number): string` formats a nonnegative amount using `mB`, `B`, `KB`, `MB`, `GB`, `TB`, `PB`, or `EB`.

### FluidStorage.getFluidFromText(input)

<div class="api-signature">

`FluidStorage.getFluidFromText(input: string): { type: string; amount: number }`

</div>

Parses a formatted type and amount from legacy display/lore text. Returns `{ type: "empty", amount: 0 }` when parsing fails.

### FluidStorage.getContainerData(id)

`getContainerData(id: string): FluidContainerData | null` returns registered insertion data for an exact item ID.

### FluidStorage.getSelectedInventoryItem(player)

<div class="api-signature">

`FluidStorage.getSelectedInventoryItem(player: Player): SelectedInventoryItem | null`

</div>

Returns the selected hotbar slot, player inventory container, and current item. Returns `null` when the player or inventory cannot be resolved.

### FluidStorage.replaceHeldFluidItem(player, expectedTypeId, nextTypeId)

<div class="api-signature">

`FluidStorage.replaceHeldFluidItem(player: Player, expectedTypeId: string, nextTypeId?: string): boolean`

</div>

Safely consumes or replaces one selected item after a liquid interaction.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `player` | `Player` | Yes | Player whose selected slot is changed. Creative players succeed without mutation. |
| `expectedTypeId` | `string` | Yes | Item ID that must still be present in the selected slot. |
| `nextTypeId` | `string` | No | Result item. Omit to consume without replacement. |

Stacked inputs are decremented and the result is inserted elsewhere; overflow is dropped at the player. A single input is replaced in place.

### FluidStorage.handleFluidItemInteraction(player, entity, mainHand)

<div class="api-signature">

`FluidStorage.handleFluidItemInteraction(player: Player, entity: Entity, mainHand?: ItemStack): void`

</div>

Uses a registered insertion item against the first compatible indexed tank, shows the updated amount on the action bar, and updates the held item outside Creative mode.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `player` | `Player` | Yes | Interacting player. |
| `entity` | `Entity` | Yes | Target with one or more liquid tanks. |
| `mainHand` | `ItemStack` | No | Explicit interaction item; when omitted, the player's main hand is read. |

## Storage methods

### hasFixedFluidType()

`hasFixedFluidType(): boolean` returns whether the entity has tag `dorios:constant_fluid_type`. Fixed tanks keep their type when empty.

### setCap(amount) / getCap()

<div class="api-signature">

`setCap(amount: number): void`<br />
`getCap(): number`

</div>

`setCap` stores maximum capacity in mB and reduces current storage if the new capacity is smaller. `getCap` reads, caches, and returns it.

### set(amount) / get()

<div class="api-signature">

`set(amount: number): void`<br />
`get(): number`

</div>

`set` writes a raw normalized amount; `get` returns the combined amount. Prefer `add`, `consume`, or `tryInsert` when capacity and availability must be enforced.

### add(amount)

<div class="api-signature">

`add(amount: number): number`

</div>

Adds a signed amount, limiting positive additions to free capacity. Returns the signed amount applied. For standalone UtilityCraft tank entities, this also updates their visible health and removes the empty resource entity when appropriate.

### consume(amount)

<div class="api-signature">

`consume(amount: number): number`

</div>

Consumes the full amount only when enough liquid is stored. Infinite and legacy creative storage tags report success without changing storage. Returns the amount consumed or `0`.

### getFreeSpace() / has(amount) / isFull()

| Method | Returns | Description |
| --- | --- | --- |
| `getFreeSpace()` | `number` | Remaining capacity in mB. |
| `has(amount: number)` | `boolean` | Whether at least `amount` is stored. |
| `isFull()` | `boolean` | Whether stored amount has reached capacity. |

### getType() / setType(type)

<div class="api-signature">

`getType(): string`<br />
`setType(type: string): void`

</div>

Types are stored as indexed tags such as `fluid0Type:water`. `setType` removes the previous tag, adds the new tag, and refreshes the cached `type`.

### tryInsert(type, amount)

<div class="api-signature">

`tryInsert(type: string, amount: number): boolean`

</div>

Performs an exact insertion only when `amount` is positive, the tank is empty or already contains `type`, and the full amount fits. Empty tanks adopt `type`.

### fluidItem(typeId)

<div class="api-signature">

`fluidItem(typeId: string): string | false`

</div>

Processes one registered insertion or extraction item.

- Finite insertion adds the registered amount and returns its `output`, or `false` when no output is defined.
- Infinite insertion fills all free space and returns `output ?? typeId`.
- A registered holder consumes its `required` amount and returns the type-specific filled item.
- Unsupported or invalid operations return `false`.

## Transfer methods

### FluidStorage.transferBetween(dim, sourceLoc, targetLoc, amount)

<div class="api-signature">

`FluidStorage.transferBetween(dim: Dimension, sourceLoc: Vector3, targetLoc: Vector3, amount?: number): boolean`

</div>

Transfers index `0` between two blocks tagged `dorios:fluid`. Empty tank blocks receive their helper entity automatically.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `dim` | `Dimension` | — | Dimension containing both endpoints. |
| `sourceLoc` | `Vector3` | — | Source block coordinates. |
| `targetLoc` | `Vector3` | — | Target block coordinates. |
| `amount` | `number` | `100` | Maximum mB transferred. |

Returns `true` when liquid moves.

### FluidStorage.findType(entity, type)

`findType(entity: Entity, type: string): FluidStorage | null` returns the existing indexed tank containing `type`; otherwise the first empty tank with free space; otherwise `null`.

### transferTo(other, amount) / receiveFrom(other, amount)

<div class="api-signature">

`transferTo(other: FluidStorage, amount: number): number`<br />
`receiveFrom(other: FluidStorage, amount: number): number`

</div>

Moves up to `amount` between wrappers. The receiver must be empty or contain the same type. The return value is the amount moved. `receiveFrom` delegates to `other.transferTo(this, amount)`.

### transferFluids(block, amount)

<div class="api-signature">

`transferFluids(block: Block, amount?: number): boolean`

</div>

Transfers to the cached single liquid output target and clears stale targets.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `block` | `Block` | — | Source block represented by this storage entity. |
| `amount` | `number` | `100` | Maximum mB moved. |

For new six-face machinery use `machine.processIO()`; this method remains useful for a fixed legacy output direction.

### transferToNetwork(speed, mode, nodes)

<div class="api-signature">

`transferToNetwork(speed: number, mode?: TransferMode, nodes?: Vector3[]): number`

</div>

Transfers liquid to precomputed positions supplied by UtilityCore.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `speed` | `number` | — | Total maximum mB sent. |
| `mode` | `"nearest" \| "farthest" \| "round"` | `nearest` | Sequential or distributed target processing. |
| `nodes` | `Vector3[]` | — | Precomputed network nodes. Missing or empty arrays return `0`. |

Returns total mB transferred. Network discovery is not owned by DoriosCore.

## Display and tank blocks

### display(slot)

<div class="api-signature">

`display(slot?: number): void`

</div>

While the UI is open, writes `utilitycraft:{type}_00` through `utilitycraft:{type}_48` into the selected slot. Empty tanks use the shared empty resource bar.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `slot` | `number` | `4` | Inventory slot used by the liquid display. |

:::important Resource frames
Every registered custom liquid displayed in a UI needs item definitions for all 49 frame IDs and matching textures. A standalone liquid also needs its resource entity definition and texture. The Addon Template contains a verified implementation.
:::

### FluidStorage.addfluidToTank(block, type, amount)

<div class="api-signature">

`FluidStorage.addfluidToTank(block: Block, type: string, amount: number): Entity | undefined | false`

</div>

Finds or spawns `utilitycraft:fluid_tank_{type}`, initializes capacity from the tank block tier, assigns its type, and adds `amount`.

:::note Exact method name
The public method is currently named `addfluidToTank` with a lowercase `f`. Use that spelling for compatibility.
:::

### FluidStorage.getTankCapacity(typeId)

`getTankCapacity(typeId: string): number` returns `8000`, `32000`, `128000`, or `512000` mB for UtilityCraft's basic through ultimate tanks. Unknown IDs use the basic capacity.

## Example

```js
import { FluidStorage } from "DoriosCore/index.js";

const [coolant, waste] = FluidStorage.initializeMultiple(entity, 2);
coolant.setCap(8_000);
waste.setCap(8_000);
coolant.setType("example_coolant");

if (coolant.has(250) && waste.getFreeSpace() >= 100) {
  coolant.consume(250);
  waste.tryInsert("example_waste", 100);
}

coolant.display(4);
waste.display(5);
```

See the complete [Fluid Washer](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/machines/fluidWasher.js) for scripted processing and IO registration.
