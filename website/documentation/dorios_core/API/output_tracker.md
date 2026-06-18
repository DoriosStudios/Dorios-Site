---
id: output-tracker
sidebar_label: OutputTracker
title: OutputTracker Class
sidebar_position: 6
---

# OutputTracker

:::info
`OutputTracker` caches item and fluid output targets for machines.

It replaces older logic that rescanned or pushed to a direction every transfer call. Machines now read a cached target and refresh it when placement changes or when the cached target becomes stale.
:::

---

# Output Direction

`OutputTracker.getOutputLocation(block)` reads the machine block state `utilitycraft:axis` and returns the block position on the opposite side.

| Axis | Output offset |
| --- | --- |
| `east` | `x - 1` |
| `west` | `x + 1` |
| `north` | `z + 1` |
| `south` | `z - 1` |
| `up` | `y - 1` |
| `down` | `y + 1` |

---

# API

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#isoutputtarget">isOutputTarget</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getoutputlocation">getOutputLocation</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getoutputtarget">getOutputTarget</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setoutputtarget">setOutputTarget</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#clearoutputtarget">clearOutputTarget</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#refreshoutput">refreshOutput</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#refreshadjacentoutputs">refreshAdjacentOutputs</a></div>

</div>

---

## isOutputTarget

<div class="api-signature">

`OutputTracker.isOutputTarget(block: Block | undefined, type: "item" | "fluid"): boolean`

</div>

Checks whether a block can receive the requested transfer type.

- `item`: block has tag `dorios:item` or is a vanilla container.
- `fluid`: block has tag `dorios:fluid` and does not have tag `dorios:isTube`.

## getOutputLocation

<div class="api-signature">

`OutputTracker.getOutputLocation(block: Block): Vector3 | undefined`

</div>

Returns the output location based on `utilitycraft:axis`.

## getOutputTarget

<div class="api-signature">

`OutputTracker.getOutputTarget(entity: Entity, type: "item" | "fluid"): Vector3 | undefined`

</div>

Reads the cached target from entity dynamic properties:

- `dorios:item_output`
- `dorios:fluid_output`

Invalid JSON is cleared automatically.

## setOutputTarget

<div class="api-signature">

`OutputTracker.setOutputTarget(entity: Entity, type: "item" | "fluid", target: Vector3): void`

</div>

Stores a cached target.

## clearOutputTarget

<div class="api-signature">

`OutputTracker.clearOutputTarget(entity: Entity, type: "item" | "fluid"): void`

</div>

Clears a cached target.

## refreshOutput

<div class="api-signature">

`OutputTracker.refreshOutput(block: Block, type: "item" | "fluid"): Vector3 | undefined`

</div>

Recalculates and stores a target for a machine block. The block must resolve to a helper entity with the `dorios:machine` type family.

## refreshAdjacentOutputs

<div class="api-signature">

`OutputTracker.refreshAdjacentOutputs(block: Block, type: "item" | "fluid"): void`

</div>

Refreshes output targets for adjacent machine blocks. This is used when an output target block is placed next to an existing machine.

---

# Automatic Updates

`OutputTracker` subscribes to `world.afterEvents.playerPlaceBlock`. After a short delay:

- newly placed machine blocks refresh item and fluid outputs,
- newly placed item targets refresh adjacent machine item outputs,
- newly placed fluid targets refresh adjacent machine fluid outputs.

Machine transfer methods still refresh lazily when no cache exists, so already-placed machines can recover without requiring a new placement.
