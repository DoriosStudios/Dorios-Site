---
id: output-tracker
title: OutputTracker class
sidebar_label: OutputTracker
sidebar_position: 16
description: Cache adjacent item, liquid, and gas compatibility for machine transfer logic.
---

# OutputTracker class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`OutputTracker` caches two related forms of transfer state:

- compatibility for item, liquid, and gas targets on all six absolute faces;
- the single legacy output target selected from a block's facing state.

```js
import { OutputTracker } from "DoriosCore/index.js";
```

[`BasicMachine.processIO()`](./process-io) uses the six-face cache automatically. The cache only records whether a compatible neighbor exists; the machine's IO document still decides which faces are inputs, outputs, or disabled.

## Definition

<div class="api-signature">

`class OutputTracker`

</div>

All members are static. Do not construct this class.

## Transfer types and groups

```ts
type OutputTransferType = "item" | "fluid" | "gas";
type IOTargetGroup = "items" | "liquids" | "gases";
```

The singular transfer type is used by legacy output-target methods. The plural group name addresses the six-face cache.

## Target compatibility

### isOutputTarget(block, type)

<div class="api-signature">

`OutputTracker.isOutputTarget(block: Block | undefined, type: OutputTransferType): boolean`

</div>

Returns whether `block` can receive the requested resource.

| Type | Requirement |
| --- | --- |
| `item` | `resolveItemContainerAt()` can resolve an inventory at the block location. |
| `fluid` | The block has `dorios:fluid` and does not have `dorios:isTube`. |
| `gas` | The block has `dorios:gas` and does not have `dorios:isTube`. |

Missing blocks and unsupported type strings return `false`.

### getNeighborLocation(block, direction)

<div class="api-signature">

`OutputTracker.getNeighborLocation(block: Block, direction: DirectionName | string): Vector3 | undefined`

</div>

Returns the location one block from `block` in `up`, `down`, `north`, `south`, `east`, or `west`. Invalid blocks and directions return `undefined`.

## Six-face IO cache

### getIOTargets(entity)

<div class="api-signature">

`OutputTracker.getIOTargets(entity: Entity | undefined): Record<string, Record<string, boolean>>`

</div>

Parses `dorios:io_targets` from a helper entity. Invalid JSON is cleared and returns an empty object.

A machine that supports every resource can produce:

```js
{
  items: { up: true, down: false, north: true, south: false, east: false, west: false },
  liquids: { up: false, down: true, north: false, south: false, east: true, west: false },
  gases: { up: false, down: false, north: false, south: true, east: false, west: true },
}
```

### refreshIOTargets(block)

<div class="api-signature">

`OutputTracker.refreshIOTargets(block: Block | undefined): Record<string, Record<string, boolean>> | undefined`

</div>

Rebuilds compatibility for all supported resources and directions, stores the result on the helper entity, and returns it.

The block must be one of:

- a block tagged `dorios:machine`;
- a block tagged with both `dorios:generator` and `dorios:io`.

Only resource groups represented by block tags are included: `dorios:item`, `dorios:fluid`, and `dorios:gas`. The method returns `undefined` when the block is not an IO owner or its helper entity cannot be resolved.

### refreshAdjacentIOTargets(block)

`OutputTracker.refreshAdjacentIOTargets(block: Block | undefined): void` rebuilds the six-face cache of every adjacent machine or opted-in generator.

### isIOTargetEnabled(entity, group, direction)

<div class="api-signature">

`OutputTracker.isIOTargetEnabled(entity: Entity | undefined, group: "items" | "liquids" | "gases", direction: string): boolean`

</div>

Returns `true` only when the cached entry for that exact group and direction is `true`. Missing or stale entries return `false`.

## Facing-based output cache

### getOutputLocation(block)

<div class="api-signature">

`OutputTracker.getOutputLocation(block: Block): Vector3 | undefined`

</div>

Reads the first available facing state in this order:

1. `minecraft:facing_direction`
2. `minecraft:cardinal_direction`
3. `utilitycraft:axis`

It returns the adjacent location on the machine's output side. An unsupported or absent direction returns `undefined`.

### getOutputTarget(entity, type)

`OutputTracker.getOutputTarget(entity: Entity, type: OutputTransferType): Vector3 | undefined` reads a cached target from the helper entity.

| Type | Dynamic property |
| --- | --- |
| `item` | `dorios:item_output` |
| `fluid` | `dorios:fluid_output` |
| `gas` | `dorios:gas_output` |

Malformed JSON or coordinates are rejected. JSON parsing failures also clear the property.

### setOutputTarget(entity, type, target)

`OutputTracker.setOutputTarget(entity: Entity, type: OutputTransferType, target: Vector3): void` serializes `target` into the property for `type`. Missing entities, targets, and unsupported types are ignored.

### clearOutputTarget(entity, type)

`OutputTracker.clearOutputTarget(entity: Entity, type: OutputTransferType): void` removes the property for `type`. Missing entities and unsupported types are ignored.

### refreshOutput(block, type)

<div class="api-signature">

`OutputTracker.refreshOutput(block: Block, type: OutputTransferType): Vector3 | undefined`

</div>

Resolves the helper entity, calculates the facing-based output location, verifies target compatibility, and stores the target. If the location or target is invalid, the existing cached target is cleared.

Returns the valid target location or `undefined`.

### refreshAdjacentOutputs(block, type)

`OutputTracker.refreshAdjacentOutputs(block: Block, type: OutputTransferType): void` recalculates `type` for every adjacent block tagged `dorios:machine`.

## Automatic refresh

Importing DoriosCore installs block placement and break listeners. Two ticks after a change, DoriosCore refreshes relevant six-face caches and item, liquid, and gas output targets around the changed position.

Transfer code can also refresh lazily, allowing machines placed before a compatible target to recover.

## Example: diagnose one machine face

```js
import { OutputTracker } from "DoriosCore/index.js";

const targets = OutputTracker.refreshIOTargets(machine.block);
const canOutputGasUp =
  machine.getGasIOMode("up") === "output" &&
  targets?.gases?.up === true;
```

## Remarks

- Compatibility does not grant permission to transfer. Always combine it with the normalized IO configuration.
- Direction keys are absolute world directions, not relative front, back, left, or right names.
- UtilityCore owns networks. This class only caches directly adjacent compatible targets for DoriosCore machinery.
