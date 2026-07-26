---
id: generators
title: Generators
sidebar_label: Overview
sidebar_position: 1
description: Build passive, item-fueled, liquid-fueled, and gas-fueled UtilityCraft-compatible generators.
---

# Generators

A generator turns an environmental condition or consumable resource into Dorios Energy. `Generator` supplies the helper entity, energy storage, scheduler-aware rate, standard display, IO processing, resource preservation, and network transfer. Your script decides when generation is allowed and what fuel is consumed.

```js
import { Generator } from "DoriosCore/index.js";

function tickGenerator(block, settings) {
  const generator = new Generator(block, settings);
  if (!generator.valid) return;

  // Validate fuel and produce energy here.
}
```

UtilityCore owns energy networks. A DoriosCore `Generator` only stores energy and requests transfer through its public `EnergyStorage` instance.

## Machine versus generator

| Processing machine | Generator |
| --- | --- |
| Consumes energy to advance recipe progress. | Produces energy from a condition or fuel. |
| Uses `new Machine(block, settings)`. | Uses `new Generator(block, settings)` or an addon-owned subclass. |
| Reads `settings.machine`. | Reads `settings.generator`. |
| Usually validates input and output slots. | Usually validates fuel and free energy capacity. |
| Calls `energy.consume()`. | Calls `energy.add()` and `energy.transferToNetwork()`. |

## Shared lifecycle

Every generator in this section follows the same order:

1. Register IO before the block component, if the generator accepts items, liquids, or gases.
2. Call `Generator.spawnEntity()` from `beforeOnPlayerPlace`.
3. Construct the generator on tick and stop when `valid` is false.
4. Process incoming IO.
5. Transfer already stored energy to the adjacent network.
6. Validate the environment, fuel, and free capacity.
7. Consume only the resource needed for the energy that can actually be stored.
8. Update `utilitycraft:on`, energy/resource displays, and the label.
9. Call `Generator.onDestroy()` when the block is broken.

```js
DoriosLib.registry.blockComponent(BLOCK_ID, {
  beforeOnPlayerPlace(event, { params: settings }) {
    Generator.spawnEntity(event, settings);
  },

  onTick({ block }, { params: settings }) {
    const generator = new Generator(block, settings);
    if (!generator.valid) return;

    generator.processIO();
    generator.energy.transferToNetwork(generator.rate * 4);
    // Validate, consume fuel, and produce energy here.
    generator.displayEnergy();
  },

  onPlayerBreak(event) {
    Generator.onDestroy(event);
  },
});
```

## Generator settings

```json
{
  "entity": {
    "name": "example_generator",
    "type": "generator",
    "inventory_size": 2
  },
  "generator": {
    "energy_cap": 64000,
    "rate_speed_base": 20
  }
}
```

| Field | Meaning |
| --- | --- |
| `entity.name` | Localization suffix used by the helper inventory title. |
| `entity.type` | Shared UtilityCraft helper-entity event. Use `generator`, `fluid_generator`, or `gas_generator` to match storage needs. |
| `entity.inventory_size` | Must include display, fuel, and IO button slots used by the generator. |
| `generator.energy_cap` | Maximum internal Dorios Energy. |
| `generator.rate_speed_base` | Energy produced per ordinary game tick before DoriosCore scheduler compensation. |
| `fluid_cap`, `fluid_types` | Optional capacity per liquid tank and number of indexed tanks. |
| `gas_cap`, `gas_types` | Optional capacity per gas tank and number of indexed tanks. |

The standard generator display uses slot `0` for energy and slot `1` for the label. Resource generators in the template use slot `2` for the fuel bar and slots `3–8` for six IO buttons.

## Tutorials

| Guide | Source pattern | Fuel |
| --- | --- | --- |
| [Passive generator](./passive-generator) | Template Solar Generator | Daylight and an open block above. |
| [Fuel generator](./fuel-generator) | Addon-owned solid-fuel example plus UtilityCraft fuel registration | Item and stored burn energy. |
| [Liquid generator](./liquid-generator) | Template Biofuel Generator | Registered Example Biofuel. |
| [Gas generator](./gas-generator) | Template Gas Turbine and `ExampleGasGenerator` | Registered Example Hydrogen. |

For every `Generator` method and setting, see the [DoriosCore Generator reference](../../dorios_core/API/generator).

Continue with [Passive Generator](./passive-generator).
