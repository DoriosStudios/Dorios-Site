---
id: multiblock
title: Multiblock facade
sidebar_label: Multiblock facade
sidebar_position: 9
description: Detect, activate, resolve, and deactivate component-driven multiblock structures.
---

# Multiblock facade

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

`Multiblock` exposes the structure scanner and shared lifecycle managers used by [`MultiblockMachine`](./multiblock-machine) and [`MultiblockGenerator`](./multiblock-generator).

```js
import {
  Multiblock,
  MultiblockGenerator,
  MultiblockMachine,
} from "DoriosCore/index.js";
```

## Definition

<div class="api-signature">

```ts
const Multiblock: {
  Constants: MultiblockConstants;
  ActivationManager: MultiblockActivationManager;
  DeactivationManager: MultiblockDeactivationManager;
  EntityManager: MultiblockEntityManager;
  StructureDetector: MultiblockStructureDetector;
}
```

</div>

The manager classes are exposed through this facade. Addons should not import DoriosCore's internal files.

## Structure lifecycle

1. A player interacts with the controller while holding an item whose ID contains `wrench`.
2. DoriosCore finds the inclusive casing bounds and scans every block inside them.
3. The controller class validates component requirements.
4. Activation stores bounds, activates link-node ports, calculates built-in energy capacity, and marks the controller `on`.
5. Addon-owned `onActivate` code derives custom capacities, rates, and behavior from detected components.
6. Breaking a casing or controller deactivates ports and clears runtime state.

## Detected structure contract

```ts
interface DetectedStructure {
  bounds: Bounds;
  components: Record<string, number>;
  inputBlocks: string[];
  caseBlocks?: Vector3[];
  ventBlocks: Vector3[];
  center: Vector3;
}
```

| Property | Description |
| --- | --- |
| `bounds` | Inclusive minimum and maximum casing corners. |
| `components` | Counts keyed by the block identifier without its namespace. It can also contain `air` and `vent`. |
| `inputBlocks` | Serialized link-node position tags copied to the controller entity during activation. |
| `caseBlocks` | Reserved optional casing-position list. The current built-in scanner does not populate it. |
| `ventBlocks` | Positions of vent-tagged casing blocks on the top layer. |
| `center` | Geometric center of the inclusive bounds. |

## Valid structure rules

### Outer shell

- Every outer-shell position except the controller must have the exact `required_case` tag supplied by the controller config.
- The controller must be part of the shell and have contiguous casing beside it along X or Z so bounds can be discovered.
- A shell block can also be a DoriosLib link node. Those blocks become activatable item, energy, liquid, or gas ports.
- A top-layer shell block tagged `dorios:vent_block` is counted as `vent` and added to `ventBlocks`.

### Interior

Interior positions may contain:

- air, counted as `components.air`;
- any liquid block;
- a block tagged `dorios:multiblock_component`, counted by its identifier after the namespace.

Any other interior block fails the scan and its coordinates are reported to the player.

:::important
DoriosCore does not need to know every addon component. Custom blocks still appear in `components`; calculate their effects inside an addon-owned core or the activation callback. Do not modify DoriosCore to add component IDs.
:::

## StructureDetector

### detectFromController(event, caseTag)

<div class="api-signature">

`Multiblock.StructureDetector.detectFromController(event: InteractionEventLike, caseTag: string): Promise<false | DetectedStructure>`

</div>

Finds casing bounds, validates the structure, shows a formation particle outline, and returns the full structure result.

| Parameter | Type | Description |
| --- | --- | --- |
| `event` | `InteractionEventLike` | Object containing the controller `block` and interacting `player`. The player receives scan messages. |
| `caseTag` | `string` | Exact block tag accepted for every casing position. |

Returns `false` when bounds cannot be found or any position is invalid.

### showFormationEffect(bounds, dimension)

<div class="api-signature">

`Multiblock.StructureDetector.showFormationEffect(bounds: Bounds, dimension: Dimension): Promise<void>`

</div>

Draws a redstone-dust outline around the vertical sides of `bounds`, yielding two ticks between layers.

### findMultiblockBounds(start, dimension, caseTag)

<div class="api-signature">

`Multiblock.StructureDetector.findMultiblockBounds(start: Vector3, dimension: Dimension, caseTag: string): Promise<Bounds | null>`

</div>

Expands from the controller across contiguous casing to find inclusive X, Z, and Y bounds.

| Parameter | Type | Description |
| --- | --- | --- |
| `start` | `Vector3` | Controller position. |
| `dimension` | `Dimension` | Dimension containing the candidate structure. |
| `caseTag` | `string` | Exact casing tag tested during expansion. |

Each direction is limited by `Multiblock.Constants.MAX_SIZE`. Returns `null` when the controller has no adjacent casing along X or Z or when a perpendicular casing line cannot be established.

### scanStructure(min, max, dimension, controller, caseTag)

<div class="api-signature">

```ts
Multiblock.StructureDetector.scanStructure(
  min: Vector3,
  max: Vector3,
  dimension: Dimension,
  controller: Vector3,
  caseTag: string,
): Promise<{
  components: Record<string, number>;
  inputBlocks: string[];
  ventBlocks: Vector3[];
} | string>
```

</div>

Validates every position in inclusive bounds using the shell and interior rules above. A successful scan returns component, port, and vent data. Failure returns a coordinate string identifying the first invalid block.

## ActivationManager

### fillBlocks(bounds, dimension, blockId)

<div class="api-signature">

`Multiblock.ActivationManager.fillBlocks(bounds: Bounds, dimension: Dimension, blockId?: string): void`

</div>

Schedules one fill command per Y layer, replacing only air inside the inclusive bounds.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `bounds` | `Bounds` | — | Area to fill. |
| `dimension` | `Dimension` | — | Dimension in which commands run. |
| `blockId` | `string` | `minecraft:water` | Block placed into air positions. |

Layers are separated by four ticks to distribute command cost.

### activateMultiblock(entity, structure, fillBlocksConfig)

<div class="api-signature">

`Multiblock.ActivationManager.activateMultiblock(entity: Entity, structure: Partial<DetectedStructure>, fillBlocksConfig?: FillBlocksConfig): number`

</div>

Applies shared activation state to an already spawned controller entity.

| Parameter | Type | Description |
| --- | --- | --- |
| `entity` | `Entity` | Controller helper entity. |
| `structure` | `Partial<DetectedStructure>` | Detected ports, bounds, vents, and component counts. |
| `fillBlocksConfig` | `{ blockId?: string }` | Optional internal fill request. |

The method:

- triggers `utilitycraft:show` on the entity;
- copies link-node tags to the entity;
- sets each resolved link node's `utilitycraft:active` state to `1`;
- requests UtilityCore network refreshes for tagged energy, item, liquid, and gas ports;
- persists bounds and vent positions;
- optionally fills air inside the bounds;
- calculates and applies built-in energy capacity;
- stores `dorios:state` as `on`.

Returns the calculated energy capacity, including `0` when no recognized energy component exists.

### calculateEnergyCapacity(components)

`Multiblock.ActivationManager.calculateEnergyCapacity(components: Record<string, number>): number` multiplies recognized component counts by `ENERGY_PER_UNIT` and returns their sum. Unknown component IDs contribute `0`.

## DeactivationManager

### emptyBlocks(entity, blockId)

<div class="api-signature">

`Multiblock.DeactivationManager.emptyBlocks(entity: Entity, blockId?: string): void`

</div>

Reads bounds from the compatibility property `reactorStats`, then schedules top-to-bottom commands that replace `blockId` with air.

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `entity` | `Entity` | — | Controller containing serialized `reactorStats.bounds`. |
| `blockId` | `string` | `minecraft:water` | Filled block to remove. |

If `reactorStats` is absent, the method does nothing. A custom fill-based multiblock must store its bounds there when it depends on this cleanup method.

### deactivateMultiblock(block, player, emptyBlocksConfig)

<div class="api-signature">

`Multiblock.DeactivationManager.deactivateMultiblock(block: Block, player?: Player, emptyBlocksConfig?: FillBlocksConfig): Entity | undefined`

</div>

Resolves the owning controller from `block`, hides it, removes its link-node tags, resets active port states, requests UtilityCore network refreshes, sets `dorios:rateSpeed` to `0`, clears stored bounds, and stores `dorios:state` as `off`.

The optional player receives a deactivation message. When `emptyBlocksConfig` is provided, `emptyBlocks()` is also called. Returns the controller entity or `undefined` when none can be resolved.

### handleBreakController(block, player, emptyBlocksConfig)

`Multiblock.DeactivationManager.handleBreakController(block: Block, player?: Player, emptyBlocksConfig?: FillBlocksConfig): Entity | undefined` runs `deactivateMultiblock()` and removes the controller entity two ticks later. Use it when the controller block itself is broken.

## EntityManager

### getCenter(min, max)

`Multiblock.EntityManager.getCenter(min: Vector3, max: Vector3): Vector3` returns the arithmetic midpoint of both corners.

### getVolume(bounds)

`Multiblock.EntityManager.getVolume(bounds: Bounds): number` returns inclusive block volume: `(Δx + 1) × (Δy + 1) × (Δz + 1)`.

### isInsideBounds(position, bounds)

`Multiblock.EntityManager.isInsideBounds(position: Vector3, bounds: Bounds): boolean` includes every position on the minimum and maximum faces.

### getEntityFromBlock(block)

<div class="api-signature">

`Multiblock.EntityManager.getEntityFromBlock(block: Block): Entity | undefined`

</div>

Returns the first entity directly at the block position when one exists. Otherwise, it searches nearby entities in the `dorios:multiblock` family and returns the first whose stored `dorios:bounds` contains the position. Invalid serialized bounds are ignored.

## Constants

### Scan and energy constants

| Constant | Value | Description |
| --- | --- | --- |
| `MAX_SIZE` | `99` | Maximum expansion distance in each scan direction. |
| `SCAN_SPEED` | `64` | Pacing value used by the structure scan. |
| `ENERGY_PER_UNIT.energy_cell` | `4,000,000` | DE capacity per standard energy cell. |
| `ENERGY_PER_UNIT.basic_power_condenser_unit` | `40,000,000` | DE capacity per basic condenser unit. |
| `ENERGY_PER_UNIT.advanced_power_condenser_unit` | `320,000,000` | DE capacity per advanced condenser unit. |
| `ENERGY_PER_UNIT.expert_power_condenser_unit` | `2,560,000,000` | DE capacity per expert condenser unit. |
| `ENERGY_PER_UNIT.ultimate_power_condenser_unit` | `64,000,000,000` | DE capacity per ultimate condenser unit. |

### Tags, states, events, and properties

| Constant | Value |
| --- | --- |
| `SHOW_EVENT_ID` | `utilitycraft:show` |
| `HIDE_EVENT_ID` | `utilitycraft:hide` |
| `ACTIVE_STATE_ID` | `utilitycraft:active` |
| `MULTIBLOCK_CASE_TAG_PREFIX` | `dorios:multiblock.case` |
| `MULTIBLOCK_COMPONENT_TAG` | `dorios:multiblock_component` |
| `MULTIBLOCK_FAMILY` | `dorios:multiblock` |
| `VENT_BLOCK_TAG` | `dorios:vent_block` |
| `ENERGY_BLOCK_TAG` | `dorios:energy` |
| `FLUID_BLOCK_TAG` | `dorios:fluid` |
| `ITEM_BLOCK_TAG` | `dorios:item` |
| `GAS_BLOCK_TAG` | `dorios:gas` |
| `BOUNDS_PROPERTY_ID` | `dorios:bounds` |
| `STATE_PROPERTY_ID` | `dorios:state` |
| `ACTIVE_STATE_VALUE` | `on` |
| `INACTIVE_STATE_VALUE` | `off` |
| `RATE_SPEED_PROPERTY_ID` | `dorios:rateSpeed` |
| `ENERGY_CAP_PROPERTY_ID` | `dorios:energyCap` |
| `VENT_BLOCKS_PROPERTY_ID` | `ventBlocks` |
| `LEGACY_REACTOR_STATS_PROPERTY_ID` | `reactorStats` |
| `UPDATE_PIPES_EVENT_ID` | `dorios:updatePipes` |

All values are read through `Multiblock.Constants`; they are not independent root exports.

## Automatic casing listeners

Importing DoriosCore installs listeners for player breaks and block explosions. When a broken permutation has a tag beginning with `dorios:multiblock.case`, DoriosCore resolves and deactivates the owning structure. The automatic cleanup requests water removal.

## Authoring checklist

- Give every valid shell block the exact casing tag configured by `required_case`.
- Give interior components `dorios:multiblock_component`.
- Use DoriosLib link-node blocks for configurable ports and register their groups with [`registerLinkNodeIO`](./link-node-io).
- Declare `utilitycraft:active` on port blocks so activation can write it.
- Give the controller helper entity the `dorios:multiblock` family, show/hide events, required properties, and enough inventory slots.
- Put addon-specific component calculations in an addon-owned core or `onActivate` callback.
- Use `handleBreakController()` for the controller block and let global casing listeners handle shell damage.

## Complete examples

- [Factory Crusher multiblock machine](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/multiblocks/factoryCrusher.js)
- [Biofuel Dynamo multiblock generator](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/multiblocks/biofuelDynamo.js)
- [Heavy Machinery controllers](https://github.com/DoriosStudios/UtilityCraft-Heavy-Machinery/tree/main/BP/scripts/machinery)

These examples keep custom component formulas in addon-owned scripts and use DoriosCore only through `DoriosCore/index.js`.
