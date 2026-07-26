---
title: Display Input and Output
sidebar_position: 3
description: Map the machine's exact helper-entity slots to UtilityCraft input, output, screen, and energy controls.
---

# Display Input and Output

The crusher stores its recipe input at helper-entity slot `3` and its output at slot `4`. The UI must render those exact `container_items` indices.

## Add the machine controls

In `first_machine_ui.json`, replace the empty `crusher_top` definition with:

```json title="RP/ui/first_machine_ui.json"
"crusher_top": {
  "type": "collection_panel",
  "anchor_from": "center",
  "anchor_to": "center",
  "size": [162, 72],
  "offset": [-10, -40],
  "collection_name": "container_items",
  "$item_collection_name": "container_items",
  "controls": [
    {
      "machine_screen@uc.machine_small_screen": {
        "layer": 1
      }
    },
    {
      "energy_bar@uc.energy_bar": {
        "offset": [-101, -13],
        "$bar_bg_texture": "textures/ui/toggle_button/left_bg"
      }
    },
    {
      "input@uc.input_slot": {
        "anchor_from": "top_middle",
        "anchor_to": "top_middle",
        "offset": [0, 30],
        "collection_index": 3
      }
    },
    {
      "output@uc.output_slot": {
        "anchor_from": "top_middle",
        "anchor_to": "top_middle",
        "offset": [56, 26],
        "collection_index": 4
      }
    }
  ]
}
```

The rest of `first_machine_ui.json` remains unchanged.

## Understand the control syntax

```json
{
  "input@uc.input_slot": {
    "collection_index": 3
  }
}
```

| Part | Meaning |
| --- | --- |
| `input` | Local name of this control inside `crusher_top`. It can be any unique name. |
| `@uc.input_slot` | Inherits UtilityCraft's public input-slot control. This part must be exact. |
| `collection_index` | Helper-entity inventory slot rendered by this control. |
| `offset` | Position relative to the selected anchors. |

Do not confuse the local name with the inherited control. A name such as `input_1` does not create an input outline. Use an existing control such as `uc.input_slot` or `uc.input_1_slot` through `uc.input_9_slot`.

## Why the output is larger

`uc.input_slot` uses an `18 × 18` interactive slot. `uc.output_slot` uses a `26 × 26` output presentation. Their offsets are intentionally different so their centers align with the processing flow.

<div className="uc-ui-gallery">
  <figure className="uc-ui-swatch"><img src="/img/documentation/utilitycraft/ui-core/slots/input_1_slot.png" alt="UtilityCraft input slot outline" /><figcaption>uc.input_slot</figcaption></figure>
  <figure className="uc-ui-swatch"><img src="/img/documentation/utilitycraft/ui-core/slots/output_1_slot.png" alt="UtilityCraft output slot outline" /><figcaption>uc.output_slot</figcaption></figure>
</div>

The blue input and red output outlines communicate the slot's role. They do not enforce inventory rules; the component and script remain responsible for accepted inputs and generated outputs.

## Energy and machine screen

`uc.machine_small_screen` draws the gray `52 × 52` area used for status text. It is only a background.

`uc.energy_bar` reads helper-entity slot `0` by default through its `$collection_index` variable. The first-machine script already calls `machine.displayEnergy()`, so the bar can render its current energy state.

Use `$collection_index` only for controls that expose that custom variable, such as `uc.energy_bar`. Interactive item slots use the standard `collection_index` property.

## Test the slots

Open the machine and place Cobblestone in the blue slot. It should occupy helper-entity slot `3`. After a completed recipe, Gravel should appear in the red slot at index `4`.

If an item appears in the wrong position, compare the UI `collection_index` with the script's `INPUT_SLOT` and `OUTPUT_SLOT` constants. Do not compensate by moving recipe logic to a different slot unless the entity layout itself is meant to change.

See [Items and slots](../ui_core/items-and-slots) for every supported slot control and outline.

Continue with [Add a progress bar](./progress-bar).

