---
id: machine
sidebar_label: Machine
title: Machine Class
sidebar_position: 1
---

# Machine

:::info
`Machine` is the main runtime helper for item-processing UtilityCraft-style machines.

It extends [`BasicMachine`](./basic-machine), adds machine settings, upgrade boosts, preserved placement/destruction, cached item output transfer, and machine status labels.
:::

Hierarchy:

```text
BasicMachine
`- Machine
```

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#settings">settings</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#upgrades">upgrades</a></div>
<div class="api-index-item"><span class="api-property">P</span><a href="#boosts">boosts</a></div>

</div>

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#ondestroy">onDestroy</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#spawnentity">spawnEntity</a></div>

</div>

## Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#transferitems">transferItems</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#hasoutputitems">hasOutputItems</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#pullitemsfromabove">pullItemsFromAbove</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setprogress">setProgress</a></div>
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

Creates a machine runtime from a block and settings object.

`Machine` passes this to `BasicMachine`:

```js
super(block, {
  rate: settings.machine.rate_speed_base ?? 0,
  ignoreTick: settings.ignoreTick,
});
```

If upgrades are configured, the constructor scans the upgrade slots, calculates speed/consumption boosts, and adjusts the effective base rate.

---

# Properties

## settings

Type: `MachineSettings`

The full settings object passed into the constructor.

## upgrades

Type:

```ts
{
  energy: number;
  range: number;
  speed: number;
  ultimate: number;
}
```

Upgrade item counts found in `settings.machine.upgrades`. Upgrade items must have the tag `utilitycraft:is_upgrade`; the upgrade type is parsed from the item id prefix before `_upgrade`.

## boosts

Type:

```ts
{
  speed: number;
  consumption: number;
}
```

Calculated from speed and energy upgrade counts.

- Speed upgrades use `1 + 0.125 * n * (n + 1)` with `n` capped at `8`.
- Energy upgrades lower energy consumption, also capped at `8`.
- The effective machine rate is adjusted with `speed * consumption`.

---

# Static Methods

## onDestroy

<div class="api-signature">

`Machine.onDestroy(event): boolean`

</div>

Handles block destruction for normal machines.

Behavior:

- Finds the helper entity at the block location.
- Reads stored energy and first fluid tank.
- Writes stored values into the dropped block item's lore.
- Releases the machine tick group.
- Drops non-UI inventory items.
- Removes the helper entity.
- Spawns the preserved block item.

Returns `true` when a helper entity was found and queued for cleanup.

## spawnEntity

<div class="api-signature">

`Machine.spawnEntity(event, config, callback?): void`

</div>

Spawns and initializes a helper entity when the machine block is placed.

Directly used fields:

```js
{
  rotation?: boolean,
  entity: {
    name?: string,
    type?: string,
    input_type?: string,
    output_type?: string,
    inventory_size?: number,
  },
  machine: {
    energy_cap: number,
    fluid_cap?: number,
    rate_speed_base?: number,
    energy_cost?: number,
    upgrades?: number[],
    fluid_types?: number,
  },
}
```

Behavior:

- Reads preserved energy/fluid values from the placed item lore.
- If `rotation` is true, cancels normal placement and uses [`Rotation.facing`](./rotation).
- Spawns the helper entity with `Utils.spawnEntity(block, config)`.
- Sets energy capacity and restored energy.
- Initializes one fluid tank when `config.machine.fluid_cap` exists.
- Runs `callback(entity)` after initialization.
- Updates adjacent item/energy/fluid networks for the placed block.

---

# Methods

## transferItems

<div class="api-signature">

`transferItems(): boolean`

</div>

Transfers machine output items into the cached item output target.

Current behavior:

- Reads the allowed output slot range from `DoriosAPI.containers.getAllowedOutputRange(this.entity)`.
- Uses [`OutputTracker`](./output-tracker) to read or refresh the target location.
- Calls `DoriosAPI.containers.transferItemsAt(this.container, targetLoc, this.dimension, range)`.
- Clears stale cached targets when the transfer API returns `-1`.

The output target is based on the block's `utilitycraft:axis` state and points to the opposite side of the machine.

Returns `true` only when at least one item moved.

## hasOutputItems

<div class="api-signature">

`hasOutputItems(): boolean`

</div>

Returns whether the configured output slot or output slot range contains at least one item.

## pullItemsFromAbove

<div class="api-signature">

`pullItemsFromAbove(targetSlot: number): boolean`

</div>

Pulls one compatible stack from the vanilla container directly above the machine into `targetSlot`.

It only works with blocks listed in `DoriosAPI.constants.vanillaContainers`.

## setProgress

<div class="api-signature">

`setProgress(value: number, options?: MachineProgressOptions): void`

</div>

Stores progress using the current energy cost as the default max value.

```ts
type MachineProgressOptions = {
  maxValue?: number;
  slot?: number;
  type?: string;
  display?: boolean;
  index?: number;
  scale?: number;
  legacy?: boolean;
};
```

## displayProgress

<div class="api-signature">

`displayProgress(options?: MachineProgressOptions): void`

`displayProgress(maxValue: number, options?: MachineProgressOptions): void`

</div>

Displays progress using `getEnergyCost(index)` unless `maxValue` is supplied.

The two-call-shape support exists so `Machine` can be called directly by addon code and internally by `BasicMachine`.

## setEnergyCost

<div class="api-signature">

`setEnergyCost(value: number, index?: number): void`

</div>

Stores the operation cost in `dorios:energy_cost_{index}`. Values are clamped to at least `1`.

## getEnergyCost

<div class="api-signature">

`getEnergyCost(index?: number): number`

</div>

Reads the stored operation cost. Returns `800` when unset.

## displayEnergy

<div class="api-signature">

`displayEnergy(slot?: number): void`

</div>

Delegates to `this.energy.display(slot)`. Unlike `BasicMachine.displayEnergy()`, this override does not check `shouldUpdateUI` before delegating.

## showWarning

<div class="api-signature">

`showWarning(message: string, options?: MachineProgressOptions & { resetProgress?: boolean, displayProgress?: boolean }): void`

</div>

Displays a warning label, turns the block off, refreshes energy UI, and by default resets progress to `0`.

Set `resetProgress: false` for warnings like "No Energy" where partial progress should be preserved.

## showStatus

<div class="api-signature">

`showStatus(message: string): void`

</div>

Displays the normal running label with speed, efficiency, operation cost, and base rate information.

---

# Example

```js
const machine = new Machine(block, settings);
if (!machine.valid) return;

const input = machine.container.getItem(3);
if (!input) {
  machine.showWarning("No Input Item");
  return;
}

machine.setEnergyCost(settings.machine.energy_cost);

if (!machine.energy.has(machine.rate * machine.boosts.consumption)) {
  machine.showWarning("No Energy", { resetProgress: false });
  return;
}

machine.energy.consume(machine.rate * machine.boosts.consumption);
machine.addProgress(machine.rate);
machine.transferItems();
machine.on();
machine.displayProgress();
machine.showStatus("Running");
```
