---
id: fluid-io
title: Liquid IO documents
sidebar_label: Liquid IO documents
sidebar_position: 13
description: Register, persist, inspect, normalize, and cycle indexed-liquid IO configurations.
---

# Liquid IO documents

The liquid IO API manages the versioned document that declares which indexed tanks accept or expose liquid on each face. [`registerIOInterface`](./io-interface) uses these functions internally; direct access is intended for advanced container infrastructure.

```js
import {
  getFluidConfig,
  getInputFluidIndices,
  getOutputFluidIndices,
  setFluidConfig,
} from "DoriosCore/index.js";
```

## Configuration models

### Basic

A compatible liquid entity with no stored document is reported as `basic`. Basic containers expose all real tank indices for both face-independent input and output.

### SimpleFluidConfig

```ts
interface SimpleFluidConfig {
  version: 1;
  type: "simple";
  inputConfig: number[];
  outputConfig: number[];
}
```

Simple documents use one face-independent policy.

### ComplexFluidConfig

```ts
interface ComplexFluidConfig {
  version: 1;
  type: "complex";
  anyInputIndices: number[];
  anyOutputIndices: number[];
  inputConfig: Partial<Record<DirectionName, number[]>>;
  outputConfig: Partial<Record<DirectionName, number[]>>;
}
```

Complex documents store absolute face policies plus fallbacks used when no face is available.

## Constants

| Export | Value | Purpose |
| --- | --- | --- |
| `FLUID_CONFIG_VERSION` | `1` | Supported document version. |
| `FLUID_CONFIG_KEY` | `"liquids"` | Section name inside the shared IO document. |
| `FLUID_CONTAINER_FAMILY` | `"dorios:fluid_container"` | Required helper-entity type family. |
| `FLUID_CONFIG_EVENT_NAMESPACE` | `"dorios_fluid"` | Script-event namespace used to publish documents. |
| `SET_FLUID_CONFIG_EVENT_ID` | `"dorios_fluid:set_config"` | Exact publication event. |
| `DEFAULT_FLUID_IO_MODE` | `"disabled"` | No-input/no-output mode ID. |

Prefer functions over sending the protocol event yourself.

## Static definitions

### registerFluidIODefinition

<div class="api-signature">

`registerFluidIODefinition(blockTypeId: string, value: LiquidIOGroupConfig): FluidIODefinition`

</div>

Registers the allowed liquid modes for one exact machine block type.

| Parameter | Type | Description |
| --- | --- | --- |
| `blockTypeId` | `string` | Nonempty block ID. |
| `value.anyInputIndices` | `number[]` | Face-independent input fallback. Every index must appear in at least one input mode. |
| `value.anyOutputIndices` | `number[]` | Face-independent output fallback. Every index must appear in at least one output mode. |
| `value.modes` | `FluidIOModeConfig[]` | Ordered UI modes. `buttonSlots` is irrelevant to this low-level registration. |

Returns a defensive normalized copy:

```ts
interface FluidIODefinition {
  anyInputIndices: number[];
  anyOutputIndices: number[];
  modes: Array<{
    id: string;
    inputIndices: number[];
    outputIndices: number[];
  }>;
}
```

Registration rules:

- IDs must be nonempty and unique.
- Indices must be unique integers from `0` through `255`.
- `disabled` cannot expose indices.
- Every other mode must expose at least one input or output index.
- Two modes cannot have the same input/output signature.
- A missing `disabled` mode is inserted automatically.

Invalid definitions throw `TypeError` or `RangeError`.

### getFluidIODefinition

`getFluidIODefinition(blockTypeId: string): FluidIODefinition | undefined` returns a defensive copy of the current static definition.

## Ensure a machine document

### ensureFluidIOConfig

<div class="api-signature">

`ensureFluidIOConfig(entity: Entity, blockTypeId: string): boolean`

</div>

Ensures a registered compatible entity owns a valid complex document.

| Parameter | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Helper entity with `dorios:fluid_container`. |
| `blockTypeId` | `string` | Block definition used to reconcile allowed modes. |

Returns `true` only when the local document is already applied, capacity-valid, definition-current, published, and validated. It commonly returns `false` immediately after placement because DoriosCore has just published a new document; the next runtime pass validates it.

It also returns `false` when the definition references more indices than the entity actually supports.

## Read and write documents

### setFluidConfig

<div class="api-signature">

`setFluidConfig(entity: Entity, config: FluidConfig): boolean`

</div>

Validates `config` against the entity's actual tank count, publishes it through the cross-addon event, updates the local cache, and returns `true`. Incompatible entities or invalid documents throw.

### getFluidConfig

`getFluidConfig(entity: Entity): FluidConfig | undefined` returns a defensive copy of a simple or complex document. Basic, invalid, and unsupported entities return `undefined`.

### getFluidConfigRevision

`getFluidConfigRevision(entity: Entity): number` returns the current local revision for configured entities and `0` otherwise.

### getFluidStatus

<div class="api-signature">

`getFluidStatus(entity: Entity): "basic" | "simple" | "complex" | "invalid" | "unsupported"`

</div>

| Status | Meaning |
| --- | --- |
| `basic` | Compatible container without a stored document; every real index is exposed. |
| `simple` | Valid face-independent document. |
| `complex` | Valid face-aware document. |
| `invalid` | A document exists but cannot be normalized for this entity. |
| `unsupported` | Entity lacks the liquid container family or required runtime capabilities. |

## Resolve allowed indices

### getInputFluidIndices

`getInputFluidIndices(entity: Entity, options?: { face?: DirectionName }): ReadonlyArray<number>` returns allowed insertion indices.

### getOutputFluidIndices

`getOutputFluidIndices(entity: Entity, options?: { face?: DirectionName }): ReadonlyArray<number>` returns allowed extraction indices.

For complex documents, omitting `face` uses `anyInputIndices` or `anyOutputIndices`. A specified face uses that face's array or an empty array. Invalid and unsupported entities expose nothing.

```js
const northInputs = getInputFluidIndices(entity, { face: "north" });
const fallbackOutputs = getOutputFluidIndices(entity);
```

## Read and cycle visual modes

### getFluidIODirectionMode

<div class="api-signature">

`getFluidIODirectionMode(entity: Entity, blockTypeId: string, direction: string): string`

</div>

Returns the registered mode whose input/output arrays exactly match the selected absolute face. Invalid directions, unready documents, and unmatched configurations return `disabled`.

### cycleFluidIODirectionMode

<div class="api-signature">

`cycleFluidIODirectionMode(entity: Entity, blockTypeId: string, direction: string): string`

</div>

Advances the face through the definition's ordered modes, publishes the updated complex document, and returns the next mode ID. Invalid or unavailable configurations return `disabled`.

Normal addons do not call these for standard IO buttons; `registerIOInterface` wires them automatically.

## Normalize and clone

### normalizeFluidConfig

<div class="api-signature">

`normalizeFluidConfig(value: unknown, count: number): FluidConfig`

</div>

Creates a validated copy of a simple or complex version-1 document.

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | Candidate document. Must be a plain object with known `type` and version. |
| `count` | `number` | Nonnegative integer count of actual tanks. Every index must be lower than this value. |

Unknown faces, versions, types, malformed arrays, and out-of-range indices throw.

### cloneFluidConfig

`cloneFluidConfig(config: FluidConfig): FluidConfig` returns a deep copy of all arrays and face maps.

## Example: direct complex document

```js
import { setFluidConfig } from "DoriosCore/index.js";

setFluidConfig(entity, {
  version: 1,
  type: "complex",
  anyInputIndices: [0],
  anyOutputIndices: [1],
  inputConfig: {
    west: [0],
  },
  outputConfig: {
    east: [1],
  },
});
```

For ordinary UI-controlled machines, declare the same policy through [`registerIOInterface`](./io-interface) rather than constructing documents manually.

