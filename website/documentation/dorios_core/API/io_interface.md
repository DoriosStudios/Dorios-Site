---
id: io-interface
title: IO interfaces
sidebar_label: IO interfaces
sidebar_position: 8
description: Register item, liquid, and gas face controls with registerIOInterface and IOInterface.
---

# IO interfaces

The IO interface API defines the slots or indexed tanks that each machine face can expose. When `buttonSlots` is present, it also installs the six buttons used by the standard UtilityCraft IO tab.

## Import

```js
import {
  IOInterface,
  ensureBlockIOInterface,
  hasRegisteredIOInterface,
  registerIOInterface,
  registerIOInterfaceForBlockTag,
} from "DoriosCore/index.js";
```

## registerIOInterface

<div class="api-signature">

`registerIOInterface(blockTypeId: string, config?: IOInterfaceConfig): boolean`

</div>

Registers the IO policy for one exact block identifier. Exact registrations take priority over tag-based definitions.

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `blockTypeId` | `string` | Yes | Exact namespaced block identifier, such as `myaddon:crusher`. |
| `config` | `IOInterfaceConfig` | No | Item, liquid, and gas policies. An omitted or empty config registers nothing. |

### Returns

`true` when at least one backend resource group was registered; otherwise `false`.

### Example: item machine

```js
registerIOInterface("myaddon:crusher", {
  items: {
    buttonSlots: [9, 14],
    anyInputSlots: [3],
    anyOutputSlots: [4],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputSlots: [3] },
      { id: "output_1", outputSlots: [4] },
    ],
  },
});
```

## IOInterfaceConfig

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `invertFaces` | `boolean` | No | Resolves each visual face to the opposite physical direction. Defaults to `false`. |
| `items` | `ItemIOGroupConfig` | No | Inventory-slot policy and optional item buttons. |
| `liquids` | `LiquidIOGroupConfig` | No | Indexed-liquid policy and optional liquid buttons. |
| `gases` | `GasIOGroupConfig` | No | Indexed-gas policy and optional gas buttons. Gas configuration is stored separately from liquids. |

### ItemIOGroupConfig

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `buttonSlots` | `number[] \| [number, number]` | No | Exactly six UI slots, or a two-number inclusive range that expands to six slots. |
| `anyInputSlots` | `number[]` | Yes | Input fallback when the source face is unknown. |
| `anyOutputSlots` | `number[]` | Yes | Output fallback when the destination face is unknown. |
| `modes` | `ItemIOModeConfig[]` | Yes | Ordered modes cycled independently for each face. |

### LiquidIOGroupConfig and GasIOGroupConfig

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `buttonSlots` | `number[] \| [number, number]` | No | Exactly six UI slots, or an inclusive six-slot range. |
| `anyInputIndices` | `number[]` | Yes | Tank-index fallback when the source face is unknown. |
| `anyOutputIndices` | `number[]` | Yes | Tank-index fallback when the destination face is unknown. |
| `modes` | `FluidIOModeConfig[]` or `GasIOModeConfig[]` | Yes | Ordered modes whose entries use `inputIndices` and `outputIndices`. |

### Button-slot rules

- Each declared resource group must use six unique slots when `buttonSlots` is present.
- `[9, 14]` means the inclusive range `9` through `14`.
- A longer array is treated as an explicit list and must contain exactly six entries.
- Item IO buttons cannot overlap operational item slots.
- Item, liquid, and gas button groups cannot share UI slots with each other.
- Slot values must be integers from `0` through `255`.

Invalid button layouts throw `RangeError` during registration so configuration problems fail at startup rather than during machine ticks.

## Modes

A mode ID is the visible name tag consumed by UtilityCraft's UI assets. Its slot or index arrays define the actual policy while that mode is selected.

```js
{
  id: "input_1",
  inputSlots: [3]
}
```

```js
{
  id: "output_1",
  outputIndices: [0]
}
```

Use mode IDs supported by the shared resource pack. Typical modes include `disabled`, `input_1`, `input_2`, `output_1`, and `output_2`, depending on the UI being represented.

## Example: items, liquids, and gases

```js
registerIOInterface("myaddon:chemical_processor", {
  items: {
    buttonSlots: [10, 15],
    anyInputSlots: [3, 4],
    anyOutputSlots: [5],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputSlots: [3] },
      { id: "input_2", inputSlots: [4] },
      { id: "output_1", outputSlots: [5] },
    ],
  },
  liquids: {
    buttonSlots: [16, 21],
    anyInputIndices: [0],
    anyOutputIndices: [1],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputIndices: [0] },
      { id: "output_1", outputIndices: [1] },
    ],
  },
  gases: {
    buttonSlots: [22, 27],
    anyInputIndices: [0],
    anyOutputIndices: [1],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputIndices: [0] },
      { id: "output_1", outputIndices: [1] },
    ],
  },
});
```

## registerIOInterfaceForBlockTag

<div class="api-signature">

`registerIOInterfaceForBlockTag(blockTag: string, config?: IOInterfaceConfig): boolean`

</div>

Stores a reusable IO template for blocks carrying one exact runtime tag. Supply the runtime tag name without the JSON `tag:` prefix.

The first encountered block type with that tag is materialized into an ordinary exact registration. If a block matches more than one registered IO tag, resolution fails closed and logs a warning.

```js
registerIOInterfaceForBlockTag("myaddon:crusher_family", crusherIO);
```

## ensureBlockIOInterface

<div class="api-signature">

`ensureBlockIOInterface(block?: Block): boolean`

</div>

Returns `true` when the block already has an exact registration or a single matching tag template can be materialized. Invalid blocks, no matches, and ambiguous matches return `false`.

## hasRegisteredIOInterface

<div class="api-signature">

`hasRegisteredIOInterface(blockTypeId: string): boolean`

</div>

Returns whether an exact block type currently owns a complete IO registration.

## IOInterface facade

`IOInterface` exposes the four functions above as properties for namespace-style callers:

```js
import { IOInterface } from "DoriosCore/index.js";

IOInterface.registerIOInterface("myaddon:crusher", config);
```

The direct function imports and facade methods have identical behavior.

