---
id: rotation
title: Rotation class
sidebar_label: Rotation
sidebar_position: 17
description: Place axis-oriented blocks and rotate UtilityCraft or vanilla facing states.
---

# Rotation class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`Rotation` applies player-facing placement and wrench rotation to DoriosCore-compatible blocks.

```js
import { Rotation } from "DoriosCore/index.js";
```

## Definition

<div class="api-signature">

`class Rotation`

</div>

All members are static. Do not construct this class.

## Supported block states

| Block states | Behavior |
| --- | --- |
| `utilitycraft:axis` | Six-direction placement with `facing()`. |
| `utilitycraft:axis` and `utilitycraft:rotation` | Full 24-orientation wrench behavior. |
| `minecraft:facing_direction` | Cycles the supported vanilla facing values. |
| `minecraft:cardinal_direction` | Cycles north, south, east, and west. |

## Methods

### facing(player, block, perm)

<div class="api-signature">

`Rotation.facing(player: Player, block: Block, perm: BlockPermutation): void`

</div>

Manually places `perm.type.id` at `block.location` with `utilitycraft:axis` based on the strongest component of the player's view direction.

| Parameter | Type | Description |
| --- | --- | --- |
| `player` | `Player` | Player whose view determines the axis and who receives the placement sound. |
| `block` | `Block` | Position and dimension where the permutation is placed. |
| `perm` | `BlockPermutation` | Permutation supplying the block identifier and tags. |

| View direction | Stored axis |
| --- | --- |
| Vertical component is strongest | `up` or `down` |
| Z component is stronger than X | `north` or `south` |
| Otherwise | `east` or `west` |

Placement is scheduled with `system.run()`. On the following scheduled callback, energy-, item-, and fluid-tagged blocks emit `dorios:updatePipes` so UtilityCore can refresh the corresponding network. UtilityCore, not DoriosCore, owns those networks.

`Machine.spawnEntity()` uses this method when the machine configuration enables rotation.

### handleRotation(block, blockFace)

<div class="api-signature">

`Rotation.handleRotation(block: Block, blockFace: DirectionName | string): void`

</div>

Rotates `block` according to its supported states.

| Parameter | Type | Description |
| --- | --- | --- |
| `block` | `Block` | Block to rotate. |
| `blockFace` | `DirectionName \| string` | Face clicked by the wrench interaction. |

The method chooses the first compatible strategy:

1. Blocks with `utilitycraft:axis` and `utilitycraft:rotation` use `rotate_24()`.
2. Blocks with `minecraft:facing_direction` advance to the next facing value.
3. Blocks with `minecraft:cardinal_direction` advance to the next cardinal value.

When no supported state exists, the block is left unchanged.

### rotate_24(block, blockFace)

<div class="api-signature">

`Rotation.rotate_24(block: Block, blockFace: DirectionName | string): void`

</div>

Applies the 24-orientation mapping for a block containing both UtilityCraft states.

- Clicking the current axis or its opposite increments `utilitycraft:rotation` modulo 4.
- Clicking another face looks up the next axis and rotation in DoriosCore's orientation map.
- An unsupported mapping leaves the permutation unchanged.

Call `handleRotation()` from a normal wrench component so blocks with vanilla states remain supported too.

## Example: wrench component

```js
import * as DoriosLib from "DoriosLib/index.js";
import { Rotation } from "DoriosCore/index.js";

DoriosLib.registry.itemComponent("example:example_wrench", {
  onUseOn(event) {
    Rotation.handleRotation(event.block, event.blockFace);
  },
});
```

## Remarks

- The block JSON must declare every state that the selected rotation method writes.
- `facing()` places the block by command on a scheduled callback; do not immediately assume the original `Block` reference already contains the new permutation.
- Use addon-owned interaction code to decide which item acts as a wrench. Do not modify DoriosCore.
