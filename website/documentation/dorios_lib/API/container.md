---
id: container
title: container namespace
sidebar_label: container
sidebar_position: 5
description: Resolve item containers, publish item IO documents, inspect accessible slots, insert stacks, and transfer items.
---

# `container` namespace

Namespace: `DoriosLib.container` · Package: `DoriosLib/index.js`

The container API presents one item-storage surface for vanilla block inventories, compatible entities, raw Script API `Container` objects, and physical link nodes. It also persists automation input/output policy on entities.

```js
import * as DoriosLib from "DoriosLib/index.js";
```

## Protocol constants

| Constant | Value | Purpose |
| --- | --- | --- |
| `CONTAINER_FAMILY` | `dorios:container` | Required entity family for compatible generic containers. |
| `DIRECTIONS` | Six absolute faces | Canonical complex-IO directions. |
| `IO_CONFIG_PROPERTY` | `utilitycraft:io_config` | Root entity dynamic property containing shared IO documents. |
| `ITEM_CONFIG_KEY` | `items` | Item document key within the shared root. |
| `ITEM_CONFIG_VERSION` | `1` | Current item configuration schema. |
| `SCRIPT_EVENT_NAMESPACE` | `dorios_container` | Namespace listened to by the container service. |
| `SET_CONFIG_EVENT_ID` | `dorios_container:set_config` | Event used to replace an entity's item configuration. |

Normal addons should call `setConfig()` rather than constructing the script event manually.

## Item configuration contracts

### SimpleItemConfig

Use a simple configuration when every face shares the same slot rules.

```ts
interface SimpleItemConfig {
  version: 1;
  type: "simple";
  inputConfig: number[];
  outputConfig: number[];
}
```

### ComplexItemConfig

Use a complex configuration when automation access varies by absolute face.

```ts
type ContainerFace = "up" | "down" | "north" | "south" | "east" | "west";
type FaceSlotConfig = Partial<Record<ContainerFace, number[]>>;

interface ComplexItemConfig {
  version: 1;
  type: "complex";
  anyInputSlots: number[];
  anyOutputSlots: number[];
  inputConfig: FaceSlotConfig;
  outputConfig: FaceSlotConfig;
}
```

`anyInputSlots` and `anyOutputSlots` are deliberate no-face fallbacks. They are not a union of every face.

Slot indices must be unique integers within the entity inventory size. Invalid documents fail closed.

## initialize

`initialize(): boolean`

Installs the item-configuration script-event listener and entity-removal cache cleanup. Returns `true` when installed by this call and `false` when already active.

## shutdown

`shutdown(): boolean`

Unsubscribes the listeners, clears local caches, and returns whether the service was active. Primarily useful for controlled teardown and tests.

## isInitialized

`isInitialized(): boolean`

Reports whether the shared listeners are installed.

## setConfig

<div class="api-signature">

`setConfig(entity: Entity, config: ItemConfig): boolean`

</div>

Validates a complete item IO document against the entity's current inventory size and publishes it through the shared update event.

| Parameter | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Valid logical owner with an inventory. |
| `config` | `SimpleItemConfig | ComplexItemConfig` | Complete replacement document. |

```js
DoriosLib.container.setConfig(machineEntity, {
  version: 1,
  type: "complex",
  anyInputSlots: [0, 1],
  anyOutputSlots: [2],
  inputConfig: {
    north: [0],
    up: [1],
  },
  outputConfig: {
    south: [2],
  },
});
```

This is a complete replacement, not a patch. Invalid schema, missing inventory, or out-of-range slots are configuration errors.

## resolve

<div class="api-signature">

`resolve(target: ContainerTarget): ResolvedContainer | undefined`

</div>

```ts
type ContainerTarget = Block | Entity | Container | ResolvedContainer;

interface ResolvedContainer {
  kind: "block" | "entity" | "raw";
  owner: Block | Entity | Container;
  container: Container;
  block?: Block;
  entity?: Entity;
  via?: "link_node";
}
```

Resolution behavior:

- A raw `Container` exposes all real slots.
- A block uses its inventory component when available.
- A link-node block tagged for `dorios:item` may resolve to one unique `dorios:container` entity.
- An entity must expose the compatible family and inventory.
- Passing a previous resolution is supported and avoids forcing callers to unwrap it.

Returns `undefined` for invalid, unavailable, incompatible, or ambiguous endpoints.

## resolveAt

`resolveAt(dimension: Dimension, location: Vector3): ResolvedContainer | undefined`

Gets the block at the location and applies ordinary resolution. Use it when automation begins from coordinates rather than a cached object.

## getConfig

`getConfig(entity: Entity): ItemConfig | undefined`

Returns a cloned, mutable snapshot of the valid item document. Returns `undefined` when the entity has no document or when the stored document is invalid. Mutating the returned object does not publish changes; call `setConfig()`.

## getConfigRevision

`getConfigRevision(entity: Entity): number`

Returns a local token that changes whenever this runtime observes a new item document for the entity. Compare for inequality when invalidating caches; do not assume globally increasing revisions across reloads.

## getStatus

`getStatus(entity: Entity): ContainerStatus`

| Status | Meaning |
| --- | --- |
| `basic` | Compatible inventory without a persisted item document. |
| `simple` | Valid face-independent document. |
| `complex` | Valid face-aware document. |
| `invalid` | The stored item document exists but fails validation. |
| `unsupported` | The entity is invalid, lacks the family, or lacks an inventory. |

## getInputSlots

`getInputSlots(target: ContainerTarget, options?: { face?: ContainerFace }): ReadonlyArray<number>`

Returns ordered slots into which automation may insert. Simple documents return `inputConfig`; complex documents return the selected face list or `anyInputSlots` when no face is supplied. Raw and vanilla block containers expose their actual slots. Invalid targets return an empty array.

## getOutputSlots

`getOutputSlots(target: ContainerTarget, options?: { face?: ContainerFace }): ReadonlyArray<number>`

Applies the same rules for extraction. Link-node results additionally apply the selected port's explicit item override when one exists.

```js
const slots = DoriosLib.container.getOutputSlots(source, { face: "east" });
```

## insert

<div class="api-signature">

`insert(target: ContainerTarget, options: InsertOptions): number`

</div>

```ts
interface InsertOptions {
  item: ItemStack;
  face?: ContainerFace;
  slots?: ReadonlyArray<number>;
  maxAmount?: number;
}
```

The supplied stack is copied and not mutated. DoriosLib tries compatible target stacks and empty slots in policy order, then returns the amount inserted.

| Option | Required | Description |
| --- | --- | --- |
| `item` | Yes | Stack whose type, components, and amount should be inserted. |
| `face` | No | Absolute input face. |
| `slots` | No | Ordered subset restricting the normally available input slots. |
| `maxAmount` | No | Maximum amount attempted from the stack. |

Invalid targets, empty policies, or nonpositive limits insert `0`.

## transfer

<div class="api-signature">

`transfer(source: ContainerTarget, options: TransferOptions): number`

</div>

```ts
interface TransferOptions {
  sourceSlot: number;
  target: ContainerTarget;
  targetFace?: ContainerFace;
  targetSlots?: ReadonlyArray<number>;
  maxAmount?: number;
}
```

Moves items from one exact source slot to the target and returns the amount transferred. The caller owns source-slot selection; the adapter enforces destination input policy. `targetSlots` completely overrides face-based destination selection.

```js
const moved = DoriosLib.container.transfer(sourceEntity, {
  sourceSlot: 5,
  target: targetBlock,
  targetFace: "west",
  maxAmount: 16,
});
```

The operation updates the source stack only after successful insertion.

## isCompatible

`isCompatible(entity: Entity): boolean`

Checks whether a valid entity exposes the `dorios:container` family and an inventory container.

## invalidate

`invalidate(entityOrId: Entity | string): boolean`

Deletes one locally cached item document. Returns whether a cache entry existed. The next read reparses current dynamic-property data.

## Remarks

- Item containers are generic DoriosLib infrastructure. Liquid and gas storage and transfer wrappers belong to DoriosCore.
- Link-node resolution fails closed when multiple entities publish the same physical endpoint.
- Persist only normalized documents produced by public configuration methods.
- Explicit slot lists are advanced policy overrides; validate them against your machine design.
