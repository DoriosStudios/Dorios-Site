---
id: time
title: time namespace
sidebar_label: time
sidebar_position: 15
description: Convert common durations to ticks, format clocks, schedule callbacks, and await Script API time.
---

# `time` namespace

Namespace: `DoriosLib.time` · Package: `DoriosLib/index.js`

## TICKS_PER_SECOND

`TICKS_PER_SECOND: 20`

The standard conversion used by DoriosLib scheduling helpers.

## TICKS

```js
{
  second: 20,
  minute: 1200,
  hour: 72000,
  day: 1728000,
}
```

Use these constants for readable tick-based configuration.

## formatClock

`formatClock(seconds: number): string`

Floors and clamps seconds to zero, then returns `m:ss` or `h:mm:ss` when at least one hour is present.

```js
DoriosLib.time.formatClock(65);   // "1:05"
DoriosLib.time.formatClock(3661); // "1:01:01"
```

## formatDuration

`formatDuration(seconds: number): string`

Formats the two largest relevant units:

- Days plus optional hours.
- Hours plus optional minutes.
- Minutes plus optional seconds.
- Seconds otherwise.

```js
DoriosLib.time.formatDuration(93784); // "1 d 2 h"
```

## runAfterTicks

`runAfterTicks(ticks: number, callback: () => void): number`

Schedules with `system.runTimeout()` after flooring the tick count and clamping it to zero. Returns the native run identifier.

## runAfterSeconds

`runAfterSeconds(seconds: number, callback: () => void): number`

Converts seconds using 20 ticks per second, then delegates to `runAfterTicks()`.

## runAfterMinutes

`runAfterMinutes(minutes: number, callback: () => void): number`

Converts minutes to seconds and schedules the callback.

```js
const runId = DoriosLib.time.runAfterSeconds(5, () => {
  DoriosLib.messages.broadcast("§r§aFive seconds elapsed.");
});
```

Use the native system API with the returned run identifier when cancellation is required.

## waitTicks

`waitTicks(ticks: number): Promise<void>`

Awaits native `system.waitTicks()` after flooring and clamping the delay to at least one tick.

## waitSeconds

`waitSeconds(seconds: number): Promise<void>`

Converts seconds and awaits `waitTicks()`.

## waitMinutes

`waitMinutes(minutes: number): Promise<void>`

Converts minutes and awaits `waitSeconds()`.

```js
async function showDelayedMessage(player) {
  await DoriosLib.time.waitSeconds(2);
  DoriosLib.messages.send(player, "§r§7The operation finished.");
}
```

Scheduled callbacks and waits use game ticks, so real elapsed time changes when the world cannot maintain 20 TPS.
