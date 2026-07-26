---
id: item
title: item namespace
sidebar_label: item
sidebar_position: 8
description: Create ItemStacks, check item identifiers, inspect durability, repair items, and apply Unbreaking-aware damage.
---

# `item` namespace

Namespace: `DoriosLib.item` · Package: `DoriosLib/index.js`

## create

<div class="api-signature">

`create(options: CreateItemOptions): ItemStack`

</div>

```ts
interface CreateItemOptions {
  typeId: string;
  amount?: number; // 1
  nameTag?: string;
  lore?: Array<RawMessage | string>;
}
```

Creates an ItemStack and applies its optional display name and lore.

| Option | Required | Description |
| --- | --- | --- |
| `typeId` | Yes | Registered item identifier. |
| `amount` | No | Stack amount; defaults to 1 and remains subject to native limits. |
| `nameTag` | No | Custom display name. |
| `lore` | No | Complete lore array passed to the native item. |

```js
const manual = DoriosLib.item.create({
  typeId: "minecraft:book",
  nameTag: "§r§6Machine Manual",
  lore: ["§r§7Right-click a controller for details."],
});
```

Missing options, invalid identifiers, invalid amounts, and native name/lore errors throw. This method is intended for trusted addon configuration, not unvalidated user input.

## isType

`isType(typeId: string): boolean`

Returns whether the installed Script API recognizes the item identifier.

## `item.durability` namespace

### getComponent

`getComponent(item: ItemStack): ItemDurabilityComponent | undefined`

Returns the native durability component or `undefined` for nondurable items.

### getInfo

`getInfo(item: ItemStack): DurabilityInfo | undefined`

```ts
interface DurabilityInfo {
  damage: number;
  max: number;
  remaining: number;
  percentage: number;
}
```

The remaining percentage is rounded to two decimals. Nondurable items return `undefined`.

### repair

`repair(item: ItemStack, amount?: number): number`

Reduces accumulated damage by up to the positive integer `amount`, which defaults to `1`, and returns the amount actually repaired. Nondurable items and nonpositive requests return `0`.

### damage

<div class="api-signature">

`damage(item: ItemStack, amount?: number, chance?: number, random?: () => number): DamageResult`

</div>

```ts
interface DamageResult {
  applied: number;
  broken: boolean;
  remaining: number;
}
```

Applies a number of damage attempts while respecting a custom base chance and the item's Unbreaking enchantment.

| Parameter | Default | Description |
| --- | ---: | --- |
| `item` | — | Item whose durability component is mutated. |
| `amount` | `1` | Number of damage attempts after flooring to an integer. |
| `chance` | `1` | Base probability clamped from 0 through 1 before Unbreaking. |
| `random` | `Math.random` | Injectable random source, useful for deterministic tests. |

Unbreakable or nondurable items apply zero damage. The method sets damage no higher than maximum durability and reports `broken`, but it does **not** remove the broken stack. The caller owns stack removal.

```js
const result = DoriosLib.item.durability.damage(hammer, 1, 1);

if (result.broken) {
  container.setItem(slot, undefined);
} else {
  container.setItem(slot, hammer);
}
```
