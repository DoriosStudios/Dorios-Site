---
id: container-adapters
title: Container adapters
sidebar_label: Container adapters
sidebar_position: 12
description: Resolve and transfer items, liquids, and gases across blocks, entities, tanks, and link nodes.
---

# Container adapters

Container adapters provide a common public surface for ordinary blocks, helper entities, standalone tanks, and physical link nodes. Use them for manual infrastructure; normal machines can call [`processIO()`](./process-io).

## Item containers

### resolveItemContainerAt

<div class="api-signature">

`resolveItemContainerAt(dimension: Dimension, location: Vector3): ResolvedItemContainer | undefined`

</div>

Resolves the item inventory accessible at one world location through DoriosLib's container system.

| Parameter | Type | Description |
| --- | --- | --- |
| `dimension` | `Dimension` | Dimension containing the endpoint. |
| `location` | `Vector3` | Block coordinates to resolve. |

```ts
interface ResolvedItemContainer {
  kind: "block" | "entity" | "raw";
  owner: Block | Entity | Container;
  container: Container;
  block?: Block;
  entity?: Entity;
  via?: "link_node";
}
```

The return value already accounts for compatible direct containers and generic link-node indirection. It returns `undefined` when no accessible inventory exists.

## Resource targets

Liquid and gas adapters accept three target shapes:

```ts
type FluidContainerTarget = Block | Entity | ResolvedFluidContainer;
type GasContainerTarget = Block | Entity | ResolvedGasContainer;
```

Resolved endpoints contain:

| Property | Type | Description |
| --- | --- | --- |
| `kind` | `"entity" | "tank"` | Existing compatible entity or empty standalone tank block. |
| `block` | `Block | undefined` | Physical access block, including a link node. |
| `entity` | `Entity | undefined` | Storage owner. Empty tank blocks can omit it until the first insertion. |
| `via` | `"link_node" | undefined` | Indicates indirection through a physical port. |

## Resolve liquid containers

### resolveFluidContainer(target)

`resolveFluidContainer(target: FluidContainerTarget): ResolvedFluidContainer | undefined` resolves a compatible entity, block, existing resolved handle, empty UtilityCraft liquid tank, or liquid link node.

### resolveFluidContainerAt(dimension, location)

`resolveFluidContainerAt(dimension: Dimension, location: Vector3): ResolvedFluidContainer | undefined` resolves the endpoint at one block location.

## Resolve gas containers

### resolveGasContainer(target)

`resolveGasContainer(target: GasContainerTarget): ResolvedGasContainer | undefined` is the gas equivalent.

### resolveGasContainerAt(dimension, location)

`resolveGasContainerAt(dimension: Dimension, location: Vector3): ResolvedGasContainer | undefined` resolves a gas entity, empty gas tank block, or gas link node.

Resolution fails for entities that do not expose the corresponding `dorios:fluid_container` or `dorios:gas_container` type family.

## Read allowed indices

### getFluidInputIndices / getFluidOutputIndices

<div class="api-signature">

`getFluidInputIndices(target: FluidContainerTarget, options?: { face?: DirectionName }): ReadonlyArray<number>`<br />
`getFluidOutputIndices(target: FluidContainerTarget, options?: { face?: DirectionName }): ReadonlyArray<number>`

</div>

### getGasInputIndices / getGasOutputIndices

<div class="api-signature">

`getGasInputIndices(target: GasContainerTarget, options?: { face?: DirectionName }): ReadonlyArray<number>`<br />
`getGasOutputIndices(target: GasContainerTarget, options?: { face?: DirectionName }): ReadonlyArray<number>`

</div>

`options.face` is one of `up`, `down`, `north`, `south`, `east`, or `west`. When omitted, the adapter returns the face-independent fallback.

- Basic containers expose their real storage indices.
- Complex containers apply the persisted face policy.
- Link nodes apply their per-port override, then the controller fallback.
- Empty standalone tanks accept input index `0` and expose no output.
- Invalid endpoints return an empty array.

## Revisions

### getFluidContainerRevision / getGasContainerRevision

<div class="api-signature">

`getFluidContainerRevision(target: FluidContainerTarget): number | string`<br />
`getGasContainerRevision(target: GasContainerTarget): number | string`

</div>

Returns a value that changes when the relevant IO document changes. Link-node revisions combine the controller document and per-port override revisions into a string. Cache consumers can compare the value for inequality; do not parse it.

Invalid or unresolved targets return `0`.

## Transfer from an exact source index

### transferFluid

<div class="api-signature">

`transferFluid(source: FluidContainerTarget, options: FluidTransferOptions): number`

</div>

```ts
interface FluidTransferOptions {
  sourceIndex: number;
  target: FluidContainerTarget;
  targetFace?: DirectionName;
  targetIndices?: ReadonlyArray<number>;
  maxAmount?: number;
}
```

### transferGas

`transferGas(source: GasContainerTarget, options: GasTransferOptions): number` uses the same properties with gas endpoints.

| Property | Required | Description |
| --- | --- | --- |
| `sourceIndex` | Yes | Exact nonnegative source index selected by the caller. Invalid values throw `TypeError`. |
| `target` | Yes | Destination endpoint. |
| `targetFace` | No | Destination face used to resolve allowed input indices. |
| `targetIndices` | No | Explicit valid indices that override `targetFace`. Invalid and duplicate entries are ignored. |
| `maxAmount` | No | Maximum amount moved. Defaults to all available source content. Nonpositive or nonfinite values move nothing. |

The source output policy belongs to the caller. The adapter enforces destination input policy unless explicit indices are supplied. It fills compatible target indices in order and returns the total amount moved.

```js
const moved = transferFluid(sourceEntity, {
  sourceIndex: 1,
  target: targetBlock,
  targetFace: "west",
  maxAmount: 1000,
});
```

## Insert an external resource

### insertFluid

<div class="api-signature">

`insertFluid(target: FluidContainerTarget, options: FluidInsertOptions): number`

</div>

```ts
interface FluidInsertOptions {
  type: string;
  amount: number;
  face?: DirectionName;
  indices?: ReadonlyArray<number>;
  exact?: boolean;
}
```

### insertGas

`insertGas(target: GasContainerTarget, options: GasInsertOptions): number` has the same option meanings.

| Property | Required | Description |
| --- | --- | --- |
| `type` | Yes | Nonempty resource type. Missing types throw `TypeError`; `empty` inserts nothing. |
| `amount` | Yes | Positive finite amount requested. |
| `face` | No | Face used to resolve allowed inputs. |
| `indices` | No | Explicit target indices overriding `face`. |
| `exact` | No | When `true`, inserts nothing unless the entire amount fits across compatible targets. |

Empty standalone tank blocks create their resource entity on first valid insertion. Returns the actual inserted amount.

```js
const inserted = insertGas(portBlock, {
  type: "example_hydrogen",
  amount: 250,
  exact: true,
});
```

## Get an indexed storage wrapper

### getFluidStorage

`getFluidStorage(target: FluidContainerTarget, fluidIndex: number): FluidStorage | undefined`

### getGasStorage

`getGasStorage(target: GasContainerTarget, gasIndex: number): GasStorage | undefined`

Both validate the endpoint and requested nonnegative index, initialize its objectives, and return a storage wrapper. Empty tank blocks without an entity return `undefined` until a resource insertion creates one.

## Imports

```js
import {
  getFluidInputIndices,
  getFluidStorage,
  getGasInputIndices,
  getGasStorage,
  insertFluid,
  insertGas,
  resolveFluidContainerAt,
  resolveGasContainerAt,
  resolveItemContainerAt,
  transferFluid,
  transferGas,
} from "DoriosCore/index.js";
```

## Remarks

- Resolved handles can become stale. Passing one back through its resolver refreshes it from the physical block when possible.
- Link-node endpoints preserve the port block so per-port overrides remain enforceable.
- Explicit indices are an advanced escape hatch. Validate them against your declared machine contract.
