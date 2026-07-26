---
id: link-node
title: linkNode namespace
sidebar_label: linkNode
sidebar_position: 9
description: Resolve physical link-node blocks to logical entities and configure per-port item, liquid, and gas IO overrides.
---

# `linkNode` namespace

Namespace: `DoriosLib.linkNode` · Package: `DoriosLib/index.js`

A link node lets a physical block act as an endpoint for an entity elsewhere in the same dimension. Multiblock ports use this pattern so automation interacts with the port while storage remains on the controller entity.

DoriosLib owns generic endpoint identity and per-port selections. DoriosCore supplies liquid/gas storage adapters and machinery behavior; UtilityCore owns networks.

## Identity constants

| Constant | Value | Purpose |
| --- | --- | --- |
| `LINK_NODE_BLOCK_TAG` | `dorios:link_node` | Required block tag for physical endpoints. |
| `LINK_NODE_TAG_PREFIX` | `dorios:link_node:[` | Prefix of coordinate tags published by logical entities. |

The canonical entity tag for `{ x: 10, y: 64, z: -3 }` is `dorios:link_node:[10,64,-3]`.

## createLinkNodeTag

`createLinkNodeTag(location: Vector3): string`

Floors finite coordinates and builds the canonical entity tag. Missing or nonfinite coordinates throw `TypeError`.

## createLinkNodeKey

`createLinkNodeKey(location: Vector3): string`

Builds the canonical `x,y,z` document key after the same coordinate normalization.

```js
const tag = DoriosLib.linkNode.createLinkNodeTag(portBlock.location);
controllerEntity.addTag(tag);
```

## parseLinkNodeKey

`parseLinkNodeKey(key: string): Vector3 | undefined`

Parses exactly three comma-separated safe integers. Whitespace, decimal coordinates, or additional components return `undefined`.

## parseLinkNodeTag

`parseLinkNodeTag(tag: string): Vector3 | undefined`

Parses the exact canonical `dorios:link_node:[x,y,z]` format and returns safe integer coordinates.

## isLinkNode

`isLinkNode(block: Block | undefined): boolean`

Checks the physical block tag and safely returns false for unavailable/invalid blocks.

## getLinkNodeLocations

`getLinkNodeLocations(entity: Entity): Vector3[]`

Parses every canonical node tag published by a valid entity, removes duplicate locations, and preserves entity-tag order. Invalid entities or tag access failures return an empty array.

## isLinkedEntity

`isLinkedEntity(block: Block | undefined, entity: Entity | undefined): boolean`

Checks a known block/entity pair without querying the dimension. Both endpoints must be valid, share a dimension, and publish the matching tag.

## resolveLinkNode

<div class="api-signature">

`resolveLinkNode(block: Block, predicate?: (entity: Entity) => boolean): ResolvedLinkNode | undefined`

</div>

```ts
interface ResolvedLinkNode {
  block: Block;
  entity: Entity;
}
```

Queries entities with the physical block's canonical coordinate tag, applies the optional predicate, and succeeds only when exactly one compatible entity remains.

```js
const resolved = DoriosLib.linkNode.resolveLinkNode(
  portBlock,
  (entity) => entity.matches({ families: ["dorios:container"] }),
);
```

Zero matches and ambiguous multiple matches both return `undefined`. Failing closed prevents automation behavior from depending on native entity-query ordering.

## resolveLinkNodeAt

`resolveLinkNodeAt(dimension: Dimension, location: Vector3, predicate?: (entity: Entity) => boolean): ResolvedLinkNode | undefined`

Floors the location, gets its block, and applies `resolveLinkNode()`.

## Per-port IO constants

| Constant | Value |
| --- | --- |
| `LINK_NODE_IO_CONFIG_KEY` | `linkNodes` |
| `LINK_NODE_IO_VERSION` | `1` |
| `LINK_NODE_IO_EVENT_NAMESPACE` | `dorios_link_node` |
| `SET_LINK_NODE_IO_EVENT_ID` | `dorios_link_node:set_io` |

The link-node document is stored below the shared `utilitycraft:io_config` entity property. Use public methods rather than editing that serialized document.

## initializeLinkNodeIO

`initializeLinkNodeIO(): boolean`

Installs the per-port update listener and entity-removal cache cleanup. Returns false after the service is already active.

## shutdownLinkNodeIO

`shutdownLinkNodeIO(): boolean`

Unsubscribes shared listeners and clears the local parsed-document cache.

## isLinkNodeIOInitialized

`isLinkNodeIOInitialized(): boolean`

Reports listener state.

## getLinkNodeIOOverride

<div class="api-signature">

`getLinkNodeIOOverride(entity, location, resource, operation): ReadonlyArray<number> | undefined`

</div>

```ts
type LinkNodeIOResource = "items" | "liquids" | "gases";
type LinkNodeIOOperation = "input" | "output";
```

Returns one explicit per-port selection.

| Result | Meaning |
| --- | --- |
| `number[]` | Explicit ordered slot or storage-index override. |
| `[]` | Invalid request or invalid stored document; access fails closed. |
| `undefined` | No override exists; use the resource's ordinary no-face fallback. |

Item selections address inventory slots. Liquid and gas selections address indexed storage positions.

## getLinkNodeIORevision

`getLinkNodeIORevision(entity: Entity): number`

Returns a local token that changes after observed node-IO updates. Invalid entities return `0`.

## invalidateLinkNodeIO

`invalidateLinkNodeIO(entityOrId: Entity | string): boolean`

Removes one entity's parsed node document from the local cache.

## setLinkNodeIO

<div class="api-signature">

`setLinkNodeIO(entity, location, resource, selection): true`

</div>

```ts
interface LinkNodeIOSelection {
  input: number[] | null;
  output: number[] | null;
}
```

Publishes complete input/output branches for one physical node and resource.

```js
DoriosLib.linkNode.setLinkNodeIO(
  controllerEntity,
  inputPort.location,
  "items",
  { input: [0, 1], output: [] },
);
```

Rules:

- The entity must be valid and already publish the matching coordinate tag.
- Resource must be `items`, `liquids`, or `gases`.
- Each selection is an array of unique integers from 0 through 255.
- Duplicates are removed while preserving order.
- `null` deletes that branch and restores ordinary fallback behavior.
- `[]` is an explicit override that allows no indices.

Invalid configuration throws `TypeError` or `RangeError`.

## parseLinkNodeIOUpdate

`parseLinkNodeIOUpdate(message: string): LinkNodeIOUpdate | undefined`

Parses and validates a serialized update without applying it.

```ts
interface LinkNodeIOUpdate {
  version: 1;
  node: string;
  location: Vector3;
  resource: LinkNodeIOResource;
  input: number[] | null;
  output: number[] | null;
}
```

This is useful for cache invalidation systems that only need the changed physical position. Malformed JSON or invalid values return `undefined`.

## Complete port pattern

```js
const location = portBlock.location;
const tag = DoriosLib.linkNode.createLinkNodeTag(location);

if (!controllerEntity.hasTag(tag)) controllerEntity.addTag(tag);

DoriosLib.linkNode.setLinkNodeIO(
  controllerEntity,
  location,
  "gases",
  { input: [0], output: null },
);
```

The physical block must also declare the `dorios:link_node` block tag. Registration of a DoriosCore link-node UI is a separate machinery concern.
