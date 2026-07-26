---
id: player
title: player namespace
sidebar_label: player
sidebar_position: 12
description: Check player game modes, give items safely, and access equipment helpers.
---

# `player` namespace

Namespace: `DoriosLib.player` · Package: `DoriosLib/index.js`

## isCreative

`isCreative(player: Player): boolean`

Returns whether the player's current native game mode is Creative.

## isSurvival

`isSurvival(player: Player): boolean`

Returns whether the player's current native game mode is Survival. Adventure and spectator players return false from both game-mode helpers.

## giveItem

<div class="api-signature">

`giveItem(player: Player, options: GiveItemOptions): AddItemResult`

</div>

```ts
interface GiveItemOptions {
  item: string | ItemStack;
  amount?: number;          // 1, for string identifiers
  dropRemainder?: boolean;  // true
  dropLocation?: Vector3;   // one block above the player
}
```

Creates or clones a stack, attempts to add it to the player inventory, and reports the result.

```js
const result = DoriosLib.player.giveItem(player, {
  item: "example:machine_manual",
  amount: 1,
});
```

Unlike [`entity.tryAddItem`](./entity#tryadditem), this player-specific helper drops overflow by default. Set `dropRemainder: false` when the caller must retain and handle it.

```ts
interface AddItemResult {
  added: number;
  remainder: ItemStack | undefined;
  dropped: boolean;
}
```

## getEquipment

`getEquipment(entity: Entity, slot: EquipmentSlot | string): ItemStack | undefined`

Re-exports the entity equipment getter for convenience.

## setEquipment

`setEquipment(entity: Entity, options: SetEquipmentOptions): boolean`

Re-exports the entity equipment setter. See [entity equipment](./entity#equipment) for validation and option details.
