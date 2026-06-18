---
id: generator
sidebar_label: Generator
title: Generator Class
sidebar_position: 2
---

# Generator

:::info
`Generator` is the runtime helper for energy-producing blocks.

It extends [`BasicMachine`](./basic-machine), reads generation settings from `settings.generator`, and provides shared placement, destruction, energy storage, optional fluid storage, and transfer-mode UI behavior.
:::

Hierarchy:

```text
BasicMachine
`- Generator
   `- MultiblockGenerator
```

---

# Index

## Properties

<div class="api-grid">

<div class="api-index-item"><span class="api-property">P</span><a href="#settings">settings</a></div>

</div>

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

Creates a generator runtime.

`Generator` passes this to `BasicMachine`:

```js
super(block, {
  rate: settings?.generator?.rate_speed_base ?? 0,
  ignoreTick: settings.ignoreTick,
});
```

If `valid` is true, the full `settings` object is stored on the instance.

---

# Properties

## settings

Type: `GeneratorSettings`

The full settings object passed into the constructor.

---

# Static Methods

## onDestroy

<div class="api-signature">

`Generator.onDestroy(event): boolean`

</div>

Handles generator block destruction.

Behavior:

- Finds the helper entity at the block location.
- Reads stored energy and first fluid tank.
- Writes stored values into the dropped block item's lore.
- Releases the generator tick group.
- Drops non-UI inventory items.
- Removes the helper entity.
- Spawns the preserved generator item.

Returns `true` when a helper entity was found and queued for cleanup.

## spawnEntity

<div class="api-signature">

`Generator.spawnEntity(event, config, callback?): void`

</div>

Spawns and initializes a generator helper entity.

Directly used fields:

```js
{
  entity: {
    name?: string,
    type?: string,
    inventory_size?: number,
  },
  generator: {
    energy_cap: number,
    fluid_cap?: number,
    rate_speed_base?: number,
  },
}
```

Behavior:

- Reads preserved energy/fluid from the placed item lore.
- Spawns the helper entity with `Utils.spawnEntity(block, config)`.
- Sets energy capacity and restored energy.
- Initializes one fluid tank when `config.generator.fluid_cap` exists.
- Runs `callback(entity)` after initialization.
- Updates adjacent networks for the placed block.

## addNearbyMachines

<div class="api-signature">

`Generator.addNearbyMachines(entity: Entity): void`

</div>

Adds `pos:[x,y,z]` tags for all six adjacent block positions.

:::warning
This method is marked deprecated in the current source. Network tags are now rebuilt from real placed energy blocks through the pipe update flow. Avoid using this as the default registration path for new generators.
:::

## openGeneratorTransferModeMenu

<div class="api-signature">

`Generator.openGeneratorTransferModeMenu(entity: Entity, player: Player): void`

</div>

Opens a `ModalFormData` dropdown that lets a player set the generator's `transferMode` dynamic property.

Supported modes:

| Mode | Behavior |
| --- | --- |
| `nearest` | Send energy to the closest valid target first. |
| `farthest` | Send energy to farther targets first. |
| `round` | Distribute energy across valid targets. |

---

# Example

```js
const generator = new Generator(block, settings);
if (!generator.valid) return;

const generated = generator.rate;
generator.energy.add(generated);
generator.energy.transferToNetwork(generated, generator.entity.getDynamicProperty("transferMode"));
generator.displayEnergy();
```
