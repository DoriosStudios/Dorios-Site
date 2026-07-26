---
id: tick-scheduler
title: TickScheduler class
sidebar_label: TickScheduler
sidebar_position: 15
description: Schedule open and closed machinery across shared tick groups and configurable refresh profiles.
---

# TickScheduler class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`TickScheduler` distributes closed machines across five tick groups. Machines with an open UI remain responsive, while closed machines use the active scheduler profile. [`BasicMachine`](./basic-machine) uses this service automatically.

```js
import {
  TickScheduler,
  TICK_GROUP_COUNTS_PROPERTY_ID,
  TICK_GROUP_PROPERTY_ID,
} from "DoriosCore/index.js";
```

:::tip
Normal machine scripts only need to construct `Machine` or `Generator` and stop when `valid` is `false`. Call `TickScheduler` directly for settings screens, diagnostics, or custom runtimes.
:::

## Definition

<div class="api-signature">

`class TickScheduler`

</div>

All members are static. Do not construct this class.

## Profiles and timing

| Profile ID | Label | Closed interval |
| --- | --- | --- |
| `fast` | Fast | 20 ticks |
| `normal` | Normal | 40 ticks |
| `low` | Low | 80 ticks |

Open machines always use a 4-tick interval. Closed machines are spread evenly across five groups within the selected interval.

## Constants

| Constant | Value | Stored on | Description |
| --- | --- | --- | --- |
| `TICK_GROUP_PROPERTY_ID` | `utilitycraft:tick_group` | Helper entity property | Group assigned to one machine. `0` means unassigned. |
| `TICK_GROUP_COUNTS_PROPERTY_ID` | `utilitycraft:tick_group_counts` | World dynamic property | JSON array containing the count for groups 1 through 5. |

## Profile methods

### getSchedulerProfileIds()

<div class="api-signature">

`TickScheduler.getSchedulerProfileIds(): SchedulerProfileId[]`

</div>

Returns `['fast', 'normal', 'low']` in display order. The returned array can be used to populate a settings control.

### getSchedulerProfiles()

<div class="api-signature">

`TickScheduler.getSchedulerProfiles(): Record<SchedulerProfileId, SchedulerProfileConfig>`

</div>

Returns a new top-level object containing every profile.

```ts
interface SchedulerProfileConfig {
  label: string;
  closedInterval: number;
}
```

### getSchedulerProfile()

<div class="api-signature">

`TickScheduler.getSchedulerProfile(): SchedulerProfileId`

</div>

Returns the active profile. The first call loads `utilitycraft:schedulerProfile` from the world; a missing or unsupported value becomes `fast`.

### setSchedulerProfile(profile)

<div class="api-signature">

`TickScheduler.setSchedulerProfile(profile: string): SchedulerProfileId`

</div>

Normalizes, persists, and activates a profile.

| Parameter | Type | Description |
| --- | --- | --- |
| `profile` | `string` | Profile ID. Matching is case-insensitive and surrounding whitespace is ignored. |

Returns the stored ID. Unsupported input stores and returns `fast`.

### getSchedulerProfileConfig(profile)

<div class="api-signature">

`TickScheduler.getSchedulerProfileConfig(profile?: string): SchedulerProfileConfig`

</div>

Returns the requested profile configuration. When omitted, `profile` defaults to the active profile. Unsupported input resolves to `fast`.

## Group methods

### getGroupCounts()

`TickScheduler.getGroupCounts(): number[]` returns exactly five nonnegative integer counts. Missing or invalid stored JSON returns `[0, 0, 0, 0, 0]`.

### setGroupCounts(counts)

<div class="api-signature">

`TickScheduler.setGroupCounts(counts: number[]): number[]`

</div>

Normalizes `counts` to five nonnegative integers, persists the array, and returns it. Extra entries are discarded; missing entries become `0`.

### updateGroupCount(group, delta)

<div class="api-signature">

`TickScheduler.updateGroupCount(group: number, delta: number): number[]`

</div>

Applies an integer `delta` to groups `1` through `5`. Counts never fall below zero. An invalid group leaves the stored counts unchanged.

### getLeastUsedGroup()

`TickScheduler.getLeastUsedGroup(): number` returns the first group with the lowest count. The result is always from `1` through `5`.

### getTickGroup(entity)

`TickScheduler.getTickGroup(entity: Entity): number` reads and normalizes the entity property. It returns `0` when the entity is missing, the property cannot be read, or the value is outside `1` through `5`.

### setTickGroup(entity, group)

`TickScheduler.setTickGroup(entity: Entity, group: number): number` writes the normalized group and returns it. It returns `0` when the write fails.

This low-level method does not update the world count. Use `assignTickGroup()` and `releaseTickGroup()` for normal lifecycle changes.

### assignTickGroup(entity)

`TickScheduler.assignTickGroup(entity: Entity): number` keeps an existing valid assignment or selects the least-used group. A new assignment increments the stored count and broadcasts the change to other addons sharing the scheduler.

Returns the assigned group, or `0` when assignment fails.

### releaseTickGroup(entity)

`TickScheduler.releaseTickGroup(entity: Entity): number` decrements the current group count, broadcasts the removal, and resets the entity group to `0`. It returns the released group or `0` when the entity was unassigned.

`Machine.onDestroy()` and `Generator.onDestroy()` perform this cleanup automatically.

## Processing methods

### hasOpenUI(entity)

`TickScheduler.hasOpenUI(entity: Entity): boolean` returns whether the helper entity's `utilitycraft:players` property is greater than zero.

### shouldProcessMachine(entity)

<div class="api-signature">

`TickScheduler.shouldProcessMachine(entity: Entity): boolean`

</div>

Returns `true` when the machine should execute on the current shared Core tick.

- Returns `false` until DoriosCore marks the world as loaded.
- Open machines run every 4 ticks.
- Closed machines are assigned a group and run at that group's phase in the active profile.

### getProcessingInterval(entity)

`TickScheduler.getProcessingInterval(entity: Entity): number` returns `4` for an open UI or the active profile's `closedInterval` for a closed machine. `BasicMachine` uses this value to scale `rate`, preserving throughput when closed machines run less often.

## Protocol handlers

### handleSchedulerProfileScriptEvent(message)

`TickScheduler.handleSchedulerProfileScriptEvent(message: string): void` applies a scheduler profile payload. It is the handler behind `utilitycraft:set_scheduler_profile`.

### handleTickGroupScriptEvent(message)

<div class="api-signature">

`TickScheduler.handleTickGroupScriptEvent(message: string): void`

</div>

Processes `add|group|source` and `remove|group|source`. Invalid actions or groups are ignored, as are messages whose source is DoriosCore's own `utilitycraft` source ID.

Importing DoriosCore installs both script-event listeners; addons normally do not call these handlers directly.

## Example: expose the current profile

```js
import { TickScheduler } from "DoriosCore/index.js";

const profileId = TickScheduler.getSchedulerProfile();
const profile = TickScheduler.getSchedulerProfileConfig(profileId);

console.warn(
  `[My Addon] Scheduler: ${profile.label} (${profile.closedInterval} ticks)`,
);
```

## Example: custom scheduled runtime

```js
import { TickScheduler } from "DoriosCore/index.js";

function tickCustomRuntime(entity) {
  if (!TickScheduler.shouldProcessMachine(entity)) return;

  const elapsedTicks = TickScheduler.getProcessingInterval(entity);
  processCustomWork(elapsedTicks);
}
```

## Remarks

- Group counts are shared coordination state. Do not change them merely to move one entity; use the lifecycle methods.
- [`addOpenUICount` and `removeOpenUICount`](./container-sessions) maintain the viewer count consumed by `hasOpenUI()`.
- See [Protocol constants](./protocol-constants) and [Script events](./script-events) for cross-addon identifiers and payloads.
