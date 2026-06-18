---
id: fluid-storage
sidebar_label: FluidStorage
title: FluidStorage Class
sidebar_position: 4
---

# FluidStorage

:::info
`FluidStorage` manages fluids for entities using scoreboard-backed tanks.

Each instance represents one tank index on one entity. The class also handles fluid item registration, bucket/cell-style interactions, tank entity spawning, cached output transfer, and multi-tank lookup.
:::

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#entity">entity</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#index">index</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#scoreid">scoreId</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#shouldupdateui">shouldUpdateUI</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#scores">scores</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#type">type</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#cap">cap</a></div>

</div>

## Static Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#itemfluidstorages">itemFluidStorages</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#itemfluidholders">itemFluidHolders</a></div>

</div>

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#initializesingle">initializeSingle</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#hasopenui">hasOpenUI</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#initializemultiple">initializeMultiple</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#initializeobjectives">initializeObjectives</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getmaxliquids">getMaxLiquids</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#normalizevalue">normalizeValue</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#combinevalue">combineValue</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#formatfluid">formatFluid</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getfluidfromtext">getFluidFromText</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getcontainerdata">getContainerData</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#replaceheldfluiditem">replaceHeldFluidItem</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#initialize">initialize</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transferbetween">transferBetween</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#findtype">findType</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#handlefluiditeminteraction">handleFluidItemInteraction</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#addfluidtotank">addfluidToTank</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#gettankcapacity">getTankCapacity</a></div>

</div>

## Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#hasfixedfluidtype">hasFixedFluidType</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#tryinsert">tryInsert</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#fluiditem">fluidItem</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setcap">setCap</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getcap">getCap</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#set">set</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#get">get</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#add">add</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#consume">consume</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getfreespace">getFreeSpace</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#has">has</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#isfull">isFull</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#gettype">getType</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#settype">setType</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transfertonetwork">transferToNetwork</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transferfluids">transferFluids</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transferto">transferTo</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#receivefrom">receiveFrom</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#display">display</a></div>

</div>

---

# Constructor

## new FluidStorage

<div class="api-signature">

`new FluidStorage(entity: Entity, index?: number)`

</div>

Creates a fluid manager for `entity` and tank `index`. The default index is `0`.

The constructor loads the scoreboard objectives for the index, reads the current fluid type, reads capacity, and resets the type to `empty` when the tank has no fluid unless the entity has the fixed-fluid-type tag.

---

# Properties

## entity

Type: `Entity`

Entity whose tank is managed.

## index

Type: `number`

Tank index.

## scoreId

Type: `ScoreboardIdentity`

Scoreboard identity used by this tank.

## shouldUpdateUI

Type: `boolean`

Whether at least one player has this entity UI open.

## scores

Type:

```ts
{
  fluid: ScoreboardObjective;
  fluidExp: ScoreboardObjective;
  fluidCap: ScoreboardObjective;
  fluidCapExp: ScoreboardObjective;
}
```

The objectives for this tank index.

## type

Type: `string`

Cached current fluid type.

## cap

Type: `number`

Cached capacity.

---

# Static Properties

## itemFluidStorages

Type:

```ts
Record<string, {
  amount: number;
  type: string;
  output?: string;
  infinite?: boolean;
}>
```

Defines items that insert fluid into tanks.

```js
FluidStorage.itemFluidStorages["minecraft:lava_bucket"] = {
  amount: 1000,
  type: "lava",
  output: "minecraft:bucket",
};
```

## itemFluidHolders

Type:

```ts
Record<string, {
  types: Record<string, string>;
  required: number;
}>
```

Defines items that extract fluid from tanks.

```js
FluidStorage.itemFluidHolders["minecraft:bucket"] = {
  required: 1000,
  types: {
    water: "minecraft:water_bucket",
    lava: "minecraft:lava_bucket",
  },
};
```

---

# Static Methods

## initializeSingle

<div class="api-signature">

`FluidStorage.initializeSingle(entity: Entity): FluidStorage`

</div>

Returns `new FluidStorage(entity, 0)`.

## hasOpenUI

<div class="api-signature">

`FluidStorage.hasOpenUI(entity: Entity): boolean`

</div>

Reads the `utilitycraft:players` entity property.

## initializeMultiple

<div class="api-signature">

`FluidStorage.initializeMultiple(entity: Entity, count: number): FluidStorage[]`

</div>

Stores `count` in the `maxLiquids` scoreboard and returns one `FluidStorage` per tank index.

## initializeObjectives

<div class="api-signature">

`FluidStorage.initializeObjectives(index?: number): void`

</div>

Loads or creates `maxLiquids` plus the four objectives for the requested tank index.

## getMaxLiquids

<div class="api-signature">

`FluidStorage.getMaxLiquids(entity: Entity): number`

</div>

Returns the number of tanks supported by an entity. It checks `maxLiquids`, then falls back to `fluid{index}Type:` tags, then defaults to `1`.

## normalizeValue / combineValue

<div class="api-signature">

`FluidStorage.normalizeValue(amount: number): { value: number, exp: number }`

`FluidStorage.combineValue(value: number, exp: number): number`

</div>

Same mantissa/exponent pattern as `EnergyStorage`.

## formatFluid

<div class="api-signature">

`FluidStorage.formatFluid(value: number): string`

</div>

Formats mB values as `mB`, `B`, `KB`, `MB`, `GB`, `TB`, `PB`, or `EB`.

## getFluidFromText

<div class="api-signature">

`FluidStorage.getFluidFromText(input: string): { type: string, amount: number }`

</div>

Parses preserved fluid lore/status text. Returns `{ type: "empty", amount: 0 }` when parsing fails.

## getContainerData

<div class="api-signature">

`FluidStorage.getContainerData(id: string): object | null`

</div>

Returns a fluid insertion definition from `itemFluidStorages`.

## replaceHeldFluidItem

<div class="api-signature">

`FluidStorage.replaceHeldFluidItem(player: Player, expectedTypeId: string, nextTypeId?: string): boolean`

</div>

Safely replaces or decrements the selected held item after a fluid interaction.

## initialize

<div class="api-signature">

`FluidStorage.initialize(entity: Entity): void`

</div>

Runs the initial fluid scoreboard command for a newly spawned fluid entity.

## transferBetween

<div class="api-signature">

`FluidStorage.transferBetween(dim: Dimension, sourceLoc: Vector3, targetLoc: Vector3, amount?: number): boolean`

</div>

Transfers fluid between two blocks tagged `dorios:fluid`. If the target is a fluid tank block without an entity, the tank entity is spawned automatically.

## findType

<div class="api-signature">

`FluidStorage.findType(entity: Entity, type: string): FluidStorage | null`

</div>

Returns the first tank with `type`, or the first empty tank with free space.

## handleFluidItemInteraction

<div class="api-signature">

`FluidStorage.handleFluidItemInteraction(player: Player, entity: Entity, mainHand?: ItemStack): void`

</div>

Handles player insertion using a registered fluid item, updates the action bar, and replaces the held item outside Creative mode.

## addfluidToTank

<div class="api-signature">

`FluidStorage.addfluidToTank(block: Block, type: string, amount: number): Entity | undefined`

</div>

Spawns a `utilitycraft:fluid_tank_{type}` entity for a tank block when missing, sets the proper capacity, sets type, and adds fluid.

## getTankCapacity

<div class="api-signature">

`FluidStorage.getTankCapacity(typeId: string): number`

</div>

Returns configured tank capacity. Unknown tank ids fall back to the basic tank capacity.

---

# Methods

## hasFixedFluidType

<div class="api-signature">

`hasFixedFluidType(): boolean`

</div>

Returns whether the entity has the fixed-fluid-type tag.

## tryInsert

<div class="api-signature">

`tryInsert(type: string, amount: number): boolean`

</div>

Inserts fluid only when the tank is empty or already stores the same type and has enough free space.

## fluidItem

<div class="api-signature">

`fluidItem(typeId: string): string | false`

</div>

Applies an item-based fluid interaction.

- Registered storage items insert fluid and return their output item id or `false`.
- Registered holder items extract fluid and return the filled output item id.
- Unknown or invalid items return `false`.

## setCap / getCap

<div class="api-signature">

`setCap(amount: number): void`

`getCap(): number`

</div>

Sets or reads tank capacity.

## set / get / add / consume

<div class="api-signature">

`set(amount: number): void`

`get(): number`

`add(amount: number): number`

`consume(amount: number): number`

</div>

Manage the stored fluid amount. `consume()` requires the full amount to be available unless the entity has the creative tag.

## getFreeSpace / has / isFull

<div class="api-signature">

`getFreeSpace(): number`

`has(amount: number): boolean`

`isFull(): boolean`

</div>

Capacity helpers.

## getType / setType

<div class="api-signature">

`getType(): string`

`setType(type: string): void`

</div>

Fluid type is stored as an entity tag:

```text
fluid0Type:water
fluid1Type:lava
```

## transferToNetwork

<div class="api-signature">

`transferToNetwork(speed: number, mode?: "nearest" | "farthest" | "round", nodes: Vector3[]): number`

</div>

Transfers fluid to precomputed network nodes. Unlike energy transfer, fluid transfer currently expects the node list to be supplied.

## transferFluids

<div class="api-signature">

`transferFluids(block: Block, amount?: number): boolean`

</div>

Transfers fluid to this entity's cached fluid output target through [`OutputTracker`](./output-tracker). The default amount is `100` mB.

## transferTo / receiveFrom

<div class="api-signature">

`transferTo(other: FluidStorage, amount: number): number`

`receiveFrom(other: FluidStorage, amount: number): number`

</div>

Transfers fluid between tanks. The target must be empty or already contain the same fluid type.

## display

<div class="api-signature">

`display(slot?: number): void`

</div>

Writes a 48-frame fluid bar item to the entity inventory while the UI is open. The default slot is `4`.

---

# Example

```js
const tank = FluidStorage.initializeSingle(entity);
tank.setCap(32000);
tank.setType("water");
tank.add(1000);

if (tank.has(500)) {
  tank.consume(500);
}

tank.display();
```
