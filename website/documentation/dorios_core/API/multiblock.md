---
id: multiblock
sidebar_label: Multiblock
title: Multiblock API
sidebar_position: 9
---

# Multiblock

:::info
The multiblock API provides structure detection, activation/deactivation managers, and controller runtimes for multiblock machines and generators.

Importing `DoriosCore/index.js` also loads multiblock listeners as a side effect.
:::

---

# Public Exports

```js
import {
  Multiblock,
  MultiblockMachine,
  MultiblockGenerator,
} from "DoriosCore/index.js";
```

`Multiblock` is a facade:

```js
Multiblock.Constants
Multiblock.ActivationManager
Multiblock.DeactivationManager
Multiblock.EntityManager
Multiblock.StructureDetector
```

---

# Block Tags And State

The current system relies on these tags and state values:

| Name | Value | Purpose |
| --- | --- | --- |
| Port tag | `dorios:multiblock.port` | Marks input/output port blocks. |
| Case tag prefix | `dorios:multiblock.case` | Identifies valid casing blocks. |
| Component tag | `dorios:multiblock_component` | Marks internal component blocks. |
| Entity family | `dorios:multiblock` | Finds controller entities. |
| Active state | `utilitycraft:active` | Marks active port blocks. |
| Energy tag | `dorios:energy` | Energy-capable port. |
| Fluid tag | `dorios:fluid` | Fluid-capable port. |
| Item tag | `dorios:item` | Item-capable port. |

---

# MultiblockMachine

`MultiblockMachine` extends `BasicMachine` and is intended for active controller blocks that process recipes or items.

## Constructor

<div class="api-signature">

`new MultiblockMachine(block: Block, config: MachineSettings)`

</div>

The runtime is valid only when the controller entity exists and its stored multiblock state is active.

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#machine-spawnentity">spawnEntity</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#machine-handleplayerinteract">handlePlayerInteract</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#machine-ondestroy">onDestroy</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#machine-activatemachinecontroller">activateMachineController</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#validaterequirements">validateRequirements</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#distributeoutput">distributeOutput</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#computemachinestats">computeMachineStats</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setmachineinfolabel">setMachineInfoLabel</a></div>

</div>

### Machine spawnEntity

<div class="api-signature">

`MultiblockMachine.spawnEntity(event, config, callback?): void`

</div>

Spawns a controller helper entity with a lower spawn offset, restores preserved energy/fluid, initializes capacity, and runs the callback after a short delay.

### Machine handlePlayerInteract

<div class="api-signature">

`MultiblockMachine.handlePlayerInteract(event, config, handlers?): Promise<unknown>`

</div>

Shared controller interaction flow:

- if the player is not using a wrench, calls `onInteractWithoutWrench`,
- spawns the controller entity when missing,
- runs optional `initializeEntity`,
- scans and activates the structure.

Handler options:

```ts
{
  initializeEntity?: Function;
  onInteractWithoutWrench?: Function;
  onActivate?: Function;
  successMessages?: string[] | ((context) => string[]);
}
```

### Machine onDestroy

<div class="api-signature">

`MultiblockMachine.onDestroy(event): boolean`

</div>

Drops stored energy/fluid lore, drops inventory, removes the controller entity, and spawns the preserved controller item.

### Machine activateMachineController

<div class="api-signature">

`MultiblockMachine.activateMachineController(event, config, entity, handlers?): Promise<object | undefined>`

</div>

Activation flow:

1. Deactivates old structure state.
2. Detects bounds from the controller and required case tag.
3. Validates component requirements.
4. Activates ports and stores bounds.
5. Computes machine stats from components.
6. Runs optional `onActivate`.
7. Sends success messages.

### validateRequirements

<div class="api-signature">

`MultiblockMachine.validateRequirements(components, requirements): object | undefined`

</div>

Returns the first failed requirement object.

### distributeOutput

<div class="api-signature">

`MultiblockMachine.distributeOutput(controller, outputSlots, itemId, amount, options?): void`

</div>

Distributes an item stack across output slots. Empty slots are filled first, then matching partial stacks.

### computeMachineStats

<div class="api-signature">

`MultiblockMachine.computeMachineStats(components): object`

</div>

Computes processing amount, speed multiplier, efficiency multiplier, and total energy multiplier from detected component counts.

Recognized component ids include:

- `processing_module`
- `speed_module`
- `efficiency_module`

### setMachineInfoLabel

<div class="api-signature">

`MultiblockMachine.setMachineInfoLabel(controller, data, status?): string`

</div>

Writes the standard multiblock machine info label and returns newline padding for callers that append more label sections.

## Instance Methods

`MultiblockMachine` also exposes:

```js
controller.setProgress(value, options);
controller.displayProgress(options);
controller.setEnergyCost(value, index);
controller.getEnergyCost(index);
```

Progress uses the configured energy cost as the default max value.

---

# MultiblockGenerator

`MultiblockGenerator` extends [`Generator`](./generator) and is intended for active controller blocks that produce energy.

## Static Methods

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#generator-spawnentity">spawnEntity</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#generator-handleplayerinteract">handlePlayerInteract</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#generator-activategeneratorcontroller">activateGeneratorController</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#validaterequirements">validateRequirements</a></div>

</div>

### Generator spawnEntity

<div class="api-signature">

`MultiblockGenerator.spawnEntity(event, config, callback?): void`

</div>

Spawns a controller entity, restores energy/fluid, initializes displays, and runs the callback.

### Generator handlePlayerInteract

<div class="api-signature">

`MultiblockGenerator.handlePlayerInteract(event, config, handlers?): Promise<unknown>`

</div>

Same interaction pattern as `MultiblockMachine`, but activation calls `activateGeneratorController()`.

### Generator activateGeneratorController

<div class="api-signature">

`MultiblockGenerator.activateGeneratorController(event, config, entity, handlers?): Promise<object | undefined>`

</div>

Activation flow:

- deactivates previous structure state,
- detects structure,
- validates requirements,
- activates ports and optional fill blocks,
- calculates energy capacity,
- optionally rejects activation if `missingEnergyWarning` is configured and capacity is `0`,
- runs `onActivate`,
- sends success messages.

---

# Managers

## ActivationManager

Useful methods:

```js
Multiblock.ActivationManager.fillBlocks(bounds, dimension, blockId);
Multiblock.ActivationManager.activateMultiblock(entity, structure, fillBlocksConfig);
Multiblock.ActivationManager.calculateEnergyCapacity(components);
```

Activation shows the controller entity, tags active ports, stores bounds and vent data, optionally fills internal volume, applies energy capacity, and sets state to `on`.

## DeactivationManager

Useful methods:

```js
Multiblock.DeactivationManager.deactivateMultiblock(block, player, emptyBlocksConfig);
Multiblock.DeactivationManager.handleBreakController(block, player, emptyBlocksConfig);
```

Deactivation hides the controller entity, clears port tags, resets active port state, clears runtime dynamic properties, and can remove filled helper blocks.

## EntityManager

Useful methods:

```js
Multiblock.EntityManager.getCenter(min, max);
Multiblock.EntityManager.getVolume(bounds);
Multiblock.EntityManager.isInsideBounds(pos, bounds);
Multiblock.EntityManager.getEntityFromBlock(block);
```

`getEntityFromBlock()` can resolve a controller entity from any block inside stored multiblock bounds.

---

# Example

```js
DoriosAPI.register.blockComponent("reactor_controller", {
  onPlayerInteract(e, { params: settings }) {
    return MultiblockGenerator.handlePlayerInteract(e, settings, {
      successMessages: ({ energyCap }) => [
        `Reactor online. Capacity: ${EnergyStorage.formatEnergyToText(energyCap)}`,
      ],
    });
  },

  onTick(e, { params: settings }) {
    const generator = new MultiblockGenerator(e.block, settings);
    if (!generator.valid) return;

    generator.energy.add(generator.rate);
    generator.energy.transferToNetwork(generator.rate);
    generator.displayEnergy();
  },
});
```
