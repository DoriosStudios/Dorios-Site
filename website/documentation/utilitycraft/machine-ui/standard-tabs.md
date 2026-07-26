---
title: Add Info, IO, and Upgrades Tabs
sidebar_position: 6
description: Add the standard information tab now and configure IO or upgrade tabs only when the machine implements their runtime contracts.
---

# Add Info, IO, and Upgrades Tabs

UtilityCraft's right-side tabs share one toggle group and a consistent visual layout. Each tab has two parts:

1. a JSON UI control that displays the button and panel;
2. runtime data that makes the panel truthful and interactive.

The current first machine supports information immediately. IO and Upgrades are reserved for their dedicated tutorials, so this page shows their exact UI configuration without exposing nonfunctional controls.

:::important Show only supported tabs
An IO diagram without six registered face buttons cannot change side modes. An Upgrades panel without registered upgrade slots cannot accept or apply upgrades. Omit those controls until their runtime setup exists.
:::

## Add the Info tab

Append this control to `crusher_top.controls`:

```json title="RP/ui/first_machine_ui.json"
{
  "info@uc.info_tab": {
    "$info_description": "ui.utilitycraft:info.example_thermal_crusher"
  }
}
```

Then replace the template's outdated description with one that matches the machine built in this course:

```properties title="RP/texts/en_US.lang"
ui.utilitycraft:info.example_thermal_crusher=§rCrushes supported materials while consuming §sDorios Energy§r.\n§r\n§r§8Recipes:\n§r- §fCobblestone §8→ §fGravel §8(800 DE)\n§r- §fGravel §8→ §fSand §8(1000 DE)\n§r\n§r§8Slots:\n§r- §9Input§8: material to crush.\n§r- §cOutput§8: processed result.
```

The value passed to `$info_description` is a localization key. `uc.info_tab` resolves it and displays the translated text in a scrollable panel.

Use the same key in every locale file, with a translated value. Keep `\n` inside the language value; a physical newline would create an invalid `.lang` entry.

<div className="uc-ui-gallery">
  <figure className="uc-ui-swatch"><img src="/img/documentation/utilitycraft/ui-core/toggles/info_unchecked.png" alt="Closed UtilityCraft information tab" /><figcaption>information closed</figcaption></figure>
  <figure className="uc-ui-swatch"><img src="/img/documentation/utilitycraft/ui-core/toggles/info_checked.png" alt="Open UtilityCraft information tab" /><figcaption>information open</figcaption></figure>
</div>

At this point the first machine UI is functional: title, status, energy, input, progress, output, and information all correspond to runtime data.

## Add IO after registering it

The [Machine IO](../machine-io/) section will register six addon-owned item-side buttons. Once those buttons exist at slots `9` through `14`, add:

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

Add its localized mode list:

```properties title="RP/texts/en_US.lang"
ui.utilitycraft:io.example_thermal_crusher.items=§rI/O Modes:\n§r- §9Input\n§r- §cOutput
```

The face order is always:

```text
top, left, front, right, bottom, back
```

All six UI indices must match the six `items.buttonSlots` registered by the script in that same order. The accepted runtime states are exact identifiers such as `input_1`, `output_1`, `both`, `disabled`, and `energy`; do not invent new state names.

The six texture paths show the machine's faces in the IO diagram. They are the crusher's per-face block textures, not a single atlas containing every face.

## Add Upgrades after registering its slots

The [Machine Upgrades](../machine-upgrades/) section will configure the block component, register accepted upgrade definitions, and reserve helper-entity slots `5` through `8`. After that runtime setup exists, add:

```json title="RP/ui/first_machine_ui.json"
{
  "upgrades@uc.upgrades_tab": {
    "$upgrade_index_1": 5,
    "$upgrade_index_2": 6,
    "$upgrade_index_3": 7,
    "$upgrade_index_4": 8,
    "$has_first_upgrade": true,
    "$has_second_upgrade": true,
    "$has_third_upgrade": true,
    "$has_fourth_upgrade": false,
    "$upgrade_overlay_1": "textures/items/machinery/speed_upgrade",
    "$upgrade_overlay_2": "textures/items/machinery/energy_upgrade",
    "$upgrade_overlay_3": "textures/items/machinery/quantity_upgrade"
  }
}
```

The three visible slots are intended for the course's `speed`, `energy_cost`, and `process_batch` upgrades. The overlay textures are empty-slot hints. They do not register an upgrade, validate an item, or apply a value. Every visible index must match a slot declared by the machine's upgrade component.

If a machine supports only two slots, set `$has_third_upgrade` and `$has_fourth_upgrade` to `false`, and do not imply support for those upgrades in the information text. Set `$has_fourth_upgrade` to `true` only after slot `8` has a real accepted upgrade.

## Shared tab behavior

`uc.info_tab`, `uc.io_tab`, and `uc.upgrades_tab` default to the same `$right_machine_tabs_name`: `right_machine_tabs`. This makes them mutually exclusive—opening one closes the other.

Keep that default for a standard machine. Override it only when a single screen intentionally contains a second independent group of right-side tabs.

The standard vertical order is Upgrades, IO, then Info. You do not position their toggle buttons manually; the shared controls already use UtilityCraft's established offsets, backgrounds, hover states, and icons.

## Final checklist

- The addon references `@uc.*` and does not copy `ui_core.json`.
- Every `collection_index` matches the helper entity and script.
- Input uses `uc.input_slot`; output uses `uc.output_slot`.
- Progress reads slot `2` with `uc.progress_display`.
- Every formatted label or information line begins with `§r`.
- The Info description matches the machine's real behavior.
- IO is shown only after six valid face-button slots are registered.
- Upgrades are shown only after their items, definitions, component, and slots exist.
- The three standard tabs keep the shared `right_machine_tabs` group.

For all variables, default values, exact IO states, and real texture previews, see [Tabs, upgrades, and IO configuration](../ui_core/tabs-and-io).

Continue with [Machine IO](../machine-io/).
