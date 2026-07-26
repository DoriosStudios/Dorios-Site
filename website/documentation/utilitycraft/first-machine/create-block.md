---
title: Create the Block
sidebar_position: 2
description: Define the block, component parameters, tick interval, states, tags, rotation, and per-face machine textures.
---

# Create the Block

The block JSON describes what Minecraft knows about the machine. It does not contain the processing algorithm. Instead, it attaches an addon-owned component and passes settings to the script that registers that component.

Open:

```text
BP/blocks/examples/example_thermal_crusher.json
```

Replace the finished template definition with this beginner version:

```json title="BP/blocks/examples/example_thermal_crusher.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:example_thermal_crusher",
      "menu_category": {
        "category": "construction"
      },
      "traits": {
        "minecraft:placement_direction": {
          "enabled_states": ["minecraft:cardinal_direction"],
          "y_rotation_offset": 180
        }
      },
      "states": {
        "utilitycraft:on": [false, true]
      }
    },
    "components": {
      "utilitycraft:example_thermal_crusher": {
        "entity": {
          "type": "machine",
          "inventory_size": 15
        },
        "machine": {
          "energy_cap": 64000,
          "energy_cost": 800,
          "rate_speed_base": 40,
          "upgrades": []
        }
      },
      "minecraft:geometry": "minecraft:geometry.full_block",
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_example_thermal_crusher_off_north",
          "render_method": "alpha_test"
        },
        "north": {
          "texture": "utilitycraft_example_thermal_crusher_off_north",
          "render_method": "alpha_test"
        },
        "south": {
          "texture": "utilitycraft_example_thermal_crusher_off_south",
          "render_method": "alpha_test"
        },
        "east": {
          "texture": "utilitycraft_example_thermal_crusher_off_east",
          "render_method": "alpha_test"
        },
        "west": {
          "texture": "utilitycraft_example_thermal_crusher_off_west",
          "render_method": "alpha_test"
        },
        "up": {
          "texture": "utilitycraft_example_thermal_crusher_off_up",
          "render_method": "alpha_test"
        },
        "down": {
          "texture": "utilitycraft_example_thermal_crusher_off_down",
          "render_method": "alpha_test"
        }
      },
      "minecraft:tick": {
        "interval_range": [4, 4]
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 1
      },
      "minecraft:destructible_by_explosion": false,
      "tag:dorios:machine": {},
      "tag:dorios:energy": {},
      "tag:dorios:item": {},
      "tag:minecraft:is_pickaxe_item_destructible": {}
    },
    "permutations": [
      {
        "condition": "q.block_state('utilitycraft:on') == true",
        "components": {
          "minecraft:material_instances": {
            "*": {
              "texture": "utilitycraft_example_thermal_crusher_on_north",
              "render_method": "alpha_test"
            },
            "north": {
              "texture": "utilitycraft_example_thermal_crusher_on_north",
              "render_method": "alpha_test"
            },
            "south": {
              "texture": "utilitycraft_example_thermal_crusher_on_south",
              "render_method": "alpha_test"
            },
            "east": {
              "texture": "utilitycraft_example_thermal_crusher_on_east",
              "render_method": "alpha_test"
            },
            "west": {
              "texture": "utilitycraft_example_thermal_crusher_on_west",
              "render_method": "alpha_test"
            },
            "up": {
              "texture": "utilitycraft_example_thermal_crusher_on_up",
              "render_method": "alpha_test"
            },
            "down": {
              "texture": "utilitycraft_example_thermal_crusher_on_down",
              "render_method": "alpha_test"
            }
          },
          "minecraft:light_emission": 4
        }
      },
      {
        "condition": "q.block_state('minecraft:cardinal_direction') == 'north'",
        "components": {
          "minecraft:transformation": {
            "rotation": [0, 0, 0]
          }
        }
      },
      {
        "condition": "q.block_state('minecraft:cardinal_direction') == 'south'",
        "components": {
          "minecraft:transformation": {
            "rotation": [0, 180, 0]
          }
        }
      },
      {
        "condition": "q.block_state('minecraft:cardinal_direction') == 'east'",
        "components": {
          "minecraft:transformation": {
            "rotation": [0, -90, 0]
          }
        }
      },
      {
        "condition": "q.block_state('minecraft:cardinal_direction') == 'west'",
        "components": {
          "minecraft:transformation": {
            "rotation": [0, 90, 0]
          }
        }
      }
    ]
  }
}
```

## Block identifier and component identifier

This example deliberately uses the same identifier for the block and its custom component:

```text
utilitycraft:example_thermal_crusher
```

They represent different things:

- `description.identifier` registers a placeable block.
- the key inside `components` attaches script behavior to that block.
- `DoriosLib.registry.blockComponent()` will register the matching component key in the next page.

If one of the three strings differs, the script will not receive the block events.

## Component parameters

Everything inside the custom component is passed to the script as `settings`.

| Parameter | Value | Meaning |
| --- | ---: | --- |
| `entity.type` | `"machine"` | Triggers the shared `utilitycraft:machine` helper-entity event. |
| `entity.inventory_size` | `15` | Gives the helper enough slots for storage and future UI controls. |
| `machine.energy_cap` | `64000` | Maximum stored Dorios Energy. |
| `machine.energy_cost` | `800` | Default progress maximum and first recipe cost. |
| `machine.rate_speed_base` | `40` | Base processing progress per game tick before scheduling. |
| `machine.upgrades` | `[]` | No upgrade slots are evaluated in this beginner version. |

JSON numbers are data, not executable logic. The script decides when energy is consumed and when a recipe completes.

## On/off state

`Machine.on()` and `Machine.off()` write the `utilitycraft:on` state. The first permutation responds to that state:

- `false`: uses all six `_off_` texture keys;
- `true`: uses all six `_on_` texture keys and emits light.

Never call `Machine.on()` without declaring the state in the block.

## Rotation

`minecraft:placement_direction` creates the cardinal-direction state. The four rotation permutations rotate the normal full-block geometry while keeping the existing per-face textures aligned with the machine.

## Required tags

| Tag | Why it is present |
| --- | --- |
| `tag:dorios:machine` | Identifies the block as machinery to shared systems. |
| `tag:dorios:energy` | Marks it as an energy-compatible block. |
| `tag:dorios:item` | Marks it as an item-capable block for later IO integration. |
| `tag:minecraft:is_pickaxe_item_destructible` | Makes the block use the expected mining-tool family. |

## Tick interval

The custom component's `onTick` handler is driven by:

```json
"minecraft:tick": {
  "interval_range": [4, 4]
}
```

DoriosCore accounts for its scheduler interval when calculating `machine.rate`. Do not manually multiply the rate again in the recipe code.

## Existing Resource Pack assets

The template already contains the twelve face textures and their mappings in `RP/textures/terrain_texture.json`. A real machine must provide equivalent texture keys and PNG files for every face it references.

At this point the block definition is valid, but its custom component is not registered yet. Continue with [Register its component](./register-component).

