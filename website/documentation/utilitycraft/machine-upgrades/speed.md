---
title: Speed Upgrades
sidebar_position: 3
description: Understand the standard speed multiplier, its energy penalty, and how Machine applies both without resetting progress.
---

# Speed Upgrades

The Example Speed Upgrade increases processing speed and adds an energy-cost penalty. Both values are standard DoriosCore perks, so `Machine` applies them automatically.

## Registered values

```js
"utilitycraft:example_speed_upgrade": {
  type: "speed",
  levels: {
    1: { speed: 0.25, energy_cost: 0.15 },
    2: { speed: 0.65, energy_cost: 0.35 },
    3: { speed: 1.25, energy_cost: 0.75 },
    4: { speed: 2.0, energy_cost: 1.25 },
  },
}
```

Because both base values begin at `1`, the resolved results are:

| Installed level | `machine.boosts.speed` | `machine.boosts.energy_cost` | Work speed | Energy for an 800 DE cycle without efficiency |
| ---: | ---: | ---: | ---: | ---: |
| `0` | `1.00` | `1.00` | `1.00×` | `800 DE` |
| `1` | `1.25` | `1.15` | `1.25×` | `920 DE` |
| `2` | `1.65` | `1.35` | `1.65×` | `1080 DE` |
| `3` | `2.25` | `1.75` | `2.25×` | `1400 DE` |
| `4` | `3.00` | `2.25` | `3.00×` | `1800 DE` |

## Machine applies the multiplier

The Thermal Crusher continues to define only its base rate:

```json
{
  "rate_speed_base": 40
}
```

When the runtime is constructed, `Machine` resolves the installed stacks and derives its effective rate. The recipe script should not multiply the base rate by `machine.boosts.speed` again.

The template's processing helper uses `machine.rate`:

```js
const energyToConsume = Math.min(
  machine.energy.get(),
  machine.rate,
  progressCapacity * consumption,
);
```

The energy drawn during a tick is converted back into work progress using the current consumption multiplier. This preserves the intended speed increase while charging its registered energy penalty.

## Read the resolved value

Use `machine.boosts` for labels or addon-owned logic:

```js
machine.setLabel([
  "§r§aThermal Crusher Running",
  `§r§7Speed: §f${machine.boosts.speed.toFixed(2)}x`,
  `§r§7Consumption: §f${machine.boosts.consumption.toFixed(2)}x`,
]);
```

Every formatted line starts with `§r` so no previous formatting leaks into it.

## Insert or remove an upgrade during processing

Progress is stored as work completed toward the recipe's base process cost. When an upgrade changes:

1. the next `Machine` instance resolves the new stack level;
2. the effective rate and consumption multiplier change;
3. stored progress remains intact;
4. future ticks continue from that progress at the new rate.

Do not reset progress merely because the upgrade slot changed. Reset only when the active recipe itself becomes invalid or the machine's design intentionally cancels work.

## Avoid double application

This is incorrect for the normal `Machine` class:

```js
machine.setRate(settings.machine.rate_speed_base * machine.boosts.speed);
```

`Machine` already applied `speed` during construction. Multiplying it again makes level `4` act like `9×` instead of `3×`.

Custom perk names are different: DoriosCore preserves them in `machine.boosts`, but an addon-owned subclass must decide how to interpret them.

Continue with [Energy cost upgrades](./energy-cost).
