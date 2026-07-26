---
title: Add Labels
sidebar_position: 5
description: Display the localized machine title and the live status text written with Machine.setLabel().
---

# Add Labels

The screen uses two different text sources:

- the machine title comes from the helper entity's localized container name;
- the live description comes from the label item at helper-entity slot `1`.

## Add the title and status controls

Add `machine_name` before the screen background, then add `machine_description` after it:

```json title="RP/ui/first_machine_ui.json"
{
  "machine_name@uc.machine_name": {}
},
{
  "machine_screen@uc.machine_small_screen": {
    "layer": 1
  }
},
{
  "machine_description@uc.text_label": {
    "collection_index": 1,
    "anchor_from": "top_left",
    "anchor_to": "top_left",
    "size": [48, 48],
    "$text_scale": 0.55,
    "offset": [14, 12]
  }
}
```

Control order affects layering. The background is declared before the status label so the label remains readable above it.

## Machine title

`uc.machine_name` reuses Minecraft's chest title binding. For this machine, the visible text is provided by:

```properties title="RP/texts/en_US.lang"
entity.utilitycraft:example_thermal_crusher.name=Example Thermal Crusher
```

The same localization key is also used by `chest_screen.json` to select the UI. Changing the visible translation is safe; changing the key requires updating the entity and route together.

## Live status label

The first-machine script writes its current state with `Machine.setLabel()`:

```js
machine.setLabel([
  "§r§aCrusher Running",
  "§r§7Input: §fCobblestone",
  "§r§7Output: §fGravel",
]);
```

The first array entry becomes the label item's name. Remaining entries become its lore lines. `uc.text_label` reads that display text from `collection_index: 1` and places it over the gray machine screen.

Every formatted line begins with `§r`. This clears formatting before that line applies its own color or style.

Dynamic values work the same way:

```js
machine.setLabel([
  "§r§aCrusher Running",
  `§r§7Input: §f${input.typeId}`,
  `§r§7Output: §f${recipe.output}`,
]);
```

## Size and text scale

| Property | Value | Purpose |
| --- | ---: | --- |
| `size` | `[48, 48]` | Keeps text inside the `52 × 52` screen. |
| `offset` | `[14, 12]` | Adds padding inside the screen background. |
| `$text_scale` | `0.55` | Fits several short lines without a side panel. |
| `collection_index` | `1` | Matches the slot written by `machine.setLabel()`. |

Keep status text concise. The standard machine screen is intended for current state, warnings, rates, or short resource values—not a full operating manual. Longer explanations belong in the information tab.

## Warnings use the same slot

Calls such as:

```js
machine.showWarning("No Input");
```

also update the machine's status presentation. You do not need a second warning label. The same UI control displays whichever status the machine wrote most recently.

If the text is missing, verify that the script called `setLabel()` or `showWarning()`, the UI uses index `1`, and the label is declared above the screen background in the visual layer order.

See [Visibility, labels, tooltips, and buttons](../ui_core/foundation-controls) for the complete label-control reference.

Continue with [Add Info, IO, and Upgrades tabs](./standard-tabs).

