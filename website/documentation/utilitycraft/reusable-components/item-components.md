---
title: Item Components
sidebar_position: 3
description: Create Hammer, Mesh, Fishing Net, and upgrade items with UtilityCraft's existing item components.
---

# Item Components

UtilityCraft reads parameters stored on custom item components. Your addon defines the item and attaches the existing component ID; UtilityCraft registers the behavior once.

## `utilitycraft:hammer`

A Hammer converts a mined block through the Crusher recipe table. Its tier must meet the recipe's optional `tier` requirement.

```json title="BP/items/examples/example_hammer.json"
{
  "format_version": "1.21.110",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:example_hammer",
      "menu_category": { "category": "equipment" }
    },
    "components": {
      "utilitycraft:hammer": { "tier": 2 },
      "minecraft:icon": "utilitycraft_diamond_hammer",
      "minecraft:max_stack_size": 1,
      "minecraft:hand_equipped": true,
      "minecraft:durability": { "max_durability": 512 },
      "minecraft:damage": 5,
      "minecraft:tags": {
        "tags": [
          "minecraft:is_pickaxe",
          "minecraft:is_tool",
          "utilitycraft:is_hammer"
        ]
      }
    }
  }
}
```

| Parameter | Type | Meaning |
| --- | --- | --- |
| `tier` | finite number | Minimum recipe tier the tool can process. A tier `2` Hammer can process recipes requiring `0`, `1`, or `2`. |

The handler looks up the exact mined block in the Crusher registry, removes its normal matching drop, and spawns the registered result and amount. Add a Crusher recipe through [Add recipes to existing machines](../registries/machine-recipes).

Durability, mining speed, damage, tags, icon, and recipe are ordinary item configuration owned by the addon; they are not supplied by the custom component.

## `utilitycraft:mesh`

A Mesh controls Auto Sieve tier, success chance, and output amount:

```json title="BP/items/examples/example_mesh.json"
{
  "format_version": "1.21.110",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:example_mesh",
      "menu_category": { "category": "construction" }
    },
    "components": {
      "utilitycraft:mesh": {
        "tier": 4,
        "multiplier": 1.5,
        "amount_multiplier": 1
      },
      "minecraft:icon": "utilitycraft_diamond_mesh",
      "minecraft:max_stack_size": 1,
      "minecraft:durability": { "max_durability": 768 }
    }
  }
}
```

| Parameter | Meaning |
| --- | --- |
| `tier` | Minimum-tier gate for registered Sieve drops. |
| `multiplier` | Multiplies every eligible drop's base chance. `1.5` turns `0.08` into `0.12`. |
| `amount_multiplier` | Multiplies the rolled output amount before it is rounded to a whole item. Default behavior is `1`. |

:::important Manual Sieve limitation
The current Basic manual Sieve accepts only UtilityCraft's built-in Mesh item IDs. An addon-owned Mesh such as `utilitycraft:example_mesh` is intended for the Auto Sieve and is deliberately rejected by the manual Sieve interaction handler.
:::

Register loot through [Fishing and sieve drops](../registries/fishing-sieve).

## `utilitycraft:fishing_net`

The Auto Fisher reads all of its equipment modifiers from the installed Fishing Net:

```json title="BP/items/examples/example_fishing_net.json"
{
  "format_version": "1.21.110",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:example_fishing_net",
      "menu_category": { "category": "construction" }
    },
    "components": {
      "utilitycraft:fishing_net": {
        "tier": 4,
        "speed": 1.5,
        "chance_multiplier": 1.75,
        "amount_multiplier": 1,
        "rolls": 2,
        "luck": 3
      },
      "minecraft:icon": "utilitycraft_diamond_fishing_net",
      "minecraft:max_stack_size": 1,
      "minecraft:durability": { "max_durability": 768 }
    }
  }
}
```

| Parameter | Default | Meaning |
| --- | ---: | --- |
| `tier` | `0` | Minimum-tier gate for loot entries. |
| `speed` | `1` | Multiplies the Auto Fisher processing rate. |
| `chance_multiplier` | `1` | Multiplies each eligible base drop chance. |
| `amount_multiplier` | `1` | Multiplies rolled item amounts. |
| `rolls` | `1` | Loot rolls performed for each completed process. |
| `luck` | `0` | Improves supported enchantment chances, counts, and quality for built-in enchantable loot. |

Use positive, intentionally balanced values. Increasing both `rolls` and `chance_multiplier` compounds output much faster than changing either one alone.

## `utilitycraft:machine_upgrade`

Attach this behavior to every item installed through UtilityCraft's upgrade interaction:

```json
{
  "utilitycraft:machine_upgrade": {},
  "minecraft:max_stack_size": 4,
  "minecraft:tags": {
    "tags": ["utilitycraft:is_upgrade"]
  }
}
```

The component handles using the item on a compatible machine. Its perk type and level values come from `DoriosLib.registry.registerMachineUpgrade()`, while the machine's block component declares the accepted slot and maximum level. Follow [Machine Upgrades](../machine-upgrades/) instead of configuring these pieces independently.

## Test each item

| Item | Minimum test |
| --- | --- |
| Hammer | Mine a block with a registered Crusher recipe below and above the Hammer tier. |
| Mesh | Install it in an Auto Sieve, test a guaranteed drop, then restore the intended probability. |
| Fishing Net | Install it in an Auto Fisher near water and compare rate, eligible tier, and rolls. |
| Upgrade | Use and sneak-use it on a compatible machine; verify the correct slot, level cap, and perk. |

Do not register any of these component IDs again. To create genuinely different behavior, define an addon-owned ID and handler with `DoriosLib.registry.itemComponent()`.

Continue with [Generators](../generators/).
