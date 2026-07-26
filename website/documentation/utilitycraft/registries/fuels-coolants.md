---
title: Fuels and Coolants
sidebar_position: 3
description: Register custom fuel energy and coolant efficiency through DoriosLib.
---

# Fuels and Coolants

Fuel and coolant registrations attach UtilityCraft behavior to identifiers your addon already owns. They do not create the fuel item or the coolant liquid.

## Register a fuel

```js title="BP/scripts/config/integrations.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerFuel({
  "utilitycraft:example_biomass": 12000,
});
```

The object key is the exact namespaced item ID. Its value is the total Dorios Energy stored as burn energy when one item is consumed.

| Value | Meaning |
| --- | --- |
| `12000` | One Example Biomass supplies `12,000 DE` in total. |
| Generator output rate | Controls how quickly that stored burn energy becomes usable energy; it does not change the registered total. |

Use a positive finite number and an exact identifier. UtilityCraft has internal matching rules for some built-in fuels, but broad or partial addon keys can match unintended items.

Registering the same item ID again replaces its previous fuel value. Registering a new key adds a new fuel.

## Register a coolant

```js title="BP/scripts/config/resources.js"
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerCoolant({
  example_coolant: {
    efficiency: 1.25,
    tier: 1,
  },
});
```

Coolant keys are storage types without a namespace prefix.

| Field | Type | Meaning |
| --- | --- | --- |
| Type key | string | Liquid type stored by `FluidStorage`, such as `example_coolant`. |
| `efficiency` | positive number | Consumption divisor used by coolant-powered machines. `1.25` makes the same work consume less coolant than efficiency `1`. |
| `tier` | finite number | Compatibility tier for machines that enforce coolant tiers. Defaults to `0`. |

UtilityCraft's water baseline uses efficiency `1` and tier `0`. A value of `2` means a compatible calculation needs half as much coolant for the same result. It does not double a machine's energy output unless that machine explicitly uses it that way.

The receiver rejects non-positive efficiency values. Registering the same coolant type again replaces its definition.

## Complete the coolant resource

`registerCoolant()` only describes coolant performance. A usable custom coolant also needs:

1. A fluid container registration and holder registration.
2. Filled and empty container items.
3. Display items and textures for frames `00` through `48`.
4. A physical tank entity and client entity when it can appear in world tanks.

Build those pieces in [Fluids and gases](./fluids-gases).

## Load and test

Import the module once from `config/index.js`:

```js title="BP/scripts/config/index.js"
import "./integrations.js";
import "./resources.js";
```

Test the fuel in a compatible fuel generator and compare the full energy delivered by one item. Test the coolant in a compatible coolant-consuming generator, confirm that its type is accepted, and compare consumption against water or another known coolant.

Continue with [Fluids and gases](./fluids-gases).
