---
id: registries
title: UtilityCraft Registries
sidebar_label: Overview
sidebar_position: 1
description: Add recipes, resources, plants, fuels, coolants, and loot to UtilityCraft through DoriosLib.
---

# UtilityCraft Registries

Registries let an extension add data to systems that UtilityCraft already runs. Your addon owns the new items, blocks, entities, textures, and scripts; UtilityCraft only receives the JSON-serializable definitions that connect them to its machines.

```js
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.registerFuel({
  "utilitycraft:example_biomass": 12000,
});
```

## Where registrations belong

Keep registrations in `BP/scripts/config/` and import them once from its index:

```text
BP/scripts/
├── config/
│   ├── index.js
│   ├── integrations.js
│   ├── resources.js
│   └── recipes/
│       └── index.js
└── main.js
```

```js title="BP/scripts/config/index.js"
import "./resources.js";
import "./integrations.js";
import "./recipes/index.js";
```

The template's `main.js` imports `config/index.js` once. Call registry methods while modules load—not inside `onTick`, an interval, or an event that can run repeatedly. DoriosLib queues each payload and dispatches it after the world is ready.

## Shared rules

| Rule | Meaning |
| --- | --- |
| JSON-serializable payload | Use plain objects, arrays, strings, numbers, and booleans. Functions and class instances do not belong in registry data. |
| Exact identifiers | Item and block IDs normally include their namespace. Resource types such as `example_coolant` are unnamespaced storage keys. |
| Add or replace | A new key adds an entry. Registering a key that already exists replaces or extends it according to that registry's page. Pack and registration order matter when two addons use the same key. |
| Addon-owned content | Prefer your own namespace and inputs so another pack cannot unexpectedly replace the same definition. |
| Assets remain yours | Registering data never creates the referenced item, block, entity, texture, or localization entry. |

## Choose a registry

| Goal | Guide | Main methods |
| --- | --- | --- |
| Process an item in an existing machine | [Add recipes to existing machines](./machine-recipes) | `registerCrusherRecipe()`, `registerPressRecipe()`, `registerInfuserRecipe()`, `registerMelterRecipe()`, `registerFurnaceRecipe()`, `registerCrafterRecipe()` |
| Burn a custom item or improve coolant | [Fuels and coolants](./fuels-coolants) | `registerFuel()`, `registerCoolant()` |
| Move custom liquids or gases in containers | [Fluids and gases](./fluids-gases) | `registerFluidItem()`, `registerFluidHolder()`, `registerGasItem()`, `registerGasHolder()` |
| Integrate a seed with plant machines and Bonsai | [Plants and bonsais](./plants-bonsais) | `registerPlant()` |
| Add probabilistic machine loot | [Fishing and sieve drops](./fishing-sieve) | `registerAutoFisherDrop()`, `registerSieveDrop()` |

For the method-level API, see the [DoriosLib registry reference](../../dorios_lib/API/registry).

Continue with [Add recipes to existing machines](./machine-recipes).
