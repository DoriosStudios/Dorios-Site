---
id: gas-io
title: Gas IO documents
sidebar_label: Gas IO documents
sidebar_position: 14
description: Register, persist, inspect, normalize, and cycle indexed-gas IO configurations.
---

# Gas IO documents

The gas IO API is the gas-specific counterpart to [liquid IO documents](./fluid-io). It stores independent versioned policies under the `gases` section and never reuses liquid indices or modes.

```js
import {
  getGasConfig,
  getInputGasIndices,
  getOutputGasIndices,
  setGasConfig,
} from "DoriosCore/index.js";
```

## Configuration models

### SimpleGasConfig

```ts
interface SimpleGasConfig {
  version: 1;
  type: "simple";
  inputConfig: number[];
  outputConfig: number[];
}
```

### ComplexGasConfig

```ts
interface ComplexGasConfig {
  version: 1;
  type: "complex";
  anyInputIndices: number[];
  anyOutputIndices: number[];
  inputConfig: Partial<Record<DirectionName, number[]>>;
  outputConfig: Partial<Record<DirectionName, number[]>>;
}
```

Compatible entities without a document are `basic` and expose every real gas index. Simple documents are face-independent; complex documents store absolute faces and no-face fallbacks.

## Constants

| Export | Value | Purpose |
| --- | --- | --- |
| `GAS_CONFIG_VERSION` | `1` | Supported document version. |
| `GAS_CONFIG_KEY` | `"gases"` | Section name in the shared IO document. |
| `GAS_CONTAINER_FAMILY` | `"dorios:gas_container"` | Required entity type family. |
| `GAS_CONFIG_EVENT_NAMESPACE` | `"dorios_gas"` | Publication event namespace. |
| `SET_GAS_CONFIG_EVENT_ID` | `"dorios_gas:set_config"` | Exact document event. |
| `DEFAULT_GAS_IO_MODE` | `"disabled"` | Empty input/output mode ID. |

## Static definitions

### registerGasIODefinition

<div class="api-signature">

`registerGasIODefinition(blockTypeId: string, value: GasIOGroupConfig): GasIODefinition`

</div>

Registers the ordered allowed modes and face-independent fallbacks for one block type.

| Parameter | Type | Description |
| --- | --- | --- |
| `blockTypeId` | `string` | Nonempty exact block ID. |
| `value.anyInputIndices` | `number[]` | Fallback inputs declared by at least one input mode. |
| `value.anyOutputIndices` | `number[]` | Fallback outputs declared by at least one output mode. |
| `value.modes` | `GasIOModeConfig[]` | Ordered IDs with optional `inputIndices` and `outputIndices`. |

Returns a defensive normalized `GasIODefinition`.

Mode IDs and index signatures must be unique. Indices are integers from `0` through `255`. `disabled` cannot expose indices; every other mode must expose at least one. DoriosCore inserts `disabled` when omitted. Violations throw during registration.

### getGasIODefinition

`getGasIODefinition(blockTypeId: string): GasIODefinition | undefined` returns a defensive copy of the registered definition.

## Ensure, read, and write

### ensureGasIOConfig

<div class="api-signature">

`ensureGasIOConfig(entity: Entity, blockTypeId: string): boolean`

</div>

Ensures a compatible registered entity has a capacity-valid, definition-current complex gas document. It returns `true` only after publication and local validation complete. A newly published or reconciled document returns `false` until a later pass observes it.

### setGasConfig

`setGasConfig(entity: Entity, config: GasConfig): boolean` normalizes against the entity's actual gas count, publishes the document, updates local cache state, and returns `true`. Invalid input throws.

### getGasConfig

`getGasConfig(entity: Entity): GasConfig | undefined` returns a defensive configured document. Basic, invalid, and unsupported states return `undefined`.

### getGasConfigRevision

`getGasConfigRevision(entity: Entity): number` returns a cache revision or `0`.

### getGasStatus

<div class="api-signature">

`getGasStatus(entity: Entity): "basic" | "simple" | "complex" | "invalid" | "unsupported"`

</div>

| Status | Meaning |
| --- | --- |
| `basic` | Compatible container without a document; all real indices are available. |
| `simple` | Valid face-independent gas document. |
| `complex` | Valid absolute-face gas document. |
| `invalid` | Stored document cannot be normalized. |
| `unsupported` | Entity lacks the gas container family or runtime support. |

## Resolve indices

### getInputGasIndices

`getInputGasIndices(entity: Entity, options?: { face?: DirectionName }): ReadonlyArray<number>` returns allowed insertion indices.

### getOutputGasIndices

`getOutputGasIndices(entity: Entity, options?: { face?: DirectionName }): ReadonlyArray<number>` returns allowed extraction indices.

Complex documents use the exact requested face or the `any*` fallback when no face is supplied. Invalid and unsupported entities return empty arrays.

## Direction modes

### getGasIODirectionMode

`getGasIODirectionMode(entity: Entity, blockTypeId: string, direction: string): string` returns the mode matching an absolute face, or `disabled`.

### cycleGasIODirectionMode

`cycleGasIODirectionMode(entity: Entity, blockTypeId: string, direction: string): string` advances through registered modes, publishes the new face document, and returns the next ID. Invalid directions and unavailable documents return `disabled`.

The standard [`registerIOInterface`](./io-interface) buttons call both functions automatically.

## Normalize and clone

### normalizeGasConfig

<div class="api-signature">

`normalizeGasConfig(value: unknown, count: number): GasConfig`

</div>

Validates and copies a version-1 simple or complex gas document. `count` must be a nonnegative integer, and every index must be in range. Unknown faces, types, versions, or malformed values throw.

### cloneGasConfig

`cloneGasConfig(config: GasConfig): GasConfig` returns a deep copy of all arrays and face maps.

## Example

```js
import { setGasConfig } from "DoriosCore/index.js";

setGasConfig(entity, {
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

For a normal Gas Reactor UI, register this policy through [`registerIOInterface`](./io-interface). See the [template implementation](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/machines/gasReactor.js).

