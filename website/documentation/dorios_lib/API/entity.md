---
id: entity
title: entity namespace
sidebar_label: entity
sidebar_position: 7
description: Access entity inventories, add and remove items, read and change health, and manage equipment.
---

# `entity` namespace

Namespace: `DoriosLib.entity` · Package: `DoriosLib/index.js`

## Inventory access

### getInventory

`getInventory(entity: Entity): Container | undefined`

Returns the inventory component's container or `undefined` when the entity has no accessible inventory.

### getInventoryEntries

`getInventoryEntries(entity: Entity): InventoryEntry[]`

```ts
interface InventoryEntry {
  slot: number;
  item: ItemStack;
}
```

Scans the full container and returns every occupied slot in ascending slot order.

### getItems

`getItems(entity: Entity): ItemStack[]`

Returns occupied stacks without slot information. Use `getInventoryEntries()` when later updates must target the original slot.

### getItem

`getItem(entity: Entity, slot: number): ItemStack | undefined`

Reads one slot through the entity inventory. Native invalid-slot behavior is not guaranteed to be suppressed; supply a valid index.

## Set and add items

### setItem

`setItem(entity: Entity, options: { slot: number; item: ItemStack | undefined }): boolean`

Sets a stack or clears the selected slot with `undefined`. Returns `false` when no inventory exists or the native set operation rejects the values.

### setNewItem

<div class="api-signature">

`setNewItem(entity: Entity, options: SetNewItemOptions): boolean`

</div>

```ts
interface SetNewItemOptions {
  slot: number;
  typeId: string;
  amount?: number; // 1
  nameTag?: string;
  lore?: Array<RawMessage | string>;
}
```

Creates an item with [`item.create`](./item#create), then writes it to the selected slot. Item-creation errors intentionally propagate so invalid IDs, amounts, names, or lore remain visible.

### tryAddItem

`tryAddItem(entity: Entity, options: TryAddItemOptions): AddItemResult`

```ts
interface TryAddItemOptions {
  item: string | ItemStack;
  amount?: number;
  dropRemainder?: boolean; // false
}

interface AddItemResult {
  added: number;
  remainder: ItemStack | undefined;
  dropped: boolean;
}
```

String identifiers create a new stack. Supplied stacks are cloned, so the caller's object is not mutated. When `dropRemainder` is true, overflow is spawned at the entity location and `remainder` becomes `undefined`.

### changeItemAmount

`changeItemAmount(entity: Entity, options: { slot: number; amount: number }): boolean`

Adds a signed integer delta to one occupied slot. The result must remain from zero through `item.maxAmount`; zero clears the slot. Returns `false` for missing stacks, fractional deltas, underflow, overflow, or native write failures.

```js
DoriosLib.entity.changeItemAmount(entity, { slot: 0, amount: -1 });
```

## Find, count, and consume

### findItem

`findItem(entity: Entity, query: string | ItemStack): InventoryEntry | undefined`

A string matches the first exact `typeId`. An `ItemStack` query uses native `isStackableWith()` compatibility and can therefore include component data.

### countItem

`countItem(entity: Entity, typeId: string): number`

Sums amounts across every matching stack.

### hasItem

`hasItem(entity: Entity, typeId: string, amount?: number): boolean`

Checks whether the total count reaches `amount`, which defaults to `1`. Nonpositive requested amounts return `true`.

### removeItem

`removeItem(entity: Entity, typeId: string, amount?: number): number`

Removes up to the requested amount across slots in ascending order and returns the amount actually removed. The request defaults to `1`; nonpositive amounts remove nothing.

## Clear and drop

### clearInventory

`clearInventory(entity: Entity, excludedTypeIds?: Iterable<string>): number`

Clears every non-excluded stack and returns the number of slots cleared.

### dropAllItems

`dropAllItems(entity: Entity, excludedTypeIds?: Iterable<string>): number`

Spawns every non-excluded stack at the entity location, clears its slot, and returns the number of stacks dropped.

```js
DoriosLib.entity.dropAllItems(machineEntity, ["example:ui_button"]);
```

### findFirstEmptySlot

`findFirstEmptySlot(entity: Entity): number | undefined`

Returns the native first empty slot or `undefined` when there is no inventory or no empty slot.

### setInFirstEmptySlot

`setInFirstEmptySlot(entity: Entity, item: ItemStack): number | undefined`

Places the stack in the first empty slot and returns that slot index. Returns `undefined` when unavailable or rejected.

### isInventoryFull

`isInventoryFull(entity: Entity): boolean`

Returns true only when an inventory exists and its empty-slot count is zero.

## Health

### getHealthComponent

`getHealthComponent(entity: Entity): EntityHealthComponent | undefined`

### getHealth

`getHealth(entity: Entity): number | undefined`

Returns the component's current value.

### setHealth

`setHealth(entity: Entity, value: number): boolean`

Clamps a finite value to the component's effective minimum and maximum. Returns false when the component is missing, the value is nonfinite, or the native setter fails.

### addHealth

`addHealth(entity: Entity, delta: number): boolean`

Adds `delta` to current health through `setHealth()`, including its clamping behavior.

### getHealthInfo

`getHealthInfo(entity: Entity): HealthInfo | undefined`

```ts
interface HealthInfo {
  current: number;
  min: number;
  max: number;
  missing: number;
  percentage: number;
}
```

`percentage` measures the current value across the effective range and is rounded to two decimals.

## Equipment

### getEquippable

`getEquippable(entity: Entity): EntityEquippableComponent | undefined`

Returns the native equippable component.

### getEquipment

`getEquipment(entity: Entity, slot: EquipmentSlot | string): ItemStack | undefined`

Validates the supplied value against the installed `EquipmentSlot` enum, then returns the equipped item.

### setEquipment

`setEquipment(entity: Entity, options: SetEquipmentOptions): boolean`

```ts
interface SetEquipmentOptions {
  slot: EquipmentSlot | string;
  item: ItemStack | undefined;
}
```

Sets or clears a valid equipment slot and reports whether the native operation succeeded.
