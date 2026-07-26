---
title: Fuel Generator
sidebar_position: 3
description: Build an item-fueled generator with one addon-owned fuel table shared with UtilityCraft's fuel registry.
---

# Fuel Generator

The simplest way to make Example Biomass work in UtilityCraft's existing Furnator is the `registerFuel()` call from the registry guide. A custom generator needs one additional decision: how its own script reads the energy value.

UtilityCraft does not expose its complete internal fuel table through a public getter. Keep one table in your addon, register that table with UtilityCraft, and read the same table from your generator. This avoids importing UtilityCraft internals or maintaining two different values.

## 1. Share one fuel definition

Replace the template's direct biomass registration in `config/integrations.js` with an exported table and exact lookup helper:

```js title="BP/scripts/config/integrations.js"
// @ts-check

import * as DoriosLib from "DoriosLib/index.js";

export const EXAMPLE_SOLID_FUELS = Object.freeze({
  "utilitycraft:example_biomass": 12000,
});

DoriosLib.registry.registerFuel(EXAMPLE_SOLID_FUELS);

/** Returns total burn energy for an addon-owned fuel, or zero when invalid. */
export function getExampleFuelValue(itemTypeId) {
  return EXAMPLE_SOLID_FUELS[itemTypeId] ?? 0;
}

// Keep the template's Sieve, Auto Fisher, and Plant registrations below.
```

Now one Example Biomass supplies exactly `12,000 DE` in both UtilityCraft's Furnator and this custom generator. The lookup uses an exact namespaced ID; it does not use substring or wildcard matching.

Do not leave the previous `registerFuel()` block in the file as a second registration. There should be one registration using `EXAMPLE_SOLID_FUELS`.

## 2. Create the generator block

Duplicate the template's `example_biofuel_generator.json` and its six off/on face textures, then rename them for `example_biomass_generator`. Keep the cardinal-direction permutations and change the machine-specific parts to:

```json title="BP/blocks/examples/example_biomass_generator.json"
{
  "description": {
    "identifier": "utilitycraft:example_biomass_generator",
    "menu_category": { "category": "construction" },
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
    "utilitycraft:example_biomass_generator": {
      "entity": {
        "name": "example_biomass_generator",
        "type": "generator",
        "inventory_size": 10
      },
      "generator": {
        "energy_cap": 128000,
        "rate_speed_base": 60
      }
    },
    "minecraft:tick": {
      "interval_range": [4, 4]
    },
    "tag:dorios:generator": {},
    "tag:dorios:io": {},
    "tag:utilitycraft:io.example_biomass_generator": {},
    "tag:dorios:energy": {}
  }
}
```

This is the relevant `minecraft:block` content, not a complete replacement for the copied file. Keep its `format_version`, geometry, material instances, rotations, on-state textures, collision, mining, and tool tag.

## Slot layout

| Slot | Purpose |
| ---: | --- |
| `0` | Energy display written by DoriosCore. |
| `1` | Generator label. |
| `2` | Fuel burn bar frame. |
| `3` | Solid fuel input. |
| `4–9` | Top, left, front, right, bottom, and back item IO buttons. |

The highest slot is `9`, so `inventory_size` must be `10`.

## 3. Register item IO

```js title="BP/scripts/examples/generators/biomassGenerator.js"
// @ts-check

import { EnergyStorage, Generator, registerIOInterface } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
import { getExampleFuelValue } from "../../config/integrations.js";

const BLOCK_ID = "utilitycraft:example_biomass_generator";
const FUEL_BAR_SLOT = 2;
const FUEL_INPUT_SLOT = 3;
const ITEM_IO_BUTTON_SLOTS = [4, 9];

registerIOInterface(BLOCK_ID, {
  items: {
    buttonSlots: ITEM_IO_BUTTON_SLOTS,
    anyInputSlots: [FUEL_INPUT_SLOT],
    anyOutputSlots: [],
    modes: [
      { id: "disabled" },
      { id: "fuel", inputSlots: [FUEL_INPUT_SLOT] },
    ],
  },
});
```

`fuel` is an existing UtilityCraft IO mode used by the Furnator. It routes only into slot `3`; the generator has no item output mode.

## 4. Track one burn cycle

Continue in the same file:

```js title="BP/scripts/examples/generators/biomassGenerator.js"
const BURN_REMAINING_PROPERTY = "utilitycraft:example_burn_remaining";
const BURN_TOTAL_PROPERTY = "utilitycraft:example_burn_total";

function readPositiveNumber(entity, propertyId) {
  const value = Number(entity.getDynamicProperty(propertyId) ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function displayFuelBar(entity, remaining, total) {
  const ratio = total > 0 ? remaining / total : 0;
  const frame = Math.max(0, Math.min(13, Math.floor(ratio * 13)));

  DoriosLib.entity.setNewItem(entity, {
    slot: FUEL_BAR_SLOT,
    typeId: `utilitycraft:fuel_bar_${frame}`,
    amount: 1,
    nameTag: " ",
  });
}
```

`remaining` is the unconverted energy left in the consumed item. `total` is its original value and only exists to calculate frames `0–13`.

## 5. Produce energy safely

```js title="BP/scripts/examples/generators/biomassGenerator.js"
DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    Generator.spawnEntity(event, settings, (entity) => {
      displayFuelBar(entity, 0, 0);
    });
  },

  onTick({ block }, { params: settings }) {
    const generator = new Generator(block, settings);
    if (!generator.valid) return;

    generator.processIO();
    generator.energy.transferToNetwork(generator.rate * 4);

    const { entity, container, energy } = generator;
    let remaining = readPositiveNumber(entity, BURN_REMAINING_PROPERTY);
    let total = readPositiveNumber(entity, BURN_TOTAL_PROPERTY);

    if (energy.getFreeSpace() <= 0) {
      generator.off();
      generator.displayEnergy();
      displayFuelBar(entity, remaining, total);
      generator.setLabel("§r§eEnergy Full");
      return;
    }

    if (remaining <= 0) {
      const fuelItem = container.getItem(FUEL_INPUT_SLOT);
      const fuelValue = getExampleFuelValue(fuelItem?.typeId);

      if (fuelValue <= 0) {
        generator.off();
        generator.displayEnergy();
        displayFuelBar(entity, 0, 0);
        generator.setLabel("§r§eNeeds Valid Fuel");
        return;
      }

      remaining = fuelValue;
      total = fuelValue;
      DoriosLib.entity.changeItemAmount(entity, {
        slot: FUEL_INPUT_SLOT,
        amount: -1,
      });
    }

    const produced = Math.min(
      generator.rate,
      energy.getFreeSpace(),
      remaining,
    );

    remaining -= produced;
    energy.add(produced);
    const producedPerTick = produced / generator.processingInterval;
    entity.setDynamicProperty(BURN_REMAINING_PROPERTY, remaining);
    entity.setDynamicProperty(BURN_TOTAL_PROPERTY, total);

    displayFuelBar(entity, remaining, total);
    generator.on();
    generator.displayEnergy();
    generator.setLabel([
      "§r§aBiomass Generator Running",
      `§r§7Fuel remaining: §f${EnergyStorage.formatEnergyToText(remaining)}`,
      `§r§7Produced: §f${EnergyStorage.formatEnergyToText(producedPerTick)}/t`,
    ]);
  },

  onPlayerBreak(event) {
    Generator.onDestroy(event);
  },
});
```

The generator checks free capacity before consuming a new item. During an active cycle it converts only `min(rate, free space, remaining fuel)`, so neither stored energy nor fuel debt can become negative.

The active burn remainder lives on the helper entity. As with UtilityCraft's Furnator cycle, breaking the block after an item has started burning does not reconstruct the partially consumed item. Stored Dorios Energy and inventory items are still preserved by `Generator.onDestroy()`.

## 6. Add the UI

Use the standard controls and exact slot indices:

```json title="RP/ui/example_machinery.json"
{
  "biomass_generator_top": {
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
      { "energy_bar@uc.energy_bar": { "offset": [54, 0], "$has_bg": false } },
      {
        "fuel_input@uc.fuel_slot": {
          "collection_index": 3,
          "anchor_from": "top_middle",
          "anchor_to": "top_middle",
          "offset": [10, 30]
        }
      },
      {
        "fuel_display@uc.item_display": {
          "collection_index": 2,
          "anchor_from": "top_middle",
          "anchor_to": "top_middle",
          "offset": [10, 48]
        }
      },
      {
        "io@uc.io_tab": {
          "$has_item_io": true,
          "$has_fluid_io": false,
          "$has_gas_io": false,
          "$io_items_modes_description": "ui.utilitycraft:io.example_biomass_generator.items",
          "$io_top_texture": "textures/blocks/examples/biomass_generator_off_up",
          "$io_left_texture": "textures/blocks/examples/biomass_generator_off_west",
          "$io_front_texture": "textures/blocks/examples/biomass_generator_off_north",
          "$io_right_texture": "textures/blocks/examples/biomass_generator_off_east",
          "$io_bottom_texture": "textures/blocks/examples/biomass_generator_off_down",
          "$io_back_texture": "textures/blocks/examples/biomass_generator_off_south",
          "$io_item_top_index": 4,
          "$io_item_left_index": 5,
          "$io_item_front_index": 6,
          "$io_item_right_index": 7,
          "$io_item_bottom_index": 8,
          "$io_item_back_index": 9
        }
      },
      {
        "info@uc.info_tab": {
          "$info_description": "ui.utilitycraft:info.example_biomass_generator"
        }
      }
    ]
  }
}
```

Add the panel alias:

```json title="RP/ui/example_machinery.json"
{
  "biomass_generator_utility_panel@example_ui.utility_panel_template": {
    "$machine_top": "example_ui.biomass_generator_top"
  }
}
```

Route the helper title:

```json title="RP/ui/chest_screen.json"
{
  "array_name": "variables",
  "operation": "insert_back",
  "value": [
    {
      "requires": "($temp_container_title = 'entity.utilitycraft:example_biomass_generator.name')",
      "$screen_content": "example_ui.biomass_generator_utility_panel",
      "$screen_bg_content": "common.screen_background"
    }
  ]
}
```

Add its names and tab descriptions:

```properties title="RP/texts/en_US.lang"
tile.utilitycraft:example_biomass_generator.name=Example Biomass Generator\n§o§9@UC: Addon Template
entity.utilitycraft:example_biomass_generator.name=Example Biomass Generator
ui.utilitycraft:info.example_biomass_generator=Consumes §gExample Biomass§8 to generate §sDorios Energy§8. One item provides 12,000 DE and continues burning until its stored value reaches zero.
ui.utilitycraft:io.example_biomass_generator.items=§rItem I/O Modes:\n§r- §vFuel Input
```

## 7. Load and test

Add `import "./biomassGenerator.js";` to `examples/generators/index.js`, then test:

1. Example Biomass works in UtilityCraft's Furnator and provides `12,000 DE`.
2. An invalid item remains in slot `3` and produces no energy.
3. A valid item is consumed only when the internal buffer has room.
4. The fuel bar decreases from frame `13` to `0`.
5. All six faces accept items only in `fuel` mode.
6. The generator stops at full capacity and resumes after energy is transferred.

Continue with [Liquid Generator](./liquid-generator).
