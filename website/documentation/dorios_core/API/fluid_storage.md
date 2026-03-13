---
id: fluid-storage
sidebar_label: FluidStorage
title: FluidStorage Class
sidebar_position: 4
---

# FluidStorage

:::info
`FluidStorage` is the utility class responsible for managing **fluids (mB)** for entities.

It provides a scoreboard‑based fluid system that allows machines, tanks, and other containers to:

- store fluids
- insert and extract fluids
- transfer fluids between entities
- interact with fluid containers (buckets, cells, etc.)
- display fluid visually
- manage large values safely using mantissa/exponent storage

Like `EnergyStorage`, this system stores values using **mantissa/exponent scaling** so large fluid values remain safe for scoreboard storage.

Each `FluidStorage` instance represents **one tank index of an entity**.
:::

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#entity">entity</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#index">index</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#scoreid">scoreId</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#scores">scores</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#type">type</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#cap">cap</a></div>

</div>

---

## Static Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#itemfluidstorages">itemFluidStorages</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#itemfluidholders">itemFluidHolders</a></div>

</div>

---

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#initializesingle">initializeSingle</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#initializemultiple">initializeMultiple</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#initializeobjectives">initializeObjectives</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getmaxliquids">getMaxLiquids</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#normalizevalue">normalizeValue</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#combinevalue">combineValue</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#formatfluid">formatFluid</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getfluidfromtext">getFluidFromText</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getcontainerdata">getContainerData</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#initialize">initialize</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transferbetween">transferBetween</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#findtype">findType</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#handlefluiditeminteraction">handleFluidItemInteraction</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#addfluidtotank">addfluidToTank</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#gettankcapacity">getTankCapacity</a></div>

</div>

---

## Methods

<div class="api-grid">

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
<div class="api-index-item"><span class="api-method">M</span><a href="#tryinsert">tryInsert</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#fluiditem">fluidItem</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transferto">transferTo</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#receivefrom">receiveFrom</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transfertonetwork">transferToNetwork</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#transferfluids">transferFluids</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#display">display</a></div>

</div>

---

# Constructor

## new FluidStorage

<div class="api-signature">

`new FluidStorage(entity: Entity, index?: number)`

</div>

Creates a new fluid manager attached to the given entity.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">entity</span>
<span class="param-type">Entity</span>

Entity representing the machine or tank container.
</li>

<li>
<span class="param-name">index</span>
<span class="param-type">number</span>

Tank index managed by this instance.
</li>

</ul>

### Behavior

1. Stores a reference to the entity.
2. Retrieves the entity scoreboard identity.
3. Loads the scoreboard objectives for the specified tank index.
4. Reads and caches the tank capacity.
5. Determines the fluid type stored in the tank.

---

# Properties

## entity

Type: `Entity`

Entity representing the machine or tank storing fluid.

---

## index

Type: `number`

Index of the fluid tank handled by this instance.

Example:

```js
const tank0 = new FluidStorage(entity, 0)
const tank1 = new FluidStorage(entity, 1)
```

---

## scoreId

Type: `ScoreboardIdentity`

Scoreboard identity used to store the tank values.

---

## scores

Cached scoreboard objectives for this tank.

Structure:

```js
{
 fluid,
 fluidExp,
 fluidCap,
 fluidCapExp
}
```

---

## type

Type: `string`

Current fluid type stored in the tank.

Examples:

```
water
lava
oil
empty
```

---

## cap

Type: `number`

Cached maximum capacity of the tank.

---

# Static Properties

## itemFluidStorages

Defines items that **contain fluids**.

Example:

```js
FluidStorage.itemFluidStorages["minecraft:lava_bucket"]
```

Returns:

```
{ amount:1000, type:"lava", output:"minecraft:bucket" }
```

---

## itemFluidHolders

Defines items capable of **extracting fluids**.

Example:

```js
{
 "minecraft:bucket":{
    types:{
      water:"minecraft:water_bucket",
      lava:"minecraft:lava_bucket"
    },
    required:1000
 }
}
```

---

# Static Methods

## initializeSingle

Creates a single tank for an entity.

---

## initializeMultiple

Initializes multiple tanks for a machine.

---

## initializeObjectives

Ensures scoreboard objectives exist for a tank index.

---

## getMaxLiquids

Returns how many tanks an entity supports.

---

## normalizeValue

Converts a value into mantissa/exponent format.

---

## combineValue

Reconstructs a number from mantissa/exponent.

---

## formatFluid

Formats fluid values into readable units.

Example:

```
5000 → 5.0 kB
```

---

## getFluidFromText

Extracts fluid information from formatted text.

---

## getContainerData

Returns fluid container data for an item.

---

## initialize

Initializes fluid scoreboards for an entity.

---

## transferBetween

Transfers fluid between two block locations.

---

## findType

Finds the first tank matching a fluid type.

---

## handleFluidItemInteraction

Handles player interaction with fluid items.

---

## addfluidToTank

Creates a tank entity and inserts fluid.

---

## getTankCapacity

Returns the default capacity for tank blocks.

---

# Methods

## setCap

Sets the tank capacity.

---

## getCap

Returns the tank capacity.

---

## set

Sets the current fluid amount.

---

## get

Returns the stored fluid amount.

---

## add

Adds or removes fluid from the tank.

---

## consume

Consumes fluid from the tank.

---

## getFreeSpace

Returns remaining tank capacity.

---

## has

Checks if the tank has a minimum amount of fluid.

---

## isFull

Returns true if the tank is full.

---

## getType

Returns the stored fluid type.

---

## setType

Sets the tank fluid type.

---

## tryInsert

Attempts to insert a fluid type into the tank.

---

## fluidItem

Handles item‑based fluid interactions.

---

## transferTo

Transfers fluid to another `FluidStorage` instance.

---

## receiveFrom

Receives fluid from another tank.

---

## transferToNetwork

Transfers fluid to connected tanks in the fluid network.

Supported modes:

- nearest
- farthest
- round

---

## transferFluids

Transfers fluid based on block facing direction.

---

## display

Displays a **48‑frame fluid bar item** in the entity inventory.

---

# Example

```js
const tank = new FluidStorage(entity, 0)

tank.setCap(32000)
tank.setType("water")

tank.add(1000)

if (tank.has(500)) {
  tank.consume(500)
}

tank.display()
```

---

# Notes

`FluidStorage` is the **core fluid system** used across Dorios machines and tanks.

It is used by:

- fluid tanks
- machines with internal liquids
- fluid transport networks

All fluid values are stored using **scoreboards with mantissa/exponent scaling** to support very large fluid values safely.
