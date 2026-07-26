---
id: interface-manager
title: InterfaceManager class
sidebar_label: InterfaceManager
sidebar_position: 10
description: Create event-driven buttons in helper-entity container interfaces.
---

# InterfaceManager class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`InterfaceManager` is the event-driven button system behind DoriosCore IO tabs. An interface owns container slots, renders protected button items, detects a press when a player removes a button, runs its callback, and restores the button.

```js
import {
  InterfaceManager,
  decodeInterfaceSlot,
  encodeInterfaceSlot,
  stripInterfaceSlotCode,
} from "DoriosCore/index.js";
```

:::tip
Use [`registerIOInterface`](./io-interface) for normal item, liquid, and gas face controls. Use `InterfaceManager` directly for addon-specific buttons that are not IO modes.
:::

## Define an interface

```ts
interface InterfaceDefinition {
  itemId?: string;
  buttons?: Record<string, InterfaceButtonDefinition> | InterfaceButtonDefinition[];
}

interface InterfaceButtonDefinition {
  id?: string;
  slot: number;
  itemId?: string;
  nameTag?: string | ((context: InterfaceButtonContext) => string);
  onPress?: (context: InterfaceButtonContext) => string | void;
  [property: string]: unknown;
}
```

| Property | Required | Description |
| --- | --- | --- |
| `itemId` | No | Default item used by buttons in this interface. Individual buttons can override it. |
| `buttons` | No | Object keyed by button ID, or an array whose `id` becomes the key. |
| `button.slot` | Yes | Owned inventory slot, normalized to an integer from `0` through `255`. Invalid entries are ignored during registration. |
| `button.nameTag` | No | Static visible text or callback recalculated when the button is written. |
| `button.onPress` | No | Callback invoked after one unambiguous button removal. A returned string becomes the next visible label. |

## Callback context

```ts
interface InterfaceButtonContext {
  entity: Entity;
  block: Block | undefined;
  player: Player | undefined;
  interfaceId: string;
  interface: RegisteredInterfaceDefinition;
  buttonId: string;
  button: RegisteredInterfaceButton;
  slot: number;
  nameTag?: string;
}
```

Custom metadata stored on a button definition remains accessible through `context.button`.

## Registration methods

### InterfaceManager.registerInterface(interfaceId, definition)

<div class="api-signature">

`InterfaceManager.registerInterface(interfaceId: string, definition?: InterfaceDefinition): boolean`

</div>

Normalizes and stores a reusable interface. Returns `false` for an empty ID and `true` after registration. Registering the same ID again replaces its definition.

### InterfaceManager.linkBlockInterface(blockTypeId, interfaceId)

`linkBlockInterface(blockTypeId: string, interfaceId: string): boolean` associates an interface with an exact block type. Both IDs must be nonempty.

### InterfaceManager.linkEntityInterface(entityTypeId, interfaceId)

`linkEntityInterface(entityTypeId: string, interfaceId: string): boolean` associates an interface with an exact helper-entity type.

An entity receives the union of interfaces linked by its represented block type and its own entity type.

## Slot metadata helpers

Button name tags begin with an invisible two-digit hexadecimal slot code. This lets DoriosCore distinguish a registered button from an ordinary item using the same item ID.

### encodeInterfaceSlot(slot)

`encodeInterfaceSlot(slot: number): string` returns the hidden prefix for slots `0` through `255`, or an empty string for an invalid slot.

### decodeInterfaceSlot(nameTag)

`decodeInterfaceSlot(nameTag: string | undefined): number | undefined` reads a valid hidden prefix.

### stripInterfaceSlotCode(nameTag)

`stripInterfaceSlotCode(nameTag: string): string` removes a valid prefix and returns visible text. Text without a valid prefix is returned unchanged.

### InterfaceManager.createSlotNameTag(slot, nameTag)

`createSlotNameTag(slot: number, nameTag?: string): string` combines the hidden prefix and visible label. `nameTag` defaults to an empty string.

## Rendering methods

### InterfaceManager.ensureEntityInterfaces(entity, player)

<div class="api-signature">

`InterfaceManager.ensureEntityInterfaces(entity?: Entity, player?: Player): boolean`

</div>

Finds every linked interface and writes its buttons into the helper inventory. The optional `player` is included in dynamic-label callbacks. Returns whether at least one button was written.

DoriosCore calls this when a container opens and after `Machine.spawnEntity()` or `Generator.spawnEntity()` finishes the placement callback.

### InterfaceManager.setButton(container, context)

`setButton(container: Container, context: InterfaceButtonContext): boolean` creates one button item, encodes its slot, evaluates its label, writes it to the container, and returns `true`.

### InterfaceManager.getEntityButtons(entity, block)

<div class="api-signature">

`getEntityButtons(entity: Entity, block?: Block): InterfaceButtonDescriptor[]`

</div>

Returns normalized descriptors from every linked interface. When `block` is omitted, DoriosCore attempts to resolve the represented block from the entity.

### InterfaceManager.getInterfaceEntityFromBlock(block)

`getInterfaceEntityFromBlock(block?: Block): Entity | undefined` returns the first valid entity at the block position that owns at least one linked button.

### InterfaceManager.getMissingButtons(entity, block, container)

<div class="api-signature">

`getMissingButtons(entity: Entity, block: Block | undefined, container: Container): InterfaceButtonDescriptor[]`

</div>

Returns registered buttons whose slot no longer contains the expected item ID and encoded slot.

## Press handling

### InterfaceManager.handlePlayerButtonDrop(player)

`handlePlayerButtonDrop(player: Player): boolean` resolves the player's open helper entity, finds missing buttons, executes an unambiguous press, and returns whether it was handled.

### InterfaceManager.handlePressedButtons(player, data)

<div class="api-signature">

`handlePressedButtons(player: Player, data: PressedInterfaceButtons): boolean`

</div>

`data` contains `entity`, optional `block`, `container`, and `pressedButtons`.

- Exactly one missing button: runs its callback and restores it.
- More than one: restores every candidate without choosing a callback.
- None: returns `false`.

Callback exceptions are logged and the button is still restored.

### InterfaceManager.resolveDroppedButtonFromOpenEntities(player)

`resolveDroppedButtonFromOpenEntities(player: Player): PressedInterfaceButtons | undefined` handles the brief period before a player-to-container session exists. It succeeds only when exactly one tracked open entity has exactly one missing button.

### InterfaceManager.handleEntityItemDrop(event)

`handleEntityItemDrop(event: EntityItemDropAfterEvent): boolean` is the world-event adapter. It attempts immediate handling and schedules one retry when runtime state is not ready.

Normal addons do not subscribe this manually; importing `DoriosCore/index.js` installs the listener.

## Example: addon-specific mode button

```js
import { InterfaceManager } from "DoriosCore/index.js";

const INTERFACE_ID = "myaddon:crusher_controls";

InterfaceManager.registerInterface(INTERFACE_ID, {
  buttons: {
    redstone_mode: {
      slot: 8,
      nameTag: ({ entity }) =>
        `§rRedstone: ${entity.getDynamicProperty("myaddon:redstone_mode") ?? "ignored"}`,
      onPress: ({ entity }) => {
        const current = entity.getDynamicProperty("myaddon:redstone_mode") ?? "ignored";
        const next = current === "ignored" ? "required" : "ignored";
        entity.setDynamicProperty("myaddon:redstone_mode", next);
        return `§rRedstone: ${next}`;
      },
    },
  },
});

InterfaceManager.linkBlockInterface("myaddon:crusher", INTERFACE_ID);
```

Reserve the owned slot in the UI and do not use it for machine items, displays, upgrades, or another interface.
