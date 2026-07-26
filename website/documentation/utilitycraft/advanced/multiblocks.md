---
title: Multiblock Machines
sidebar_position: 5
description: Build a wrench-activated processing multiblock with validated casing, internal components, ports, energy, progress, and UI.
---

# Multiblock Machines

A multiblock machine uses one controller block and one helper entity, but calculates its behavior from a complete rectangular structure. This guide builds the Factory Crusher pattern from the UtilityCraft Addon Template.

The finished controller:

- scans a rectangular casing when used with a wrench;
- requires an internal energy cell and processing module;
- activates item and energy ports in its outer shell;
- derives energy capacity, batch size, speed, and efficiency from internal components;
- processes items with energy and a progress display;
- deactivates when the controller or casing is broken.

## How structure detection works

DoriosCore discovers the bounds from the controller. It does not require one hard-coded size, but every detected position must follow these rules:

| Position | Accepted block |
| --- | --- |
| Controller position | The configured controller block. |
| Every other outer-shell position | A block with the exact tag in `required_case`. |
| Outer-shell port | A link node that also has the exact casing tag. |
| Interior | Air, a liquid, or a block tagged `dorios:multiblock_component`. |
| Any other position | Invalidates the scan and reports its coordinates. |

The controller must touch casing horizontally so the scanner can discover the first axes. For a first test, use a small rectangular shell with the controller replacing one casing block and place the required components inside.

## Files used by the controller

```text
BP/
├── blocks/multiblocks/
│   ├── factory_crusher.json
│   ├── casing.json
│   ├── energy_cell.json
│   ├── processing_module.json
│   ├── speed_module.json
│   ├── efficiency_module.json
│   ├── item_port.json
│   └── energy_port.json
├── entities/
│   └── myaddon_multiblock_machine.json
└── scripts/examples/multiblocks/
    ├── index.js
    ├── factoryCrusher.js
    └── linkNodePort.js

RP/
├── ui/
│   ├── chest_screen.json
│   └── myaddon_machinery.json
└── texts/en_US.lang
```

The normal BP/RP block assets, texture atlas entries, item catalog entries, and localization are still required. Start from the working template files rather than rebuilding those shared patterns from memory.

## 1. Define casing and internal components

The casing needs only the exact casing tag used by the controller:

```json title="BP/blocks/multiblocks/casing.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "myaddon:casing",
      "menu_category": { "category": "construction" }
    },
    "components": {
      "minecraft:geometry": "minecraft:geometry.full_block",
      "minecraft:material_instances": {
        "*": {
          "texture": "myaddon_casing",
          "render_method": "alpha_test"
        }
      },
      "tag:dorios:multiblock.case.myaddon": {}
    }
  }
}
```

Every block counted inside the structure uses the shared component tag:

```json title="BP/blocks/multiblocks/energy_cell.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "myaddon:energy_cell",
      "menu_category": { "category": "construction" }
    },
    "components": {
      "minecraft:geometry": "minecraft:geometry.full_block",
      "minecraft:material_instances": {
        "*": {
          "texture": "myaddon_energy_cell",
          "render_method": "alpha_test"
        }
      },
      "tag:dorios:multiblock_component": {}
    }
  }
}
```

Create the processing, speed, and efficiency module blocks with the same tag. The detected component key is the block identifier without its namespace:

| Block ID | Key in `components` |
| --- | --- |
| `myaddon:energy_cell` | `energy_cell` |
| `myaddon:processing_module` | `processing_module` |
| `myaddon:speed_module` | `speed_module` |
| `myaddon:efficiency_module` | `efficiency_module` |

Use unique suffixes when several addons may appear in the same structure. The template uses keys such as `example_energy_cell` so its custom components cannot be mistaken for built-in Heavy Machinery components.

## 2. Create the controller block

The controller needs a tick, the registered custom component, and resource tags matching what it stores:

```json title="BP/blocks/multiblocks/factory_crusher.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "myaddon:factory_crusher",
      "menu_category": { "category": "construction" },
      "traits": {
        "minecraft:placement_direction": {
          "enabled_states": ["minecraft:cardinal_direction"],
          "y_rotation_offset": 180
        }
      }
    },
    "components": {
      "minecraft:geometry": "minecraft:geometry.full_block",
      "minecraft:material_instances": {
        "*": {
          "texture": "myaddon_factory_crusher_side",
          "render_method": "alpha_test"
        },
        "north": {
          "texture": "myaddon_factory_crusher_north",
          "render_method": "alpha_test"
        },
        "up": {
          "texture": "myaddon_factory_crusher_up",
          "render_method": "alpha_test"
        },
        "down": {
          "texture": "myaddon_factory_crusher_down",
          "render_method": "alpha_test"
        }
      },
      "minecraft:tick": { "interval_range": [2, 2] },
      "myaddon:factory_crusher": {},
      "minecraft:destructible_by_mining": { "seconds_to_destroy": 2 },
      "minecraft:destructible_by_explosion": false,
      "tag:dorios:machine": {},
      "tag:dorios:energy": {},
      "tag:dorios:item": {}
    }
  }
}
```

Add the cardinal rotation permutations from the template so the front texture follows placement direction. Those visual permutations do not change multiblock detection.

## 3. Create an addon-owned helper entity

Copy the template's [`BP/entities/example_multiblock_machine.json`](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/entities/example_multiblock_machine.json) into your addon and give it a unique identifier such as `myaddon:multiblock_machine`.

Do not replace it with the shared single-block `utilitycraft:machine_entity`. The addon-owned multiblock helper must define all events and groups requested by the controller configuration.

For the Factory Crusher, verify that the copied entity provides:

| Contract | Required value |
| --- | --- |
| Identifier | `myaddon:multiblock_machine` |
| Machine event | `utilitycraft:simple_machine` because `entity.type` below is `simple_machine`. |
| Inventory event | `utilitycraft:inventory_5` because `inventory_size` is `5`. |
| Family while active | Includes `dorios:multiblock`, energy-container, and container families. |
| Visibility events | `utilitycraft:show` and `utilitycraft:hide`. |
| Properties | `utilitycraft:players` and `utilitycraft:tick_group`. |

The event name is not inferred from a family. If `entity.type` requests an event absent from this entity, spawning fails with an `InvalidArgumentError`. Keep the copied groups and events that your controller actually uses.

## 4. Configure the controller

```js title="BP/scripts/examples/multiblocks/factoryCrusher.js"
// @ts-check

import { ItemStack } from "@minecraft/server";
import {
  EnergyStorage,
  Multiblock,
  MultiblockMachine,
  registerLinkNodeIO,
} from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

const BLOCK_ID = "myaddon:factory_crusher";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
const BASE_COST = 1_200;

const CONFIG = {
  required_case: "dorios:multiblock.case.myaddon",
  entity: {
    identifier: "myaddon:multiblock_machine",
    type: "simple_machine",
    name: "factory_crusher",
    inventory_size: 5,
    input_range: /** @type {[number, number]} */ ([INPUT_SLOT, INPUT_SLOT]),
    output_range: /** @type {[number, number]} */ ([OUTPUT_SLOT, OUTPUT_SLOT]),
  },
  machine: {
    rate_speed_base: 100,
    energy_cap: 0,
  },
  requirements: {
    energy_cell: {
      amount: 1,
      warning: "§r§c[Factory Crusher] Add at least one Energy Cell inside.",
    },
    processing_module: {
      amount: 1,
      warning: "§r§c[Factory Crusher] Add one Processing Module inside.",
    },
  },
};
```

### Configuration fields

| Field | Meaning |
| --- | --- |
| `required_case` | Exact tag required at every outer-shell position except the controller. |
| `entity.identifier` | Addon-owned helper entity spawned for this controller. |
| `entity.type` | Event suffix supported by that entity. |
| `entity.name` | Inventory-title suffix used to route the Resource Pack UI. |
| `inventory_size` | Helper inventory size and inventory event suffix. |
| `input_range` / `output_range` | Slots used by shared item IO. |
| `rate_speed_base` | Average base work performed per vanilla tick. |
| `energy_cap` | Initial capacity before structure components are calculated. |
| `requirements` | Minimum detected component counts and player-facing failures. |

The requirement keys must match the namespace-free detected component keys exactly.

## 5. Register item routes

Add this immediately after `CONFIG` and before the block component registration:

```js title="BP/scripts/examples/multiblocks/factoryCrusher.js"
registerLinkNodeIO(BLOCK_ID, {
  items: {
    anyInputSlots: [INPUT_SLOT],
    anyOutputSlots: [OUTPUT_SLOT],
    inputs: [
      {
        id: "material",
        label: "Material Input",
        color: "§9",
        slots: [INPUT_SLOT],
      },
    ],
    outputs: [
      {
        id: "product",
        label: "Product Output",
        color: "§c",
        slots: [OUTPUT_SLOT],
      },
    ],
  },
});
```

This defines controller storage routes. The physical item and energy ports come from [Ports and Link Nodes](./ports-link-nodes).

## 6. Add recipes and addon component formulas

The template keeps the recipe table in the concrete controller script:

```js title="BP/scripts/examples/multiblocks/factoryCrusher.js"
const RECIPES = Object.freeze({
  "minecraft:cobblestone": {
    output: "minecraft:gravel",
    amount: 1,
  },
  "minecraft:gravel": {
    output: "minecraft:sand",
    amount: 1,
  },
  "myaddon:crystal_shard": {
    output: "minecraft:amethyst_shard",
    amount: 2,
  },
});

function createAddonStats(components) {
  const processing = Math.max(1, components.processing_module ?? 0);
  const speed = Math.max(0, components.speed_module ?? 0);
  const efficiency = Math.max(0, components.efficiency_module ?? 0);

  const batch = 1 + processing;
  const speedMultiplier = 1 + speed * 0.25;
  const energyMultiplier = Math.max(
    0.35,
    1 + speed * 0.15 + processing * 0.2 - efficiency * 0.12,
  );

  return {
    raw: { processing, speed, efficiency },
    processing: {
      amount: batch,
      penalty: 1 + processing * 0.2,
    },
    speed: {
      multiplier: speedMultiplier,
      penalty: 1 + speed * 0.15,
    },
    efficiency: {
      multiplier: Math.max(0.35, 1 - efficiency * 0.12),
    },
    energyMultiplier,
  };
}

function readStats(entity) {
  const value = entity.getDynamicProperty("components");
  return typeof value === "string"
    ? JSON.parse(value)
    : createAddonStats({});
}
```

DoriosCore understands its built-in multiblock component keys. These formulas belong in the addon because the blocks and balancing are addon-owned. `onActivate` will calculate and persist them after every successful scan.

## 7. Register activation, processing, and teardown

Continue in the same file:

```js title="BP/scripts/examples/multiblocks/factoryCrusher.js"
DoriosLib.registry.blockComponent(BLOCK_ID, {
  onPlayerInteract(event) {
    return MultiblockMachine.handlePlayerInteract(event, CONFIG, {
      onActivate({ entity, components }) {
        const capacity = (components.energy_cell ?? 0) * 2_000_000;
        EnergyStorage.setCap(entity, capacity);
        entity.setDynamicProperty("dorios:energyCap", capacity);

        const stats = createAddonStats(components);
        entity.setDynamicProperty("components", JSON.stringify(stats));
      },
      successMessages({ components }) {
        const capacity = (components.energy_cell ?? 0) * 2_000_000;
        return [
          "§r§a[Factory Crusher] Structure activated.",
          `§r§7Energy capacity: §b${EnergyStorage.formatEnergyToText(capacity)}`,
          "§r§7Use a port to choose its IO route.",
        ];
      },
    });
  },

  onPlayerBreak({ block, player }) {
    Multiblock.DeactivationManager.handleBreakController(block, player);
  },

  onTick({ block }) {
    const machine = new MultiblockMachine(block, CONFIG);
    if (!machine.valid) return;

    machine.processIO();

    const stats = readStats(machine.entity);
    machine.setRateMultiplier(stats.speed.multiplier);
    machine.setEnergyCost(BASE_COST);

    const input = machine.container.getItem(INPUT_SLOT);
    const recipe = input ? RECIPES[input.typeId] : undefined;

    if (!input || !recipe) {
      machine.setProgress(0);
      machine.displayProgress();
      machine.displayEnergy();
      showStatus(machine, stats, "§r§eNo Recipe");
      return;
    }

    const output = machine.container.getItem(OUTPUT_SLOT);
    const maximumByInput = Math.min(
      input.amount,
      stats.processing.amount,
    );
    const maximumByOutput = output
      ? output.typeId === recipe.output
        ? Math.floor((output.maxAmount - output.amount) / recipe.amount)
        : 0
      : Math.floor(64 / recipe.amount);
    const batch = Math.min(maximumByInput, maximumByOutput);

    if (batch <= 0) {
      machine.displayProgress();
      machine.displayEnergy();
      showStatus(machine, stats, "§r§eOutput Full");
      return;
    }

    const totalCost = BASE_COST * batch * stats.energyMultiplier;
    machine.setEnergyCost(totalCost);

    const remaining = totalCost - machine.getProgress();
    const spent = Math.min(machine.energy.get(), machine.rate, remaining);

    if (spent > 0) {
      machine.energy.consume(spent);
      machine.addProgress(spent);
    }

    if (machine.getProgress() >= totalCost) {
      input.amount -= batch;
      machine.container.setItem(
        INPUT_SLOT,
        input.amount > 0 ? input : undefined,
      );

      const result = output
        ?? new ItemStack(recipe.output, batch * recipe.amount);
      if (output) result.amount += batch * recipe.amount;
      machine.container.setItem(OUTPUT_SLOT, result);
      machine.setProgress(0, { display: false });
    }

    machine.displayProgress();
    machine.displayEnergy();
    showStatus(
      machine,
      { ...stats, cost: totalCost },
      spent > 0 ? "§r§aRunning" : "§r§eNo Energy",
    );
  },
});

function showStatus(machine, stats, status) {
  machine.setLabel([
    `§r${MultiblockMachine.getMachineInfoLabel(stats, status)}`,
    `§r${MultiblockMachine.getEnergyInfoLabel(machine)}`,
  ]);
}
```

### Lifecycle explained

| Stage | What happens |
| --- | --- |
| First wrench interaction | A missing addon-owned helper entity is spawned and initialized. |
| Scan | DoriosCore discovers bounds, validates every position, and counts interior components. |
| Requirement validation | The first missing required component sends its configured warning. |
| Activation | Ports become active, bounds are stored, and the helper state becomes `on`. |
| `onActivate` | Addon-owned capacities and formulas are applied to the detected component counts. |
| Tick | `MultiblockMachine` is valid only for an active helper and an allowed scheduled update. |
| Processing | IO runs, output space is checked, energy becomes progress, then inputs and outputs change. |
| Break | The controller is deactivated, link nodes reset, networks refresh, and the helper is removed. |

`setRateMultiplier()` always starts from the configured base rate, so calling it every update does not compound the previous multiplier.

## 8. Route the standard UI

The Factory Crusher uses the same UI Core controls as a single-block machine:

| Inventory slot | UI element |
| ---: | --- |
| `0` | Energy bar. |
| `1` | Machine screen label. |
| `2` | Progress display. |
| `3` | Material input. |
| `4` | Product output. |

Create a `factory_crusher_top` panel in your addon UI file with `@uc.machine_name`, `@uc.machine_small_screen`, `@uc.energy_bar`, `@uc.input_slot`, `@uc.progress_display`, `@uc.output_slot`, and `@uc.info_tab`. Do not duplicate `ui_core.json`; reference its `@uc.*` elements as shown in [Machine UI](../machine-ui/).

Route the entity title from `RP/ui/chest_screen.json`:

```json title="RP/ui/chest_screen.json"
{
  "array_name": "variables",
  "operation": "insert_back",
  "value": [
    {
      "requires": "($temp_container_title = 'entity.utilitycraft:factory_crusher.name')",
      "$screen_content": "myaddon_ui.factory_crusher_utility_panel",
      "$screen_bg_content": "common.screen_background"
    }
  ]
}
```

Add the matching localization keys:

```properties title="RP/texts/en_US.lang"
entity.myaddon:multiblock_machine.name=My Addon Multiblock Machine
entity.utilitycraft:factory_crusher.name=Factory Crusher
ui.myaddon:info.factory_crusher=Processes materials in a validated multiblock structure. Internal energy cells increase capacity, while processing, speed, and efficiency modules modify its runtime.
```

`entity.name: "factory_crusher"` in `CONFIG` selects the controller-specific inventory title. The current DoriosCore helper formats that title as `entity.utilitycraft:<name>.name`, so the chest-screen requirement and localization must use `entity.utilitycraft:factory_crusher.name` even when the addon block has another namespace. The helper's base identifier still needs its own fallback localization.

## 9. Load the module

```js title="BP/scripts/examples/multiblocks/index.js"
import "./linkNodePort.js";
import "./factoryCrusher.js";
```

Then import the multiblock index from your examples index or main entry point.

## 10. Build and test the structure

1. Place a rectangular shell using only blocks tagged `dorios:multiblock.case.myaddon`.
2. Replace one shell block with the Factory Crusher controller.
3. Put at least one Energy Cell and one Processing Module inside.
4. Leave every other interior position as air or liquid.
5. Include an item port and energy port in the outer shell.
6. Use the controller with a wrench.
7. Confirm the scan effect appears, the activation messages show the calculated capacity, and the ports become active.
8. Insert cobblestone through the material route and provide energy through the energy port.
9. Confirm the progress bar advances and gravel reaches slot `4` and the product route.
10. Add speed, efficiency, or processing modules and reactivate; verify the displayed statistics change.
11. Break one casing block and confirm the controller and all ports deactivate.
12. Repair the shell and scan again; invalid or outdated state must not process before successful activation.

## Common failures

| Symptom | Check |
| --- | --- |
| No casing structure found | The controller touches the casing horizontally and every shell block has the exact configured tag. |
| Invalid block coordinates | The reported outer position is casing, or the reported inner position is air, liquid, or a tagged component. |
| Missing component warning | Requirement keys match the block suffix after the namespace. |
| Entity event does not exist | The addon-owned helper defines the event requested by `entity.type`. |
| Inventory event error | The helper defines `utilitycraft:inventory_N` for the configured size. |
| Port form finds no machine | The structure is active, the port is in the detected shell, and it has the link-node and casing tags. |
| Wrong port contents | Item routes use inventory slots; liquid and gas routes use storage indices. |
| No custom UI | `entity.name`, localization, chest-screen route, namespace, and panel name match exactly. |
| Machine processes after damage | The casing uses a tag beginning with `dorios:multiblock.case` so the automatic break listener can resolve and deactivate it. |

## Continue from the working projects

- [Factory Crusher source](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/multiblocks/factoryCrusher.js)
- [Biofuel Dynamo source](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/multiblocks/biofuelDynamo.js)
- [Heavy Machinery controller scripts](https://github.com/DoriosStudios/UtilityCraft-Heavy-Machinery/tree/main/BP/scripts/machinery)
- [Technical MultiblockMachine reference](../../dorios_core/API/multiblock-machine)
- [Technical Multiblock facade reference](../../dorios_core/API/multiblock)

The same activation hooks can initialize fluid or gas capacity for a multiblock generator. Use [`MultiblockGenerator`](../../dorios_core/API/multiblock-generator) when the structure produces energy instead of consuming it for item processing.

You have now completed the UtilityCraft extension learning path. Return to the [UtilityCraft Extensions overview](../) or use the [DoriosCore reference](../../dorios_core/) when you need the exact contract for a class or method.
