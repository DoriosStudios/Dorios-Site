---
title: Ports and Link Nodes
sidebar_position: 4
description: Create multiblock ports and register exact item, liquid, and gas routes for their active controller.
---

# Ports and Link Nodes

A multiblock port is a casing block that exposes controller storage to an external UtilityCraft network. The port does not own a separate inventory or tank. When the structure activates, it becomes a link node associated with the controller's helper entity.

There are two separate configurations:

| Layer | Purpose |
| --- | --- |
| Physical port block | Declares that the block is a casing, a link node, and which resource it supports while active. |
| Controller link-node registration | Declares the exact controller slots or storage indices that players may select at that port. |

DoriosLib stores and resolves the physical association. DoriosCore validates logical groups and displays the selection form. UtilityCore owns network discovery and resource transfer.

## Resource identifiers

Use the correct value type for each resource:

| Resource | Port tag | Values registered on the controller |
| --- | --- | --- |
| Items | `dorios:item` | Helper-entity inventory slots. |
| Liquids | `dorios:fluid` | Liquid storage indices. |
| Gases | `dorios:gas` | Gas storage indices. |
| Energy | `dorios:energy` | No selectable group; the controller energy storage is used directly. |

An inventory display slot and a liquid or gas index are not interchangeable. For example, a liquid rendered in inventory slot `2` can still belong to liquid storage index `0`.

## 1. Register the shared interaction component

Item, liquid, and gas ports can all use one addon-owned block component:

```js title="BP/scripts/examples/multiblocks/linkNodePort.js"
// @ts-check

import { openLinkNodeIOForm } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.blockComponent("myaddon:link_node_port", {
  onPlayerInteract({ block, player }) {
    if (!block || !player) return;
    void openLinkNodeIOForm(block, player);
  },
});
```

`openLinkNodeIOForm()`:

1. resolves the one active controller linked to this position;
2. reads the definition registered for that controller block ID;
3. detects supported resources from the port's active tags;
4. displays input and output dropdowns;
5. saves the selected per-port routes.

It returns `false` when the structure is inactive, the node matches no single controller, no definition exists, the form is canceled, or the selected values exceed the controller's current storage capacity.

Energy ports do not need this component because energy has no input/output slot group to select.

Load the module once from the multiblock index:

```js title="BP/scripts/examples/multiblocks/index.js"
import "./linkNodePort.js";
import "./factoryCrusher.js";
```

## 2. Create an item port block

The complete item-port behavior is small:

```json title="BP/blocks/multiblocks/item_port.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "myaddon:item_port",
      "menu_category": { "category": "construction" },
      "states": {
        "utilitycraft:active": [0, 1]
      }
    },
    "components": {
      "minecraft:geometry": "minecraft:geometry.full_block",
      "minecraft:material_instances": {
        "*": {
          "texture": "myaddon_item_port",
          "render_method": "opaque"
        }
      },
      "myaddon:link_node_port": {},
      "tag:dorios:link_node": {},
      "tag:dorios:multiblock.case.myaddon": {}
    },
    "permutations": [
      {
        "condition": "q.block_state('utilitycraft:active') == 1",
        "components": {
          "tag:dorios:item": {},
          "tag:dorios:link_node": {},
          "tag:dorios:multiblock.case.myaddon": {}
        }
      }
    ]
  }
}
```

| Part | Why it is required |
| --- | --- |
| `utilitycraft:active` | DoriosCore changes this state to `1` after a valid activation and back to `0` on deactivation. |
| `dorios:link_node` | Lets DoriosLib recognize the block as a physical node. |
| Exact casing tag | Allows the port to occupy the outer shell accepted by the controller. |
| Interaction component | Opens the route selector for item, liquid, or gas ports. |
| Resource tag in active permutation | Makes the active node visible to the matching network type. |

Keep the link-node and casing tags in the active permutation along with the resource tag. This matches the working template port definitions.

## 3. Create the other resource ports

Copy the item-port structure and change only the block ID, texture, and active resource tag:

```json title="Liquid port active permutation"
{
  "condition": "q.block_state('utilitycraft:active') == 1",
  "components": {
    "tag:dorios:fluid": {},
    "tag:dorios:link_node": {},
    "tag:dorios:multiblock.case.myaddon": {}
  }
}
```

```json title="Gas port active permutation"
{
  "condition": "q.block_state('utilitycraft:active') == 1",
  "components": {
    "tag:dorios:gas": {},
    "tag:dorios:link_node": {},
    "tag:dorios:multiblock.case.myaddon": {}
  }
}
```

An energy port keeps the same state, link-node tag, casing tag, and active permutation, but uses `tag:dorios:energy` and omits `myaddon:link_node_port`:

```json title="BP/blocks/multiblocks/energy_port.json"
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "myaddon:energy_port",
      "menu_category": { "category": "construction" },
      "states": {
        "utilitycraft:active": [0, 1]
      }
    },
    "components": {
      "minecraft:geometry": "minecraft:geometry.full_block",
      "minecraft:material_instances": {
        "*": {
          "texture": "myaddon_energy_port",
          "render_method": "opaque"
        }
      },
      "tag:dorios:link_node": {},
      "tag:dorios:multiblock.case.myaddon": {}
    },
    "permutations": [
      {
        "condition": "q.block_state('utilitycraft:active') == 1",
        "components": {
          "tag:dorios:energy": {},
          "tag:dorios:link_node": {},
          "tag:dorios:multiblock.case.myaddon": {}
        }
      }
    ]
  }
}
```

## 4. Register controller routes

Register routes against the controller block ID, not the port block ID:

```js title="BP/scripts/examples/multiblocks/myController.js"
import { registerLinkNodeIO } from "DoriosCore/index.js";

const CONTROLLER_ID = "myaddon:factory_processor";

registerLinkNodeIO(CONTROLLER_ID, {
  items: {
    anyInputSlots: [3],
    anyOutputSlots: [4],
    inputs: [
      {
        id: "material",
        label: "Material Input",
        color: "§9",
        slots: [3],
      },
    ],
    outputs: [
      {
        id: "product",
        label: "Product Output",
        color: "§c",
        slots: [4],
      },
    ],
  },
  liquids: {
    anyInputIndices: [0],
    anyOutputIndices: [],
    inputs: [
      {
        id: "coolant",
        label: "Coolant Input",
        color: "§9",
        indices: [0],
      },
    ],
    outputs: [],
  },
  gases: {
    anyInputIndices: [],
    anyOutputIndices: [0],
    inputs: [],
    outputs: [
      {
        id: "exhaust",
        label: "Exhaust Output",
        color: "§c",
        indices: [0],
      },
    ],
  },
});
```

Declare only resources that the controller actually stores. The controller above requires at least five inventory slots, one liquid storage, and one gas storage.

### Registration fields

| Field | Meaning |
| --- | --- |
| `anyInputSlots` / `anyOutputSlots` | Default item route used when a port has no override. |
| `anyInputIndices` / `anyOutputIndices` | Default liquid or gas route. |
| `inputs` / `outputs` | Groups displayed in that direction's dropdown. |
| `id` | Unique stable ID inside this resource and direction. `disabled` is reserved. |
| `label` | Player-facing dropdown text. Defaults to the ID. |
| `color` | One Minecraft color code such as `§9` or `§c`. |
| `slots` | Exact item inventory slots in this group. |
| `indices` | Exact liquid or gas storage indices in this group. |

Every value must be a unique integer from `0` through `255`. A default array must be empty or match exactly one declared group. For example, `anyInputSlots: [3, 4]` is invalid when the only input groups are `[3]` and `[4]`.

`registerLinkNodeIO()` also installs face-independent defaults in the ordinary IO backend. Do not register a second conflicting IO definition for the same controller.

## 5. Understand activation

When a player activates a valid multiblock with a wrench, DoriosCore:

1. finds link-node blocks on the outer casing;
2. records their positions on the controller entity;
3. changes each `utilitycraft:active` state to `1`;
4. detects the active resource tag;
5. asks UtilityCore to refresh the appropriate nearby network.

When the structure deactivates, those associations are removed, the port state returns to `0`, and affected networks refresh again. Do not change the active state manually in your tick loop.

## 6. Test every port

1. Place one port in the outer shell before activation.
2. Activate the controller with a wrench and confirm the port changes to its active texture or state.
3. Use an item, liquid, or gas port and verify its form lists only registered groups.
4. Select an input route and test transfer from the matching UtilityCraft network.
5. Select an output route and verify it cannot read an unrelated slot or index.
6. Test the energy port without expecting a route form.
7. Break one casing block and confirm every port returns to inactive state.
8. Repair and reactivate the structure; confirm saved defaults and valid per-port routing work again.

For the full contract and failure cases, see the technical [`registerLinkNodeIO` and `openLinkNodeIOForm` reference](../../dorios_core/API/link-node-io).

Continue with [Multiblock Machines](./multiblocks).
