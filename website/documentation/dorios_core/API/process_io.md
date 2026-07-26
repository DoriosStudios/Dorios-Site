---
id: process-io
title: Process machine IO
sidebar_label: Process machine IO
sidebar_position: 9
description: Execute configurable item, liquid, and gas transfers with BasicMachine.processIO.
---

# Process machine IO

`BasicMachine.processIO()` executes the six-face policy registered for a machine. It handles items, indexed liquids, and indexed gases in one scheduler-aware call.

```js
import { Machine, registerIOInterface } from "DoriosCore/index.js";
```

## Signature

<div class="api-signature">

`processIO(limits?: ProcessIOLimits): ProcessIOSummary`

</div>

The method is inherited by `Machine`, `Generator`, `MultiblockMachine`, and `MultiblockGenerator`.

## Prerequisites

1. Register a policy with [`registerIOInterface`](./io-interface) or `registerLinkNodeIO`.
2. Reserve six unique button slots for every resource that exposes face controls.
3. Give the helper entity the appropriate container families and storage indices.
4. Call `processIO()` only after the runtime's `valid` guard.

```js
registerIOInterface("myaddon:gas_reactor", {
  items: {
    buttonSlots: [10, 15],
    anyInputSlots: [3],
    anyOutputSlots: [4],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputSlots: [3] },
      { id: "output_1", outputSlots: [4] },
    ],
  },
  gases: {
    buttonSlots: [16, 21],
    anyInputIndices: [0],
    anyOutputIndices: [1],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputIndices: [0] },
      { id: "output_1", outputIndices: [1] },
    ],
  },
});
```

## Parameters

### ProcessIOLimits

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `maxInputSlotsScannedPerTick` | `number` | `9` | Neighbor inventory slots examined per enabled input face. |
| `maxOutputSlotsMovedPerTick` | `number` | `9` | Machine output slots attempted per enabled output face. Each attempt can move a full compatible stack. |
| `maxFluidMovedPerTick` | `number` | `2500` | Total liquid amount moved during this call. |
| `maxGasMovedPerTick` | `number` | `2500` | Total gas amount moved during this call. |

Values are floored and clamped to zero. A zero limit disables that operation for the call.

## Return value

```ts
interface ProcessIOSummary {
  itemsMoved: number;
  inputSlotsScanned: number;
  fluidMoved: number;
  gasMoved: number;
}
```

| Property | Description |
| --- | --- |
| `itemsMoved` | Total number of items inserted or extracted. |
| `inputSlotsScanned` | Neighbor source slots examined while pulling inputs. This can be greater than zero when no item moves. |
| `fluidMoved` | Total liquid amount transferred. |
| `gasMoved` | Total gas amount transferred. |

An invalid runtime returns four zeros.

## Processing order

For each enabled neighboring direction, DoriosCore:

1. Resolves the neighbor location from `OutputTracker`.
2. Pushes machine item outputs allowed on that face.
3. Pulls compatible neighbor items into the machine's face inputs.
4. Pushes liquids from configured output indices.
5. Pulls liquids into configured input indices.
6. Pushes gases from configured output indices.
7. Pulls gases into configured input indices.

Item, liquid, and gas policies are separate. Inventory slot `0` does not refer to liquid index `0` or gas index `0`.

## Fair item scanning

Large neighbor inventories are scanned through a rotating cursor maintained per machine entity and direction. A call stops scanning that face after the first successful pull or when its scan budget is exhausted. The next valid tick continues from the next source slot.

This prevents early slots from permanently starving later slots without scanning every neighbor slot every tick.

## Face resolution

The persisted IO document uses absolute directions:

```text
up, down, north, south, east, west
```

The visible buttons are presented as relative machine faces:

```text
top, left, front, right, bottom, back
```

DoriosCore resolves relative buttons using the block orientation. `invertFaces: true` applies the opposite physical direction when a particular UI layout requires it.

When transferring to a neighbor, the target is queried through the opposite face. For example, an east machine output inserts through the neighbor's west input policy.

## Fallback policies

The `anyInputSlots`, `anyOutputSlots`, `anyInputIndices`, and `anyOutputIndices` arrays are used when a caller has no physical face, including some link-node and direct adapter paths.

They are not a seventh configurable machine face.

## Runtime example

```js
function onTick({ block }, { params: settings }) {
  const machine = new Machine(block, settings);
  if (!machine.valid) return;

  const summary = machine.processIO({
    maxInputSlotsScannedPerTick: 6,
    maxOutputSlotsMovedPerTick: 4,
    maxFluidMovedPerTick: 1000,
    maxGasMovedPerTick: 1000,
  });

  // Recipe processing remains addon-owned.
  runRecipe(machine);

  if (summary.itemsMoved || summary.fluidMoved || summary.gasMoved) {
    machine.displayEnergy();
  }
}
```

## When to use adapters instead

Use the [container adapters](./container-adapters) when you need to:

- insert a resource from a source that is not another machine face;
- transfer one exact storage index manually;
- inspect an endpoint before creating a runtime wrapper;
- interact through a physical link-node port;
- require an all-or-nothing external insertion.

## Remarks

- `processIO()` does not execute recipes.
- It does not discover or own UtilityCore networks; it handles neighboring compatible endpoints and link-node abstractions.
- Call it once per valid runtime tick unless a specific machine intentionally applies smaller independent budgets.
- Register IO during module loading, not from the tick callback.

