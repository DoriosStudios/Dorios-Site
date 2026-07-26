---
id: container-sessions
title: Container sessions and UI counters
sidebar_label: Container sessions
sidebar_position: 19
description: Track open helper-entity containers, player bindings, and machine UI viewer counts.
---

# Container sessions and UI counters

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`ContainerSessionManager` tracks helper entities whose container UI is open and, when the runtime provides a player, binds that player to the entity. DoriosCore's event-driven interface system uses this state to resolve button presses.

```js
import {
  ContainerSessionManager,
  addOpenUICount,
  removeOpenUICount,
} from "DoriosCore/index.js";
```

## Session contracts

```ts
interface ContainerSession {
  playerId: string;
  playerEntityId?: string;
  playerName?: string;
  entityId: string;
  entityTypeId?: string;
}

interface ContainerSessionEntry {
  player: Player | undefined;
  entity: Entity | undefined;
  session: ContainerSession;
}
```

Sessions are runtime-only. They are not persisted when the world unloads.

## Entity tracking

### ContainerSessionManager.trackEntity(entity)

<div class="api-signature">

`ContainerSessionManager.trackEntity(entity?: Entity): boolean`

</div>

Adds a valid entity ID to the set of containers known to be open. Returns `true` when the entity is valid and was tracked; otherwise returns `false`.

### ContainerSessionManager.untrackEntity(entity)

<div class="api-signature">

`ContainerSessionManager.untrackEntity(entity?: Entity): boolean`

</div>

Removes an entity from the open set and clears every player session pointing to it. Returns whether the entity ID existed in the open set.

### ContainerSessionManager.getOpenEntities()

`ContainerSessionManager.getOpenEntities(): Entity[]` resolves every tracked ID to a live entity. Stale IDs are removed during the scan.

## Player sessions

### ContainerSessionManager.open(player, entity)

<div class="api-signature">

`ContainerSessionManager.open(player?: Player, entity?: Entity): boolean`

</div>

Binds a player to a valid open container entity. The player entity ID is preferred as the session key, with the player name used as a compatibility fallback.

Returns `true` when a session was stored. A missing player identity, invalid entity, or missing entity ID returns `false`.

### ContainerSessionManager.close(player, entity)

<div class="api-signature">

`ContainerSessionManager.close(player?: Player, entity?: Entity): boolean`

</div>

Clears the player's session. When `entity` has an ID, it must match the entity stored in the session. Returns whether a matching session was removed.

### ContainerSessionManager.getOpenSession(player)

`ContainerSessionManager.getOpenSession(player?: Player): ContainerSession | undefined` returns the stored session only while its container entity still resolves. A stale session is deleted and returns `undefined`.

### ContainerSessionManager.getOpenSessionEntry(player)

<div class="api-signature">

`ContainerSessionManager.getOpenSessionEntry(player?: Player): ContainerSessionEntry | undefined`

</div>

Returns the stored metadata together with currently resolvable entity handles. If the stored player ID is unavailable, DoriosCore attempts to resolve the player by name and finally uses the supplied `player` argument.

### ContainerSessionManager.getOpenEntity(player)

`ContainerSessionManager.getOpenEntity(player?: Player): Entity | undefined` returns the live container entity bound to the player.

### ContainerSessionManager.clearPlayer(player)

`ContainerSessionManager.clearPlayer(player?: Player): boolean` removes all session state for one player and returns whether a session existed.

## Automatic event handling

Importing `DoriosCore/index.js` subscribes to the available `entityContainerOpened` and `entityContainerClosed` events.

- Opening tracks the entity and stores a player session when the event exposes a player.
- Closing clears the matching player session and untracks the entity.
- Some Bedrock API variants expose the container entity without the player. In that case, `getOpenEntities()` still supports the unambiguous fallback used by [`InterfaceManager`](./interface-manager).

Normal addons do not need to subscribe these handlers again.

## UI viewer counters

Container sessions answer *which* entity a player opened. The viewer counter answers *how many* viewers a machine currently has and is stored in the entity property `utilitycraft:players`.

### addOpenUICount(entity)

`addOpenUICount(entity: Entity): number` increments the normalized nonnegative integer count and returns the resulting value. When writing fails, it returns the current readable count.

### removeOpenUICount(entity)

`removeOpenUICount(entity: Entity): number` decrements the count without allowing it below zero and returns the resulting value.

[`TickScheduler.hasOpenUI()`](./tick-scheduler) reads this counter. UtilityCore's container events normally maintain it for standard machine UIs.

## Example: resolve a custom container interaction

```js
import { ContainerSessionManager } from "DoriosCore/index.js";

function handleCustomAction(player) {
  const entry = ContainerSessionManager.getOpenSessionEntry(player);
  if (!entry?.entity) return false;

  runAddonOwnedAction(entry.entity, player);
  return true;
}
```

## Remarks

- Use [`InterfaceManager`](./interface-manager) for new event-driven container buttons. It already integrates with session tracking.
- Do not use `getOpenEntities()` to guess between several candidates. A player-specific session or an unambiguous event should determine the target.
- Keep UI counter increments and decrements balanced. An incorrect positive count makes the scheduler treat a closed machine as open.
