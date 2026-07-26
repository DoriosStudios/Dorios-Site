---
title: Passive Generator
sidebar_position: 2
description: Build the template's Solar Generator and produce energy only while its environmental conditions are valid.
---

# Passive Generator

The Example Solar Generator produces energy without an item, liquid, or gas. It runs while the time is before `12000`, the block directly above it is air, and its internal energy storage has room.

## 1. Define the block

The complete block in the Addon Template uses a shared UtilityCraft solar geometry and two addon-owned textures:

```json title="BP/blocks/examples/example_solar_generator.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:example_solar_generator",
      "menu_category": { "category": "construction" },
      "states": {
        "utilitycraft:on": [false, true]
      }
    },
    "components": {
      "utilitycraft:example_solar_generator": {
        "entity": {
          "name": "example_solar_generator",
          "type": "generator",
          "inventory_size": 2
        },
        "generator": {
          "energy_cap": 64000,
          "rate_speed_base": 20
        }
      },
      "minecraft:geometry": "geometry.utilitycraft_solar_panel",
      "minecraft:material_instances": {
        "*": {
          "texture": "utilitycraft_example_solar_generator_off",
          "render_method": "alpha_test"
        }
      },
      "minecraft:tick": {
        "interval_range": [4, 4]
      },
      "tag:dorios:generator": {},
      "tag:dorios:energy": {},
      "tag:minecraft:is_pickaxe_item_destructible": {}
    },
    "permutations": [
      {
        "condition": "q.block_state('utilitycraft:on') == true",
        "components": {
          "minecraft:material_instances": {
            "*": {
              "texture": "utilitycraft_example_solar_generator_on",
              "render_method": "alpha_test"
            }
          },
          "minecraft:light_emission": 4
        }
      }
    ]
  }
}
```

| Part | Why it is required |
| --- | --- |
| `utilitycraft:on` | `generator.on()` and `off()` toggle this state. The permutation displays the active texture. |
| `type: "generator"` | Selects the shared energy-generator helper entity group. |
| `inventory_size: 2` | Provides energy display slot `0` and label slot `1`. |
| `minecraft:tick` | Invokes the component every four game ticks. |
| Generator and energy tags | Identify the block as an energy-producing endpoint. |

The template also contains its selection box, collision box, mining time, explosion resistance, and complete texture registrations. Preserve those when copying the block.

## 2. Register the behavior

```js title="BP/scripts/examples/generators/solarGenerator.js"
// @ts-check

import { world } from "@minecraft/server";
import { EnergyStorage, Generator } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_solar_generator";

DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    Generator.spawnEntity(event, settings);
  },

  onTick({ block }, { params: settings }) {
    const generator = new Generator(block, settings);
    if (!generator.valid) return;

    // The block component runs every four game ticks, so this provides a
    // matching transfer budget for energy accumulated over that interval.
    generator.energy.transferToNetwork(generator.rate * 4);

    const daylight = world.getTimeOfDay() < 12000;
    const blockAboveIsAir = block.above(1)?.typeId === "minecraft:air";

    if (!daylight || !blockAboveIsAir || generator.energy.getFreeSpace() <= 0) {
      generator.off();
      generator.displayEnergy();

      if (!daylight) {
        generator.setLabel("§r§eWaiting for Daylight");
      } else if (!blockAboveIsAir) {
        generator.setLabel("§r§eNeeds Open Sky");
      } else {
        generator.setLabel("§r§eEnergy Full");
      }
      return;
    }

    const produced = Math.min(
      generator.rate,
      generator.energy.getFreeSpace(),
    );

    generator.energy.add(produced);
    const producedPerTick = produced / generator.processingInterval;
    generator.on();
    generator.displayEnergy();
    generator.setLabel([
      "§r§aSolar Generator Running",
      `§r§7Produced: §f${EnergyStorage.formatEnergyToText(producedPerTick)}/t`,
    ]);
  },

  onPlayerBreak(event) {
    Generator.onDestroy(event);
  },
});
```

### Why this order matters

1. Transfer runs before the full-capacity check, so an attached network can free space.
2. Environmental conditions are checked before energy is added.
3. `Math.min()` prevents production from exceeding the scheduler-adjusted burst rate or remaining capacity.
4. `on()` is called only after energy is actually produced.
5. `Generator.onDestroy()` removes the helper safely and preserves stored energy in the dropped block item.

`generator.rate` is the work performed on this valid scheduled update. Dividing the result by `processingInterval` converts that burst back to an average `/t` value for the label.

`block.above(1)` checks only the immediately adjacent block. If your addon needs a true view-of-sky test through a taller column, implement that separate environmental rule in your addon-owned script.

## 3. Load the script

```js title="BP/scripts/examples/generators/index.js"
import "./solarGenerator.js";
```

The template's `examples/index.js` already imports `./generators/index.js` before DoriosLib installs registered components.

## 4. Display the generator

The standard template UI needs no input slot or IO tab:

```json title="RP/ui/example_machinery.json"
{
  "solar_generator_top": {
    "type": "collection_panel",
    "anchor_from": "center",
    "anchor_to": "center",
    "size": [162, 72],
    "offset": [-10, -40],
    "collection_name": "container_items",
    "$item_collection_name": "container_items",
    "controls": [
      { "machine_name@uc.machine_name": {} },
      { "machine_screen@uc.big_machine_screen": {} },
      {
        "machine_description@uc.text_label": {
          "collection_index": 1,
          "anchor_from": "top_left",
          "anchor_to": "top_left",
          "size": [98, 48],
          "$text_scale": 0.55,
          "offset": [14, 12]
        }
      },
      {
        "energy_bar@uc.energy_bar": {
          "offset": [54, 0],
          "$has_bg": false
        }
      },
      {
        "info@uc.info_tab": {
          "$info_description": "ui.utilitycraft:info.example_solar_generator"
        }
      }
    ]
  }
}
```

`@uc.*` controls are referenced from UtilityCraft's existing UI Core. Do not copy `ui_core.json` into the extension. Route the helper title `entity.utilitycraft:example_solar_generator.name` to this panel as explained in [Create the UI File](../machine-ui/create-ui-file).

## 5. Add localization

```properties title="RP/texts/en_US.lang"
tile.utilitycraft:example_solar_generator.name=Example Solar Generator\n§o§9@UC: Addon Template
entity.utilitycraft:example_solar_generator.name=Example Solar Generator
ui.utilitycraft:info.example_solar_generator=Generates §sDorios Energy§8 during daytime while the block above it is air. It pauses at night, under a solid block or when its energy storage is full. It needs no item, liquid or gas IO.
```

## 6. Test the conditions

1. Place the generator during daytime with air directly above it.
2. Confirm the texture turns on and stored energy increases.
3. Connect an energy consumer or network and confirm energy leaves the internal buffer.
4. Put a block directly above the generator and confirm production stops.
5. Remove it and set the time to night; confirm production remains stopped with the daylight warning.
6. Disconnect consumption, fill the energy buffer, and confirm it reports `Energy Full` without overfilling.
7. Break and replace the generator in Survival; confirm stored energy is restored.

Continue with [Fuel Generator](./fuel-generator).
