---
id: api-overview
title: DoriosCore API reference
sidebar_label: API overview
sidebar_position: 1
description: Complete inventory of the runtime values and type contracts exported by DoriosCore/index.js.
---

# DoriosCore API reference

The API reference documents the supported programming surface available from:

```js
import { Machine } from "DoriosCore/index.js";
```

The current public entry point exposes **103 runtime members** and **93 type-only contracts**. Members not exported by this entry point are implementation details and are intentionally excluded.

## Classification

<div class="dc-scope-list">
  <span><strong>Primary</strong> Common addon development</span>
  <span><strong>Advanced</strong> Custom infrastructure and low-level control</span>
  <span><strong>Compatibility</strong> Supported for existing implementations</span>
</div>

## Machinery

| Member | Kind | Scope | Description |
| --- | --- | --- | --- |
| [`BasicMachine`](./basic-machine) | Class | Primary | Base scheduled runtime shared by machines and generators. |
| [`Machine`](./machine) | Class | Primary | Processing-machine runtime with upgrades, costs, progress, and lifecycle helpers. |
| [`Generator`](./generator) | Class | Primary | Energy-producing runtime and output-mode helpers. |
| [`EnergyStorage`](./energy-storage) | Class | Primary | Large-value energy storage and transfers. |
| [`FluidStorage`](./fluid-storage) | Class | Primary | Indexed liquid storage, container interactions, display, and transfers. |
| [`GasStorage`](./gas-storage) | Class | Primary | Indexed gas storage with the same storage model as liquids. |
| `MachineUpgradeRegistry` | Class | Primary | Compiles registered upgrade items and resolves machine boosts. |

## IO authoring and interfaces

| Members | Scope | Description |
| --- | --- | --- |
| `registerIOInterface`, `registerIOInterfaceForBlockTag` | Primary | Register six-face item, liquid, and gas controls by block ID or block tag. |
| `ensureBlockIOInterface`, `hasRegisteredIOInterface` | Primary | Materialize or query a block's registered UI interface. |
| `IOInterface` | Primary | Object facade containing the IO registration operations. |
| `registerLinkNodeIO`, `getLinkNodeIODefinition`, `openLinkNodeIOForm` | Primary | Define and operate item, liquid, and gas routing for multiblock link-node ports. |
| `InterfaceManager`, `encodeInterfaceSlot`, `decodeInterfaceSlot`, `stripInterfaceSlotCode` | Advanced | Low-level entity-container interface and button infrastructure. |

## Liquid IO documents

These functions manage the normalized per-face IO document stored by compatible liquid containers.

`DEFAULT_FLUID_IO_MODE`, `FLUID_CONFIG_VERSION`, `FLUID_CONFIG_KEY`, `FLUID_CONTAINER_FAMILY`, `FLUID_CONFIG_EVENT_NAMESPACE`, `SET_FLUID_CONFIG_EVENT_ID`, `registerFluidIODefinition`, `getFluidIODefinition`, `ensureFluidIOConfig`, `setFluidConfig`, `getFluidConfig`, `getFluidConfigRevision`, `getFluidStatus`, `getInputFluidIndices`, `getOutputFluidIndices`, `getFluidIODirectionMode`, `cycleFluidIODirectionMode`, `normalizeFluidConfig`, `cloneFluidConfig`.

## Gas IO documents

Gas containers expose a parallel document API:

`DEFAULT_GAS_IO_MODE`, `GAS_CONFIG_VERSION`, `GAS_CONFIG_KEY`, `GAS_CONTAINER_FAMILY`, `GAS_CONFIG_EVENT_NAMESPACE`, `SET_GAS_CONFIG_EVENT_ID`, `registerGasIODefinition`, `getGasIODefinition`, `ensureGasIOConfig`, `setGasConfig`, `getGasConfig`, `getGasConfigRevision`, `getGasStatus`, `getInputGasIndices`, `getOutputGasIndices`, `getGasIODirectionMode`, `cycleGasIODirectionMode`, `normalizeGasConfig`, `cloneGasConfig`.

## Container adapters

| Resource | Members |
| --- | --- |
| Items | `resolveItemContainerAt` |
| Liquids | `resolveFluidContainer`, `resolveFluidContainerAt`, `getFluidInputIndices`, `getFluidOutputIndices`, `getFluidContainerRevision`, `transferFluid`, `insertFluid`, `getFluidStorage` |
| Gases | `resolveGasContainer`, `resolveGasContainerAt`, `getGasInputIndices`, `getGasOutputIndices`, `getGasContainerRevision`, `transferGas`, `insertGas`, `getGasStorage` |

Use these advanced adapters when transferring resources between arbitrary compatible targets. Normal `Machine.processIO()` calls already use the registered machine IO.

## Runtime helpers

| Member | Scope | Description |
| --- | --- | --- |
| [`TickScheduler`](./tick-scheduler) | Primary / Advanced | Distributes closed-machine work across groups and exposes the active profile. |
| [`OutputTracker`](./output-tracker) | Advanced | Caches enabled item, liquid, and gas output targets. |
| [`Rotation`](./rotation) | Primary | Handles placement facing and wrench rotation. |
| `ContainerSessionManager` | Advanced | Tracks which player has which helper-entity container open. |
| `ButtonItemStack`, `loadButtonItemStack`, [`ButtonManager`](./button-manager) | Compatibility | Existing polling-based container buttons. Prefer registered interfaces for new IO controls. |
| `addOpenUICount`, `removeOpenUICount` | Advanced | Maintains the open-UI counter used by scheduling and rendering. |

## Resource lore

`RESOURCE_LORE_MARKERS`, `buildEnergyLoreLine`, `buildFluidLoreLine`, `buildGasLoreLine`, `createResourceLore`, `parseResourceLore`, `getResourcesFromItem`, and `restoreResourceSnapshot` serialize stored resources into a placed machine's dropped item and restore them after placement.

These functions are advanced APIs. `Machine.spawnEntity()`, `Machine.onDestroy()`, `Generator.spawnEntity()`, and `Generator.onDestroy()` already handle the normal lifecycle.

## Multiblocks

| Member | Kind | Description |
| --- | --- | --- |
| [`Multiblock`](./multiblock) | Facade | Structure detection, activation, deactivation, entity lookup, and constants. |
| `MultiblockMachine` | Class | Component-scaled processing controller. |
| `MultiblockGenerator` | Class | Multiblock generator controller. |

## Protocol constants

Advanced integrations can use `TICK_GROUP_PROPERTY_ID`, `TICK_GROUP_COUNTS_PROPERTY_ID`, `DEFAULT_ENTITY_ID`, `DEFAULT_SCHEDULER_PROFILE`, `SET_SCHEDULER_PROFILE_EVENT_ID`, `SET_TICK_SPEED_EVENT_ID`, `REGISTER_GAS_ITEM_EVENT_ID`, `REGISTER_GAS_HOLDER_EVENT_ID`, and `REGISTER_MACHINE_UPGRADE_EVENT_ID`.

Prefer the corresponding classes and DoriosLib registries over sending protocol events manually.

## Type-only contracts

The declaration file also exposes 93 editor contracts. They are documented beside the member that consumes or returns them rather than as independent runtime values.

| Area | Types |
| --- | --- |
| Core configuration | `DirectionName`, `CardinalDirectionName`, `TransferMode`, `OutputTransferType`, `SchedulerProfileId`, `NormalizedValue`, `Bounds`, `MachineEntityConfig`, `BaseMachineConfig`, `MachineRuntimeConfig`, `GeneratorRuntimeConfig`, `MachineSettings`, `GeneratorSettings`, `Requirement`, `FillBlocksConfig`, `PlacementEventLike`, `DestroyEventLike`, `InteractionEventLike`, `ProgressOptions`, `WarningOptions`, `MachineBoosts`, `MachineUpgradeRegistration`, `CompiledMachineUpgrade`, `BasicMachineOptions` |
| IO authoring | `ItemIOModeConfig`, `ItemIOGroupConfig`, `FluidIOModeConfig`, `LiquidIOGroupConfig`, `GasIOModeConfig`, `GasIOGroupConfig`, `IOInterfaceConfig`, `LinkNodeItemGroupConfig`, `LinkNodeIndexedGroupConfig`, `LinkNodeItemIOConfig`, `LinkNodeIndexedIOConfig`, `LinkNodeIOConfig`, `LinkNodeIOGroup`, `LinkNodeResourceDefinition`, `LinkNodeIODefinition`, `ProcessIOLimits`, `ProcessIOSummary` |
| Interface buttons | `InterfaceButtonDefinition`, `InterfaceDefinition`, `RegisteredInterfaceButton`, `RegisteredInterfaceDefinition`, `InterfaceButtonContext`, `InterfaceButtonDescriptor`, `PressedInterfaceButtons` |
| Resource containers | `ResolvedItemContainer`, `FaceFluidIndexConfig`, `SimpleFluidConfig`, `ComplexFluidConfig`, `FluidConfig`, `FluidIOMode`, `FluidIODefinition`, `ResolvedFluidContainer`, `FluidContainerTarget`, `FluidTransferOptions`, `FluidInsertOptions`, `FaceGasIndexConfig`, `SimpleGasConfig`, `ComplexGasConfig`, `GasConfig`, `GasIOMode`, `GasIODefinition`, `ResolvedGasContainer`, `GasContainerTarget`, `GasTransferOptions`, `GasInsertOptions`, `FluidContainerData`, `FluidHolderData`, `SelectedInventoryItem`, `GasContainerData`, `GasHolderData`, `StoredResourceEntry`, `StoredResourceSnapshot` |
| Scheduling and sessions | `SchedulerProfileConfig`, `ContainerSession`, `ContainerSessionEntry`, `ButtonPressEvent`, `ButtonPressCallback`, `ButtonDefinition`, `ButtonWatcher` |
| Multiblocks | `DetectedStructure`, `ActivationContext`, `MachineActivationContext`, `InteractionHandlers`, `MachineStats`, `MultiblockStructureDetector`, `MultiblockActivationManager`, `MultiblockDeactivationManager`, `MultiblockEntityManager`, `MultiblockConstants` |
