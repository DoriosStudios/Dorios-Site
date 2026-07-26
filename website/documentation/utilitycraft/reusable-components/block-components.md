---
title: Block Components
sidebar_position: 2
description: Use UtilityCraft's block generator, resource interaction, creative storage, energy source, and upgrade components correctly.
---

# Block Components

Attach these IDs directly inside `minecraft:block.components`. UtilityCraft registers their handlers; your addon must supply the JSON structure each handler expects.

## `utilitycraft:block_generator`

This passive component creates an item every block tick and tries to insert it into the container on its output face. Anything not inserted remains buffered in two block states. A player with an empty main hand can collect that buffer.

```json title="BP/blocks/examples/example_deepslate_generator.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:example_deepslate_generator",
      "menu_category": { "category": "construction" },
      "traits": {
        "minecraft:placement_direction": {
          "enabled_states": ["minecraft:facing_direction"]
        }
      },
      "states": {
        "utilitycraft:e0": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        "utilitycraft:e1": [0, 1, 2, 3, 4, 5, 6]
      }
    },
    "components": {
      "utilitycraft:block_generator": {
        "material": "minecraft:deepslate",
        "amount": 3
      },
      "minecraft:geometry": "geometry.utilitycraft_cobble_gen",
      "minecraft:tick": {
        "interval_range": [10, 10]
      }
    }
  }
}
```

| Parameter or dependency | Meaning |
| --- | --- |
| `material` | Namespaced item ID produced. Defaults to `minecraft:cobblestone`. |
| `amount` | Items produced on each component tick. Values below `1` become `1`; one insertion attempt is capped at a stack of `64`. |
| `minecraft:facing_direction` | Selects the output side. The template's permutations rotate the shared generator model to match it. |
| `utilitycraft:e0`, `utilitycraft:e1` | Required decimal buffer states. The template range stores up to `69` pending items. |
| `minecraft:tick` | Required to call `onTick`; `[10, 10]` produces every ten game ticks. |

Copy the complete Cobble or Deepslate Generator block from the template when reusing `geometry.utilitycraft_cobble_gen`; its up/down geometry and all six rotation permutations must stay aligned with the output direction.

## `utilitycraft:fluid_container` and `utilitycraft:gas_container`

These components handle player interaction with registered containers. On a machine, the helper entity and storage settings are created by the machine's own component:

```json
{
  "utilitycraft:fluid_container": {},
  "utilitycraft:example_fluid_washer": {
    "entity": {
      "type": "fluid_machine",
      "inventory_size": 21
    },
    "machine": {
      "fluid_cap": 16000,
      "fluid_types": 1
    }
  },
  "tag:dorios:fluid": {}
}
```

```json
{
  "utilitycraft:gas_container": {},
  "utilitycraft:example_gas_reactor": {
    "entity": {
      "type": "gas_machine",
      "inventory_size": 27
    },
    "machine": {
      "gas_cap": 16000,
      "gas_types": 2
    }
  },
  "tag:dorios:gas": {}
}
```

With an empty hand, interaction reports the stored type and amount. With a registered filled or empty holder, it inserts or extracts the resource. With a wrench, compatible generators expose transfer behavior or rotate.

| Context | Required pieces |
| --- | --- |
| Fluid machine | Fluid-capable helper entity, `fluid_cap`, `fluid_types`, `tag:dorios:fluid`, and registered fluid items. |
| Gas machine | Gas-capable helper entity, `gas_cap`, `gas_types`, `tag:dorios:gas`, and registered gas items. |
| Physical finite tank | `type: "tank"`, an ID containing `fluid_tank` or `gas_tank`, the resource tag and tank tag, tank states/geometry, and physical resource entities. |

The JSON `capacity` field shown by built-in finite tanks is not used as a free custom capacity by the current handler; DoriosCore resolves known tank capacities by block ID and otherwise falls back to the basic capacity. Do not assume an arbitrary `capacity` value creates a new tier.

See [Fluids and gases](../registries/fluids-gases), [Liquid IO](../machine-io/liquid-io), and [Gas IO](../machine-io/gas-io).

## `utilitycraft:infinite_tank`

This component creates the generic UtilityCraft backing entity and keeps one resource type at effectively infinite capacity. It is intended for creative/testing blocks.

```json title="BP/blocks/examples/creative_tanks/example_creative_coolant_tank.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:example_creative_coolant_tank",
      "menu_category": { "category": "construction" }
    },
    "components": {
      "utilitycraft:infinite_tank": {
        "resource": "fluid",
        "type": "example_coolant"
      },
      "minecraft:geometry": "geometry.utilitycraft_creative_fluid_tank",
      "tag:dorios:fluid": {}
    }
  }
}
```

| Parameter | Accepted value | Meaning |
| --- | --- | --- |
| `resource` | `"fluid"` or `"gas"` | Selects `FluidStorage` or `GasStorage`. |
| `type` | non-empty resource type | Fixed storage type without namespace, such as `example_coolant`. |

Use `geometry.utilitycraft_creative_fluid_tank` plus a `fluid` material instance for liquids. Use `geometry.utilitycraft_creative_gas_tank`, the gas material instance, and the four cardinal rotation permutations from the template for gases. The matching `tag:dorios:fluid` or `tag:dorios:gas` makes the block discoverable as a resource endpoint.

## `utilitycraft:infinite_energy_source`

This creative component spawns a shared generator helper entity, keeps it full, and transfers energy to the adjacent UtilityCore network.

```json
{
  "utilitycraft:infinite_energy_source": {
    "rate_speed_base": 10000
  },
  "minecraft:tick": {
    "interval_range": [4, 4]
  },
  "tag:dorios:energy": {},
  "tag:dorios:generator": {},
  "tag:dorios:infinite_energy_source": {}
}
```

`rate_speed_base` is the positive maximum transfer per component tick and defaults to `10000`. `minecraft:tick` is required. The three tags identify the energy endpoint, generator behavior, and infinite source. UtilityCore owns the network this component transfers into.

## `utilitycraft:machine_upgrades`

This data-only block component declares which upgrade category can be installed into each helper-entity slot:

```json
{
  "utilitycraft:machine_upgrades": [
    { "type": "speed", "slot": 5, "max": 4 },
    { "type": "energy", "slot": 6, "max": 4 },
    { "type": "batch", "slot": 7, "max": 4 }
  ]
}
```

It works together with the `machine.upgrades` slot list, registered upgrade definitions, the upgrade item component, and the UI tab. Follow [Register an Upgrade](../machine-upgrades/register-upgrade) for the complete pipeline.

## Block-component checklist

- Reference the UtilityCraft-owned component ID; do not register it again.
- Copy all required states, traits, ticks, tags, geometries, and permutations from the matching current template example.
- Keep addon identifiers and textures unique.
- Confirm UtilityCraft, your BP, UtilityCraft's RP, and your RP are all active.
- Test placement, breaking, reloading, empty-hand interaction, and adjacent transfer.

Continue with [Item components](./item-components).
