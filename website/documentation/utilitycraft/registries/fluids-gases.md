---
title: Fluids and Gases
sidebar_position: 4
description: Register custom fluid and gas containers and supply every display and physical-tank asset they require.
---

# Fluids and Gases

A custom resource has three separate layers:

1. **Registry data** teaches storage which items insert or extract the resource.
2. **UI frames** let `FluidStorage.display()` or `GasStorage.display()` draw a fill level.
3. **Tank entities** let the resource render inside physical UtilityCraft tanks.

All three are required for a resource that can appear everywhere. Registration alone does not create any item, texture, or entity.

## Register two liquids

The template uses `4,000 mB` capsules:

```js title="BP/scripts/config/resources.js"
import * as DoriosLib from "DoriosLib/index.js";

const FLUID_CAPSULE_AMOUNT = 4000;

DoriosLib.registry.registerFluidItem({
  "utilitycraft:example_coolant_capsule": {
    type: "example_coolant",
    amount: FLUID_CAPSULE_AMOUNT,
    output: "utilitycraft:example_empty_fluid_capsule",
  },
  "utilitycraft:example_biofuel_capsule": {
    type: "example_biofuel",
    amount: FLUID_CAPSULE_AMOUNT,
    output: "utilitycraft:example_empty_fluid_capsule",
  },
});

DoriosLib.registry.registerFluidHolder({
  "utilitycraft:example_empty_fluid_capsule": {
    required: FLUID_CAPSULE_AMOUNT,
    types: {
      example_coolant: "utilitycraft:example_coolant_capsule",
      example_biofuel: "utilitycraft:example_biofuel_capsule",
    },
  },
});
```

`registerFluidItem()` describes a filled item inserted into storage:

| Field | Meaning |
| --- | --- |
| Item key | Exact filled-container item ID. |
| `type` | Stored liquid type without a namespace prefix. |
| `amount` | Millibuckets inserted. |
| `output` | Optional item returned after insertion, normally the empty holder. |

`registerFluidHolder()` describes an empty item that extracts from storage:

| Field | Meaning |
| --- | --- |
| Holder key | Exact empty-container item ID. |
| `required` | Millibuckets removed to fill one holder. Required for a new holder. |
| `types` | Map from every supported liquid type to its filled output item. |

Registering an existing filled item replaces its mapping. Registering an existing holder merges its `types`; a supplied `required` value updates the holder size.

## Register two gases

Gas registration has the same shape but uses an independent storage registry:

```js title="BP/scripts/config/resources.js"
const GAS_CAPSULE_AMOUNT = 4000;

DoriosLib.registry.registerGasItem({
  "utilitycraft:example_hydrogen_capsule": {
    type: "example_hydrogen",
    amount: GAS_CAPSULE_AMOUNT,
    output: "utilitycraft:example_empty_gas_capsule",
  },
  "utilitycraft:example_exhaust_capsule": {
    type: "example_exhaust",
    amount: GAS_CAPSULE_AMOUNT,
    output: "utilitycraft:example_empty_gas_capsule",
  },
});

DoriosLib.registry.registerGasHolder({
  "utilitycraft:example_empty_gas_capsule": {
    required: GAS_CAPSULE_AMOUNT,
    types: {
      example_hydrogen: "utilitycraft:example_hydrogen_capsule",
      example_exhaust: "utilitycraft:example_exhaust_capsule",
    },
  },
});
```

Do not put a gas into the fluid registry or reuse one empty holder across both systems. `FluidStorage` and `GasStorage` intentionally keep separate mappings.

## Create the holder items

Every identifier in the registry must exist as a normal Behavior Pack item. A filled capsule can be as small as:

```json title="BP/items/examples/example_coolant_capsule.json"
{
  "format_version": "1.21.110",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:example_coolant_capsule",
      "menu_category": { "category": "items" }
    },
    "components": {
      "minecraft:icon": "utilitycraft_example_coolant_capsule",
      "minecraft:max_stack_size": 16
    }
  }
}
```

Create the corresponding empty fluid capsule, biofuel capsule, empty gas capsule, hydrogen capsule, and exhaust capsule, then add their icon keys to `RP/textures/item_texture.json` and names to the lang file.

## Create all 49 display frames

Storage displays calculate a frame from `00` through `48`, inclusive. For `example_coolant`, the Behavior Pack must therefore contain items named:

```text
utilitycraft:example_coolant_00
utilitycraft:example_coolant_01
...
utilitycraft:example_coolant_48
```

Each frame item uses this pattern:

```json title="BP/items/ui/resource_bars/example_coolant/utilitycraft_example_coolant_00.json"
{
  "format_version": "1.20.80",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:example_coolant_00",
      "menu_category": { "category": "none" }
    },
    "components": {
      "minecraft:icon": "utilitycraft:example_coolant_00",
      "minecraft:tags": {
        "tags": ["utilitycraft:ui_element"]
      }
    }
  }
}
```

Map every icon key to its matching texture in `RP/textures/item_texture.json`:

```json
{
  "utilitycraft:example_coolant_00": {
    "textures": "textures/ui/example_coolant_bar/example_coolant_00"
  }
}
```

Repeat the full sequence for `example_biofuel`, `example_hydrogen`, and `example_exhaust`. A missing frame produces an `Invalid item identifier 'utilitycraft:<type>_NN'` scripting error when a UI tries to display that fill level.

## Create the physical tank entity

UtilityCraft resolves a physical entity by convention:

| Resource | Required Behavior Pack entity ID | Required family |
| --- | --- | --- |
| Liquid `example_coolant` | `utilitycraft:fluid_tank_example_coolant` | `dorios:fluid_container` |
| Gas `example_hydrogen` | `utilitycraft:gas_tank_example_hydrogen` | `dorios:gas_container` |

Copy the matching entity from the Addon Template and change the resource-specific identifier. Preserve its tier health groups, environment sensors, tank family, despawn event, and other controller-facing data.

The Resource Pack client entity may reuse UtilityCraft's registered geometry, animations, and animation controller. Only the identifier and addon-owned texture need to change:

```json title="RP/entity/fluids/fluid_tank_example_coolant.json"
{
  "format_version": "1.8.0",
  "minecraft:client_entity": {
    "description": {
      "identifier": "utilitycraft:fluid_tank_example_coolant",
      "materials": { "default": "entity_alphablend" },
      "textures": { "default": "textures/entity/example_coolant_fluid" },
      "geometry": { "default": "geometry.utilitycraft_fluid_tank_entity" },
      "render_controllers": ["controller.render.default"],
      "animations": {
        "fill": "animation.utilitycraft_fluid_tank_entity.fill"
      },
      "animation_controllers": [
        { "fluid_fill": "controller.animation.fluid_fill" }
      ]
    }
  }
}
```

For a gas, use `geometry.utilitycraft_gas_tank_entity`, `animation.utilitycraft_gas_tank_entity.fill`, and `controller.animation.gas_fill` from the matching template client entity.

## Resource checklist

For each type, verify:

- Its filled and empty container items exist.
- Its item and holder registrations use the same amount.
- Every frame item and texture from `00` through `48` exists.
- Its BP tank entity ID follows the exact fluid/gas naming convention.
- Its RP client entity uses the same identifier and the correct family of shared geometry/controllers.
- A machine can insert, extract, display, and transfer the resource without content-log errors.

For storage behavior, see [Liquid IO](../machine-io/liquid-io), [Gas IO](../machine-io/gas-io), [FluidStorage](../../dorios_core/API/fluid-storage), and [GasStorage](../../dorios_core/API/gas-storage).

Continue with [Plants and bonsais](./plants-bonsais).
