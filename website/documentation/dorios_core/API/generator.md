---
id: generator
title: Generator class
sidebar_label: Generator
sidebar_position: 4
description: Energy-producing runtime with resource preservation and transfer-mode controls.
---

# Generator class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`Generator` is the standard runtime for energy-producing blocks. It supplies scheduler-aware rates, energy storage, optional indexed liquid and gas tanks, IO processing, resource-preserving placement and destruction, and an energy-transfer mode form.

```js
import { Generator } from "DoriosCore/index.js";
```

## Definition

<div class="api-signature">

`class Generator extends BasicMachine`

</div>

```text
BasicMachine
└─ Generator
   └─ MultiblockGenerator
```

## Constructor

### new Generator(block, settings)

<div class="api-signature">

`new Generator(block: Block, settings: GeneratorSettings)`

</div>

| Parameter | Type | Description |
| --- | --- | --- |
| `block` | `Block` | Generator block in the world. |
| `settings` | `GeneratorSettings` | Entity, generation-rate, storage, and optional multiblock configuration. |

The base rate is `settings.generator.rate_speed_base ?? 0`. As with every `BasicMachine` subclass, check `valid` before using runtime properties.

```js
const generator = new Generator(block, settings);
if (!generator.valid) return;
```

## GeneratorSettings

```ts
interface GeneratorSettings {
  entity: MachineEntityConfig;
  generator: GeneratorRuntimeConfig;
  spawn_offset?: Vector3;
  rotation?: boolean;
  ignoreTick?: boolean;
  requirements?: Record<string, Requirement>;
  required_case?: string;
  fillBlocksConfig?: FillBlocksConfig;
  deactivateConfig?: FillBlocksConfig;
  missingEnergyWarning?: string;
}
```

### GeneratorRuntimeConfig

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `rate_speed_base` | `number` | No | Energy generation rate per ordinary tick before scheduler scaling. Defaults to `0`. |
| `energy_cap` | `number` | No | Generator energy capacity. |
| `fluid_cap` | `number` | No | Capacity assigned to every configured liquid tank. |
| `fluid_types` | `number` | No | Number of indexed liquid tanks. Defaults to `1` when liquid storage exists. |
| `gas_cap` | `number` | No | Capacity assigned to every configured gas tank. |
| `gas_types` | `number` | No | Number of indexed gas tanks. Defaults to `1` when gas storage exists. |

The entity-related properties have the same meaning as [`MachineSettings`](./machine#machinesettings).

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `settings` | `GeneratorSettings` | Original settings supplied to the valid runtime. |

All scheduler, block, entity, inventory, energy, rate, UI, progress, and IO properties are inherited from [`BasicMachine`](./basic-machine).

## Static methods

### Generator.spawnEntity(event, config, callback)

<div class="api-signature">

`Generator.spawnEntity(event: PlacementEventLike, config: GeneratorSettings, callback?: (entity: Entity) => void): void`

</div>

Queues creation and initialization of a generator helper entity.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `event.block` | `Block` | Yes | Block receiving the helper entity. |
| `event.player` | `Player` | Yes | Player placing the generator; its held item may contain preserved resources. |
| `event.permutationToPlace` | `BlockPermutation` | Yes | Placed block permutation used when notifying adjacent systems. |
| `config` | `GeneratorSettings` | Yes | Helper entity and generator storage configuration. |
| `callback` | `(entity: Entity) => void` | No | Runs after storage and IO setup, before registered interface buttons are finalized. |

The method initializes energy capacity, creates every configured liquid and gas index, restores preserved resource lore, prepares IO documents, runs the callback, installs interfaces, and notifies adjacent UtilityCore-managed networks.

```js
beforeOnPlayerPlace(event, { params: settings }) {
  Generator.spawnEntity(event, settings, (entity) => {
    const generator = new Generator(event.block, {
      ...settings,
      ignoreTick: true,
    });
    if (!generator.valid) return;
    generator.displayEnergy();
  });
}
```

### Generator.onDestroy(event)

<div class="api-signature">

`Generator.onDestroy(event: DestroyEventLike): boolean`

</div>

| Parameter | Type | Description |
| --- | --- | --- |
| `event.block` | `Block` | Generator block being destroyed. |
| `event.brokenBlockPermutation` | `BlockPermutation` | Supplies the preserved block item ID. |
| `event.player` | `Player | undefined` | Player responsible for the break when available. |
| `event.dimension` | `Dimension` | Dimension containing the block and helper entity. |

Returns `false` when no helper entity exists. Otherwise queues inventory drops, scheduler release, helper removal, and a generator item containing serialized energy and every liquid/gas tank.

### Generator.addNearbyMachines(entity)

<div class="api-signature">

`Generator.addNearbyMachines(entity: Entity): void`

</div>

:::warning Deprecated
Network tags are rebuilt through real placed blocks and UtilityCore's update flow. Do not register all six adjacent positions for new generators.
:::

Adds legacy `pos:[x,y,z]` tags for all six neighboring block locations.

### Generator.openGeneratorTransferModeMenu(entity, player)

<div class="api-signature">

`Generator.openGeneratorTransferModeMenu(entity: Entity, player: Player): void`

</div>

Opens a localized modal form and stores the selected value in the entity's `transferMode` dynamic property.

| Parameter | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Generator helper entity that owns the transfer mode. |
| `player` | `Player` | Player shown the form and confirmation action bar. |

Available values:

| Mode | Behavior |
| --- | --- |
| `nearest` | Prioritize the nearest compatible targets. |
| `farthest` | Prioritize the farthest compatible targets. |
| `round` | Distribute across targets in round-robin order. |

The method returns immediately if either parameter is missing. Closing the form leaves the existing mode unchanged; invalid selections fall back to `nearest`.

## Inherited methods

`Generator` uses these inherited methods directly:

- `processIO()` for item, liquid, and gas face transfers.
- `on()` and `off()` for active block state.
- `setLabel()` for UI status.
- `displayEnergy()` and `displayProgress()` for standard UI slots.
- `setRate()` when an addon needs to adjust the effective base generation rate.

See [`BasicMachine`](./basic-machine) for every inherited signature.

## Example: passive generator

```js
import { EnergyStorage, Generator } from "DoriosCore/index.js";

function tick(block, settings) {
  const generator = new Generator(block, settings);
  if (!generator.valid) return;

  generator.processIO();

  const produced = generator.energy.add(generator.rate);
  generator.energy.transferToNetwork(generator.rate * 4);

  if (produced <= 0) {
    generator.off();
    generator.setLabel("§eEnergy Full");
    generator.displayEnergy();
    return;
  }

  generator.on();
  generator.displayEnergy();
  generator.setLabel([
    "§aGenerator Running",
    `§7Produced: §f${EnergyStorage.formatEnergyToText(produced)}`,
  ]);
}
```

For gas-fueled generation, see the [Gas Turbine example](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/generators/gasTurbine.js).
