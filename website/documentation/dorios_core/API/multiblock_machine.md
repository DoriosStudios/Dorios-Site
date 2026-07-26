---
id: multiblock-machine
title: MultiblockMachine class
sidebar_label: MultiblockMachine
sidebar_position: 10
description: Build component-scaled processing controllers with preserved resources, ports, progress, and activation hooks.
---

# MultiblockMachine class

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`MultiblockMachine` is the controller runtime for multiblock structures that consume energy and process items or resources. It extends [`BasicMachine`](./basic-machine), adding structure activation, component-derived stats, controller lifecycle helpers, and energy-cost-based progress.

```js
import { Multiblock, MultiblockMachine } from "DoriosCore/index.js";
```

## Definition

<div class="api-signature">

`class MultiblockMachine extends BasicMachine`

</div>

## Configuration

```ts
interface MachineSettings {
  required_case: string;
  requirements?: Record<string, Requirement>;
  entity: MachineEntityConfig;
  machine: {
    rate_speed_base?: number;
    energy_cap?: number;
    fluid_cap?: number;
    fluid_types?: number;
    gas_cap?: number;
    gas_types?: number;
  };
  ignoreTick?: boolean;
}

interface Requirement {
  amount: number;
  warning: string;
}
```

`required_case` is optional in the shared TypeScript base contract but required for a functioning multiblock scan.

| Setting | Description |
| --- | --- |
| `required_case` | Exact tag required on every casing position except the controller. |
| `requirements` | Minimum detected component counts keyed by namespace-free component ID. |
| `entity.identifier` | Controller helper entity. It must support the multiblock family, events, properties, and required inventory. |
| `entity.inventory_size` | Inventory event suffix/size used by the helper entity. |
| `entity.input_range`, `input_slot` | Optional item input boundaries used by shared machine IO. |
| `entity.output_range`, `output_slot` | Optional item output boundaries used by shared machine IO. |
| `entity.fixed_fluid_types` | Keeps indexed liquid types after their amount reaches zero. |
| `entity.fixed_gas_types` | Keeps indexed gas types after their amount reaches zero. |
| `machine.rate_speed_base` | Average work rate per vanilla tick before scheduler scaling. Defaults to `0`. |
| `machine.energy_cap` | Initial energy capacity before activation-derived overrides. |
| `machine.fluid_cap` | Capacity assigned to every initialized liquid storage. |
| `machine.fluid_types` | Number of indexed liquid storages. Defaults to `1` when liquid capacity is enabled. |
| `machine.gas_cap` | Capacity assigned to every initialized gas storage. |
| `machine.gas_types` | Number of indexed gas storages. Defaults to `1` when gas capacity is enabled. |
| `ignoreTick` | Bypasses `TickScheduler` when `true`. |

## Constructor

### new MultiblockMachine(block, config)

<div class="api-signature">

`new MultiblockMachine(block: Block, config: MachineSettings)`

</div>

Creates a scheduled controller runtime using `config.machine.rate_speed_base`.

| Parameter | Type | Description |
| --- | --- | --- |
| `block` | `Block` | Controller block whose helper entity is resolved. |
| `config` | `MachineSettings` | Complete controller configuration. |

The instance is valid only when:

- the backing helper entity exists;
- the scheduler allows this tick, unless `ignoreTick` is enabled;
- `dorios:state` exists and is not `off`.

Always guard the instance:

```js
const machine = new MultiblockMachine(block, CONFIG);
if (!machine.valid) return;
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `configuredRate` | `number` | Original `rate_speed_base`, before addon multipliers and scheduler scaling. |
| `config` | `MachineSettings` | Full config on a valid active instance. |
| `settings` | `MachineSettings` | Alias for `config`. |

Inherited properties include `entity`, `container`, `energy`, `baseRate`, `rate`, `processingInterval`, and `shouldUpdateUI`.

## Instance methods

### setRateMultiplier(multiplier)

<div class="api-signature">

`setRateMultiplier(multiplier?: number): void`

</div>

Applies a non-compounding multiplier to `configuredRate` and passes the result through `BasicMachine.setRate()`.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `multiplier` | `number` | `1` | Finite multiplier. Negative values become `0`; nonfinite values become `1`. |

Repeated calls always use the configured rate, not the previous multiplied result.

### setProgress(value, options)

<div class="api-signature">

`setProgress(value: number, options?: ProgressOptions): void`

</div>

Stores progress using `options.maxValue` or the energy cost at `options.index` as its maximum, then optionally redraws the progress item.

| Parameter | Type | Description |
| --- | --- | --- |
| `value` | `number` | New process progress. |
| `options.slot` | `number` | Display slot. Defaults through `BasicMachine` to `2`. |
| `options.maxValue` | `number` | Explicit maximum instead of the stored energy cost. |
| `options.display` | `boolean` | Whether to redraw immediately. Defaults to `true`. |
| `options.index` | `number` | Indexed process/property. Defaults to `0`. |
| `options.type` | `string` | Optional progress-frame item prefix. |
| `options.scale` | `number` | Maximum visual frame. |
| `options.legacy` | `boolean` | Uses classic non-padded frame IDs. |

Inherited `getProgress()` and `addProgress()` remain available.

### displayProgress(options)

<div class="api-signature">

`displayProgress(options?: ProgressOptions): void`

`displayProgress(maxValue: number, options?: ProgressOptions): void`

</div>

Draws progress using an explicit numeric maximum, `options.maxValue`, or the energy cost at `options.index`. A missing, zero, or negative maximum does not draw a frame.

### setEnergyCost(value, index)

`setEnergyCost(value: number, index?: number): void` stores the process maximum in `dorios:energy_cost_{index}`. The default index is `0`, and values are clamped to at least `1`.

### getEnergyCost(index)

`getEnergyCost(index?: number): number` returns `dorios:energy_cost_{index}` or `800` when it has not been initialized. The default index is `0`.

## Controller lifecycle

### defaultOnInteractWithoutWrench(context)

<div class="api-signature">

`MultiblockMachine.defaultOnInteractWithoutWrench(context: { entity?: Entity; player: Player }): void`

</div>

Tells the player to use a wrench when a controller entity already exists. It does nothing when no entity exists.

### spawnEntity(event, config, callback)

<div class="api-signature">

`MultiblockMachine.spawnEntity(event: PlacementEventLike, config: MachineSettings, callback?: (entity: Entity) => void): void`

</div>

Spawns and initializes the controller helper entity half a block below the controller center.

| Parameter | Type | Description |
| --- | --- | --- |
| `event.block` | `Block` | Placed controller block. |
| `event.player` | `Player` | Player whose held controller item may contain resource lore. |
| `event.permutationToPlace` | `BlockPermutation` | Placed permutation used to refresh adjacent networks. |
| `config` | `MachineSettings` | Energy, liquid, gas, entity, and IO configuration. |
| `callback` | `(entity: Entity) => void` | Optional post-initialization callback. |

The method initializes energy, every configured liquid and gas storage, restores all indexed resource lore from the held item, selects the combined fluid/gas helper event when necessary, initializes gas IO state, and refreshes adjacent networks.

The callback runs after two ticks. If it throws, DoriosCore retries it once after another two ticks; keep callback initialization idempotent.

### handlePlayerInteract(event, config, handlers)

<div class="api-signature">

```ts
MultiblockMachine.handlePlayerInteract(
  event: InteractionEventLike,
  config: MachineSettings,
  handlers?: InteractionHandlers<MachineSettings, MachineActivationContext>,
): Promise<unknown>
```

</div>

Runs the standard controller interaction pipeline.

| Parameter | Description |
| --- | --- |
| `event` | Controller `block` and interacting `player`. |
| `config` | Complete multiblock machine settings. |
| `handlers.initializeEntity` | Runs only after this interaction had to spawn a missing entity and before scanning. |
| `handlers.onInteractWithoutWrench` | Handles interactions when the held item ID does not contain `wrench`. Defaults to `defaultOnInteractWithoutWrench`. |
| `handlers.onActivate` | Runs after detection, requirement validation, activation, and stat calculation. Returning `false` cancels and deactivates the structure. |
| `handlers.successMessages` | Static message array or callback returning an array from the successful activation context. Empty values are skipped. |

If a helper entity already exists, `initializeEntity` is not called.

### activateMachineController(event, config, entity, handlers)

<div class="api-signature">

```ts
MultiblockMachine.activateMachineController(
  event: InteractionEventLike,
  config: MachineSettings,
  entity: Entity,
  handlers?: Pick<
    InteractionHandlers<MachineSettings, MachineActivationContext>,
    "onActivate" | "successMessages"
  >,
): Promise<MachineActivationContext | undefined>
```

</div>

Deactivates previous structure state, detects the new structure, validates requirements, activates ports, calculates built-in energy capacity and machine stats, stores the stats in the `components` dynamic property, runs `onActivate`, and sends success messages.

Returns the context on success or `undefined` after any failed or cancelled activation.

```ts
interface MachineActivationContext {
  block: Block;
  components: Record<string, number>;
  config: MachineSettings;
  settings: MachineSettings;
  energyCap: number;
  entity: Entity;
  factoryData: MachineStats;
  player: Player;
  structure: DetectedStructure;
}
```

### onDestroy(event)

<div class="api-signature">

`MultiblockMachine.onDestroy(event: DestroyEventLike): boolean`

</div>

Preserves energy and every indexed liquid and gas as item lore, drops the helper inventory, removes the helper entity, and spawns one preserved controller item. In survival, it removes the nearby ordinary controller drop first.

Returns `true` when a controller entity was found and scheduled for removal; otherwise returns `false`.

Use `Multiblock.DeactivationManager.handleBreakController()` to deactivate ports, and use the destruction lifecycle responsible for your controller block to preserve its contents.

## Validation and outputs

### validateRequirements(components, requirements)

<div class="api-signature">

`MultiblockMachine.validateRequirements(components: Record<string, number>, requirements: Record<string, Requirement>): Requirement | undefined`

</div>

Returns the first requirement whose detected amount is less than `requirement.amount`. Returns `undefined` when all requirements pass.

### distributeOutput(controller, outputSlots, itemId, amount, options)

<div class="api-signature">

```ts
MultiblockMachine.distributeOutput(
  controller: MultiblockMachine,
  outputSlots: number[],
  itemId: string,
  amount: number,
  options?: { suppressErrors?: boolean },
): void
```

</div>

Walks `outputSlots` in order. An empty slot receives up to 64 items; a matching partial stack receives up to its remaining `maxAmount`. Incompatible and full slots are skipped.

The method does not return leftover amount. Validate total output capacity before consuming inputs. When `suppressErrors` is `true`, a failure in one slot is ignored and distribution continues.

## Component-derived stats

### computeMachineStats(components)

`MultiblockMachine.computeMachineStats(components: Record<string, number>): MachineStats` recognizes these namespace-free IDs:

| Component key | Normalized count | Effect |
| --- | --- | --- |
| `processing_module` | Minimum `1` | Two operations per unit plus increasing energy penalty. |
| `speed_module` | Minimum `0` | Saturating speed multiplier plus energy penalty. |
| `efficiency_module` | Minimum `0` | Exponentially lowers the energy multiplier toward `0.01`. |

Returned structure:

```ts
interface MachineStats {
  raw: { processing: number; speed: number; efficiency: number };
  processing: { amount: number; penalty: number };
  speed: { multiplier: number; penalty: number };
  efficiency: { multiplier: number };
  energyMultiplier: number;
}
```

The exact calculations are:

```text
processing.amount = 2 × processing
processing.penalty = 1 + 2.25 × (processing - 1)
speed.multiplier = 1 + (999 × speed) / (3200 + speed)
speed.penalty = 1 + (99 × speed) / (640 + speed)
efficiency.multiplier = 0.01 + 0.99 × e^(-0.15 × efficiency)
energyMultiplier = processing.penalty × speed.penalty × efficiency.multiplier
```

Unknown component keys are left available in the original detected `components` object but do not affect this calculation.

## Information labels

### getMachineInfoLabel(data, status)

`MultiblockMachine.getMachineInfoLabel(data: MachineStats & { cost?: number }, status?: string): string` builds the status, input capacity, cost, speed, and calculated efficiency section without writing it. `status` defaults to `§aRunning`.

### getEnergyInfoLabel(controller)

`MultiblockMachine.getEnergyInfoLabel(controller: MultiblockMachine): string` builds the energy capacity, stored amount, and average base rate section. It deliberately displays `baseRate`, not the scheduler-scaled burst rate.

### setMachineInfoLabel(controller, data, status)

`MultiblockMachine.setMachineInfoLabel(controller: MultiblockMachine, data: MachineStats & { cost?: number }, status?: string): string` writes the standard machine information into label slot `1`. It returns a newline-padding string with the same height for callers composing additional UI sections.

For multi-section UIs, building the sections and passing them to `setLabel()` is usually clearer:

```js
machine.setLabel([
  MultiblockMachine.getMachineInfoLabel(stats, "§r§aRunning"),
  MultiblockMachine.getEnergyInfoLabel(machine),
  "§r§eRecipe Information\n\n§r§aOutput §fGravel",
]);
```

## Example: minimal processing controller

```js
import { ItemStack } from "@minecraft/server";
import * as DoriosLib from "DoriosLib/index.js";
import {
  Multiblock,
  MultiblockMachine,
  registerLinkNodeIO,
} from "DoriosCore/index.js";

const BLOCK_ID = "example:crusher_controller";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
const CONFIG = {
  required_case: "dorios:multiblock.case.example",
  entity: {
    identifier: "example:multiblock_machine",
    inventory_size: 5,
    input_slot: INPUT_SLOT,
    output_slot: OUTPUT_SLOT,
  },
  machine: {
    rate_speed_base: 100,
    energy_cap: 0,
  },
  requirements: {
    energy_cell: {
      amount: 1,
      warning: "§r§c[Crusher] Add at least one energy cell.",
    },
    processing_module: {
      amount: 1,
      warning: "§r§c[Crusher] Add at least one processing module.",
    },
  },
};

registerLinkNodeIO(BLOCK_ID, {
  items: {
    anyInputSlots: [INPUT_SLOT],
    anyOutputSlots: [OUTPUT_SLOT],
    inputs: [{ id: "material", label: "Material Input", slots: [INPUT_SLOT] }],
    outputs: [{ id: "product", label: "Product Output", slots: [OUTPUT_SLOT] }],
  },
});

DoriosLib.registry.blockComponent(BLOCK_ID, {
  onPlayerInteract(event) {
    return MultiblockMachine.handlePlayerInteract(event, CONFIG, {
      successMessages: ["§r§a[Crusher] Structure activated."],
    });
  },

  onPlayerBreak({ block, player }) {
    Multiblock.DeactivationManager.handleBreakController(block, player);
  },

  onTick({ block }) {
    const machine = new MultiblockMachine(block, CONFIG);
    if (!machine.valid) return;

    machine.processIO();
    const raw = machine.entity.getDynamicProperty("components");
    const stats = raw ? JSON.parse(raw) : MultiblockMachine.computeMachineStats({});
    machine.setRateMultiplier(stats.speed.multiplier);
    machine.setEnergyCost(1_200 * stats.energyMultiplier);

    const input = machine.container.getItem(INPUT_SLOT);
    const output = machine.container.getItem(OUTPUT_SLOT);
    const canProcess =
      input?.typeId === "minecraft:cobblestone" &&
      (!output || (output.typeId === "minecraft:gravel" && output.amount < output.maxAmount));

    if (!canProcess) {
      machine.setProgress(0);
      machine.setLabel([
        MultiblockMachine.getMachineInfoLabel(stats, "§r§eWaiting"),
        MultiblockMachine.getEnergyInfoLabel(machine),
      ]);
      return;
    }

    const spent = Math.min(machine.energy.get(), machine.rate);
    machine.energy.consume(spent);
    machine.addProgress(spent);

    if (machine.getProgress() >= machine.getEnergyCost()) {
      input.amount -= 1;
      machine.container.setItem(INPUT_SLOT, input.amount > 0 ? input : undefined);
      const result = output ?? new ItemStack("minecraft:gravel", 1);
      if (output) result.amount += 1;
      machine.container.setItem(OUTPUT_SLOT, result);
      machine.setProgress(0);
    }

    machine.displayProgress();
    machine.displayEnergy();
    machine.setLabel([
      MultiblockMachine.getMachineInfoLabel(stats, "§r§aRunning"),
      MultiblockMachine.getEnergyInfoLabel(machine),
    ]);
  },
});
```

For a complete component-scaled implementation, see the [Factory Crusher template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/multiblocks/factoryCrusher.js).

## Remarks

- `MultiblockMachine` intentionally extends `BasicMachine`, not `Machine`; machine-upgrade behavior is not added automatically.
- Put reusable addon-specific formulas in an addon-owned subclass such as `ExampleCore/ExampleMultiblockMachine.js`.
- Register physical ports through [`registerLinkNodeIO`](./link-node-io); DoriosCore activates them, while UtilityCore owns their networks.
- Do not edit DoriosCore to add recipes, component IDs, or machine-specific state.
