---
id: multiblock-generator
title: MultiblockGenerator class
sidebar_label: MultiblockGenerator
sidebar_position: 11
description: Build active or passive multiblock generators with component-derived storage, fill behavior, and activation hooks.
---

# MultiblockGenerator class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`MultiblockGenerator` extends [`Generator`](./generator) with multiblock detection, validation, activation, and controller spawning.

```js
import { Multiblock, MultiblockGenerator } from "DoriosCore/index.js";
```

## Definition

<div class="api-signature">

`class MultiblockGenerator extends Generator`

</div>

## Configuration

```ts
interface GeneratorSettings {
  required_case: string;
  requirements?: Record<string, Requirement>;
  entity: MachineEntityConfig;
  generator: {
    rate_speed_base?: number;
    energy_cap?: number;
    fluid_cap?: number;
    fluid_types?: number;
    gas_cap?: number;
    gas_types?: number;
  };
  fillBlocksConfig?: { blockId?: string };
  deactivateConfig?: { blockId?: string };
  missingEnergyWarning?: string;
  ignoreTick?: boolean;
}
```

| Setting | Description |
| --- | --- |
| `required_case` | Exact tag accepted on the outer casing. Required for a functioning scan. |
| `requirements` | Minimum component counts and player-facing warnings. |
| `entity` | Controller helper identifier, inventory, localization, ranges, and fixed resource-type options. |
| `generator.rate_speed_base` | Average generation or transfer rate per vanilla tick. |
| `generator.energy_cap` | Initial energy capacity before structure activation. |
| `generator.fluid_cap`, `fluid_types` | Per-storage liquid capacity and indexed storage count. |
| `generator.gas_cap`, `gas_types` | Per-storage gas capacity and indexed storage count. |
| `fillBlocksConfig.blockId` | Block used to replace air inside the detected bounds during activation. Defaults to water when the config object is present without an ID. |
| `deactivateConfig.blockId` | Filled block removed during explicit deactivation. |
| `missingEnergyWarning` | When provided, activation fails if recognized energy components produce zero capacity. |
| `ignoreTick` | Bypasses the shared scheduler. |

## Constructor

### new MultiblockGenerator(block, config)

<div class="api-signature">

`new MultiblockGenerator(block: Block, config: GeneratorSettings)`

</div>

Creates a generator runtime for a controller block.

| Parameter | Type | Description |
| --- | --- | --- |
| `block` | `Block` | Controller block whose helper entity is resolved. |
| `config` | `GeneratorSettings` | Complete generator and multiblock configuration. |

Unlike `MultiblockMachine`, validity does not require `dorios:state` to be `on`. A generator may need to tick while inactive for displays or control logic.

```js
const generator = new MultiblockGenerator(block, CONFIG);
if (!generator.valid) return;

const active =
  generator.entity.getDynamicProperty(Multiblock.Constants.STATE_PROPERTY_ID) ===
  Multiblock.Constants.ACTIVE_STATE_VALUE;
if (!active) return;
```

Add the state check when the addon must not generate or consume resources before successful activation.

## Properties and inherited API

| Property | Type | Description |
| --- | --- | --- |
| `config` | `GeneratorSettings` | Full config on a valid instance. |
| `settings` | `GeneratorSettings` | Alias for `config`. |

The class inherits `energy`, `rate`, `baseRate`, `setRate()`, `processIO()`, `on()`, `off()`, `setLabel()`, display helpers, output-mode methods, and destruction behavior from [`Generator`](./generator).

## Controller lifecycle

### defaultOnInteractWithoutWrench(context)

<div class="api-signature">

`MultiblockGenerator.defaultOnInteractWithoutWrench(context: { entity?: Entity; player: Player }): void`

</div>

When a controller entity exists, tells the player to use a wrench to scan and activate the multiblock. A missing entity produces no message.

### spawnEntity(event, config, callback)

<div class="api-signature">

`MultiblockGenerator.spawnEntity(event: PlacementEventLike, config: GeneratorSettings, callback?: (entity: Entity) => void): void`

</div>

Spawns the helper entity half a block below the controller center and initializes generator storage.

| Parameter | Type | Description |
| --- | --- | --- |
| `event.block` | `Block` | Placed controller block. |
| `event.player` | `Player` | Player whose held controller item may contain preserved resources. |
| `event.permutationToPlace` | `BlockPermutation` | Part of the shared placement event contract. |
| `config` | `GeneratorSettings` | Generator, entity, storage, and multiblock settings. |
| `callback` | `(entity: Entity) => void` | Optional callback invoked on the following scheduled tick. |

The method:

- sets the configured initial energy capacity;
- creates every configured liquid and gas manager and assigns per-storage capacity;
- restores all indexed energy, liquid, and gas lore from the held item;
- draws the energy display and first liquid display;
- selects the fluid/gas generator entity event when required;
- initializes gas IO state;
- invokes the optional callback.

### handlePlayerInteract(event, config, handlers)

<div class="api-signature">

```ts
MultiblockGenerator.handlePlayerInteract(
  event: InteractionEventLike,
  config: GeneratorSettings,
  handlers?: InteractionHandlers<GeneratorSettings, ActivationContext<GeneratorSettings>>,
): Promise<unknown>
```

</div>

Handles controller interaction and wrench detection.

| Handler | Description |
| --- | --- |
| `initializeEntity(entity, context)` | Runs only after this interaction spawned a missing controller entity. |
| `onInteractWithoutWrench(context)` | Runs when the held item ID does not contain `wrench`. Defaults to the standard instruction message. |
| `onActivate(context)` | Runs after structure validation and shared activation. Returning `false` deactivates and cancels success. It may be asynchronous. |
| `successMessages` | Message array or callback returning messages from the activation context. |

When the entity already exists, the method calls `activateGeneratorController()` directly and returns its result.

### activateGeneratorController(event, config, entity, handlers)

<div class="api-signature">

```ts
MultiblockGenerator.activateGeneratorController(
  event: InteractionEventLike,
  config: GeneratorSettings,
  entity: Entity,
  handlers?: Pick<
    InteractionHandlers<GeneratorSettings, ActivationContext<GeneratorSettings>>,
    "onActivate" | "successMessages"
  >,
): Promise<ActivationContext<GeneratorSettings> | undefined>
```

</div>

Runs the complete generator activation flow:

1. Deactivates existing state using `config.deactivateConfig`.
2. Detects the structure using `config.required_case`.
3. Validates `config.requirements`.
4. Activates ports and applies `config.fillBlocksConfig`.
5. Calculates energy capacity from recognized components.
6. Rejects zero capacity when `missingEnergyWarning` is configured.
7. Runs the addon activation callback.
8. Sends successful activation messages.

Returns the activation context on success or `undefined` when detection, validation, energy validation, or an addon callback cancels activation.

```ts
interface ActivationContext<TConfig> {
  block: Block;
  components: Record<string, number>;
  config: TConfig;
  settings: TConfig;
  energyCap: number;
  entity: Entity;
  player: Player;
  structure: DetectedStructure;
}
```

### validateRequirements(components, requirements)

<div class="api-signature">

`MultiblockGenerator.validateRequirements(components: Record<string, number>, requirements: Record<string, Requirement>): Requirement | undefined`

</div>

Returns the first requirement whose detected count is too low, or `undefined` when every requirement passes.

## Component-derived generator behavior

DoriosCore automatically derives energy capacity only for keys listed in `Multiblock.Constants.ENERGY_PER_UNIT`. Other detected component keys remain available to `onActivate`.

Use `onActivate` to calculate addon-owned values such as:

- liquid or gas capacity per internal cell;
- burn rate per heating component;
- transfer rate as a fraction of energy capacity;
- passive generation per solar or thermal component;
- venting and cooling limits;
- custom dynamic properties used by the tick simulation.

```js
onActivate({ entity, components, energyCap, structure }) {
  const gasCapacity = (components.gas_cell ?? 0) * 128_000;
  const exhaustRate = (components.vent ?? 0) * 250;

  entity.setDynamicProperty("example:gas_capacity", gasCapacity);
  entity.setDynamicProperty("example:exhaust_rate", exhaustRate);
  entity.setDynamicProperty("example:volume", JSON.stringify(structure.bounds));
  entity.setDynamicProperty("dorios:rateSpeed", Math.max(100, energyCap / 10_000));
}
```

## Filled structures

For reactor-like generators:

```js
const CONFIG = {
  // ...entity, generator, casing, and requirements
  fillBlocksConfig: { blockId: "minecraft:water" },
  deactivateConfig: { blockId: "minecraft:water" },
};
```

`ActivationManager.fillBlocks()` only replaces air. `DeactivationManager.emptyBlocks()` reads cleanup bounds from `reactorStats.bounds`, so an activation callback that relies on this cleanup must persist them:

```js
onActivate({ entity, structure }) {
  entity.setDynamicProperty(
    "reactorStats",
    JSON.stringify({ bounds: structure.bounds }),
  );
}
```

## Example: liquid-fueled dynamo

```js
import * as DoriosLib from "DoriosLib/index.js";
import {
  EnergyStorage,
  FluidStorage,
  Multiblock,
  MultiblockGenerator,
  registerLinkNodeIO,
} from "DoriosCore/index.js";

const BLOCK_ID = "example:biofuel_dynamo";
const CONFIG = {
  required_case: "dorios:multiblock.case.example",
  entity: {
    identifier: "example:multiblock_generator",
    type: "fluid_generator",
    inventory_size: 5,
    fixed_fluid_types: true,
  },
  generator: {
    energy_cap: 1,
    fluid_cap: 64_000,
    fluid_types: 1,
    rate_speed_base: 400,
  },
  requirements: {
    energy_cell: {
      amount: 1,
      warning: "§r§c[Dynamo] Add at least one energy cell.",
    },
    fluid_cell: {
      amount: 1,
      warning: "§r§c[Dynamo] Add at least one fluid cell.",
    },
  },
  missingEnergyWarning: "§r§c[Dynamo] The structure needs energy capacity.",
};

registerLinkNodeIO(BLOCK_ID, {
  liquids: {
    anyInputIndices: [0],
    anyOutputIndices: [],
    inputs: [{ id: "fuel", label: "Biofuel Input", indices: [0] }],
    outputs: [],
  },
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  onPlayerInteract(event) {
    return MultiblockGenerator.handlePlayerInteract(event, CONFIG, {
      onActivate({ entity, components }) {
        const fuel = FluidStorage.initializeSingle(entity);
        fuel.setType("example_biofuel");
        fuel.setCap((components.fluid_cell ?? 0) * 128_000);
      },
      successMessages: ["§r§a[Dynamo] Structure activated."],
    });
  },

  onPlayerBreak({ block, player }) {
    Multiblock.DeactivationManager.handleBreakController(block, player);
  },

  onTick({ block }) {
    const generator = new MultiblockGenerator(block, CONFIG);
    if (!generator.valid) return;

    const active =
      generator.entity.getDynamicProperty(Multiblock.Constants.STATE_PROPERTY_ID) ===
      Multiblock.Constants.ACTIVE_STATE_VALUE;
    if (!active) return;

    generator.processIO();
    generator.energy.transferToNetwork(generator.rate);

    const fuel = FluidStorage.initializeSingle(generator.entity);
    generator.displayEnergy();
    fuel.display(4);
    const produced = Math.min(
      generator.rate,
      generator.energy.getFreeSpace(),
      fuel.get() * 45,
    );

    if (fuel.getType() !== "example_biofuel" || produced <= 0) {
      generator.off();
      generator.setLabel([
        "§r§eDynamo Waiting",
        `§r§7Fuel: §f${FluidStorage.formatFluid(fuel.get())}`,
      ]);
      return;
    }

    fuel.consume(produced / 45);
    generator.energy.add(produced);
    generator.on();
    generator.setLabel([
      "§r§aDynamo Running",
      `§r§7Stored: §f${EnergyStorage.formatEnergyToText(generator.energy.get())}`,
      `§r§7Fuel: §f${FluidStorage.formatFluid(fuel.get())}`,
      `§r§7Generated: §f${EnergyStorage.formatEnergyToText(produced)}/t`,
    ]);
  },
});
```

See the complete [Biofuel Dynamo template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/multiblocks/biofuelDynamo.js) and [Heavy Machinery Power Condenser](https://github.com/DoriosStudios/UtilityCraft-Heavy-Machinery/blob/main/BP/scripts/machinery/generators/power_condenser.js).

## Remarks

- Check active state explicitly when generation must stop before activation or after deactivation.
- `onActivate` is the correct place for addon-specific capacities and component formulas.
- Register liquid and gas ports with [`registerLinkNodeIO`](./link-node-io); UtilityCore owns network discovery and routing.
- Keep custom behavior in an addon-owned class such as `ExampleCore/ExampleMultiblockGenerator.js`. Do not modify DoriosCore.
