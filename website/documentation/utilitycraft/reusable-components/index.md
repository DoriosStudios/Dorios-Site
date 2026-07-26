---
id: reusable-components
title: Reusable Components
sidebar_label: Overview
sidebar_position: 1
description: Reuse supported UtilityCraft block and item behavior without duplicating its scripts.
---

# Reusable Components

UtilityCraft registers several custom components that extension JSON can reference directly. This is useful when your addon needs the same behavior with different identifiers, parameters, recipes, or textures.

```json
{
  "utilitycraft:block_generator": {
    "material": "minecraft:deepslate",
    "amount": 3
  }
}
```

You do not import or register that component in your addon. UtilityCraft owns its handler; the extension only attaches the existing ID to an addon-owned block or item.

## Responsibility boundary

| UtilityCraft owns | Your extension owns |
| --- | --- |
| The custom component handler and its runtime behavior. | The block or item JSON that references it. |
| Shared behavior such as inserting generated blocks or reading tool parameters. | Unique identifiers, textures, names, recipes, catalog entries, and balanced values. |
| Shared geometry or UI assets explicitly reused by the template. | Any new assets not already supplied by UtilityCraft. |
| Validation implemented by the handler. | Every required state, tick, tag, helper entity, registry entry, and companion asset listed in the guide. |

Do not call `DoriosLib.registry.blockComponent()` or `itemComponent()` with a UtilityCraft-owned ID. A duplicate handler can override or conflict with the installed UtilityCraft version.

## Extension-facing components

The following components are used by current UtilityCraft or its Addon Template as reusable extension patterns:

| Kind | Components |
| --- | --- |
| Blocks | `utilitycraft:block_generator`, `utilitycraft:fluid_container`, `utilitycraft:gas_container`, `utilitycraft:infinite_tank`, `utilitycraft:infinite_energy_source`, `utilitycraft:machine_upgrades` |
| Items | `utilitycraft:hammer`, `utilitycraft:mesh`, `utilitycraft:fishing_net`, `utilitycraft:machine_upgrade` |

Other UtilityCraft component IDs implement concrete internal blocks or machines. Their presence in source does not make them a stable extension contract; use the documented patterns or create an addon-owned component instead.

- [Block components](./block-components)
- [Item components](./item-components)

For completely new behavior, register a unique ID such as `myaddon:custom_machine` through [DoriosLib's component registry](../../dorios_lib/API/registry).

Continue with [Block components](./block-components).
