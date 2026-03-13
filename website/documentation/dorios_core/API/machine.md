---
id: machine
sidebar_label: Machine
title: Machine Class
sidebar_position: 1
---

# Machine

:::info
`Machine` is the main operational class used by **UtilityCraft machines**.

It extends [`BasicMachine`](./basic-machine) and inherits all its base properties and methods, including:

- entity access
- block access
- dimension access
- inventory container access
- progress tracking
- energy integration
- tick refresh validation
- progress and energy UI rendering

The `Machine` class adds higher-level machine behavior such as:

- machine settings access
- upgrade handling
- boost calculation
- item transfer automation
- item pulling from containers
- machine placement and destruction logic
- energy cost management
- machine status and warning displays
:::

Hierarchy:

```text
BasicMachine
└─ Machine
```

All methods and properties from **BasicMachine** are available here.  
This page documents the **additional properties and methods introduced by `Machine`**.

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#settings">settings</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#upgrades">upgrades</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#boosts">boosts</a></div>

</div>

---

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#ondestroy">onDestroy</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#spawnentity">spawnEntity</a></div>

</div>

---

## Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#transferitems">transferItems</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#pullitemsfromabove">pullItemsFromAbove</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#displayprogress">displayProgress</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setenergycost">setEnergyCost</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getenergycost">getEnergyCost</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#displayenergy">displayEnergy</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#showwarning">showWarning</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#showstatus">showStatus</a></div>

</div>

---

# Constructor

## new Machine

<div class="api-signature">

`new Machine(block: Block, settings: MachineSettings)`

</div>

Creates a new machine instance using the infrastructure provided by [`BasicMachine`](./basic-machine).

### Parameters

<ul class="api-params">

<li>
<span class="param-name">block</span>
<span class="param-type">Block</span>

Block representing the machine in the world.
</li>

<li>
<span class="param-name">settings</span>
<span class="param-type">MachineSettings</span>

Machine configuration object that defines machine behavior such as:

- base rate
- energy capacity
- fluid capacity
- upgrades
- rotation behavior
</li>

</ul>

### Behavior

The constructor performs the following steps:

1. Calls `BasicMachine` constructor using `settings.machine.rate_speed_base`.
2. Validates that the machine entity exists and that the current tick is valid.
3. Stores the provided machine settings.
4. Reads upgrade levels from configured upgrade slots.
5. Calculates machine boosts.
6. Recalculates the effective machine rate.

---

# Properties

## settings

Type: `MachineSettings`

Full machine configuration object passed into the constructor.

```js
const settings = machine.settings
```

This property stores the machine definition used by the class, including values such as:

- machine energy capacity
- machine fluid capacity
- base rate
- upgrade slot definitions
- rotation options

It is typically used by subclasses or machine implementations that need access to their full configuration.

---

## upgrades

Type: `UpgradeLevels`

Upgrade levels currently detected inside the machine upgrade slots.

```js
const upgrades = machine.upgrades
```

Typical structure:

```js
{
  energy: 0,
  range: 0,
  speed: 0,
  ultimate: 0
}
```

These values are calculated from the items currently placed in the configured upgrade slots.

---

## boosts

Type: `{ speed: number, consumption: number }`

Calculated boost values derived from installed upgrades.

```js
const boosts = machine.boosts
```

Structure:

```js
{
  speed: 1,
  consumption: 1
}
```

### Meaning

- `speed` increases the machine processing speed
- `consumption` affects the effective energy cost multiplier

These values are used internally to adjust machine rate and operation cost.

---

# Static Methods

## onDestroy

<div class="api-signature">

`Machine.onDestroy(event): boolean`

</div>

Handles the destruction of a machine block.

### Behavior

When a machine is broken:

1. Retrieves the machine entity associated with the block.
2. Reads stored **energy and fluid data**.
3. Encodes that data into the dropped block item lore.
4. Drops all items stored in the machine inventory.
5. Removes the machine entity.
6. Spawns the machine block item with stored information.

If the player is in **Creative mode**, the original block item drop is removed so the machine can be replaced by the custom preserved drop.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">event</span>
<span class="param-type">object</span>

Block break event data containing block, broken permutation, player, and dimension.
</li>

</ul>

### Returns

Type: `boolean`

Returns `true` if a machine entity was found and processed.  
Returns `false` if no machine entity was associated with the block.

---

## spawnEntity

<div class="api-signature">

`Machine.spawnEntity(event, config, callback?)`

</div>

Spawns the machine entity when the block is placed.

### Behavior

1. Reads the item held by the player.
2. Extracts stored **energy and fluid information** from the placed item.
3. Handles optional **machine rotation** before final placement.
4. Spawns the machine entity.
5. Initializes machine energy storage.
6. Initializes fluid storage if the machine supports fluids.
7. Executes an optional callback after initialization.
8. Updates adjacent networks.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">event</span>
<span class="param-type">object</span>

Placement event data containing block, player, permutation to place, and optional cancel flag.
</li>

<li>
<span class="param-name">config</span>
<span class="param-type">MachineSettings</span>

Machine configuration describing entity type, capacities, and placement behavior.
</li>

<li>
<span class="param-name">callback</span>
<span class="param-type">function</span>

Optional callback executed after the entity has been spawned and initialized.
</li>

</ul>

---

# Methods

## transferItems

<div class="api-signature">

`transferItems(): boolean`

</div>

Transfers items from the machine inventory into the container located **behind the machine**.

### Behavior

1. Reads the machine facing direction using `utilitycraft:axis`.
2. Resolves the opposite direction vector.
3. Finds the adjacent block in that opposite direction.
4. Gets the machine output slot range.
5. Transfers items using `DoriosAPI.containers.transferItemsAt()`.

### Returns

Type: `boolean`

Returns `true` if the transfer attempt was executed.  
Returns `false` if the machine facing state was missing or invalid.

---

## pullItemsFromAbove

<div class="api-signature">

`pullItemsFromAbove(targetSlot: number): boolean`

</div>

Pulls items from the container directly above the machine into a specific internal slot.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">targetSlot</span>
<span class="param-type">number</span>

Machine inventory slot where the item should be inserted.
</li>

</ul>

### Behavior

- Checks whether the block above is a supported vanilla container.
- Reads the source container inventory.
- If the target slot is empty, moves the first compatible stack.
- If the target slot already contains the same item, merges stacks until full.

### Returns

Type: `boolean`

Returns `true` if an item transfer occurred.  
Returns `false` if no compatible transfer was possible.

---

## displayProgress

<div class="api-signature">

`displayProgress(options?: object): void`

</div>

Displays the machine progress bar using the configured energy cost as the maximum progress value.

This method overrides the base progress display behavior from [`BasicMachine`](./basic-machine).

### Parameters

<ul class="api-params">

<li>
<span class="param-name">options</span>
<span class="param-type">object</span>

Optional progress display configuration.

Supported options:

```js
slot?: number
type?: string
index?: number
scale?: number
```
</li>

</ul>

### Notes

Internally this method calls the base `displayProgress()` implementation, but uses `getEnergyCost()` to determine the progress maximum.

---

## setEnergyCost

<div class="api-signature">

`setEnergyCost(value: number, index?: number): void`

</div>

Sets the energy cost required to complete one machine operation.

The value is stored as a dynamic property on the machine entity.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">value</span>
<span class="param-type">number</span>

Energy cost representing full progress.
</li>

<li>
<span class="param-name">index</span>
<span class="param-type">number</span>

Optional cost index for machines that track multiple processes.
</li>

</ul>

---

## getEnergyCost

<div class="api-signature">

`getEnergyCost(index?: number): number`

</div>

Returns the stored energy cost for the specified process index.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">index</span>
<span class="param-type">number</span>

Optional cost index.
</li>

</ul>

### Returns

Type: `number`

If no value is stored, the default returned value is:

```js
800
```

---

## displayEnergy

<div class="api-signature">

`displayEnergy(slot?: number): void`

</div>

Displays the machine energy bar in the inventory UI.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">slot</span>
<span class="param-type">number</span>

Optional inventory slot used for the energy display.
</li>

</ul>

### Notes

Internally delegates to `this.energy.display(slot)`.

---

## showWarning

<div class="api-signature">

`showWarning(message: string, options?: object): void`

</div>

Displays a warning label in the machine interface.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">message</span>
<span class="param-type">string</span>

Warning text shown to the player.
</li>

<li>
<span class="param-name">options</span>
<span class="param-type">object</span>

Optional warning behavior settings.

Supported options:

```js
resetProgress?: boolean
displayProgress?: boolean
slot?: number
type?: string
index?: number
scale?: number
```
</li>

</ul>

### Behavior

- optionally resets progress
- optionally redraws the progress bar
- redraws the energy bar
- turns the machine off
- shows formatted machine statistics
- displays the warning message

This method is commonly used for states such as:

- missing input
- blocked output
- invalid recipe
- missing conditions

---

## showStatus

<div class="api-signature">

`showStatus(message: string): void`

</div>

Displays a normal machine status label.

### Parameters

<ul class="api-params">

<li>
<span class="param-name">message</span>
<span class="param-type">string</span>

Status text shown to the player.
</li>

</ul>

### Behavior

- redraws the energy bar
- displays current machine boost information
- displays current operation cost
- displays current machine rate

Unlike `showWarning`, this method does **not** reset progress.

---

# Example

```js
const machine = new Machine(block, settings)

if (!machine.valid) return

machine.displayEnergy()
machine.displayProgress()

machine.showStatus("Running")
machine.transferItems()
```

---

# Notes

`Machine` is the primary implementation class used by most **UtilityCraft** machines.

Examples include:

- Crusher
- Incinerator
- Electro Press
- Block Breaker
- Block Placer

These machines inherit all base infrastructure from [`BasicMachine`](./basic-machine) and then use `Machine` for common machine behavior such as upgrades, UI, transfer logic, and preserved placement data.
