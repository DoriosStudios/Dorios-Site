---
id: registry
title: registry namespace
sidebar_label: registry
sidebar_position: 13
description: Register UtilityCraft payloads, custom block and item components, and custom commands through DoriosLib.
---

# `registry` namespace

Namespace: `DoriosLib.registry` · Package: `DoriosLib/index.js`

The registry namespace provides two related systems:

1. Queue JSON payloads for UtilityCraft's runtime registries.
2. Collect custom block components, item components, and commands for Script API startup.

## Runtime registry constants

### REGISTRATION_EVENT_IDS

A frozen map of UtilityCraft script-event IDs. Normal addons call the corresponding helper instead of sending events manually.

| Key | Event ID |
| --- | --- |
| `AUTO_FISHER_DROP` | `utilitycraft:register_autofisher_drop` |
| `BONSAI` | `utilitycraft:register_bonsai` |
| `COOLANT` | `utilitycraft:register_coolant` |
| `CRAFTER_RECIPE` | `utilitycraft:register_crafter_recipe` |
| `CRUSHER_RECIPE` | `utilitycraft:register_crusher_recipe` |
| `FLUID_HOLDER` | `utilitycraft:register_fluid_holder` |
| `FLUID_ITEM` | `utilitycraft:register_fluid_item` |
| `FUEL` | `utilitycraft:register_fuel` |
| `FURNACE_RECIPE` | `utilitycraft:register_furnace_recipe` |
| `GAS_HOLDER` | `utilitycraft:register_gas_holder` |
| `GAS_ITEM` | `utilitycraft:register_gas_item` |
| `INFUSER_RECIPE` | `utilitycraft:register_infuser_recipe` |
| `MELTER_RECIPE` | `utilitycraft:register_melter_recipe` |
| `MACHINE_UPGRADE` | `utilitycraft:register_machine_upgrade` |
| `PLANT` | `utilitycraft:register_plant` |
| `PRESS_RECIPE` | `utilitycraft:register_press_recipe` |
| `SIEVE_DROP` | `utilitycraft:register_sieve_drop` |
| `SPECIAL_CONTAINER_SLOTS` | `utilitycraft:register_special_container_slots` |

### PARAMETER_TYPES, COMMAND_PARAMETER_TYPES, PERMISSION_LEVELS

`PARAMETER_TYPES` and `COMMAND_PARAMETER_TYPES` reference the aliases from [`constants`](./constants). `PERMISSION_LEVELS` is the same shared permission map.

## Payload dispatch behavior

Every `register*` payload helper serializes its payload immediately, queues the event, and dispatches queued registrations one per tick after world load.

```ts
type RegistrationPayload = Record<string, unknown>;
```

DoriosLib validates that the top-level payload is an object and JSON serializable. The receiving UtilityCraft registry owns the feature-specific schema and validation. Therefore, the signatures intentionally do not pretend that DoriosLib itself knows every recipe field.

## Recipe and drop registrations

### registerAutoFisherDrop

`registerAutoFisherDrop(payload: RegistrationPayload | RegistrationPayload[]): void`

Registers one definition object or an array of Auto Fisher drop definitions. See the [Fishing and Sieve integration guide](/documentation/utilitycraft/registries/fishing-sieve).

### registerCrafterRecipe

`registerCrafterRecipe(payload: RegistrationPayload): void`

Registers Assembler/autocrafter recipes. See [UtilityCraft machine recipe registration](/documentation/utilitycraft/registries/machine-recipes).

### registerCrusherRecipe

`registerCrusherRecipe(payload: RegistrationPayload): void`

Registers Crusher recipes. See [UtilityCraft machine recipe registration](/documentation/utilitycraft/registries/machine-recipes).

### registerFurnaceRecipe

`registerFurnaceRecipe(payload: RegistrationPayload): void`

Registers UtilityCraft furnace/incinerator recipes. See [UtilityCraft machine recipe registration](/documentation/utilitycraft/registries/machine-recipes).

### registerInfuserRecipe

`registerInfuserRecipe(payload: RegistrationPayload): void`

Registers Infuser input pairs and outputs. See [UtilityCraft machine recipe registration](/documentation/utilitycraft/registries/machine-recipes).

### registerMelterRecipe

`registerMelterRecipe(payload: RegistrationPayload): void`

Registers Magmatic Chamber/melter recipes. See [UtilityCraft machine recipe registration](/documentation/utilitycraft/registries/machine-recipes).

### registerPressRecipe

`registerPressRecipe(payload: RegistrationPayload): void`

Registers Electro Press recipes. See [UtilityCraft machine recipe registration](/documentation/utilitycraft/registries/machine-recipes).

### registerSieveDrop

`registerSieveDrop(payload: RegistrationPayload): void`

Registers AutoSieve drop data. See the [Fishing and Sieve integration guide](/documentation/utilitycraft/registries/fishing-sieve).

## Resource and fuel registrations

### registerCoolant

`registerCoolant(payload: Record<string, CoolantRegistration>): void`

```ts
interface CoolantRegistration {
  efficiency: number;
  tier?: number; // 0
}
```

Keys are coolant resource IDs. `efficiency` is the consumption divisor used by coolant-powered machinery; `tier` supports machines that enforce coolant compatibility levels.

```js
DoriosLib.registry.registerCoolant({
  example_cryofluid: {
    efficiency: 4,
    tier: 2,
  },
});
```

### registerFluidHolder

`registerFluidHolder(payload: RegistrationPayload): void`

Registers an item/container definition capable of holding liquids.

### registerFluidItem

`registerFluidItem(payload: RegistrationPayload): void`

Registers a liquid and its item/display integration. Liquid frame items and resource entities required by DoriosCore displays remain behavior-pack/resource-pack content; this helper only dispatches registry data.

### registerGasHolder

`registerGasHolder(payload: RegistrationPayload): void`

Registers an item/container definition capable of holding gases.

### registerGasItem

`registerGasItem(payload: RegistrationPayload): void`

Registers a gas and its item/display integration. The addon's corresponding frame items and resource entity definitions must still exist.

### registerFuel

`registerFuel(payload: RegistrationPayload): void`

Registers generator fuel values. See [Fuels and Coolants](/documentation/utilitycraft/registries/fuels-coolants).

## Plants, bonsais, upgrades, and slots

### registerPlant

`registerPlant(payload: RegistrationPayload): void`

Registers Seed Synthesizer/plant data. See [Plants and Bonsais](/documentation/utilitycraft/registries/plants-bonsais).

### registerBonsai

`registerBonsai(payload: RegistrationPayload): void`

Registers the legacy bonsai definition format. Prefer `registerPlant()` for new general plant integrations unless extending a system that explicitly consumes bonsai registrations.

### registerMachineUpgrade

`registerMachineUpgrade(payload: RegistrationPayload): void`

Registers upgrade item perks consumed by DoriosCore machines.

```js
DoriosLib.registry.registerMachineUpgrade({
  "example:speed_upgrade": {
    type: "speed",
    levels: {
      1: { speed: 0.25, energy_cost: 0.15 },
      2: { speed: 0.65, energy_cost: 0.35 },
      3: { speed: 1.25, energy_cost: 0.75 },
      4: { speed: 2, energy_cost: 1.25 },
    },
  },
  "example:batch_upgrade": {
    type: "batch",
    levels: {
      1: { process_batch: 1, energy_cost: 0.25 },
      2: { process_batch: 2, energy_cost: 0.6 },
      3: { process_batch: 4, energy_cost: 1.25 },
      4: { process_batch: 7, energy_cost: 2.25 },
    },
  },
});
```

Standard DoriosCore perks include `speed`, `energy_cost`, `energy_efficiency`, and `process_batch`. Addon-owned numeric perks can be interpreted by custom subclasses.

### registerSpecialContainerSlots

`registerSpecialContainerSlots(payload: RegistrationPayload): void`

Registers slot metadata consumed by UtilityCraft container integrations. The payload schema belongs to the receiving feature.

## Isolated startup registrars

### createRegistrar

<div class="api-signature">

`createRegistrar(options: string | RegistrarOptions): Registrar`

</div>

```ts
interface RegistrarOptions {
  namespace: string;
  onError?: (error: unknown, context: string) => void;
}

interface Registrar {
  block(id: string, handlers: BlockCustomComponent): Registrar;
  item(id: string, handlers: ItemCustomComponent): Registrar;
  command(definition: CommandDefinition): Registrar;
  install(): boolean;
  isInstalled(): boolean;
}
```

Creates an independent, chainable registrar. A string is shorthand for `{ namespace: string }`. Local IDs are qualified with that namespace; already qualified IDs must belong to it.

```js
const registrar = DoriosLib.registry.createRegistrar({
  namespace: "example",
  onError(error, context) {
    console.warn(`[Example:${context}]`, error);
  },
});

registrar
  .block("inspectable", inspectableComponent)
  .item("wrench", wrenchComponent)
  .command(commandDefinition)
  .install();
```

`install()` subscribes one startup callback and returns false after the first call. Adding definitions after installation throws.

## Shared startup registrar

The shared helpers group definitions automatically by namespace.

### blockComponent

`blockComponent(id: string, handlers: BlockCustomComponent): void`

Adds a fully qualified custom block component.

### itemComponent

`itemComponent(id: string, handlers: ItemCustomComponent): void`

Adds a fully qualified custom item component.

### customCommand

`customCommand(definition: CommandDefinition): void`

Adds a command whose `name` must already be fully qualified.

### install

`install(): boolean`

Installs every namespace collected by the shared helpers. Call it once during initial module evaluation, after all definition modules have loaded. Returns false when already installed.

```js title="BP/scripts/main.js"
import * as DoriosLib from "DoriosLib/index.js";
import "./features/blocks.js";
import "./features/items.js";
import "./features/commands.js";

DoriosLib.registry.install();
```

## CommandDefinition

```ts
interface CommandParameter {
  name: string;
  type: keyof typeof DoriosLib.constants.COMMAND_PARAMETER_TYPES;
  optional?: boolean;
  values?: string[];
}

interface CommandDefinition {
  name: string;
  description?: string;
  permissionLevel?: keyof typeof DoriosLib.constants.PERMISSION_LEVELS
    | CommandPermissionLevel;
  cheatsRequired?: boolean;
  parameters?: CommandParameter[];
  callback: (origin: CustomCommandOrigin, ...args: unknown[]) => void;
}
```

Mandatory parameters are registered before optional parameters. Enum parameters require a nonempty `values` array and receive a generated namespaced enum ID. Command callbacks are deferred to the next system tick and passed to the registrar error handler when they throw.

```js
DoriosLib.registry.customCommand({
  name: "example:mode",
  description: "Changes an example machine mode",
  permissionLevel: "admin",
  cheatsRequired: true,
  parameters: [
    { name: "mode", type: "enum", values: ["input", "output", "disabled"] },
    { name: "amount", type: "integer", optional: true },
  ],
  callback(origin, mode, amount) {
    console.warn(`Requested ${mode} with ${amount ?? 1}`);
  },
});
```

## Errors and timing

- Invalid namespaces, unqualified shared IDs, foreign qualified IDs, missing command callbacks, and unknown parameter types throw.
- Definitions must be collected before `install()`.
- Payloads are queued before world load and dispatched one per tick afterward.
- A serialized payload being accepted by DoriosLib does not guarantee the receiving UtilityCraft feature accepts its fields.
