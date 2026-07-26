---
title: Process Batch Upgrades
sidebar_position: 5
description: Complete multiple safe recipe operations per cycle using process_batch, full input validation, and output-capacity checks.
---

# Process Batch Upgrades

`process_batch` controls how many recipe operations one completed process cycle can produce. The base is `1`, so registered values are additional crafts.

## Registered values

```js
"utilitycraft:example_batch_upgrade": {
  type: "batch",
  levels: {
    1: { process_batch: 1, energy_cost: 0.25 },
    2: { process_batch: 2, energy_cost: 0.6 },
    3: { process_batch: 4, energy_cost: 1.25 },
    4: { process_batch: 7, energy_cost: 2.25 },
  },
}
```

Without other upgrades:

| Level | Resolved batch | Cost multiplier | Energy per full 800 DE cycle | Energy per produced item when full |
| ---: | ---: | ---: | ---: | ---: |
| `0` | `1` | `1.00` | `800 DE` | `800 DE` |
| `1` | `2` | `1.25` | `1000 DE` | `500 DE` |
| `2` | `3` | `1.60` | `1280 DE` | about `427 DE` |
| `3` | `5` | `2.25` | `1800 DE` | `360 DE` |
| `4` | `8` | `3.25` | `2600 DE` | `325 DE` |

Batch size is a maximum. A cycle can complete fewer operations when less input or output capacity is available.

## Calculate safe craft capacity first

Before consuming energy or items, determine how many complete crafts can fit:

```js
const outputCapacity = getOutputCapacity(
  machine.container,
  OUTPUT_SLOT,
  recipe.output,
);

const maxCrafts = Math.min(
  input.amount,
  Math.floor(outputCapacity / recipe.amount),
);
```

For a recipe that requires more than one input item, include that divisor:

```js
const maxCrafts = Math.min(
  Math.floor(input.amount / recipe.required),
  Math.floor(outputCapacity / recipe.amount),
);
```

The result must be calculated before mutating the inventory. This guarantees that the callback receives only crafts that can complete safely.

## Let the helper apply process_batch

```js
const result = advanceProcessCycle(machine, {
  energyCost: recipe.cost,
  maxCrafts,
  onComplete(craftCount) {
    DoriosLib.entity.changeItemAmount(machine.entity, {
      slot: INPUT_SLOT,
      amount: -(craftCount * recipe.required),
    });

    const produced = craftCount * recipe.amount;
    const output = machine.container.getItem(OUTPUT_SLOT);

    if (output) {
      DoriosLib.entity.changeItemAmount(machine.entity, {
        slot: OUTPUT_SLOT,
        amount: produced,
      });
    } else {
      machine.container.setItem(
        OUTPUT_SLOT,
        new ItemStack(recipe.output, produced),
      );
    }
  },
});
```

The helper reads:

```js
const processBatch = Math.max(
  1,
  Math.floor(machine.boosts.process_batch ?? 1),
);
```

The concrete recipe callback receives the final `craftCount`. It should not read `process_batch` again or multiply the result a second time.

## Why output capacity must include recipe amount

If one craft produces two items and the output has room for six, only three crafts fit:

```text
floor(6 available items / 2 items per craft) = 3 crafts
```

Using the raw capacity as `maxCrafts` would attempt to produce twelve items and overflow the stack.

## Partial batches

Suppose level `4` allows eight crafts but only three inputs remain. The machine completes three operations, consumes three inputs, and produces three recipe results. It does not wait indefinitely for a full batch.

This keeps small stacks usable while preserving the upgrade's maximum throughput when enough resources are available.

## Keep progress safe when blocked

Return before advancing the cycle when no complete craft fits:

```js
if (maxCrafts <= 0) {
  machine.off();
  machine.showWarning("Output Full", {
    resetProgress: false,
  });
  return;
}
```

`resetProgress: false` pauses existing work. Once output capacity becomes available, processing resumes without losing stored progress.

## Show the current batch

```js
machine.setLabel([
  "§r§aThermal Crusher Running",
  `§r§7Batch: §fx${Math.max(1, Math.floor(machine.boosts.process_batch))}`,
  `§r§7Available Crafts: §f${maxCrafts}`,
  `§r§7Completed This Cycle: §f${result.craftCount}`,
]);
```

All formatted lines begin with `§r`.

## Final upgrade checklist

- Every upgrade item uses `utilitycraft:machine_upgrade`.
- DoriosLib registers the exact item identifier before gameplay begins.
- `type` matches the block component's accepted category.
- Level `1` exists and every perk is a finite number.
- `machine.upgrades`, the block component, and `uc.upgrades_tab` use the same slots.
- Recipe costs remain base values.
- Speed and consumption are not multiplied twice.
- Batch capacity is validated before input or output mutation.
- Custom perk names are interpreted only by addon-owned classes.

For lower-level lookup and custom perks, see [MachineUpgradeRegistry](../../dorios_core/API/machine-upgrades). Continue with [UtilityCraft Registries](../registries/).

