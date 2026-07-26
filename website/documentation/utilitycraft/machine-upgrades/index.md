---
id: machine-upgrades
title: Machine Upgrades
sidebar_label: Overview
sidebar_position: 1
description: Register installable upgrade items and apply speed, energy, and batch perks to UtilityCraft machines.
---

# Machine Upgrades

Machine upgrades are addon-owned items whose numeric perks are resolved by DoriosCore. A normal upgrade needs three matching definitions:

```text
DoriosLib registration
    item ID -> type, levels, and perk values

Machine block component
    accepted type -> exact helper-entity slot and maximum level

Machine runtime
    scans configured slots -> exposes the result as machine.boosts
```

The standard upgrade UI displays those same helper-entity slots. It does not register or apply the perks by itself.

## What you will add

This section adds three upgrade categories to the Thermal Crusher:

| Upgrade item | Category | Standard perks |
| --- | --- | --- |
| Example Speed Upgrade | `speed` | `speed`, `energy_cost` |
| Example Efficiency Upgrade | `energy` | `energy_efficiency` |
| Example Batch Upgrade | `batch` | `process_batch`, `energy_cost` |

These are the standard values automatically interpreted by `Machine`:

| Boost | Base | Meaning |
| --- | ---: | --- |
| `speed` | `1` | Work-speed multiplier. |
| `energy_cost` | `1` | Energy-cost multiplier before efficiency. |
| `energy_efficiency` | `1` | Divisor that reduces effective consumption. |
| `process_batch` | `1` | Maximum operations completed by one process cycle. |
| `consumption` | calculated | `energy_cost / energy_efficiency`, clamped above zero. |

Registered perk values are added to these bases. A level with `speed: 0.25` produces `machine.boosts.speed === 1.25`.

## Files used

| File | Purpose |
| --- | --- |
| `BP/items/examples/example_*_upgrade.json` | Defines the three installable items. |
| `BP/scripts/config/upgrades.js` | Registers categories, levels, and perks through DoriosLib. |
| `BP/scripts/config/index.js` | Loads the registration module. |
| `BP/blocks/examples/example_thermal_crusher.json` | Declares accepted types, slots, and maximum levels. |
| `RP/ui/first_machine_ui.json` | Displays the exact upgrade slots. |
| `RP/texts/en_US.lang` | Item names and upgrade action-bar names. |

The item behavior and block component are supplied by UtilityCraft. Your extension uses them directly and does not duplicate their script implementations.

## Tutorial order

1. [Register an upgrade](./register-upgrade)
2. [Speed](./speed)
3. [Energy cost](./energy-cost)
4. [Process batch](./process-batch)

For every compiled field and duplicate-category rule, see the technical [MachineUpgradeRegistry reference](../../dorios_core/API/machine-upgrades). For the registration transport itself, see [`DoriosLib.registry.registerMachineUpgrade`](../../dorios_lib/API/registry#registermachineupgrade).

Start with [Register an upgrade](./register-upgrade).

