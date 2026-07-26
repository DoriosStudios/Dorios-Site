---
title: Gas IO
sidebar_position: 5
description: Configure independent gas input and output tanks using the template's Example Gas Reactor and GasStorage.
---

# Gas IO

The Example Gas Reactor demonstrates two fixed gas tanks:

```text
gas index 0: Example Hydrogen input
gas index 1: Example Exhaust output
```

Each tank has its own type, amount, capacity, display slot, and per-face routing policy. Gas storage remains separate from liquid storage even though both use indexed tanks.

## Gas Reactor layout

| Kind | Index or slot | Purpose |
| --- | ---: | --- |
| Energy, label, progress | `0–2` | Standard machine displays. |
| Item slot | `3` | Iron catalyst input. |
| Item slot | `4` | Crystal shard output. |
| Gas index | `0` | Hydrogen input tank. |
| Gas index | `1` | Exhaust output tank. |
| Gas display slots | `5–6` | Hydrogen and Exhaust bar frame items. |
| Upgrade slots | `7–9` | Speed, energy cost, and batch. |
| Item IO buttons | `10–15` | Six item faces. |
| Gas IO buttons | `16–21` | Six gas faces. |

The highest inventory slot is `21`, so the helper entity requires `inventory_size: 22`.

## 1. Give the block two gas tanks

Inside `minecraft:block.components`, use:

```json title="BP/blocks/examples/example_gas_reactor.json"
{
  "utilitycraft:example_gas_reactor": {
    "entity": {
      "type": "gas_machine",
      "inventory_size": 22,
      "fixed_gas_types": true
    },
    "machine": {
      "energy_cap": 96000,
      "energy_cost": 1400,
      "rate_speed_base": 50,
      "gas_cap": 16000,
      "gas_types": 2,
      "upgrades": [7, 8, 9]
    }
  },
  "utilitycraft:gas_container": {},
  "tag:dorios:gas": {}
}
```

| Property | Meaning |
| --- | --- |
| `type: "gas_machine"` | Uses the shared gas-compatible machine helper entity. |
| `gas_cap: 16000` | Capacity of each gas tank. |
| `gas_types: 2` | Creates gas indices `0` and `1`. |
| `fixed_gas_types: true` | Preserves the assigned type when a tank reaches zero. |
| `utilitycraft:gas_container` | Enables gas-container interactions. |
| `tag:dorios:gas` | Identifies the block as a gas endpoint. |

Fixed types are useful when one tank must always accept Hydrogen and the other must always hold Exhaust.

## 2. Register separate gas modes

```js title="BP/scripts/examples/machines/gasReactor.js"
import {
  GasStorage,
  Machine,
  registerIOInterface,
} from "DoriosCore/index.js";

const BLOCK_ID = "utilitycraft:example_gas_reactor";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
const HYDROGEN_INDEX = 0;
const EXHAUST_INDEX = 1;
const HYDROGEN_DISPLAY_SLOT = 5;
const EXHAUST_DISPLAY_SLOT = 6;
const ITEM_IO_BUTTON_SLOTS = [10, 15];
const GAS_IO_BUTTON_SLOTS = [16, 21];

registerIOInterface(BLOCK_ID, {
  items: {
    buttonSlots: ITEM_IO_BUTTON_SLOTS,
    anyInputSlots: [INPUT_SLOT],
    anyOutputSlots: [OUTPUT_SLOT],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputSlots: [INPUT_SLOT] },
      { id: "output_1", outputSlots: [OUTPUT_SLOT] },
    ],
  },
  gases: {
    buttonSlots: GAS_IO_BUTTON_SLOTS,
    anyInputIndices: [HYDROGEN_INDEX],
    anyOutputIndices: [EXHAUST_INDEX],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputIndices: [HYDROGEN_INDEX] },
      { id: "output_1", outputIndices: [EXHAUST_INDEX] },
    ],
  },
});
```

The gas policy exposes Hydrogen only as input and Exhaust only as output. Automation cannot insert gas into the Exhaust tank through `input_1`, and it cannot extract Hydrogen through `output_1`.

Gas and liquid button slots can never be shared. If a machine supports both resources, each needs its own six-slot range.

## 3. Initialize fixed tank types

Initialize both indexed tanks in the spawn callback:

```js
Machine.spawnEntity(event, settings, (entity) => {
  const tanks = GasStorage.initializeMultiple(entity, 2);

  tanks[0]?.setType("example_hydrogen");
  tanks[1]?.setType("example_exhaust");

  tanks[0]?.display(HYDROGEN_DISPLAY_SLOT);
  tanks[1]?.display(EXHAUST_DISPLAY_SLOT);
});
```

`initializeMultiple(entity, 2)` returns the managers in index order. Optional chaining protects the setup if the helper entity is not compatible or has not exposed the expected count.

On normal ticks, reload the same indices and restore fixed types only if required:

```js
const [hydrogen, exhaust] = GasStorage.initializeMultiple(machine.entity, 2);
if (!hydrogen || !exhaust) return;

if (hydrogen.type === "empty") hydrogen.setType("example_hydrogen");
if (exhaust.type === "empty") exhaust.setType("example_exhaust");

hydrogen.display(HYDROGEN_DISPLAY_SLOT);
exhaust.display(EXHAUST_DISPLAY_SLOT);
```

For every property and transfer method, see the technical [GasStorage reference](../../dorios_core/API/gas-storage).

## 4. Process gas transfers

Call the shared IO processor after the validity guard:

```js
const machine = new Machine(block, settings);
if (!machine.valid) return;

machine.processIO();
```

Gas faces are evaluated independently from item and liquid faces. The default total gas budget is `2500` units per call. It can be limited without changing item IO:

```js
machine.processIO({
  maxGasMovedPerTick: 1000,
});
```

## 5. Consume input and produce output gas

The reactor consumes `250` Hydrogen and creates `100` Exhaust per craft:

```js
const HYDROGEN_PER_CRAFT = 250;
const EXHAUST_PER_CRAFT = 100;

if (
  hydrogen.type !== "example_hydrogen"
  || hydrogen.get() < HYDROGEN_PER_CRAFT
) {
  machine.showWarning("Needs Hydrogen", {
    resetProgress: false,
  });
  return;
}

if (exhaust.getFreeSpace() < EXHAUST_PER_CRAFT) {
  machine.showWarning("Exhaust Full", {
    resetProgress: false,
  });
  return;
}
```

After every validation succeeds, mutate both tanks together:

```js
hydrogen.consume(craftCount * HYDROGEN_PER_CRAFT);
exhaust.add(craftCount * EXHAUST_PER_CRAFT);

hydrogen.display(HYDROGEN_DISPLAY_SLOT);
exhaust.display(EXHAUST_DISPLAY_SLOT);
```

Checking Exhaust free space before consuming Hydrogen prevents resource loss when the output tank is full.

## 6. Display both gases and their IO page

Gas frame items use the generic bar renderer:

```json title="RP/ui/example_machinery.json"
[
  {
    "hydrogen@uc.fluid_bar": {
      "$collection_index": 5,
      "$has_bg": false,
      "offset": [31, 0]
    }
  },
  {
    "exhaust@uc.fluid_bar": {
      "$collection_index": 6,
      "$has_bg": false,
      "offset": [49, 0]
    }
  }
]
```

`uc.fluid_bar` is a generic vertical resource-bar renderer. Using it does not turn gas storage into liquid storage; the displayed items were generated by `GasStorage`.

Enable the gas page and map its six button slots:

```json
{
  "io@uc.io_tab": {
    "$has_item_io": true,
    "$has_fluid_io": false,
    "$has_gas_io": true,
    "$io_items_modes_description": "ui.utilitycraft:io.example_gas_reactor.items",
    "$io_gases_modes_description": "ui.utilitycraft:io.example_gas_reactor.gases",
    "$io_top_texture": "textures/blocks/examples/gas_reactor_off_up",
    "$io_left_texture": "textures/blocks/examples/gas_reactor_off_west",
    "$io_front_texture": "textures/blocks/examples/gas_reactor_off_north",
    "$io_right_texture": "textures/blocks/examples/gas_reactor_off_east",
    "$io_bottom_texture": "textures/blocks/examples/gas_reactor_off_down",
    "$io_back_texture": "textures/blocks/examples/gas_reactor_off_south",
    "$io_item_top_index": 10,
    "$io_item_left_index": 11,
    "$io_item_front_index": 12,
    "$io_item_right_index": 13,
    "$io_item_bottom_index": 14,
    "$io_item_back_index": 15,
    "$io_gas_top_index": 16,
    "$io_gas_left_index": 17,
    "$io_gas_front_index": 18,
    "$io_gas_right_index": 19,
    "$io_gas_bottom_index": 20,
    "$io_gas_back_index": 21
  }
}
```

Add the localized legend:

```properties title="RP/texts/en_US.lang"
ui.utilitycraft:io.example_gas_reactor.items=§rItem I/O Modes:\n§r- §9Catalyst Input\n§r- §cProduct Output
ui.utilitycraft:io.example_gas_reactor.gases=§rGas I/O Modes:\n§r- §9Hydrogen Input\n§r- §cExhaust Output
```

## Custom-gas display requirement

`GasStorage.display()` expects the complete frame sequence for each type:

```text
utilitycraft:example_hydrogen_00 ... utilitycraft:example_hydrogen_48
utilitycraft:example_exhaust_00  ... utilitycraft:example_exhaust_48
```

Each identifier needs a Behavior Pack item and a Resource Pack texture entry. Custom tank visuals also require the corresponding tank entity and client-entity texture setup. Missing frames cause an invalid item identifier error when the UI refreshes.

The [Fluids and gases registry](../registries/fluids-gases) tutorial covers creating and registering these resources. Machine IO only decides which indexed tank a face may access.

## Test gas IO

1. Supply Hydrogen from a compatible gas endpoint.
2. Set the touching gas face to `input_1` and confirm only tank `0` fills.
3. Insert an Iron Ingot catalyst and give the reactor energy.
4. Confirm Hydrogen falls while Exhaust rises.
5. Configure another face as `output_1` and confirm it drains only Exhaust.
6. Fill or block the Exhaust destination and confirm the recipe pauses before consuming more Hydrogen.
7. Set both gas faces to `disabled` and confirm automatic transfers stop while stored values remain intact.

For advanced inspection of persisted gas policies, see [Gas IO documents](../../dorios_core/API/gas-io). Continue with [Machine Upgrades](../machine-upgrades/).
