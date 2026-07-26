---
title: Test the Machine
sidebar_position: 7
description: Build, run, and verify the first machine across valid recipes, blocked outputs, energy loss, reloads, and destruction.
---

# Test the Machine

Test the completed machine in layers. A successful build proves that files are syntactically valid; the in-game checklist proves that lifecycle, inventory, energy, and persistence behave correctly.

## 1. Validate the project

From the template root:

```powershell
npm run check
npm run verify:imports
```

These commands should finish without an error in `thermalCrusher.js` or the crusher block definition.

If you use Regolith, export a readable development build:

```powershell
regolith run buildDev
```

If you do not use Regolith, update the `BP` and `RP` copies used by your normal Minecraft development workflow.

## 2. Prepare a test world

Enable:

- UtilityCraft BP and RP;
- the template BP and RP;
- the Script API settings required by the current Minecraft version.

Give yourself the teaching content and an energy source:

```mcfunction
/function example/kit
/give @s utilitycraft:creative_battery 1
/give @s utilitycraft:energy_cable 16
```

Connect the Example Thermal Crusher to the Creative Battery using UtilityCraft's normal energy connection. Open the crusher and confirm that its energy bar begins filling.

The existing template UI is temporary scaffolding for this tutorial. Use its input and output slots, but ignore its IO and Upgrades tabs until those sections are taught.

## 3. Test valid recipes

### Cobblestone to Gravel

1. Insert one Cobblestone into the input slot.
2. Confirm the block changes to its active texture.
3. Confirm the progress display advances.
4. Confirm stored energy decreases.
5. Wait for one Gravel in the output slot.
6. Confirm exactly one Cobblestone was consumed.

### Gravel to Sand

1. Clear the output slot.
2. Insert one Gravel.
3. Confirm the operation takes longer because it costs `1000` DE instead of `800` DE.
4. Confirm one Sand is produced.

### Multiple operations

Insert a stack of Cobblestone and leave enough output space. The machine should complete one item at a time without losing the remaining input.

## 4. Test invalid input

Insert an item without a recipe, such as Dirt.

Expected result:

- no item is consumed;
- no output is created;
- recipe progress resets to zero;
- the block turns off;
- the UI reports `Invalid Recipe`.

Remove the item. The UI should report `No Input` and remain off.

## 5. Test a blocked output

Create either condition:

- place a different item in the output slot; or
- fill the matching output stack to its maximum.

Then insert a valid input.

Expected result:

- the machine reports `Output Full`;
- no input is consumed;
- no new energy is consumed while blocked;
- existing partial progress is preserved;
- processing resumes after the output is cleared.

## 6. Test energy loss

Start a recipe, then disconnect or remove the energy source before completion.

Expected result:

- the machine consumes only the energy it actually received;
- the block turns off when storage reaches zero;
- the UI reports `No Energy`;
- partial progress remains;
- processing resumes from that progress when energy returns.

## 7. Test changing recipes

Partially process Cobblestone, remove it, and insert Gravel.

Expected result:

- the active-recipe marker changes;
- old Cobblestone progress is discarded;
- Gravel starts at zero progress;
- no free progress crosses between recipes.

## 8. Test reload behavior

Start a recipe and leave the world or move far enough for the chunk to unload. Return after loading the world again.

Expected result:

- the helper entity still exists at the controller block;
- stored energy remains;
- inventory contents remain;
- partial progress remains;
- the machine continues when its chunk is active and energy is available.

## 9. Test destruction

In Survival mode:

1. Place input and output items in the machine.
2. Store some energy.
3. Break the block.

Expected result:

- inventory contents are dropped once;
- the shared helper entity is removed;
- the machine item is dropped once;
- supported stored resources appear in the machine item's lore;
- placing that machine item restores its stored resources.

Repeat in Creative mode and confirm the shared cleanup completes without Survival duplicate-drop behavior.

## 10. Check the Content Log

The test is not complete if the machine appears to work but produces repeating scripting errors. Check specifically for:

- an unregistered block component;
- an invalid helper-entity event;
- a missing `utilitycraft:machine_entity`;
- an invalid energy or progress display item;
- access to a slot outside the 15-slot inventory;
- a private DoriosCore import;
- a missing UtilityCraft dependency.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| The block exists but never ticks | The component ID does not match, its module is not imported, or `minecraft:tick` is missing. |
| `machine.valid` is always false | Placement did not spawn the helper entity, the inventory is not ready, or the wrong block is being tested. |
| `utilitycraft:simple_machine` does not exist | The entity type was invented. Use `entity.type: "machine"`. |
| The machine has no energy | Connect a compatible UtilityCraft energy source and confirm the block keeps `tag:dorios:energy`. |
| Items disappear | Input was changed before output amount and capacity were validated. Restore the validation order from the tutorial. |
| The output never stacks | The existing output type differs or the positive amount is being applied to the wrong slot. |
| The block stays on while idle | An invalid/no-input branch does not call `showWarning()` or `off()`. |
| Breaking leaves an invisible inventory behind | The component is not calling `Machine.onDestroy(event)`. |
| The interface does not use the template layout | Confirm both RPs are enabled and the extension RP is above UtilityCraft RP. |

## Completion checklist

- [ ] Both recipes produce the correct item and amount.
- [ ] Energy decreases by the configured cost per completed operation.
- [ ] Progress pauses without energy.
- [ ] Invalid inputs reset progress.
- [ ] Blocked outputs preserve items and progress.
- [ ] Changing the input recipe resets incompatible progress.
- [ ] Reloading preserves machine state.
- [ ] Breaking the machine cleans up its helper entity.
- [ ] The Content Log has no repeating errors from this machine.

You now have a complete scripted machine lifecycle. Continue with [Machine UI](../machine-ui/) to replace the temporary template interface with one you understand and own.

