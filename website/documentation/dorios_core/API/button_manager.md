---
id: button-manager
title: ButtonManager class
sidebar_label: ButtonManager
sidebar_position: 20
description: Maintain polling-based button slots in legacy and specialized machine container UIs.
---

# ButtonManager class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`ButtonManager` is the compatibility button watcher for machine container UIs. It detects a button press as a change to a registered inventory slot, runs a callback, and restores the shared button item.

```js
import {
  ButtonItemStack,
  ButtonManager,
  loadButtonItemStack,
} from "DoriosCore/index.js";
```

:::tip
Use [`InterfaceManager`](./interface-manager) for new addon-owned controls and [`registerIOInterface`](./io-interface) for IO tabs. Use `ButtonManager` when maintaining an existing polling-based UI or when its one-tick slot watcher is specifically required.
:::

## Button contracts

```ts
interface ButtonDefinition {
  slot: number;
  onPressEvent: ButtonPressCallback;
}

type ButtonPressCallback = (event: ButtonPressEvent) => string | void;

interface ButtonPressEvent {
  entity: Entity;
  block: Block | undefined;
  container: Container;
  slot: number;
}

interface ButtonWatcher {
  entity: Entity;
  machineId: string;
  cacheBySlot: Map<number, string>;
}
```

The watcher compares item type IDs, not amount, lore, or name tags. If the callback returns a string, that string becomes the restored button's `nameTag` for that entity and press.

## Shared button item

### ButtonItemStack

<div class="api-signature">

`ButtonItemStack: ItemStack | null`

</div>

Shared template cloned whenever DoriosCore restores a watched slot. DoriosCore initializes it during world load with `utilitycraft:ui_filler` and a blank name.

### loadButtonItemStack(itemId, ItemStackClass)

<div class="api-signature">

`loadButtonItemStack(itemId?: string, ItemStackClass?: typeof ItemStack): ItemStack | null`

</div>

Creates the shared template, assigns a blank name tag, stores it in `ButtonItemStack`, and returns it.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `itemId` | `string` | `utilitycraft:ui_filler` | Valid button item identifier supplied by an active resource and behavior pack. |
| `ItemStackClass` | `typeof ItemStack` | — | Minecraft `ItemStack` constructor. A missing constructor returns `null`. |

Normal addons do not call this because DoriosCore initializes the standard item.

## Static state

| Property | Type | Description |
| --- | --- | --- |
| `ButtonManager.machineDefinitions` | `Map<string, ButtonDefinition[]>` | Registered, slot-sorted definitions by machine ID. |
| `ButtonManager.activeWatchers` | `Map<string, ButtonWatcher>` | Runtime watchers keyed by helper entity ID. |
| `ButtonManager.intervalId` | `number \| undefined` | Current one-tick interval handle. |

Treat these maps as diagnostic state. Use registration and watcher methods to modify the system.

## Registration methods

### registerMachineButton(machineId, slot, onPressEvent)

<div class="api-signature">

`ButtonManager.registerMachineButton(machineId: string, slot: number | number[], onPressEvent?: ButtonPressCallback): boolean`

</div>

Registers one callback for one or more slots. Existing definitions at those slots are replaced; new slots are added and sorted.

| Parameter | Type | Description |
| --- | --- | --- |
| `machineId` | `string` | Nonempty identifier used later by `ensureWatching()`. Conventionally the block type ID. |
| `slot` | `number \| number[]` | One or more unique nonnegative integer inventory slots. |
| `onPressEvent` | `ButtonPressCallback` | Callback invoked when a watched slot's item type changes. Defaults to a no-op. |

Returns `false` for an empty ID, empty slot array, or any invalid slot. Otherwise returns `true`.

### unregisterMachineButton(machineId, slot)

`ButtonManager.unregisterMachineButton(machineId: string, slot: number | number[]): boolean` removes the specified slots. It returns `true` only when at least one existing definition was removed. A machine ID with no remaining definitions is removed from the registry.

## Watcher lifecycle

### ensureWatching(entity, machineId)

<div class="api-signature">

`ButtonManager.ensureWatching(entity: Entity, machineId: string): boolean`

</div>

Ensures a helper entity is actively watched with the definitions registered under `machineId`.

The method resolves the entity inventory, restores missing button items, creates or updates watcher state, synchronizes its cache, and starts the global interval. It returns `false` when the entity has no ID, the machine has no definitions, or no inventory container exists.

Call it from the machine tick while the UI should remain interactive.

### unwatchEntity(entity)

`ButtonManager.unwatchEntity(entity: Entity): boolean` removes the watcher for one entity. When no watchers remain, it stops the global interval. Returns whether a watcher existed.

### createWatcher(entity, machineId, container, buttons)

<div class="api-signature">

`ButtonManager.createWatcher(entity: Entity, machineId: string, container: Container, buttons: ButtonDefinition[]): ButtonWatcher`

</div>

Creates watcher state and records the current item type in every registered slot. This is a low-level helper; `ensureWatching()` calls it automatically.

### ensureButtonItems(container, buttons)

`ButtonManager.ensureButtonItems(container: Container, buttons: ButtonDefinition[]): void` fills each registered slot whose current item type is not the shared button type. Each slot receives an independent clone.

If the shared template is not initialized, the method does nothing.

### syncWatcherCache(watcher, container, buttons)

<div class="api-signature">

`ButtonManager.syncWatcherCache(watcher: Pick<ButtonWatcher, "cacheBySlot">, container: Container, buttons: ButtonDefinition[]): void`

</div>

Removes cached slots that are no longer registered and initializes cache entries for newly registered slots. Existing entries are preserved so a pending item-type change can still be detected.

## Runner methods

### start()

`ButtonManager.start(): void` starts the shared one-tick watcher interval when it is not already running.

### stop()

`ButtonManager.stop(): void` clears the watcher interval and resets `intervalId`. It does not clear definitions or watcher maps.

### tick()

`ButtonManager.tick(): void` runs one detection pass across all active watchers.

For each watcher, it:

1. validates the entity, definitions, and inventory;
2. synchronizes registered slots;
3. compares each current item type with the cached type;
4. invokes the callback for every changed slot;
5. restores a cloned button item even if the callback throws;
6. stores the restored slot state.

Invalid or failing watchers are removed. The interval stops when no watchers remain. `start()` invokes this automatically; direct calls are mainly useful for controlled tests.

## Example: polling-based mode button

```js
import * as DoriosLib from "DoriosLib/index.js";
import { ButtonManager, Machine } from "DoriosCore/index.js";

const MACHINE_ID = "example:mode_machine";

ButtonManager.registerMachineButton(MACHINE_ID, 8, ({ entity }) => {
  const current = entity.getDynamicProperty("example:mode") ?? "input";
  const next = current === "input" ? "output" : "input";
  entity.setDynamicProperty("example:mode", next);
  return `§r§eMode: §f${next}`;
});

DoriosLib.registry.blockComponent("example:mode_machine", {
  onTick(event, { params: settings }) {
    const machine = new Machine(event.block, settings);
    if (!machine.valid) return;

    ButtonManager.ensureWatching(machine.entity, MACHINE_ID);
  },
});
```

Reserve slot `8` in the helper inventory and UI. Do not also use it for resources, recipes, upgrades, displays, or an `InterfaceManager` interface.

## Remarks

- Register definitions once during script initialization, not on every machine tick.
- A callback can be shared across several slots; inspect `event.slot` to distinguish them.
- Dynamic labels require the matching dynamic-button UI control. Returning a string does not change UI JSON by itself.
- Call `unwatchEntity()` during custom cleanup when the entity remains valid but should no longer be polled.
