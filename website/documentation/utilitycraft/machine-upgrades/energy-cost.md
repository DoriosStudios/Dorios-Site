---
title: Energy Cost Upgrades
sidebar_position: 4
description: Calculate effective machine consumption from energy_cost and energy_efficiency without applying either perk twice.
---

# Energy Cost Upgrades

DoriosCore represents energy changes with two standard boosts:

```text
consumption = energy_cost / energy_efficiency
```

- `energy_cost` increases the energy required by speed, batch, or other power-hungry upgrades.
- `energy_efficiency` reduces that effective requirement.

Both start at `1` and receive additive registered contributions.

## Efficiency registration

```js
"utilitycraft:example_efficiency_upgrade": {
  type: "energy",
  levels: {
    1: { energy_efficiency: 0.25 },
    2: { energy_efficiency: 0.75 },
    3: { energy_efficiency: 1.5 },
    4: { energy_efficiency: 3.0 },
  },
}
```

With no energy penalties from other upgrades:

| Level | Efficiency boost | Resolved efficiency | Consumption | Energy for an 800 DE cycle |
| ---: | ---: | ---: | ---: | ---: |
| `0` | `0` | `1.00` | `1.0000` | `800 DE` |
| `1` | `0.25` | `1.25` | `0.8000` | `640 DE` |
| `2` | `0.75` | `1.75` | `0.5714` | about `457 DE` |
| `3` | `1.50` | `2.50` | `0.4000` | `320 DE` |
| `4` | `3.00` | `4.00` | `0.2500` | `200 DE` |

The registered number is an additive efficiency contribution, not a percentage removed directly from the cost.

## Combine penalties and efficiency

Boosts from different accepted categories are added independently before consumption is calculated.

Example: Speed level `1` and Efficiency level `1` produce:

```text
energy_cost       = 1 + 0.15 = 1.15
energy_efficiency = 1 + 0.25 = 1.25
consumption       = 1.15 / 1.25 = 0.92
effective cycle   = 800 × 0.92 = 736 DE
```

The machine is `1.25×` faster while consuming `736 DE` for the base `800 DE` process.

## Use the base recipe cost

Keep recipe definitions in base units:

```js
const RECIPES = Object.freeze({
  "minecraft:cobblestone": {
    output: "minecraft:gravel",
    amount: 1,
    cost: 800,
  },
});
```

Pass the base value to the shared process helper:

```js
const result = advanceProcessCycle(machine, {
  energyCost: recipe.cost,
  maxCrafts,
  onComplete(craftCount) {
    completeRecipe(machine, recipe, craftCount);
  },
});
```

The helper reads `machine.boosts.consumption`. Do not pre-multiply `recipe.cost` by `energy_cost`, or the penalty will be applied twice.

## Show effective values

```js
const effectiveCost = recipe.cost * machine.boosts.consumption;

machine.setLabel([
  "§r§aThermal Crusher Running",
  `§r§7Base Cost: §f${recipe.cost} DE`,
  `§r§7Effective Cost: §f${Math.ceil(effectiveCost)} DE`,
  `§r§7Efficiency: §f${(1 / machine.boosts.consumption).toFixed(2)}x`,
]);
```

Use the unrounded value for processing. Rounding is only for readable UI text.

## Why consumption is clamped

`Machine` clamps `energy_cost`, `energy_efficiency`, and the final `consumption` above zero. This prevents invalid custom perk combinations from producing negative energy use or division by zero.

The clamp is a safety boundary, not a replacement for sensible registrations. Use finite values and test every maximum stack combination accepted by the machine.

Continue with [Process batch upgrades](./process-batch).

