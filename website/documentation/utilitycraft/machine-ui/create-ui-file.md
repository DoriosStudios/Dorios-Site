---
title: Create the UI File
sidebar_position: 2
description: Create an addon-owned JSON UI namespace, load it, and route the machine helper entity to it.
---

# Create the UI File

A working machine screen needs three connections:

```text
_ui_defs.json -> first_machine_ui.json -> chest_screen.json route
```

The UI definition loads your controls. The chest-screen route selects those controls when Minecraft opens the Example Thermal Crusher helper entity.

## 1. Create an addon-owned namespace

Create this file:

```json title="RP/ui/first_machine_ui.json"
{
  "namespace": "first_machine_ui",

  "utility_panel_template": {
    "type": "panel",
    "$machine_top|default": "first_machine_ui.crusher_top",
    "controls": [
      {
        "container_gamepad_helpers@common.container_gamepad_helpers": {}
      },
      {
        "flying_item_renderer@common.flying_item_renderer": {
          "layer": 40
        }
      },
      {
        "selected_item_details_factory@common.selected_item_details_factory": {}
      },
      {
        "item_lock_notification_factory@common.item_lock_notification_factory": {}
      },
      {
        "root_panel@common.root_panel": {
          "layer": 1,
          "controls": [
            {
              "common_panel@common.common_panel": {}
            },
            {
              "chest_panel": {
                "type": "panel",
                "layer": 5,
                "controls": [
                  {
                    "machine_top@$machine_top": {}
                  },
                  {
                    "inventory_panel_bottom_half_with_label@common.inventory_panel_bottom_half_with_label": {}
                  },
                  {
                    "hotbar_grid@common.hotbar_grid_template": {}
                  },
                  {
                    "inventory_take_progress_icon_button@common.inventory_take_progress_icon_button": {}
                  }
                ]
              }
            },
            {
              "inventory_selected_icon_button@common.inventory_selected_icon_button": {}
            },
            {
              "gamepad_cursor@common.gamepad_cursor_button": {}
            }
          ]
        }
      }
    ]
  },

  "crusher_top": {
    "type": "collection_panel",
    "anchor_from": "center",
    "anchor_to": "center",
    "size": [162, 72],
    "offset": [-10, -40],
    "collection_name": "container_items",
    "$item_collection_name": "container_items",
    "controls": []
  },

  "crusher_utility_panel@first_machine_ui.utility_panel_template": {
    "$machine_top": "first_machine_ui.crusher_top"
  }
}
```

`first_machine_ui` belongs to the addon. It must be unique; do not name it `uc`, `chest`, or `common` because those namespaces already belong to other UI files.

The `utility_panel_template` retains Minecraft's player inventory, hotbar, item tooltip, controller helpers, cursor, and item-transfer behavior. Later pages only change `crusher_top`, the standard `162 × 72` machine area.

## 2. Load the file

Add the new path to `ui_defs`. Keep `example_machinery.json` because the other template machines still use it.

```json title="RP/ui/_ui_defs.json"
{
  "ui_defs": [
    "ui/example_machinery.json",
    "ui/first_machine_ui.json"
  ]
}
```

Every path is relative to the Resource Pack root and uses forward slashes.

## 3. Route the crusher to the new screen

Open `RP/ui/chest_screen.json`. Find the route whose `requires` value contains the Example Thermal Crusher entity name. Change its `$screen_content` value:

```json title="RP/ui/chest_screen.json"
{
  "requires": "($temp_container_title = 'entity.utilitycraft:example_thermal_crusher.name')",
  "$screen_content": "first_machine_ui.crusher_utility_panel",
  "$screen_bg_content": "common.screen_background"
}
```

Do not add a second route for the same entity title. Replace the existing crusher route so only one screen can match it.

The route has two different identifiers:

| Value | Meaning |
| --- | --- |
| `entity.utilitycraft:example_thermal_crusher.name` | Localization key used as the helper entity's container title. |
| `first_machine_ui.crusher_utility_panel` | `namespace.control` to display when that title matches. |

The template already contains the required entity localization:

```properties title="RP/texts/en_US.lang"
entity.utilitycraft:example_thermal_crusher.name=Example Thermal Crusher
```

The `requires` expression uses the localization key, not the visible English text. This allows the same route to work in every language.

## 4. Test the route

Build and load both UtilityCraft and the template Resource Pack, then open the crusher. At this stage the custom top area is intentionally empty, but the player inventory and hotbar should still appear.

If Minecraft opens a normal chest instead, verify:

- `first_machine_ui.json` is listed in `_ui_defs.json`;
- the namespace and control name match exactly;
- the crusher has only one matching route;
- the entity localization key matches the route;
- the JSON UI content log contains no parse error.

Continue with [Display input and output](./input-output).

