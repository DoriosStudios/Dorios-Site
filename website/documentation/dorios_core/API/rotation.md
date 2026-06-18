---
id: rotation
sidebar_label: Rotation
title: Rotation Utility
sidebar_position: 8
---

# Rotation

:::info
`Rotation` handles manual placement facing and wrench-style block rotation.
:::

---

# API

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#facing">facing</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#handlerotation">handleRotation</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#rotate_24">rotate_24</a></div>

</div>

---

## facing

<div class="api-signature">

`Rotation.facing(player: Player, block: Block, perm: BlockPermutation): void`

</div>

Places a block manually with its `utilitycraft:axis` state based on the player's view direction.

Axis selection:

- mostly vertical view: `up` or `down`
- stronger Z direction: `north` or `south`
- otherwise: `east` or `west`

After placement, the helper sends `dorios:updatePipes` script events for blocks tagged as energy, item, or fluid network blocks.

This is used by `Machine.spawnEntity()` when `config.rotation` is true.

## handleRotation

<div class="api-signature">

`Rotation.handleRotation(block: Block, blockFace: string): void`

</div>

Rotates a block when a wrench is used.

Supported cases:

- blocks with `utilitycraft:axis` and `utilitycraft:rotation` use full 24-direction logic,
- vanilla `minecraft:facing_direction` cycles through all facing directions,
- vanilla `minecraft:cardinal_direction` cycles through cardinal directions.

## rotate_24

<div class="api-signature">

`Rotation.rotate_24(block: Block, blockFace: string): void`

</div>

Rotates blocks that use both:

```text
utilitycraft:axis
utilitycraft:rotation
```

Rules:

- clicking the same axis line rotates `utilitycraft:rotation` from `0` to `3`,
- clicking another face changes the axis using the precomputed rotation map.

---

# Example

```js
DoriosAPI.register.itemComponent("wrench", {
  onUseOn(e) {
    Rotation.handleRotation(e.block, e.blockFace);
  },
});
```
