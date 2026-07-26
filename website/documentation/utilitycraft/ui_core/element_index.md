---
id: element-index
title: Complete UI Core element index
sidebar_label: Complete element index
sidebar_position: 6
description: Exhaustive index of every top-level element in UtilityCraft RP ui/ui_core.json.
---

# Complete UI Core element index

This index contains every top-level definition currently exported by `UtilityCraft/RP/ui/ui_core.json`: 100 controls in the `uc` namespace. Reference a control as `local_name@uc.element_name` from an addon-owned UI file.

Status meanings:

- **Public**: intended for normal machine UI composition.
- **Alias**: public preset inheriting another UI Core control.
- **Low-level**: compositional control used by a larger public control; use it only for a custom UI abstraction.
- **Internal**: implementation primitive beginning with `_`; prefer its public wrapper.

## Foundation controls

| Element | Status | Inherits / role |
| --- | --- | --- |
| `uc.function_panel` | Low-level | Visible for an empty collection item. |
| `uc.second_function_panel` | Low-level | Visible for a present collection item. |
| `uc.hover_text_function_panel` | Low-level | Visible when hover text excludes a marker. |
| `uc.second_hover_text_function_panel` | Low-level | Visible when hover text includes a marker. |
| `uc.fake_hover_text` | Low-level | Tooltip image and localized text. |
| `uc.fake_hover_button` | Low-level | Invisible tooltip trigger button. |
| `uc.slot_button_prototype` | Low-level | `common.container_slot_button_prototype`. |
| `uc.slot_button` | Low-level | Slot hover and auto-place button. |
| `uc.slot_highlight` | Low-level | Native item hover text. |
| `uc.text_label` | Public | Dynamic top-left collection text. |
| `uc.centered_text_label` | Public | Centered collection text. |
| `uc._text_label_v1` | Internal | Direct hover-text label binding. |
| `uc._text_label_v2` | Internal | Compatibility label binding. |
| `uc.machine_name` | Public | Container title based on `chest.chest_label`. |
| `uc.specific_slot` | Low-level | Empty collection-bound composition base. |
| `uc.machine_button` | Public | Collection-backed action button. |
| `uc.dynamic_button` | Public | Machine button whose label comes from hover text. |

See [Visibility, labels, tooltips, and buttons](./foundation-controls).

## Item visuals and displays

| Element | Status | Inherits / role |
| --- | --- | --- |
| `uc._slot_visual` | Internal | Base item renderer without hover button. |
| `uc._slot_visual_hover` | Internal | Base item renderer with hover/focus support. |
| `uc.button_item_display` | Low-level | Small item button visual. |
| `uc.item_display` | Public | Small read-only item. |
| `uc.item_display_medium` | Public | Medium read-only item. |
| `uc.item_display_large` | Public | Large read-only item. |
| `uc.item_display_hover` | Public | Small item with tooltip. |
| `uc.item_display_hover_medium` | Public | Medium item with tooltip. |
| `uc.item_display_hover_large` | Public | Large item with tooltip. |
| `uc.progress_display` | Public | Medium non-focusable progress-frame item. |
| `uc.output_item` | Low-level | 26x26 native output item. |
| `uc.input_item` | Low-level | 18x18 native input item. |

## Machine slots

| Element | Status | Inherits / role |
| --- | --- | --- |
| `uc.input_slot` | Public | Configurable 18x18 input slot. |
| `uc.input_1_slot` | Alias | `uc.input_slot`, input 1 outline. |
| `uc.input_2_slot` | Alias | `uc.input_slot`, input 2 outline. |
| `uc.input_3_slot` | Alias | `uc.input_slot`, input 3 outline. |
| `uc.input_4_slot` | Alias | `uc.input_slot`, input 4 outline. |
| `uc.input_5_slot` | Alias | `uc.input_slot`, input 5 outline. |
| `uc.input_6_slot` | Alias | `uc.input_slot`, input 6 outline. |
| `uc.input_7_slot` | Alias | `uc.input_slot`, input 7 outline. |
| `uc.input_8_slot` | Alias | `uc.input_slot`, input 8 outline. |
| `uc.input_9_slot` | Alias | `uc.input_slot`, input 9 outline. |
| `uc.fuel_slot` | Public | 18x18 fuel slot. |
| `uc.upgrade_slot` | Public | 18x18 optional-background upgrade slot. |
| `uc.output_slot` | Public | Configurable 26x26 output slot. |
| `uc.output_1_slot` | Alias | `uc.output_slot`, output 1 outline. |
| `uc.output_2_slot` | Alias | `uc.output_slot`, output 2 outline. |
| `uc.output_3_slot` | Alias | `uc.output_slot`, output 3 outline. |
| `uc.output_4_slot` | Alias | `uc.output_slot`, output 4 outline. |
| `uc.output_5_slot` | Alias | `uc.output_slot`, output 5 outline. |
| `uc.output_6_slot` | Alias | `uc.output_slot`, output 6 outline. |
| `uc.output_7_slot` | Alias | `uc.output_slot`, output 7 outline. |
| `uc.output_8_slot` | Alias | `uc.output_slot`, output 8 outline. |
| `uc.output_9_slot` | Alias | `uc.output_slot`, output 9 outline. |

See [Items, progress displays, and slots](./items-and-slots).

## Bars and storage displays

| Element | Status | Inherits / role |
| --- | --- | --- |
| `uc.bar_background` | Low-level | Optional resource-bar background. |
| `uc.bar` | Low-level | Generic single energy/liquid display. |
| `uc._bar_multi` | Internal | Generic two- through five-part bar. |
| `uc.bar_double` | Low-level | Two-part `_bar_multi` preset. |
| `uc.bar_triple` | Low-level | Three-part `_bar_multi` preset. |
| `uc.bar_quadruple` | Low-level | Four-part `_bar_multi` preset. |
| `uc.bar_quintuple` | Low-level | Five-part `_bar_multi` preset. |
| `uc.energy_bar` | Public | Standard energy display. |
| `uc.big_energy_bar` | Public | Wide energy display. |
| `uc.fluid_bar` | Public | Standard liquid-border display. |
| `uc.liquid_bar` | Public | Liquid display with optional IO outline. |
| `uc.liquid_input_1_bar` | Alias | `uc.liquid_bar`, input 1 outline. |
| `uc.liquid_input_2_bar` | Alias | `uc.liquid_bar`, input 2 outline. |
| `uc.liquid_input_3_bar` | Alias | `uc.liquid_bar`, input 3 outline. |
| `uc.liquid_input_4_bar` | Alias | `uc.liquid_bar`, input 4 outline. |
| `uc.liquid_input_5_bar` | Alias | `uc.liquid_bar`, input 5 outline. |
| `uc.liquid_input_6_bar` | Alias | `uc.liquid_bar`, input 6 outline. |
| `uc.liquid_input_7_bar` | Alias | `uc.liquid_bar`, input 7 outline. |
| `uc.liquid_input_8_bar` | Alias | `uc.liquid_bar`, input 8 outline. |
| `uc.liquid_input_9_bar` | Alias | `uc.liquid_bar`, input 9 outline. |
| `uc.liquid_output_1_bar` | Alias | `uc.liquid_bar`, output 1 outline. |
| `uc.liquid_output_2_bar` | Alias | `uc.liquid_bar`, output 2 outline. |
| `uc.liquid_output_3_bar` | Alias | `uc.liquid_bar`, output 3 outline. |
| `uc.liquid_output_4_bar` | Alias | `uc.liquid_bar`, output 4 outline. |
| `uc.liquid_output_5_bar` | Alias | `uc.liquid_bar`, output 5 outline. |
| `uc.liquid_output_6_bar` | Alias | `uc.liquid_bar`, output 6 outline. |
| `uc.liquid_output_7_bar` | Alias | `uc.liquid_bar`, output 7 outline. |
| `uc.liquid_output_8_bar` | Alias | `uc.liquid_bar`, output 8 outline. |
| `uc.liquid_output_9_bar` | Alias | `uc.liquid_bar`, output 9 outline. |
| `uc.liquid_fuel_bar` | Alias | `uc.liquid_bar`, fuel outline. |
| `uc.big_fluid_bar` | Public | Wide liquid display. |

## Layout and screen controls

| Element | Status | Inherits / role |
| --- | --- | --- |
| `uc.slot_stack_vertical` | Public | Up to three vertical container items. |
| `uc.slot_stack_horizontal` | Public | Up to three horizontal container items. |
| `uc.slot_grid_3x3` | Public | Nine-slot grid with configurable indices. |
| `uc.slot_grid_2x2` | Public | Four-slot grid with configurable indices. |
| `uc.machine_side_panel` | Public | Optional left-side machine panel. |
| `uc.machine_small_screen` | Public | Standard 52x52 machine screen. |
| `uc.big_machine_screen` | Public | Wide 104x52 machine screen. |

See [Resource bars, slot layouts, and screens](./bars-grids-and-screens).

## Tabs, toggles, and IO

| Element | Status | Inherits / role |
| --- | --- | --- |
| `uc.button_display` | Low-level | Collection item displayed as a button icon. |
| `uc.toggle_button` | Low-level | Reusable toggle/radio control. |
| `uc.upgrades_tab` | Public | Standard upgrades button and panel. |
| `uc.io_state_outline` | Low-level | One hover-text state outline. |
| `uc.io_face_outline` | Low-level | All recognized IO state outlines for one face. |
| `uc.io_face_button` | Low-level | One clickable machine face and state outline. |
| `uc.io_face_slots` | Low-level | Six-face IO diagram. |
| `uc.io_tab` | Public | Standard item/liquid/gas IO configuration tab. |
| `uc.info_description_scroll_content` | Low-level | Scrollable information body. |
| `uc.info_tab` | Public | Standard information tab. |
| `uc.toggle_button_panel` | Low-level | Shows arbitrary controls for a checked toggle. |

See [Tabs, upgrades, and IO configuration](./tabs-and-io).

