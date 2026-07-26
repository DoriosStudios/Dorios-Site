---
title: Configure the Six Faces
sidebar_position: 3
description: Connect six registered item IO buttons to the standard UtilityCraft IO tab and test every relative machine face.
---

# Configure the Six Faces

`registerIOInterface()` created six button definitions. The standard IO tab renders them in this exact order:

| Position | Relative face | Crusher button slot |
| ---: | --- | ---: |
| 1 | Top | `9` |
| 2 | Left | `10` |
| 3 | Front | `11` |
| 4 | Right | `12` |
| 5 | Bottom | `13` |
| 6 | Back | `14` |

Changing the order in either the script or JSON UI makes the visible face control a different physical side.

## Add the item IO tab

Add this control to the Thermal Crusher's `crusher_top.controls` array created in [Machine UI](../machine-ui/):

```json title="RP/ui/first_machine_ui.json"
{
  "io@uc.io_tab": {
    "$has_io_config": true,
    "$has_item_io": true,
    "$has_fluid_io": false,
    "$has_gas_io": false,
    "$io_items_modes_description": "ui.utilitycraft:io.example_thermal_crusher.items",
    "$io_top_texture": "textures/blocks/examples/thermal_crusher_off_up",
    "$io_left_texture": "textures/blocks/examples/thermal_crusher_off_west",
    "$io_front_texture": "textures/blocks/examples/thermal_crusher_off_north",
    "$io_right_texture": "textures/blocks/examples/thermal_crusher_off_east",
    "$io_bottom_texture": "textures/blocks/examples/thermal_crusher_off_down",
    "$io_back_texture": "textures/blocks/examples/thermal_crusher_off_south",
    "$io_item_top_index": 9,
    "$io_item_left_index": 10,
    "$io_item_front_index": 11,
    "$io_item_right_index": 12,
    "$io_item_bottom_index": 13,
    "$io_item_back_index": 14
  }
}
```

The six `*_index` values are the same six slots registered by `items.buttonSlots`. They are display-button slots, not recipe slots.

## Add the mode legend

```properties title="RP/texts/en_US.lang"
ui.utilitycraft:io.example_thermal_crusher.items=§rI/O Modes:\n§r- §9Input\n§r- §cOutput
```

Every formatted line begins with `§r`. The colors match the slot-outline convention: blue for input and red for output.

## Use one texture per face

The IO diagram represents the block itself. Supply the crusher texture corresponding to each face:

```text
up, west, north, east, down, south
```

These are separate per-face textures from the Resource Pack. Do not pass an atlas image that contains all six faces.

The UI face names are relative to the placed machine. DoriosCore reads `minecraft:cardinal_direction` and resolves the selected Front, Left, Right, and Back to the corresponding world direction.

Use `invertFaces: true` in `registerIOInterface()` only if a custom model or legacy facing convention intentionally maps every visual face to its opposite physical direction:

```js
registerIOInterface(BLOCK_ID, {
  invertFaces: true,
  items: itemPolicy,
});
```

The template's Thermal Crusher does not need this option.

## How clicking works

No custom button event is required. DoriosCore's interface system:

1. places one protected button item in every registered button slot;
2. writes the current mode ID into its visible name tag;
3. detects when the player presses the container button;
4. advances that face to the next registered mode;
5. persists the new per-face item configuration;
6. restores the button item with its new outline state.

For this crusher, each face cycles:

```text
disabled -> input_1 -> output_1 -> disabled
```

Every face stores its choice independently. The top can be an input while the right is an output and the remaining faces stay disabled.

## Test the complete routing

1. Place the crusher and give it energy.
2. Place one compatible item container against its left face and another against its right face.
3. Open the IO tab.
4. Set Left to the blue `input_1` mode.
5. Set Right to the red `output_1` mode.
6. Put Cobblestone in the left container.
7. Confirm the crusher pulls it into slot `3`.
8. Wait for processing and confirm Gravel leaves slot `4` through the right face.
9. Set Right to `disabled` and confirm the next output remains inside the crusher.

Transfers occur on valid machine ticks, so a change may not be visible in the same game tick as the click.

## Common configuration errors

### Exactly six valid slots

```text
RangeError: items.buttonSlots must resolve to exactly six valid slots
```

Use either an inclusive six-slot range such as `[9, 14]` or an explicit six-entry array. `[9, 10]` is interpreted as the inclusive range `9..10`, which produces only two slots and fails.

### Overlapping slots

Button slots cannot overlap operational inputs or outputs. Separate UI controls, recipe inventory, displays, and upgrades in the helper-entity layout.

### Outline disappears after clicking

The selected `id` has no matching UI Core state, or the visible UI index points to the wrong helper slot. Use exact IDs such as `disabled`, `input_1`, and `output_1`, then compare all six UI indices with `buttonSlots`.

### Wrong physical side moves items

Check the order `top, left, front, right, bottom, back`, the block's placement-direction trait, and its rotation permutations. Do not reorder indices to compensate for an incorrect block-facing definition.

See the [IO interface API](../../dorios_core/API/io-interface) for every validation rule and the [UI tabs reference](../ui_core/tabs-and-io) for all accepted outline states.

Continue with [Liquid IO](./liquid-io).

