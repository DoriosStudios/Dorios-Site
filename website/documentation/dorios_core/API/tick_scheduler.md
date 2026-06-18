---
id: tick-scheduler
sidebar_label: TickScheduler
title: TickScheduler Class
sidebar_position: 5
---

# TickScheduler

:::info
`TickScheduler` spreads closed machine work across tick groups while keeping open machine UIs responsive.

`BasicMachine` uses it automatically. Most machine code only needs to check `machine.valid`; direct scheduler calls are useful for commands, diagnostics, or advanced integrations.
:::

---

# Profiles

The current scheduler profiles are:

| Profile | Label | Closed interval |
| --- | --- | --- |
| `fast` | Fast | 20 ticks |
| `normal` | Normal | 40 ticks |
| `low` | Low | 80 ticks |

Open machine UIs use a fixed short interval of `4` ticks.

Closed machines are assigned to one of five tick groups. The scheduler staggers those groups across the selected closed interval.

---

# API

<div class="api-grid">

<div class="api-index-item"><span class="api-method">M</span><a href="#getschedulerprofileids">getSchedulerProfileIds</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getschedulerprofiles">getSchedulerProfiles</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getschedulerprofile">getSchedulerProfile</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#setschedulerprofile">setSchedulerProfile</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getgroupcounts">getGroupCounts</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#assigntickgroup">assignTickGroup</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#releasetickgroup">releaseTickGroup</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#shouldprocessmachine">shouldProcessMachine</a></div>
<div class="api-index-item"><span class="api-method">M</span><a href="#getprocessinginterval">getProcessingInterval</a></div>

</div>

---

## getSchedulerProfileIds

<div class="api-signature">

`TickScheduler.getSchedulerProfileIds(): string[]`

</div>

Returns `["fast", "normal", "low"]`.

## getSchedulerProfiles

<div class="api-signature">

`TickScheduler.getSchedulerProfiles(): Record<string, { label: string, closedInterval: number }>`

</div>

Returns a copy of the profile config map.

## getSchedulerProfile

<div class="api-signature">

`TickScheduler.getSchedulerProfile(): string`

</div>

Returns the active profile id from cache or world dynamic property `utilitycraft:schedulerProfile`.

## setSchedulerProfile

<div class="api-signature">

`TickScheduler.setSchedulerProfile(profile: string): string`

</div>

Normalizes and stores the active profile. Invalid values fall back to the default profile, `fast`.

## getGroupCounts

<div class="api-signature">

`TickScheduler.getGroupCounts(): number[]`

</div>

Returns the persisted machine count for each of the five closed tick groups.

## assignTickGroup

<div class="api-signature">

`TickScheduler.assignTickGroup(entity: Entity): number`

</div>

Assigns an entity to the least-used group if it is not already assigned. Also broadcasts the group count change through the Core tick-group script event.

## releaseTickGroup

<div class="api-signature">

`TickScheduler.releaseTickGroup(entity: Entity): number`

</div>

Releases the entity's group assignment, updates counts, and broadcasts the removal. `Machine.onDestroy()` and `Generator.onDestroy()` call this during cleanup.

## shouldProcessMachine

<div class="api-signature">

`TickScheduler.shouldProcessMachine(entity: Entity): boolean`

</div>

Returns whether a machine should run logic on the current Core tick.

This returns `false` until the Core marks the world as loaded.

## getProcessingInterval

<div class="api-signature">

`TickScheduler.getProcessingInterval(entity: Entity): number`

</div>

Returns the interval used to scale machine work. `BasicMachine` multiplies `baseRate` by this value to calculate `rate`.

---

# Script Event Integration

The scheduler also handles:

```text
utilitycraft:set_scheduler_profile
utilitycraft:tick_group
```

See [Script Events](./script-events) for payload formats.
