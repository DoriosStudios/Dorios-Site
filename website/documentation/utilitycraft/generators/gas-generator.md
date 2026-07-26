---
title: Gas Generator
sidebar_position: 5
description: Extend Generator in ExampleCore and convert fixed Example Hydrogen storage into Dorios Energy.
---

# Gas Generator

The Example Gas Turbine demonstrates when an addon-owned subclass is useful. DoriosCore's `Generator` continues to own the helper entity, energy, IO, scheduling, displays, and cleanup. `ExampleGasGenerator` adds only the meaning of its fuel gas and the conversion operation.

DoriosCore remains unchanged. In a real extension, rename `ExampleCore` to an addon-owned name such as `MYADDON_CORE`.

## 1. Prepare Example Hydrogen

The turbine requires the complete resource from [Fluids and gases](../registries/fluids-gases):

- gas type `example_hydrogen`
- filled and empty gas capsules
- `registerGasItem()` and `registerGasHolder()` mappings
- display items and textures `utilitycraft:example_hydrogen_00` through `_48`
- BP entity `utilitycraft:gas_tank_example_hydrogen`
- matching RP client entity and texture

Missing display items cause `GasStorage.display()` to report an invalid item identifier. Missing physical entities prevent the gas from appearing in world tanks.

## 2. Create the addon-owned class

```js title="BP/scripts/ExampleCore/machinery/ExampleGasGenerator.js"
// @ts-check

import { GasStorage, Generator } from "DoriosCore/index.js";

/** Generator specialization that owns one fixed gas fuel. */
export class ExampleGasGenerator extends Generator {
  /**
   * @param {import("@minecraft/server").Block} block
   * @param {import("DoriosCore/index.js").GeneratorSettings & {
   *   fuelGas?: string,
   *   energyPerGasUnit?: number
   * }} settings
   */
  constructor(block, settings) {
    super(block, settings);
    if (!this.valid) return;

    this.gas = GasStorage.initializeSingle(this.entity);
    this.fuelGas = settings.fuelGas ?? "example_hydrogen";
    this.energyPerGasUnit = Math.max(
      1,
      settings.energyPerGasUnit ?? 40,
    );

    if (this.gas.type === "empty") {
      this.gas.setType(this.fuelGas);
    }
  }

  /** Returns a player-facing problem or undefined when generation can run. */
  getFuelProblem() {
    if (this.gas.get() <= 0) return "No Gas";
    if (this.gas.type !== this.fuelGas) return "Invalid Gas";
    if (this.energy.getFreeSpace() <= 0) return "Energy Full";
    if (this.energy.getFreeSpace() < this.energyPerGasUnit) {
      return `Needs ${this.energyPerGasUnit} DE Free Space`;
    }
    return undefined;
  }

  /** Burns only enough gas to satisfy rate, fuel, and free-space limits. */
  burnGas() {
    if (this.getFuelProblem()) return 0;

    const consumed = Math.min(
      Math.floor(this.gas.get()),
      Math.floor(this.rate / this.energyPerGasUnit),
      Math.floor(this.energy.getFreeSpace() / this.energyPerGasUnit),
    );

    if (consumed <= 0) return 0;

    const produced = consumed * this.energyPerGasUnit;
    this.gas.consume(consumed);
    this.energy.add(produced);
    return produced;
  }
}
```

### Class-owned settings

| Setting | Default | Meaning |
| --- | ---: | --- |
| `fuelGas` | `example_hydrogen` | Exact gas type accepted by this subclass. |
| `energyPerGasUnit` | `40` | Dorios Energy produced per gas storage unit. Values below `1` become `1`. |

The subclass calls `super()` first and checks `valid` before creating `GasStorage`. Its `burnGas()` method contains one conversion rule that can be tested independently from block events and UI code.

Export it from the addon-owned core:

```js title="BP/scripts/ExampleCore/index.js"
export * from "./machinery/ExampleGasGenerator.js";
```

## 3. Configure the block

```json title="BP/blocks/examples/example_gas_turbine.json"
{
  "description": {
    "identifier": "utilitycraft:example_gas_turbine",
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
    "utilitycraft:gas_container": {},
    "utilitycraft:example_gas_turbine": {
      "entity": {
        "name": "example_gas_turbine",
        "type": "gas_generator",
        "inventory_size": 9,
        "fixed_gas_types": true
      },
      "generator": {
        "energy_cap": 128000,
        "rate_speed_base": 100,
        "gas_cap": 16000,
        "gas_types": 1
      },
      "fuelGas": "example_hydrogen",
      "energyPerGasUnit": 40
    },
    "minecraft:tick": {
      "interval_range": [4, 4]
    },
    "tag:dorios:generator": {},
    "tag:dorios:io": {},
    "tag:utilitycraft:io.example_gas_turbine": {},
    "tag:dorios:energy": {},
    "tag:dorios:gas": {}
  }
}
```

`fuelGas` and `energyPerGasUnit` are extra settings read by `ExampleGasGenerator`; they are not built-in DoriosCore `Generator` fields.

`fixed_gas_types: true` keeps the gas type tag when the amount reaches zero. The constructor assigns `example_hydrogen`, so normal IO cannot replace it with Example Exhaust or another gas.

Keep the complete template block's six face textures, cardinal rotations, on-state permutation, collision, mining settings, and tags.

## Slot and index layout

| Kind | Slot or index | Purpose |
| --- | ---: | --- |
| Energy display | slot `0` | Stored Dorios Energy. |
| Label | slot `1` | Live turbine status. |
| Gas display | slot `2` | Hydrogen frame item. |
| Gas storage | index `0` | Actual gas amount and type. |
| Gas IO buttons | slots `3–8` | Six relative faces. |

## 4. Register gas IO

```js title="BP/scripts/examples/generators/gasTurbine.js"
// @ts-check

import {
  EnergyStorage,
  GasStorage,
  registerIOInterface,
} from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
import { ExampleGasGenerator } from "ExampleCore/index.js";

const BLOCK_ID = "utilitycraft:example_gas_turbine";
const GAS_INDEX = 0;
const GAS_DISPLAY_SLOT = 2;
const GAS_IO_BUTTON_SLOTS = [3, 8];

registerIOInterface(BLOCK_ID, {
  gases: {
    buttonSlots: GAS_IO_BUTTON_SLOTS,
    anyInputIndices: [GAS_INDEX],
    anyOutputIndices: [],
    modes: [
      { id: "disabled" },
      { id: "fuel", inputIndices: [GAS_INDEX] },
    ],
  },
});
```

Gas configuration uses `gases`, `inputIndices`, and storage index `0`. The six UI button slots remain inventory slots `3–8`.

## 5. Connect the block lifecycle

```js title="BP/scripts/examples/generators/gasTurbine.js"
DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    ExampleGasGenerator.spawnEntity(event, settings, () => {
      const generator = new ExampleGasGenerator(event.block, {
        ...settings,
        ignoreTick: true,
      });
      if (!generator.valid) return;
      generator.gas.display(GAS_DISPLAY_SLOT);
    });
  },

  onTick({ block }, { params: settings }) {
    const generator = new ExampleGasGenerator(block, settings);
    if (!generator.valid) return;

    generator.processIO();
    generator.energy.transferToNetwork(generator.rate * 4);
    generator.gas.display(GAS_DISPLAY_SLOT);

    const problem = generator.getFuelProblem();
    if (problem) {
      generator.off();
      generator.displayEnergy();
      generator.setLabel(`§r§e${problem}`);
      return;
    }

    const produced = generator.burnGas();
    const producedPerTick = produced / generator.processingInterval;

    generator.gas.display(GAS_DISPLAY_SLOT);
    generator.on();
    generator.displayEnergy();
    generator.setLabel([
      "§r§aGas Turbine Running",
      `§r§7Hydrogen: §f${GasStorage.formatGas(generator.gas.get())}`,
      `§r§7Produced: §f${EnergyStorage.formatEnergyToText(producedPerTick)}/t`,
    ]);
  },

  onPlayerBreak(event) {
    ExampleGasGenerator.onDestroy(event);
  },
});
```

Static methods are inherited, so `ExampleGasGenerator.spawnEntity()` and `.onDestroy()` use the same DoriosCore lifecycle as `Generator`.

The `ignoreTick: true` instance is created only inside the post-spawn callback to initialize its fixed type and first display immediately. Ordinary tick instances remain scheduler-controlled.

## 6. Add the gas UI

```json title="RP/ui/example_machinery.json"
{
  "gas_turbine_top": {
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
        "fuel@uc.fluid_bar": {
          "$collection_index": 2,
          "$has_bg": false,
          "offset": [54, 0]
        }
      },
      {
        "io@uc.io_tab": {
          "$has_item_io": false,
          "$has_fluid_io": false,
          "$has_gas_io": true,
          "$io_gases_modes_description": "ui.utilitycraft:io.example_gas_turbine.gases",
          "$io_top_texture": "textures/blocks/examples/gas_turbine_off_up",
          "$io_left_texture": "textures/blocks/examples/gas_turbine_off_west",
          "$io_front_texture": "textures/blocks/examples/gas_turbine_off_north",
          "$io_right_texture": "textures/blocks/examples/gas_turbine_off_east",
          "$io_bottom_texture": "textures/blocks/examples/gas_turbine_off_down",
          "$io_back_texture": "textures/blocks/examples/gas_turbine_off_south",
          "$io_gas_top_index": 3,
          "$io_gas_left_index": 4,
          "$io_gas_front_index": 5,
          "$io_gas_right_index": 6,
          "$io_gas_bottom_index": 7,
          "$io_gas_back_index": 8
        }
      },
      {
        "info@uc.info_tab": {
          "$info_description": "ui.utilitycraft:info.example_gas_turbine"
        }
      }
    ]
  }
}
```

UI Core uses the generic `uc.fluid_bar` renderer for the gas frame item. Gas IO is still configured independently with `$has_gas_io`, `$io_gases_*`, and `$io_gas_*` variables.

The template already routes `entity.utilitycraft:example_gas_turbine.name` to this panel and supplies:

```properties title="RP/texts/en_US.lang"
tile.utilitycraft:example_gas_turbine.name=Example Gas Turbine\n§o§9@UC: Addon Template
entity.utilitycraft:example_gas_turbine.name=Example Gas Turbine
ui.utilitycraft:info.example_gas_turbine=Consumes §uExample Hydrogen§8 to generate §sDorios Energy§8. Each gas unit provides 40 DE, and generation pauses when the gas tank is empty or energy storage is full.
ui.utilitycraft:io.example_gas_turbine.gases=§rGas I/O Modes:\n§r- §vHydrogen Fuel
```

## 7. Test the turbine

1. Insert an Example Hydrogen Capsule and confirm the frame changes without identifier errors.
2. Try Example Exhaust and confirm the fixed tank rejects it.
3. Set one face to `fuel` and pull Hydrogen from an adjacent gas tank.
4. Confirm each consumed gas unit produces exactly `40 DE` in total.
5. Leave less than `40 DE` of free space and confirm the turbine pauses without consuming gas.
6. Fill the energy buffer and confirm the turbine reports `Energy Full`.
7. Break and replace it in Survival and confirm energy and gas storage are restored.

Continue with [Advanced Examples](../advanced/).
