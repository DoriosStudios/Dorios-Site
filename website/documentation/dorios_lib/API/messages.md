---
id: messages
title: messages namespace
sidebar_label: messages
sidebar_position: 11
description: Send world and player messages, update action bars, and print safe formatted JSON.
---

# `messages` namespace

Namespace: `DoriosLib.messages` · Package: `DoriosLib/index.js`

All message values accept a plain string or Script API `RawMessage`.

## broadcast

`broadcast(message: RawMessage | string): void`

Sends a message to every player through `world.sendMessage()`.

## send

`send(player: Player, message: RawMessage | string): void`

Attempts to message one player immediately. If the current execution context is restricted, DoriosLib defers the operation to the next system tick.

```js
DoriosLib.messages.send(player, "§r§aConfiguration saved.");
```

## actionBar

`actionBar(player: Player, message: RawMessage | string): void`

Updates the player's action bar. It uses the same immediate-then-deferred behavior as `send()`.

## printJson

`printJson(player: Player, title: string, value: unknown): void`

Safely serializes `value` with two-space indentation, sends a gold title, then sends each JSON line separately in gray. Unserializable values produce an error description instead of throwing from the display helper.

```js
DoriosLib.messages.printJson(player, "Machine state", {
  enabled: true,
  inputSlots: [0, 1],
  outputSlots: [2],
});
```

This helper is intended for debugging and administrator diagnostics. Avoid sending large documents every tick.
