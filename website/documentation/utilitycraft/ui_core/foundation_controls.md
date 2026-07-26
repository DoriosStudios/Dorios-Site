---
id: foundation-controls
title: Visibility, labels, tooltips, and buttons
sidebar_label: Foundation controls
sidebar_position: 2
description: Use UI Core conditional panels, hover helpers, labels, machine names, slot highlights, and collection-backed buttons.
---

# Visibility, labels, tooltips, and buttons

All controls are referenced from an addon-owned UI file with `@uc.<name>`.

## Conditional panels

| Element | Variables | What it does |
| --- | --- | --- |
| `uc.function_panel` | None | Reads `#item_id_aux` from `container_items` and is visible while the bound numeric item ID is below 1. Used for an empty/absent-state overlay. |
| `uc.second_function_panel` | None | Inverse of `function_panel`; visible when the numeric item ID is 1 or greater. |
| `uc.hover_text_function_panel` | `$function_item_name` required | Visible when `#hover_text` does **not** contain the supplied function marker. |
| `uc.second_hover_text_function_panel` | `$function_item_name` required | Inverse hover-text condition; visible when the marker is present. |

These are binding templates. Set `collection_index` on the inherited instance so the collection binding reads the intended helper-entity slot.

```json
{
  "empty_overlay@uc.function_panel": {
    "collection_index": 3,
    "controls": [
      {
        "ghost": {
          "type": "image",
          "texture": "textures/items/example_input_ghost",
          "alpha": 0.5
        }
      }
    ]
  }
}
```

## Fake hover tooltip

### `uc.fake_hover_text`

Draws a purple tooltip-style image with a localized label.

| Variable | Type | Default | Purpose |
| --- | --- | --- | --- |
| `$hover_text` | `string` | `""` | Text or localization key shown in the tooltip. |

The control is anchored at the top-left, offset `[23, 2]`, placed at layer 80, and does not clip its content.

### `uc.fake_hover_button`

An invisible 16×16 button whose hover state creates `uc.fake_hover_text`.

| Variable | Type | Default |
| --- | --- | --- |
| `$hover_text` | `string` | `""` |

Use it when a normal JSON UI control needs a tooltip but is not itself a container slot.

## Slot hover infrastructure

| Element | Variables | Purpose |
| --- | --- | --- |
| `uc.slot_button_prototype` | None | Extends `common.container_slot_button_prototype` and maps mouse, controller, auto-place, and inventory-drop inputs to `button.container_auto_place`. |
| `uc.slot_button` | `$highlight_control` = `"uc.slot_highlight"` | Button wrapper that displays the selected highlight control on hover. |
| `uc.slot_highlight` | None | Uses `common.hover_text` bound to the current item collection's `#hover_text`. |

Change `$highlight_control` only when providing a compatible control reference with the same hover responsibilities.

## Dynamic text labels

### `uc.text_label`

Reads text from the instance's `collection_index`, anchors it top-left, and renders it with the current label compatibility logic.

| Variable | Type | Default | Purpose |
| --- | --- | --- | --- |
| `$text_scale` | `number` | `1` | `font_scale_factor` for both internal label variants. |

```json
{
  "description@uc.text_label": {
    "collection_index": 1,
    "anchor_from": "top_left",
    "anchor_to": "top_left",
    "offset": [14, 12],
    "size": [48, 48],
    "$text_scale": 0.55
  }
}
```

### `uc.centered_text_label`

Same data source and `$text_scale`, but uses a 52×52 panel with a centered 48-pixel-wide text area.

### `uc._text_label_v1` and `uc._text_label_v2`

Internal label implementations used by both wrappers.

| Element | Bound text | Behavior |
| --- | --- | --- |
| `_text_label_v1` | `#hover_text` | Direct collection binding. |
| `_text_label_v2` | `#displaying_text` | Visibility-change binding that remains visible only while the always-bound and displayed text agree or the always-bound text is empty. |

Both accept `$text_scale` with default `1`. Prefer `text_label` or `centered_text_label` rather than referencing these primitives directly.

## Machine title

### `uc.machine_name`

Wraps `chest.chest_label`, which displays the current container title.

| Variable | Type | Default | Purpose |
| --- | --- | --- | --- |
| `$offset` | `[number, number]` | `[10, 0]` | Title offset inside the machine panel. |

```json
{ "machine_name@uc.machine_name": {} }
```

The visible text comes from the helper entity/container title and its language entry; it is not passed as a UI variable.

## Collection-backed buttons

### `uc.machine_button`

A `collection_panel` that sends `button.drop_all` when pressed. DoriosCore/DoriosLib interface logic interprets the helper item and button action.

| Variable | Type | Default |
| --- | --- | --- |
| `$item_collection_name` | `string` | `"container_items"` |
| `$button_size` | `[number, number]` | `[18, 18]` |
| `$button_text` | `string` | `" "` |
| `$text_scale` | `number` | `1` |
| `$default_texture` | texture path | `textures/ui/buttons/power_button` |
| `$hover_texture` | texture path | `textures/ui/buttons/power_button_selected` |
| `$pressed_texture` | texture path | `textures/ui/buttons/power_button_pressed` |

### `uc.dynamic_button`

Uses the same collection, size, scale, texture variables, mappings, and click sound. Instead of `$button_text`, its label is bound to the selected collection item's `#hover_text`.

```json
{
  "increase@uc.machine_button": {
    "collection_index": 4,
    "$button_size": [24, 16],
    "$button_text": "+1",
    "$text_scale": 0.6,
    "$default_texture": "textures/ui/buttons/button",
    "$hover_texture": "textures/ui/buttons/button_selected",
    "$pressed_texture": "textures/ui/buttons/button_pressed"
  }
}
```

<div className="uc-ui-gallery">
  <figure className="uc-ui-swatch"><img src="/img/documentation/utilitycraft/ui-core/buttons/power_button.png" alt="Default power button" /><figcaption>default</figcaption></figure>
  <figure className="uc-ui-swatch"><img src="/img/documentation/utilitycraft/ui-core/buttons/power_button_selected.png" alt="Hovered power button" /><figcaption>hover</figcaption></figure>
  <figure className="uc-ui-swatch"><img src="/img/documentation/utilitycraft/ui-core/buttons/power_button_pressed.png" alt="Pressed power button" /><figcaption>pressed</figcaption></figure>
</div>

## `uc.specific_slot`

An empty `collection_panel` template sized to its children. It accepts `$item_collection_name`, defaulting to `container_items`, and is useful as a collection-bound base for addon-owned slot compositions.
