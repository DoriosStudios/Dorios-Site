---
title: Liquid Generator
sidebar_position: 4
description: Convert registered Example Biofuel into Dorios Energy with FluidStorage, fixed liquid type, and six-face liquid IO.
---

# Liquid Generator

The Example Biofuel Generator converts each millibucket of `example_biofuel` into `30 DE`. It has one fixed liquid tank, no item inventory, and six independently configured liquid input faces.

This tutorial uses the template's single-block generator and applies the fixed-type pattern also used by its Biofuel Dynamo. Fixing the tank type prevents another valid liquid from occupying the empty fuel tank.

## 1. Register the resource first

The generator depends on the registrations and assets from [Fluids and gases](../registries/fluids-gases):

- `utilitycraft:example_biofuel_capsule`
- `utilitycraft:example_empty_fluid_capsule`
- liquid type `example_biofuel`
- display items and textures `utilitycraft:example_biofuel_00` through `_48`
- `utilitycraft:fluid_tank_example_biofuel` BP and RP entities

Confirm a capsule can fill and empty a UtilityCraft fluid tank before debugging generation.

## 2. Configure the block

The important part of the template block is:

```json title="BP/blocks/examples/example_biofuel_generator.json"
{
  "description": {
    "identifier": "utilitycraft:example_biofuel_generator",
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
    "utilitycraft:fluid_container": {},
    "utilitycraft:example_biofuel_generator": {
      "entity": {
        "name": "example_biofuel_generator",
        "type": "fluid_generator",
        "inventory_size": 9,
        "fixed_fluid_types": true
      },
      "generator": {
        "energy_cap": 128000,
        "rate_speed_base": 80,
        "fluid_cap": 16000,
        "fluid_types": 1
      }
    },
    "minecraft:tick": {
      "interval_range": [4, 4]
    },
    "tag:dorios:generator": {},
    "tag:dorios:io": {},
    "tag:utilitycraft:io.example_biofuel_generator": {},
    "tag:dorios:energy": {},
    "tag:dorios:fluid": {}
  }
}
```

Add `fixed_fluid_types: true` to the current template block when following this single-purpose version. The component creates one `16,000 mB` tank at liquid index `0` and one `128,000 DE` energy buffer.

The complete template file also has six face textures, cardinal rotations, an on-state permutation, collision, mining settings, and the tool tag. Keep them unchanged.

## Slot and index layout

| Kind | Slot or index | Purpose |
| --- | ---: | --- |
| Energy display | slot `0` | Internal Dorios Energy. |
| Label | slot `1` | Live generator status. |
| Liquid display | slot `2` | Biofuel bar frame. |
| Liquid storage | index `0` | Actual biofuel amount and type. |
| Liquid IO buttons | slots `3–8` | Six relative faces. |

The liquid display slot and liquid storage index are different concepts. `fuel.display(2)` reads tank index `0` and writes its frame item into inventory slot `2`.

## 3. Register liquid IO

```js title="BP/scripts/examples/generators/biofuelGenerator.js"
// @ts-check

import {
  EnergyStorage,
  FluidStorage,
  Generator,
  registerIOInterface,
} from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "utilitycraft:example_biofuel_generator";
const FUEL_TYPE = "example_biofuel";
const ENERGY_PER_MB = 30;
const FLUID_INDEX = 0;
const FLUID_DISPLAY_SLOT = 2;
const LIQUID_IO_BUTTON_SLOTS = [3, 8];

registerIOInterface(BLOCK_ID, {
  liquids: {
    buttonSlots: LIQUID_IO_BUTTON_SLOTS,
    anyInputIndices: [FLUID_INDEX],
    anyOutputIndices: [],
    modes: [
      { id: "disabled" },
      { id: "fuel", inputIndices: [FLUID_INDEX] },
    ],
  },
});
```

`buttonSlots: [3, 8]` resolves to exactly six slots. Liquid policies use tank indices, so `inputIndices: [0]` is correct; using display slot `2` there would route to a nonexistent third tank.

## 4. Spawn fixed storage

Continue in the same file:

```js title="BP/scripts/examples/generators/biofuelGenerator.js"
function spawnBiofuelGenerator(event, settings) {
  Generator.spawnEntity(event, settings, (entity) => {
    const fuel = FluidStorage.initializeSingle(entity);
    if (fuel.type === "empty") fuel.setType(FUEL_TYPE);
    fuel.display(FLUID_DISPLAY_SLOT);
  });
}
```

The constant-type tag comes from `fixed_fluid_types`. Assigning `example_biofuel` once means normal IO rejects other liquid types even when the amount reaches zero.

## 5. Convert only usable fuel

Complete the component:

```js title="BP/scripts/examples/generators/biofuelGenerator.js"
DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    spawnBiofuelGenerator(event, settings);
  },

  onTick({ block }, { params: settings }) {
    const generator = new Generator(block, settings);
    if (!generator.valid) return;

    generator.processIO();
    generator.energy.transferToNetwork(generator.rate * 4);

    const fuel = FluidStorage.initializeSingle(generator.entity);
    fuel.display(FLUID_DISPLAY_SLOT);

    if (fuel.type !== FUEL_TYPE || fuel.get() <= 0) {
      generator.off();
      generator.displayEnergy();
      generator.setLabel("§r§eNeeds Example Biofuel");
      return;
    }

    if (generator.energy.getFreeSpace() <= 0) {
      generator.off();
      generator.displayEnergy();
      generator.setLabel("§r§eEnergy Full");
      return;
    }

    const consumed = Math.min(
      Math.floor(fuel.get()),
      Math.floor(generator.rate / ENERGY_PER_MB),
      Math.floor(generator.energy.getFreeSpace() / ENERGY_PER_MB),
    );

    if (consumed <= 0) {
      generator.off();
      generator.displayEnergy();
      generator.setLabel("§r§eNeeds 30 DE Free Space");
      return;
    }

    const produced = consumed * ENERGY_PER_MB;
    fuel.consume(consumed);
    generator.energy.add(produced);
    const producedPerTick = produced / generator.processingInterval;

    fuel.display(FLUID_DISPLAY_SLOT);
    generator.on();
    generator.displayEnergy();
    generator.setLabel([
      "§r§aBiofuel Generator Running",
      `§r§7Fuel: §f${FluidStorage.formatFluid(fuel.get())}`,
      `§r§7Produced: §f${EnergyStorage.formatEnergyToText(producedPerTick)}/t`,
    ]);
  },

  onPlayerBreak(event) {
    Generator.onDestroy(event);
  },
});
```

The three limits are whole stored millibuckets, the scheduled energy budget converted to millibuckets, and free capacity converted to millibuckets. If only `1 mB` remains, the generator produces `30 DE` and consumes exactly that millibucket. If the energy buffer has room for only `15 DE`, it pauses until at least `30 DE` is free.

FluidStorage uses whole millibucket scoreboard values. Keeping consumption integral prevents a fractional request from rounding into an extra consumed millibucket. Never consume fuel before calculating the complete storable conversion.

## 6. Display fuel and IO

The template's standard panel uses slot `2` and the liquid fuel outline:

```json title="RP/ui/example_machinery.json"
{
  "biofuel_generator_top": {
    "type": "collection_panel",
    "size": [162, 72],
    "offset": [-10, -40],
    "collection_name": "container_items",
    "$item_collection_name": "container_items",
    "controls": [
      { "machine_name@uc.machine_name": {} },
      { "machine_screen@uc.machine_small_screen": {} },
      {
        "machine_description@uc.text_label": {
          "collection_index": 1,
          "anchor_from": "top_left",
          "anchor_to": "top_left",
          "size": [48, 48],
          "$text_scale": 0.55,
          "offset": [14, 12]
        }
      },
      { "energy_bar@uc.energy_bar": { "offset": [32, 0], "$has_bg": false } },
      {
        "fuel@uc.liquid_fuel_bar": {
          "$collection_index": 2,
          "$has_bg": false,
          "offset": [54, 0]
        }
      },
      {
        "io@uc.io_tab": {
          "$has_item_io": false,
          "$has_fluid_io": true,
          "$has_gas_io": false,
          "$io_fluids_modes_description": "ui.utilitycraft:io.example_biofuel_generator.liquids",
          "$io_top_texture": "textures/blocks/examples/biofuel_generator_off_up",
          "$io_left_texture": "textures/blocks/examples/biofuel_generator_off_west",
          "$io_front_texture": "textures/blocks/examples/biofuel_generator_off_north",
          "$io_right_texture": "textures/blocks/examples/biofuel_generator_off_east",
          "$io_bottom_texture": "textures/blocks/examples/biofuel_generator_off_down",
          "$io_back_texture": "textures/blocks/examples/biofuel_generator_off_south",
          "$io_fluid_top_index": 3,
          "$io_fluid_left_index": 4,
          "$io_fluid_front_index": 5,
          "$io_fluid_right_index": 6,
          "$io_fluid_bottom_index": 7,
          "$io_fluid_back_index": 8
        }
      },
      {
        "info@uc.info_tab": {
          "$info_description": "ui.utilitycraft:info.example_biofuel_generator"
        }
      }
    ]
  }
}
```

UI Core retains the older `$has_fluid_io`, `$io_fluids_*`, and `$io_fluid_*` names. The DoriosCore registration uses `liquids`. This distinction is intentional.

The template already routes `entity.utilitycraft:example_biofuel_generator.name` to this panel and supplies:

```properties title="RP/texts/en_US.lang"
tile.utilitycraft:example_biofuel_generator.name=Example Biofuel Generator\n§o§9@UC: Addon Template
entity.utilitycraft:example_biofuel_generator.name=Example Biofuel Generator
ui.utilitycraft:info.example_biofuel_generator=Consumes §gExample Biofuel§8 to generate §sDorios Energy§8. Each liquid unit provides 30 DE, and generation pauses when the tank is empty or energy storage is full.
ui.utilitycraft:io.example_biofuel_generator.liquids=§rLiquid I/O Modes:\n§r- §vBiofuel Input
```

## 7. Test liquid generation

1. Fill the generator with an Example Biofuel Capsule.
2. Confirm other registered liquids are rejected by the fixed tank.
3. Configure one face as `fuel` and pull biofuel from an adjacent tank.
4. Confirm every `1 mB` consumed produces `30 DE` in total.
5. Leave less than `30 DE` free and verify the generator pauses without consuming a millibucket.
6. Disable the face and confirm automatic transfer stops.
7. Break and replace the generator; verify energy and liquid are preserved in resource lore.

Continue with [Gas Generator](./gas-generator).
