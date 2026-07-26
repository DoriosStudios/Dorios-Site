---
title: Fishing and Sieve Drops
sidebar_position: 6
description: Add probabilistic Auto Fisher and Sieve loot and connect tier checks to Fishing Nets and Meshes.
---

# Fishing and Sieve Drops

These registries add loot candidates to machines UtilityCraft already runs. Each candidate rolls independently; the Fishing Net or Mesh installed in the machine controls which tiers are eligible and how the roll is modified.

## Add an Auto Fisher drop

Register one object or an array of objects:

```js title="BP/scripts/config/integrations.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerAutoFisherDrop({
  item: "utilitycraft:example_crystal_shard",
  amount: [1, 2],
  chance: 0.025,
  tier: 2,
});
```

```js
DoriosLib.registry.registerAutoFisherDrop([
  {
    item: "utilitycraft:example_crystal_shard",
    amount: 1,
    chance: 0.025,
    tier: 2,
  },
  {
    item: "utilitycraft:example_energized_alloy",
    amount: 1,
    chance: 0.005,
    tier: 4,
  },
]);
```

| Field | Type | Default | Meaning |
| --- | --- | ---: | --- |
| `item` | namespaced string | required | Item added to the output. Invalid entries are skipped. |
| `amount` | number or `[min, max]` | `1` | Fixed or random base count. |
| `chance` | number | `0.1` | Base probability from `0` to `1` for each roll. |
| `tier` | number | `0` | Minimum Fishing Net tier. |

External registration currently keeps those four fields. Advanced built-in loot may carry enchantment and durability metadata, but those fields are not copied by this public receiver.

The installed net can multiply chance and amount and can perform more than one roll. A `2.5%` entry is therefore a base chance, not a guaranteed final frequency.

## Add Sieve drops

The payload is keyed by the exact block or item being sieved:

```js title="BP/scripts/config/integrations.js"
DoriosLib.registry.registerSieveDrop({
  "minecraft:gravel": [
    {
      item: "utilitycraft:example_crystal_shard",
      amount: [1, 2],
      chance: 0.08,
      tier: 3,
    },
  ],
});
```

| Field | Type | Default | Meaning |
| --- | --- | ---: | --- |
| Input key | namespaced string | required | Material consumed by a compatible Sieve. New keys can create new scripted recipe lists. |
| `item` | namespaced string | required | Possible output. |
| `amount` | number or `[min, max]` | `1` | Fixed or randomized maximum/base output used by the Sieve runtime. |
| `chance` | number | `0.1` | Base probability from `0` to `1`. |
| `tier` | number | `0` | Minimum Mesh tier. |

Drops are appended to the input's existing array; registering another drop does not replace earlier candidates. The Auto Fisher also appends each received entry.

:::note Manual Sieve inputs
The Basic Sieve has its own accepted-input catalog. A new registry key is available to compatible scripted Sieve machinery, but it does not automatically add a new block to that Basic Sieve catalog. Existing accepted inputs such as Gravel work in both places.
:::

## Connect the equipment

Use the existing item components documented in [Item components](../reusable-components/item-components):

```json
{
  "utilitycraft:mesh": {
    "tier": 4,
    "multiplier": 1.5,
    "amount_multiplier": 1
  }
}
```

```json
{
  "utilitycraft:fishing_net": {
    "tier": 4,
    "speed": 1.5,
    "chance_multiplier": 1.75,
    "amount_multiplier": 1,
    "rolls": 2,
    "luck": 3
  }
}
```

## Test probabilistic drops

1. Start with `chance: 1` to prove the item ID, input, and tier are valid.
2. Test one tier below the requirement and confirm the drop cannot occur.
3. Test at the required tier and collect many operations.
4. Restore the intended chance only after the deterministic test passes.
5. Confirm output capacity is available; a successful roll cannot prove itself when every output slot is full.

Continue with [Reusable Components](../reusable-components/).
