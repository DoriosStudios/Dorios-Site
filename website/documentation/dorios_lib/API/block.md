---
id: block
title: block namespace
sidebar_label: block
sidebar_position: 2
description: Read and write block states, resolve facing and adjacency, find entities, and validate block identifiers.
---

# `block` namespace

Namespace: `DoriosLib.block` · Package: `DoriosLib/index.js`

```js
import * as DoriosLib from "DoriosLib/index.js";
```

## getState

<div class="api-signature">

`getState(block: Block, stateId: string): boolean | number | string | undefined`

</div>

Reads one state from the block's current permutation. It returns `undefined` when the block or state is unavailable instead of exposing a native lookup error.

| Parameter | Type | Description |
| --- | --- | --- |
| `block` | `Block` | Block whose current permutation is inspected. |
| `stateId` | `string` | Fully qualified block-state identifier. |

```js
const powered = DoriosLib.block.getState(block, "example:powered") ?? false;
```

## setState

`setState(block: Block, stateId: string, value: BlockStateValue): boolean`

Creates a permutation with one changed state and applies it to the block. Returns `true` when applied or `false` when the block, state, or value is invalid.

```js
DoriosLib.block.setState(block, "example:powered", true);
```

## setStates

`setStates(block: Block, states: Record<string, BlockStateValue>): boolean`

Applies several state changes to a single permutation before setting the block. Entries are processed in object insertion order. The update is all-or-nothing from the caller's perspective: a validation failure returns `false` without reporting individual entries.

```js
DoriosLib.block.setStates(block, {
  "example:powered": true,
  "example:mode": 2,
});
```

## getFacingVector

`getFacingVector(block: Block, stateId?: string): Vector3 | undefined`

Returns the unit vector represented by a direction state. `stateId` defaults to `minecraft:facing_direction`. For this default, DoriosLib can also interpret UtilityCraft's `utilitycraft:axis` convention and returns its opposite-facing vector as required by the block model convention.

```js
const direction = DoriosLib.block.getFacingVector(block);
const customDirection = DoriosLib.block.getFacingVector(block, "example:facing");
```

Returns `undefined` when neither state resolves to one of the six known directions.

## getFacingBlock

`getFacingBlock(block: Block, stateId?: string): Block | undefined`

Resolves the facing vector and returns the block one unit away. It returns `undefined` when direction resolution fails or the dimension cannot provide that block.

## getAdjacentBlocks

`getAdjacentBlocks(block: Block): Block[]`

Returns every available neighbor in the order `east`, `west`, `up`, `down`, `south`, `north`. Missing blocks are omitted.

```js
for (const neighbor of DoriosLib.block.getAdjacentBlocks(block)) {
  if (neighbor.typeId === "minecraft:chest") {
    // Found an adjacent chest.
  }
}
```

## getEntity

`getEntity(block: Block): Entity | undefined`

Queries the block's one-block volume and returns the first entity found. This is a generic spatial lookup; it does not guarantee a particular family or type. Apply your own predicate after resolution.

## isType

`isType(typeId: string): boolean`

Returns whether the installed Script API recognizes the block identifier.

```js
if (!DoriosLib.block.isType("example:machine")) {
  throw new Error("The example machine block is not registered");
}
```

## Related types

```ts
type BlockStateValue = boolean | number | string;
```
