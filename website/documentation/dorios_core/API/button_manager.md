---
id: button-manager
sidebar_label: ButtonManager
title: ButtonManager Class
sidebar_position: 7
---

# ButtonManager

:::info
`ButtonManager` turns inventory slots into clickable machine UI buttons.

It watches registered slots for item changes, restores the shared button item, and runs a callback for the machine entity.
:::

---

# Setup

The DoriosCore initializer calls:

```js
loadButtonItemStack("utilitycraft:ui_filler", ItemStack);
```

That creates the shared button item template used to restore button slots.

Register button definitions once, then call `ensureWatching()` from the machine tick while its UI should be interactive.

---

# API

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#loadbuttonitemstack">loadButtonItemStack</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#registermachinebutton">registerMachineButton</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#unregistermachinebutton">unregisterMachineButton</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#ensurewatching">ensureWatching</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#unwatchentity">unwatchEntity</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#ensurebuttonitems">ensureButtonItems</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#start">start</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#stop">stop</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#tick">tick</a></div>

</div>

---

## loadButtonItemStack

<div class="api-signature">

`loadButtonItemStack(itemId?: string, ItemStackClass: typeof ItemStack): ItemStack | null`

</div>

Initializes the shared button item template. The default item id is `utilitycraft:ui_filler`.

## registerMachineButton

<div class="api-signature">

`ButtonManager.registerMachineButton(machineId: string, slot: number | number[], onPressEvent?: Function): boolean`

</div>

Registers or replaces button definitions for a machine id.

Callback shape:

```ts
({
  entity,
  block,
  container,
  slot,
}) => string | void
```

If the callback returns a string, that string becomes the restored button item's `nameTag`. Use a dynamic button UI element if the UI needs to display that label.

## unregisterMachineButton

<div class="api-signature">

`ButtonManager.unregisterMachineButton(machineId: string, slot: number | number[]): boolean`

</div>

Removes button definitions.

## ensureWatching

<div class="api-signature">

`ButtonManager.ensureWatching(entity: Entity, machineId: string): boolean`

</div>

Ensures the entity is being watched using the registered buttons for `machineId`.

This method:

- validates inventory access,
- restores missing button items,
- syncs the watcher cache,
- starts the global watcher loop.

## unwatchEntity

<div class="api-signature">

`ButtonManager.unwatchEntity(entity: Entity): boolean`

</div>

Stops watching an entity. If no active watchers remain, the global loop stops.

## ensureButtonItems

<div class="api-signature">

`ButtonManager.ensureButtonItems(container: Container, buttons: ButtonDefinition[]): void`

</div>

Restores the shared button item in every registered slot.

## start / stop / tick

<div class="api-signature">

`ButtonManager.start(): void`

`ButtonManager.stop(): void`

`ButtonManager.tick(): void`

</div>

Low-level watcher controls. `ensureWatching()` normally manages these automatically.

---

# Example

```js
import { ButtonManager } from "DoriosCore/index.js";

ButtonManager.registerMachineButton("utilitycraft:mode_machine", 8, ({ entity }) => {
  const current = entity.getDynamicProperty("mode") ?? "input";
  const next = current === "input" ? "output" : "input";
  entity.setDynamicProperty("mode", next);
  return `Mode: ${next}`;
});

DoriosAPI.register.blockComponent("mode_machine", {
  onTick(e, { params: settings }) {
    const machine = new Machine(e.block, settings);
    if (!machine.valid) return;

    ButtonManager.ensureWatching(machine.entity, "utilitycraft:mode_machine");
  },
});
```
