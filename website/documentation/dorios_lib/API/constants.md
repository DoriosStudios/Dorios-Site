---
id: constants
title: constants namespace
sidebar_label: constants
sidebar_position: 4
description: Command aliases, equipment slots, directions, dimensions, and shared block policy lists.
---

# `constants` namespace

Namespace: `DoriosLib.constants` · Package: `DoriosLib/index.js`

## PERMISSION_LEVELS

Maps convenient names to `CommandPermissionLevel` values:

| Alias | Native value |
| --- | --- |
| `any` | `Any` |
| `gamedirector`, `gameDirectors` | `GameDirectors` |
| `admin` | `Admin` |
| `host` | `Host` |
| `owner` | `Owner` |

These keys are accepted by [`CommandDefinition.permissionLevel`](./registry#commanddefinition).

## COMMAND_PARAMETER_TYPES

Maps concise command parameter names to `CustomCommandParamType`:

| Aliases | Native type |
| --- | --- |
| `string` | `String` |
| `int`, `integer` | `Integer` |
| `float` | `Float` |
| `bool`, `boolean` | `Boolean` |
| `enum` | `Enum` |
| `block` | `BlockType` |
| `item` | `ItemType` |
| `location` | `Location` |
| `entity`, `target` | `EntitySelector` |
| `entityType` | `EntityType` |
| `player` | `PlayerSelector` |

## EQUIPMENT_SLOTS

`EQUIPMENT_SLOTS: EquipmentSlot[]`

Contains the values exposed by the installed Script API `EquipmentSlot` enum. Use it when iterating valid equipment positions. The entity helpers also validate supplied slot strings against this list.

## DIRECTION_VECTORS

`DIRECTION_VECTORS: Record<ContainerFace, Vector3>`

| Direction | Vector |
| --- | --- |
| `north` | `{ x: 0, y: 0, z: -1 }` |
| `south` | `{ x: 0, y: 0, z: 1 }` |
| `east` | `{ x: 1, y: 0, z: 0 }` |
| `west` | `{ x: -1, y: 0, z: 0 }` |
| `up` | `{ x: 0, y: 1, z: 0 }` |
| `down` | `{ x: 0, y: -1, z: 0 }` |

```js
const above = DoriosLib.math.offset(
  block.location,
  DoriosLib.constants.DIRECTION_VECTORS.up,
);
```

## DIMENSIONS

Provides canonical IDs and build-height bounds:

| Key | ID | Minimum Y | Maximum Y |
| --- | --- | ---: | ---: |
| `overworld` | `minecraft:overworld` | -64 | 320 |
| `nether` | `minecraft:nether` | 0 | 128 |
| `end` | `minecraft:the_end` | 0 | 256 |

## UNBREAKABLE_BLOCKS

`UNBREAKABLE_BLOCKS: string[]`

A shared addon safety policy for blocks that scripted tools should not destroy. Script API does not expose a universal `unbreakable` property, so this list provides a consistent policy for Dorios addons.

The exported array is mutable. Prefer reading it; mutating shared library policy affects every consumer in the same runtime.

### isUnbreakableBlock

`isUnbreakableBlock(typeId: string): boolean`

Checks membership in `UNBREAKABLE_BLOCKS`.

## VANILLA_CONTAINER_BLOCKS

`VANILLA_CONTAINER_BLOCKS: string[]`

Known vanilla blocks that expose container-like storage, including chests, barrels, furnaces, hoppers, shulker boxes, dispensers, droppers, and related blocks.

### isVanillaContainerBlock

`isVanillaContainerBlock(typeId: string): boolean`

Checks membership in `VANILLA_CONTAINER_BLOCKS`. It does not inspect a block instance or guarantee that the instance currently exposes an accessible inventory.
