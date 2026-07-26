---
title: Add a Progress Bar
sidebar_position: 4
description: Display the progress frames written by Machine at the exact helper-entity slot used by the crusher script.
---

# Add a Progress Bar

The first-machine script already stores completed work with `machine.setProgress()` and writes its visual state with `machine.displayProgress()`. The UI only needs to render the frame item stored at helper-entity slot `2`.

## Add the progress control

Insert this control between the input and output controls in `crusher_top.controls`:

```json title="RP/ui/first_machine_ui.json"
{
  "progress@uc.progress_display": {
    "anchor_from": "top_middle",
    "anchor_to": "top_middle",
    "offset": [28, 23],
    "collection_index": 2
  }
}
```

The processing row now has this order:

```text
slot 3 input -> slot 2 progress display -> slot 4 output
```

Slot `2` is placed visually between slots `3` and `4`, even though its numeric index is lower. Inventory index and screen position are independent.

## How the progress reaches the UI

The runtime flow is:

```text
machine.energy.consume()
    -> returns the energy consumed this tick
machine.setProgress()
    -> stores the accumulated work
machine.displayProgress()
    -> writes the matching frame item to slot 2
uc.progress_display
    -> renders the item from collection_index 2
```

`uc.progress_display` does not calculate a percentage and does not advance itself. It is a read-only `34 × 34` item renderer designed for UtilityCraft progress-frame items.

The script remains the source of truth:

```js title="BP/scripts/examples/machines/thermalCrusher.js"
let progress = machine.getProgress();
const remaining = Math.max(0, recipe.cost - progress);
const requestedEnergy = Math.min(machine.energy.get(), machine.rate, remaining);
const consumedEnergy = machine.energy.consume(requestedEnergy);

progress += consumedEnergy;
machine.setProgress(progress, { display: false });

machine.displayEnergy();
machine.displayProgress();
```

When processing stops, the script resets the stored value and refreshes the display:

```js
machine.setProgress(0, { display: false });
machine.displayProgress();
```

Passing `{ display: false }` prevents an intermediate refresh. The script updates the stored number first and calls `displayProgress()` once after the final value for that tick is known.

Do not create progress items manually in the UI. The frame identifiers and display updates belong to `Machine`.

## Keep the visual slot non-interactive

Progress is not a recipe inventory slot. Players should not insert or remove its display item. `uc.progress_display` disables focus navigation and uses a display renderer instead of a normal input slot.

Using `uc.input_slot` at index `2` would expose the wrong interaction model, even if the frame looked visible.

## Test progress

Give the crusher energy, insert Cobblestone, and watch the frame advance before Gravel is produced. Then remove the input during a later operation. The progress should return to its idle state according to the script's reset branch.

If the machine processes correctly but no progress is visible:

- confirm the script calls `machine.displayProgress()` after changing progress;
- confirm the UI reads `collection_index: 2`;
- confirm the helper entity has enough inventory slots;
- check the content log for an invalid progress-frame item identifier.

See [`uc.progress_display`](../ui_core/items-and-slots#item-display-controls) for the control's renderer properties.

Continue with [Add labels](./labels).
