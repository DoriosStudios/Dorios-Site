---
title: Item Inputs and Outputs
sidebar_position: 2
description: Register the Thermal Crusher's item slots, supported face modes, UI buttons, and automatic item transfers.
---

# Item Inputs and Outputs

The Thermal Crusher already knows how to process slot `3` into slot `4`. Item IO adds an automation policy around those slots:

```text
input_1  -> automation may insert into slot 3
output_1 -> automation may extract from slot 4
disabled -> the face exposes neither slot
```

The recipe code does not change which slot it reads or writes.

## 1. Import the IO registry

Update the DoriosCore import in the crusher script:

```js title="BP/scripts/examples/machines/thermalCrusher.js"
import { Machine, registerIOInterface } from "DoriosCore/index.js";
```

Keep the required import style. Do not import from a private DoriosCore file.

## 2. Define the slot layout

Add these constants near the top of the module:

```js
const BLOCK_ID = "utilitycraft:example_thermal_crusher";
const INPUT_SLOT = 3;
const OUTPUT_SLOT = 4;
const ITEM_IO_BUTTON_SLOTS = [9, 14];
```

`[9, 14]` is an inclusive button range. It expands to:

```js
[9, 10, 11, 12, 13, 14]
```

Exactly six slots are required because the interface creates one button for each machine face.

## 3. Register the item policy

Register IO once at module load, before the block component registration:

```js title="BP/scripts/examples/machines/thermalCrusher.js"
registerIOInterface(BLOCK_ID, {
  items: {
    buttonSlots: ITEM_IO_BUTTON_SLOTS,
    anyInputSlots: [INPUT_SLOT],
    anyOutputSlots: [OUTPUT_SLOT],
    modes: [
      { id: "disabled" },
      { id: "input_1", inputSlots: [INPUT_SLOT] },
      { id: "output_1", outputSlots: [OUTPUT_SLOT] },
    ],
  },
});
```

Do not register this inside `onTick()`. The policy is static for the block type and should be installed only once when the module loads.

## Configuration fields

| Field | Value | Meaning |
| --- | --- | --- |
| `buttonSlots` | `[9, 14]` | Six helper-entity slots containing the clickable face buttons. |
| `anyInputSlots` | `[3]` | Input fallback for transfers without a known physical face. |
| `anyOutputSlots` | `[4]` | Output fallback for transfers without a known physical face. |
| `modes` | array | Ordered choices cycled independently by every face. |

The `any*` arrays are not a seventh face and do not enable every physical side. They are used when an adapter or link path cannot provide a direction.

Every fallback slot must also appear in a corresponding mode. For example, `anyInputSlots: [3]` is valid because `input_1` declares `inputSlots: [3]`.

## Mode fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | Yes | Exact visual state written into the face button. |
| `inputSlots` | For an input mode | Machine inventory slots automation may fill. |
| `outputSlots` | For an output mode | Machine inventory slots automation may drain. |

`disabled` must not declare inputs or outputs. Every other mode must expose at least one slot.

For a machine with two distinct inputs, the same pattern can expose separate modes:

```js
modes: [
  { id: "disabled" },
  { id: "input_1", inputSlots: [3] },
  { id: "input_2", inputSlots: [4] },
  { id: "output_1", outputSlots: [5] },
]
```

Use only visual IDs supported by UtilityCraft UI Core. `input_1` through `input_9` and `output_1` through `output_9` have matching numbered outlines. An invented ID can still enter the runtime configuration but has no matching outline and appears to disappear in the UI.

## 4. Process transfers

Call `processIO()` once after the machine is valid:

```js
onTick({ block }, { params: settings }) {
  const machine = new Machine(block, settings);
  if (!machine.valid) return;

  machine.processIO();

  // Continue with recipe validation and processing.
}
```

On an enabled input face, DoriosCore pulls compatible items from the adjacent container into slot `3`. On an enabled output face, it pushes items from slot `4` into the adjacent container.

The registration protects automation boundaries:

- input faces cannot insert into slot `4`;
- output faces cannot extract from slot `3`;
- disabled faces expose neither operational slot.

Recipe validation is still required. IO decides where an item may go, not whether its identifier has a valid crusher recipe.

## Optional transfer limits

The default call is appropriate for most machines. A machine can apply smaller budgets:

```js
const moved = machine.processIO({
  maxInputSlotsScannedPerTick: 6,
  maxOutputSlotsMovedPerTick: 2,
});
```

| Result field | Meaning |
| --- | --- |
| `itemsMoved` | Total item count transferred in this call. |
| `inputSlotsScanned` | Adjacent source slots examined while pulling. |
| `fluidMoved` | Liquid moved; remains `0` for this crusher. |
| `gasMoved` | Gas moved; remains `0` for this crusher. |

## Slot safety

The crusher's highest button slot is `14`, so its helper entity needs at least `15` inventory slots:

```json
{
  "entity": {
    "type": "machine",
    "inventory_size": 15
  }
}
```

Button slots must not overlap operational item slots. This layout is safe:

| Slots | Purpose |
| --- | --- |
| `0–2` | Energy, label, and progress display. |
| `3–4` | Recipe input and output. |
| `5–8` | Reserved upgrades. |
| `9–14` | Six item IO buttons. |

For the full configuration types and thrown validation errors, see the technical [IO interface API](../../dorios_core/API/io-interface).

Continue with [Configure the six faces](./six-faces) to connect these button slots to the UI.
