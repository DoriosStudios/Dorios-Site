---
title: Plants and Bonsais
sidebar_position: 5
description: Register one plant definition for UtilityCraft plant machines and optional Bonsai support.
---

# Plants and Bonsais

`registerPlant()` gives one seed or sapling a shared definition. UtilityCraft plant machinery reads its energy cost and drops; Bonsai additionally reads the nested entity, soil, duration, and modifier settings.

The registry does not create a crop. Your addon still owns the seed item, crop block, growth script, loot table, textures, and optional Bonsai entity.

## Register the plant

```js title="BP/scripts/config/integrations.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerPlant({
  "utilitycraft:example_crystal_seeds": {
    cost: 3200,
    drops: [
      {
        item: "utilitycraft:example_crystal_shard",
        amount: [2, 4],
        chance: 1,
      },
      {
        item: "utilitycraft:example_crystal_seeds",
        amount: 1,
        chance: 0.15,
      },
    ],
    bonsai: {
      entityTypeId: "utilitycraft:example_crystal_bonsai",
      allowedSoils: ["minecraft:dirt", "minecraft:grass_block"],
      durationTicks: 1200,
      speedMultiplier: 1,
      yieldMultiplier: 1,
      modifiers: {
        soilSpeed: true,
        soilYield: true,
        tillingSpeed: true,
      },
    },
  },
});
```

## Plant fields

| Field | Type | Meaning |
| --- | --- | --- |
| Seed key | namespaced string | Input item consumed by compatible plant machinery and inserted into Bonsai. |
| `cost` | positive number | Base Dorios Energy cost used by plant machinery. Defaults to `8000` if invalid or absent. |
| `drops` | array | At least one valid drop is required. Registering an empty list is rejected. |
| `drops[].item` | namespaced string | Result item. |
| `drops[].amount` | number or `[min, max]` | Fixed or randomized base amount. |
| `drops[].chance` | number | Independent probability from `0` to `1`. |
| `drops[].scaleWithYield` | boolean | Bonsai-only opt-out. Set `false` to prevent its amount from being multiplied by Bonsai yield bonuses. |

Each drop rolls independently, so multiple entries can succeed in one operation.

## Bonsai fields

| Field | Type | Meaning |
| --- | --- | --- |
| `entityTypeId` | namespaced string | Visual entity spawned above the Bonsai. Required to enable Bonsai for this plant. |
| `allowedSoils` | string array | Soil item IDs accepted for this plant. Unnamespaced values are treated as `minecraft:*`. Defaults to dirt and grass block. |
| `durationTicks` | positive number | Base growth duration. It is rounded up to Bonsai's 200-tick heartbeat and capped at `12000` ticks. Default is `1200`. |
| `speedMultiplier` | positive number | Plant-specific growth speed multiplier. Default `1`. |
| `yieldMultiplier` | positive number | Plant-specific output multiplier. Default `1`. |
| `modifiers.soilSpeed` | boolean | Allows the chosen soil's speed bonus. Default `true`. |
| `modifiers.soilYield` | boolean | Allows the chosen soil's yield bonus. Default `true`. |
| `modifiers.tillingSpeed` | boolean | Allows the Bonsai tilling speed bonus. Default `true`. |
| `drops` | array | Optional Bonsai-only drop table; otherwise the plant's main `drops` are reused. |

You may omit `bonsai` entirely when the seed should work only in plant machinery.

## Create the seed and crop

The seed places the addon-owned crop block:

```json title="BP/items/examples/example_crystal_seeds.json"
{
  "format_version": "1.21.110",
  "minecraft:item": {
    "description": {
      "identifier": "utilitycraft:example_crystal_seeds",
      "menu_category": { "category": "nature" }
    },
    "components": {
      "minecraft:icon": "utilitycraft_emerald_seeds",
      "minecraft:block_placer": {
        "block": "utilitycraft:example_crystal_crop"
      }
    }
  }
}
```

The template crop has its own age state and its own custom component:

```json title="BP/blocks/examples/example_crystal_crop.json"
{
  "description": {
    "identifier": "utilitycraft:example_crystal_crop",
    "states": {
      "utilitycraft:example_age": [0, 1, 2, 3, 4, 5]
    }
  },
  "components": {
    "utilitycraft:example_crystal_crop": {},
    "minecraft:tick": {
      "interval_range": [160, 240],
      "looping": true
    }
  }
}
```

Its script registers `utilitycraft:example_crystal_crop`, advances the age on tick, harvests only at maximum age, and resets the state. This physical crop behavior is separate from `registerPlant()`.

## Create the Bonsai entity

Copy both `BP/entities/examples/example_crystal_bonsai.json` and `RP/entity/example_crystal_bonsai.json` from the template when creating a new plant.

The BP entity must preserve the properties and events UtilityCraft's Bonsai runtime drives, including:

- `utilitycraft:growth_duration`
- `utilitycraft:animation_reset`
- the 10-second `utilitycraft:bonsai_heartbeat` timer event
- the `normal`, `small`, and `despawn` events

The RP client entity can reuse UtilityCraft's Bonsai geometry and animations while selecting an addon-owned texture. Its identifier must exactly match `bonsai.entityTypeId`.

## Registration behavior and test

Registering the same seed key merges the new entry over the existing definition. A supplied `drops` list replaces the previous list; omitted plant or Bonsai fields retain compatible existing values. Prefer a unique seed ID to avoid order-dependent integrations.

1. Confirm the seed grows and harvests as your addon intends.
2. Insert it into a compatible UtilityCraft plant machine and verify cost and drops.
3. Place it in a Bonsai with an allowed soil.
4. Verify the visual entity grows and output moves into a container below.
5. Try a disallowed soil and confirm the plant is rejected.

`registerBonsai()` remains available only as a legacy adapter. New extensions should use the unified `registerPlant()` shape above.

Continue with [Fishing and sieve drops](./fishing-sieve).
