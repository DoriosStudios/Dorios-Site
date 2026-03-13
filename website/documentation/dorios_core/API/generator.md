---
id: generator
sidebar_label: Generator
title: Generator Class
sidebar_position: 2
---

# Generator

:::info
`Generator` is the base class used for all **energy-producing machines** in UtilityCraft.

It extends [`BasicMachine`](./basic-machine) and therefore inherits all base infrastructure such as:

- entity access
- block access
- dimension access
- inventory container access
- progress tracking
- energy integration
- tick refresh validation
- energy and UI display helpers

The `Generator` class adds behavior specific to **energy generation systems**, including:

- generator configuration access
- generator entity spawning
- generator destruction handling
- nearby machine detection
- energy transfer mode configuration
:::

Hierarchy:

```
BasicMachine
└─ Generator
```

All methods and properties from **BasicMachine** are available here.  
This page documents **only the additional behavior introduced by `Generator`.**

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#settings">settings</a></div>

</div>

---

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#ondestroy">onDestroy</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#spawnentity">spawnEntity</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#addnearbymachines">addNearbyMachines</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#opengeneratortransfermodemenu">openGeneratorTransferModeMenu</a></div>

</div>

---

# Constructor

## new Generator

<div class="api-signature">

`new Generator(block: Block, settings: GeneratorSettings)`

</div>

Creates a new generator instance using the infrastructure provided by [`BasicMachine`](./basic-machine).

### Parameters

<ul class="api-params">

<li>
<span class="param-name">block</span>
<span class="param-type">Block</span>

Block representing the generator in the world.
</li>

<li>
<span class="param-name">settings</span>
<span class="param-type">GeneratorSettings</span>

Generator configuration object defining behavior such as:

- base generation rate
- energy capacity
- fluid capacity (optional)
- entity type
</li>

</ul>

### Behavior

The constructor performs the following:

1. Reads the base generation rate from `settings.generator.rate_speed_base`.
2. Calls the `BasicMachine` constructor with that rate.
3. Validates that the generator entity exists and the tick is valid.
4. Stores the generator settings for later use.

---

# Properties

## settings

Type: `GeneratorSettings`

Stores the generator configuration passed into the constructor.

```js
const settings = generator.settings
```

This configuration usually contains:

- generator energy capacity
- fluid capacity (if the generator consumes fluids)
- generation rate
- entity identifier
- inventory size

It allows generator implementations to access their configuration without needing to re-read external definitions.

---

# Static Methods

## onDestroy

<div class="api-signature">

`Generator.onDestroy(event): boolean`

</div>

Handles the destruction of a generator block.

### Behavior

When a generator is broken:

1. Retrieves the generator entity associated with the block.
2. Reads stored **energy and fluid values**.
3. Encodes those values into the dropped block item lore.
4. Drops all stored inventory items.
5. Removes the generator entity.
6. Spawns the generator block item preserving stored information.

If the player is in **Creative mode**, the original block drop is removed so the custom preserved drop replaces it.

### Returns

Type: `boolean`

Returns `true` if a generator entity was processed.  
Returns `false` if no entity was found.

---

## spawnEntity

<div class="api-signature">

`Generator.spawnEntity(event, config, callback?)`

</div>

Spawns the generator entity when the block is placed.

### Behavior

1. Reads the item held in the player's main hand.
2. Extracts stored **energy and fluid data** from the item.
3. Spawns the generator entity.
4. Initializes generator energy capacity and stored energy.
5. Initializes fluid storage if the generator supports fluids.
6. Registers nearby machine positions.
7. Executes an optional callback after initialization.
8. Updates adjacent energy networks.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">event</span>
<span class="param-type">object</span>

Placement event containing block location, player, and permutation.
</li>

<li>
<span class="param-name">config</span>
<span class="param-type">GeneratorSettings</span>

Generator configuration describing entity type, capacities and generator properties.
</li>

<li>
<span class="param-name">callback</span>
<span class="param-type">function</span>

Optional callback executed after the generator entity has been initialized.
</li>

</ul>

---

## addNearbyMachines

<div class="api-signature">

`Generator.addNearbyMachines(entity: Entity): void`

</div>

Adds position tags for all blocks surrounding the generator entity.

### Behavior

The generator scans the **six adjacent blocks**:

- East
- West
- Up
- Down
- South
- North

For each adjacent position it adds a tag using the format:

```
pos:[x,y,z]
```

These tags allow energy transfer systems to quickly identify nearby machines without performing expensive block scans.

### Example

```
pos:[101,64,-23]
pos:[99,64,-23]
pos:[100,65,-23]
pos:[100,63,-23]
```

These tags are later used by energy transfer logic to determine valid targets.

---

## openGeneratorTransferModeMenu

<div class="api-signature">

`Generator.openGeneratorTransferModeMenu(entity: Entity, player: Player): void`

</div>

Opens a configuration menu allowing players to change the generator energy distribution mode.

### Transfer Modes

Generators support three distribution strategies:

| Mode | Description |
|-----|-------------|
| nearest | Sends energy to the closest machine first |
| farthest | Sends energy to the farthest machine first |
| round | Distributes energy evenly across all connected machines |

### Behavior

1. Reads the current generator transfer mode.
2. Opens a dropdown menu.
3. Allows the player to select a new mode.
4. Stores the new value as a dynamic property.
5. Displays a confirmation message in the player's action bar.

### Example Result

```
Transfer mode set to: Nearest
```

---

# Example

```js
const generator = new Generator(block, settings)

if (!generator.valid) return

generator.displayEnergy()
```

---

# Notes

`Generator` is used as the base implementation for **all UtilityCraft generators**, including:

- Furnator
- Magmator
- Thermo Generator
- Solar Panel

Each generator defines its own generation logic but shares the infrastructure provided by this class.
