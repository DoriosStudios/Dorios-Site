---
id: api-overview
title: DoriosLib API reference
sidebar_label: API overview
sidebar_position: 1
description: Complete inventory of namespaces, functions, constants, and type contracts exported by DoriosLib/index.js.
---

# DoriosLib API reference

The supported API is available from one namespace import:

```js
import * as DoriosLib from "DoriosLib/index.js";
```

The current declaration exposes **186 runtime paths** across 15 namespaces and **43 type-only contracts**. Anything that is not reachable from this root entry point is an implementation detail.

## Root member

### VERSION

<div class="api-signature">

`DoriosLib.VERSION: "2.0.0"`

</div>

Identifies the installed DoriosLib public API version. Use it for diagnostics; feature detection is still preferable when supporting multiple generations.

## Namespaces

| Namespace | Scope | Purpose |
| --- | --- | --- |
| [`block`](./block) | Foundation | Block states, facing, adjacency, entity lookup, and registered block checks. |
| [`config`](./config) | Configuration | Metadata and dependency options for the installed UtilityCraft copy. |
| [`constants`](./constants) | Foundation | Command aliases, directions, dimensions, equipment slots, and block policies. |
| [`container`](./container) | Infrastructure | Generic item containers, persisted IO documents, insertion, and transfer. |
| [`dependencies`](./dependencies) | Integration | Cross-addon discovery and minimum-version validation. |
| [`entity`](./entity) | Foundation | Inventory, health, and equipment operations. |
| [`item`](./item) | Foundation | Item creation, item type checks, durability, and Unbreaking-aware damage. |
| [`linkNode`](./link-node) | Infrastructure | Physical/logical endpoint resolution and per-port resource IO overrides. |
| [`math`](./math) | Foundation | Ranges, scaling, random values, vectors, and Roman numerals. |
| [`messages`](./messages) | Foundation | World chat, player chat, action bar, and formatted JSON output. |
| [`player`](./player) | Foundation | Game-mode checks, item giving, and equipment aliases. |
| [`registry`](./registry) | Integration | UtilityCraft payloads, custom components, and custom commands. |
| [`text`](./text) | Foundation | Minecraft formatting codes and identifier labels. |
| [`time`](./time) | Foundation | Tick constants, duration formatting, callbacks, and asynchronous waits. |
| [`utils`](./utils) | Foundation | Arrays, plain-object checks, safe JSON, and cloning. |

## Type-only contracts

Types are available to TypeScript and JSDoc consumers but do not exist as JavaScript properties at runtime.

| Area | Contracts |
| --- | --- |
| Core aliases | `BlockStateValue`, `ContainerFace`, `ScaleMode`, `LinkNodeIOResource`, `LinkNodeIOOperation`, `RegistrationPayload`, `JsonResult` |
| Container IO | `SimpleItemConfig`, `FaceSlotConfig`, `ComplexItemConfig`, `ItemConfig`, `ResolvedContainer`, `ContainerTarget`, `InsertOptions`, `TransferOptions`, `SlotQueryOptions`, `ContainerStatus` |
| Dependencies | `DependencyRequirement`, `AddonMetadata`, `DependencyIssue`, `ValidationResult`, `InitializeDependencyOptions` |
| Entities/items | `InventoryEntry`, `SetItemOptions`, `SetNewItemOptions`, `TryAddItemOptions`, `AddItemResult`, `ChangeItemAmountOptions`, `HealthInfo`, `SetEquipmentOptions`, `CreateItemOptions`, `DurabilityInfo`, `DamageResult`, `GiveItemOptions` |
| Link nodes | `ResolvedLinkNode`, `LinkNodeIOSelection`, `LinkNodeIOUpdate` |
| Registries/JSON | `CoolantRegistration`, `CommandParameter`, `CommandDefinition`, `RegistrarOptions`, `Registrar`, `JsonStringifyOptions` |

Each contract is documented beside the function that consumes or returns it.

## Common conventions

- Positions use the Script API `Vector3` shape.
- Item IO faces are absolute: `up`, `down`, `north`, `south`, `east`, and `west`.
- Indexed liquid and gas selections use integers from `0` through `255`.
- Methods returning arrays use deterministic order; preserve it when attempting insertion or transfer.
- Safe lookup methods return `undefined`, `false`, `0`, or empty arrays when the target is unavailable.
- Configuration errors generally throw rather than silently producing invalid state.
- Registration payloads must be JSON serializable.
