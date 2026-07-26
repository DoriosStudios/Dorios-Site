---
id: link-node-io
title: Link-node IO
sidebar_label: Link-node IO
sidebar_position: 11
description: Register logical item, liquid, and gas groups for physical multiblock ports.
---

# Link-node IO

Link-node IO lets a physical multiblock port route to selected item slots or liquid/gas indices on its active controller. The user configures each port through a standard form.

```js
import {
  getLinkNodeIODefinition,
  openLinkNodeIOForm,
  registerLinkNodeIO,
} from "DoriosCore/index.js";
```

DoriosLib owns the physical link-node association. DoriosCore defines the machinery-specific groups and opens the routing UI. UtilityCore continues to own networks.

## registerLinkNodeIO

<div class="api-signature">

`registerLinkNodeIO(blockTypeId: string, config: LinkNodeIOConfig): boolean`

</div>

Registers logical routes for one exact controller block type. The same declaration installs face-independent defaults in the ordinary item/liquid/gas backend.

| Parameter | Type | Description |
| --- | --- | --- |
| `blockTypeId` | `string` | Exact controller block identifier. Must be nonempty. |
| `config` | `LinkNodeIOConfig` | One or more `items`, `liquids`, or `gases` sections. |

Returns `true` after registration. Invalid definitions throw during module loading.

## Configuration types

### Item routes

```ts
interface LinkNodeItemIOConfig {
  anyInputSlots: number[];
  anyOutputSlots: number[];
  inputs: LinkNodeItemGroupConfig[];
  outputs: LinkNodeItemGroupConfig[];
}

interface LinkNodeItemGroupConfig {
  id: string;
  label?: string;
  color?: string;
  slots: number[];
}
```

### Liquid and gas routes

```ts
interface LinkNodeIndexedIOConfig {
  anyInputIndices: number[];
  anyOutputIndices: number[];
  inputs: LinkNodeIndexedGroupConfig[];
  outputs: LinkNodeIndexedGroupConfig[];
}

interface LinkNodeIndexedGroupConfig {
  id: string;
  label?: string;
  color?: string;
  indices: number[];
}
```

| Property | Description |
| --- | --- |
| `id` | Unique nonempty ID within the input or output list. `disabled` is reserved. |
| `label` | Text shown in the routing form. Defaults to `id`. |
| `color` | One Minecraft color code. Inputs default to `§9`; outputs default to `§c`. |
| `slots` / `indices` | Nonempty unique integer values from `0` through `255`. Runtime capacity is validated when the form saves. |
| `anyInput*` | Face-independent default. Must be empty or exactly match one declared input group. |
| `anyOutput*` | Face-independent default. Must be empty or exactly match one declared output group. |

Group IDs and value-array signatures must be unique. Register at least one resource section.

## Example: item port

```js
registerLinkNodeIO("myaddon:factory_crusher", {
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
});
```

## Example: liquid and gas ports

```js
registerLinkNodeIO("myaddon:chemical_reactor", {
  liquids: {
    anyInputIndices: [0],
    anyOutputIndices: [1],
    inputs: [
      { id: "solvent", label: "Solvent Input", color: "§b", indices: [0] },
    ],
    outputs: [
      { id: "waste", label: "Liquid Waste", color: "§6", indices: [1] },
    ],
  },
  gases: {
    anyInputIndices: [0],
    anyOutputIndices: [1],
    inputs: [
      { id: "reactant", label: "Reactant Gas", color: "§d", indices: [0] },
    ],
    outputs: [
      { id: "exhaust", label: "Gas Exhaust", color: "§7", indices: [1] },
    ],
  },
});
```

## getLinkNodeIODefinition

<div class="api-signature">

`getLinkNodeIODefinition(blockTypeId: string): LinkNodeIODefinition | undefined`

</div>

Returns a defensive copy of the normalized definition, or `undefined` when the block type is not registered.

Normalized groups use:

```ts
interface LinkNodeIOGroup {
  id: string;
  label: string;
  color: string;
  values: number[];
}
```

`values` contains slots for items and storage indices for liquids/gases.

## openLinkNodeIOForm

<div class="api-signature">

`openLinkNodeIOForm(block: Block, player: Player): Promise<boolean>`

</div>

Resolves the active controller linked to `block`, detects the resources supported by the physical port tags, and opens Input to / Output from dropdowns.

| Parameter | Type | Description |
| --- | --- | --- |
| `block` | `Block` | Physical port or link-node block being configured. |
| `player` | `Player` | Player shown the modal and action-bar result. |

Returns `true` when valid selections are saved. It returns `false` when:

- the node is not linked to exactly one active machine;
- the controller has no link-node definition;
- the port has no supported `dorios:item`, `dorios:fluid`, or `dorios:gas` tag;
- the player cancels;
- a selection exceeds the current controller capacity;
- form display or persistence fails.

```js
import { openLinkNodeIOForm } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";

DoriosLib.registry.blockComponent("myaddon:machine_port", {
  onPlayerInteract({ block, player }) {
    if (!block || !player) return;
    void openLinkNodeIOForm(block, player);
  },
});
```

## Runtime resolution

After a selection is saved, the [container adapters](./container-adapters) resolve the physical port to its controller entity. A per-port override takes priority over the controller's `anyInput` or `anyOutput` fallback.

See the [Factory Crusher](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/multiblocks/factoryCrusher.js) and [Biofuel Dynamo](https://github.com/DoriosStudios/UtilityCraft-Addon-Template/blob/main/BP/scripts/examples/multiblocks/biofuelDynamo.js).

