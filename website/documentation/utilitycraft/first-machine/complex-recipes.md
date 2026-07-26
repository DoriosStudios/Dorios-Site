---
title: Complex Recipes
sidebar_position: 7
description: Index ordered and multislot recipes with composite keys, canonical signatures, Objects, and Maps instead of scanning every recipe each tick.
---

# Complex Recipes

The Thermal Crusher can select a recipe directly from one input ID:

```js
const recipe = RECIPES[input.typeId];
```

Machines such as an Infuser or Catalyst Weaver need several items. A common first attempt is to store recipes in an array and search it every machine tick:

```js
// Avoid this for a recipe catalog used every tick.
const recipe = RECIPES.find((candidate) =>
  candidate.base.id === base.typeId
  && candidate.catalysts.every((required) => hasItem(required)),
);
```

That lookup is O(n) in the number of recipes. Every active machine may inspect the entire catalog even though only one combination can match.

Instead, compile recipes into an index when the module loads or when a recipe is registered. The tick handler then builds one deterministic key from the machine inputs and performs an Object or `Map` lookup in average O(1) time relative to the number of registered recipes.

:::note What O(1) means here
A hash-table lookup is average O(1), not a formal worst-case guarantee. A machine with several slots must still read those slots. The goal is to keep lookup independent of the total recipe count: inspecting six catalyst slots costs the same whether the catalog contains 10 recipes or 10,000.
:::

## Choose a key that describes recipe identity

Use the smallest stable data that uniquely identifies a recipe:

| Machine shape | Recommended key |
| --- | --- |
| One input slot | The input item ID. |
| Two fixed, ordered slots | `catalystId|baseId`. |
| Several fixed slots where position matters | Join the item ID from each slot in slot order. |
| Several catalyst slots where position does not matter | Base item ID plus a sorted catalyst-type signature. |
| Recipes with different operating modes | Add the mode, fluid type, or another identity field to the key. |

Amounts usually do not belong in the primary key. A recipe that needs two Redstone should still match a stack of 17 Redstone. Use item types to find the candidate, then validate required amounts.

## Pattern 1: two ordered inputs

The Infuser has one base slot and one catalyst slot. Their roles are different, so order is part of the key:

```js
const INFUSER_RECIPES = Object.freeze({
  "minecraft:redstone|minecraft:iron_ingot": {
    id: "example:energized_alloy",
    catalystRequired: 2,
    baseRequired: 1,
    output: "utilitycraft:example_energized_alloy",
    amount: 1,
    cost: 1_200,
  },
  "minecraft:glowstone_dust|minecraft:copper_ingot": {
    id: "example:crystal_shard",
    catalystRequired: 1,
    baseRequired: 1,
    output: "utilitycraft:example_crystal_shard",
    amount: 2,
    cost: 900,
  },
});

function getInfuserRecipe(base, catalyst) {
  if (!base || !catalyst) return undefined;
  return INFUSER_RECIPES[`${catalyst.typeId}|${base.typeId}`];
}
```

The lookup performs no recipe loop:

```js
function selectInfuserRecipe(machine) {
  const base = machine.container.getItem(BASE_SLOT);
  const catalyst = machine.container.getItem(CATALYST_SLOT);
  const recipe = getInfuserRecipe(base, catalyst);

  if (!recipe) {
    machine.showWarning(
      !base ? "No Base" : !catalyst ? "No Catalyst" : "Invalid Recipe",
      { resetProgress: false },
    );
    return undefined;
  }

  return { base, catalyst, recipe };
}
```

The separator and key order are part of the format. If recipes are declared as `catalyst|base`, the runtime must not construct `base|catalyst`.

### Validate amounts after lookup

```js
function getMaximumInfuserCrafts(
  machine,
  base,
  catalyst,
  recipe,
  outputCapacity,
) {
  const maximumCrafts = Math.min(
    Math.floor(base.amount / recipe.baseRequired),
    Math.floor(catalyst.amount / recipe.catalystRequired),
    Math.floor(outputCapacity / recipe.amount),
  );

  if (maximumCrafts <= 0) {
    machine.showWarning("Inputs Low or Output Full", {
      resetProgress: false,
    });
    return 0;
  }

  return maximumCrafts;
}
```

Selection answers “which recipe is this?” Amount validation answers “how many times can it run?” Keeping those questions separate makes both pieces easier to verify.

## Pattern 2: several ordered slots

If every slot has a fixed semantic role and changing positions should change the recipe, create the key in slot order:

```js
const RECIPE_SLOTS = [3, 4, 5, 6];
const EMPTY_SLOT = "<empty>";
const KEY_SEPARATOR = "\u0001";

function createOrderedSlotKey(container) {
  return RECIPE_SLOTS
    .map((slot) => container.getItem(slot)?.typeId ?? EMPTY_SLOT)
    .join(KEY_SEPARATOR);
}

const ORDERED_RECIPES = new Map([
  [
    [
      "minecraft:iron_ingot",
      "minecraft:redstone",
      "minecraft:quartz",
      EMPTY_SLOT,
    ].join(KEY_SEPARATOR),
    {
      id: "example:ordered_component",
      requiredAmounts: [1, 2, 1, 0],
      output: { id: "utilitycraft:example_energized_alloy", amount: 1 },
      cost: 2_400,
    },
  ],
]);

const recipe = ORDERED_RECIPES.get(
  createOrderedSlotKey(machine.container),
);
```

An explicit empty token prevents these layouts from becoming the same key:

```text
[Iron, Redstone, empty, Quartz]
[Iron, Redstone, Quartz, empty]
```

Do not sort an ordered recipe. Sorting would erase the information carried by slot position.

## Pattern 3: unordered catalyst slots

A Catalyst Weaver-style machine may accept catalysts in any of six slots. The player should be able to rearrange them without changing the recipe.

The efficient pattern is:

1. Aggregate the six slots into `item type -> total amount`.
2. Sort only the distinct catalyst type IDs to create a canonical signature.
3. Look up the base item, then the signature.
4. Validate the candidate's required amounts.

### Define complete recipes

```js
const RECIPE_DEFINITIONS = Object.freeze({
  "example:aetherium_alloy": {
    input: { id: "minecraft:gold_ingot", amount: 1 },
    catalysts: [
      { id: "utilitycraft:steel_ingot", amount: 1 },
      { id: "utilitycraft:energized_iron_ingot", amount: 1 },
      { id: "utilitycraft:ender_pearl_dust", amount: 4 },
      { id: "utilitycraft:aetherium_shard", amount: 4 },
    ],
    fluid: { type: "lava", amount: 8_000 },
    output: { id: "utilitycraft:aetherium", amount: 1 },
    byproduct: {
      id: "utilitycraft:stabilized_obsidian_dust",
      amount: 2,
      chance: 0.05,
    },
    cost: 12_000,
    speed: 0.5,
  },
  "example:hyper_processing_upgrade": {
    input: { id: "utilitycraft:speed_upgrade", amount: 1 },
    catalysts: [
      { id: "utilitycraft:energized_iron_dust", amount: 2 },
      { id: "utilitycraft:aetherium_dust", amount: 1 },
      { id: "utilitycraft:titanium_plate", amount: 1 },
    ],
    output: {
      id: "utilitycraft:hyper_processing_upgrade",
      amount: 1,
    },
    cost: 12_800,
    speed: 0.25,
  },
});
```

This shape keeps the complete operating recipe together: base input, all catalysts, optional resource requirements, primary output, optional byproduct, energy cost, and speed modifier.

### Aggregate the catalyst inventory

```js
const CATALYST_SLOTS = [4, 5, 6, 7, 8, 9];

function readCatalystTotals(container) {
  const totals = new Map();

  for (const slot of CATALYST_SLOTS) {
    const item = container.getItem(slot);
    if (!item) continue;

    totals.set(
      item.typeId,
      (totals.get(item.typeId) ?? 0) + item.amount,
    );
  }

  return totals;
}
```

Aggregating is important when the same item type is split between multiple catalyst slots. A recipe requiring four shards should accept stacks of one and three in different slots.

### Create one canonical signature

```js
const SIGNATURE_SEPARATOR = "\u0001";

function createCatalystSignature(typeIds) {
  return Array.from(typeIds)
    .sort()
    .join(SIGNATURE_SEPARATOR);
}
```

These sets now produce exactly the same signature:

```text
[Steel, Redstone, Quartz]
[Quartz, Steel, Redstone]
```

Use a separator that cannot occur in an item identifier. The control character `\u0001` avoids ambiguous concatenations without conflicting with normal namespaced IDs.

## Build the indexes once

Create a nested index:

```text
base item ID
    -> catalyst signature
        -> recipe
```

```js
/** @type {Map<string, Map<string, object | object[]>>} */
const RECIPES_BY_INPUT = new Map();

for (const [id, definition] of Object.entries(RECIPE_DEFINITIONS)) {
  indexRecipe(id, definition);
}

function indexRecipe(id, definition) {
  const catalystAmounts = new Map();

  for (const catalyst of definition.catalysts ?? []) {
    catalystAmounts.set(
      catalyst.id,
      (catalystAmounts.get(catalyst.id) ?? 0) + catalyst.amount,
    );
  }

  const catalysts = Array.from(
    catalystAmounts,
    ([catalystId, amount]) => ({ id: catalystId, amount }),
  );
  const signature = createCatalystSignature(
    catalystAmounts.keys(),
  );
  const recipe = {
    id,
    ...definition,
    catalysts,
    signature,
  };

  let bySignature = RECIPES_BY_INPUT.get(definition.input.id);
  if (!bySignature) {
    bySignature = new Map();
    RECIPES_BY_INPUT.set(definition.input.id, bySignature);
  }

  const current = bySignature.get(signature);
  if (!current) {
    bySignature.set(signature, recipe);
  } else if (Array.isArray(current)) {
    current.push(recipe);
  } else {
    bySignature.set(signature, [current, recipe]);
  }
}
```

This work happens once while the module loads. If the addon accepts runtime registrations, call `indexRecipe()` when a registration arrives—not inside every machine tick.

### Why a collision bucket exists

Two recipes may use the same base item and catalyst types but require different amounts. Their primary signature is identical. The index stores only those colliding candidates in a small array.

The runtime never scans the complete catalog. It inspects a collision bucket only when the catalog deliberately contains ambiguous type signatures.

Prefer unique type signatures when possible. If amount-based alternatives are necessary, order the bucket from most specific or highest requirement to lowest so a large stack selects the intended recipe first.

## Resolve and validate a multislot recipe

```js
function hasRequiredAmounts(recipe, inputAmount, catalystTotals) {
  if (inputAmount < recipe.input.amount) return false;

  return recipe.catalysts.every((catalyst) =>
    (catalystTotals.get(catalyst.id) ?? 0) >= catalyst.amount
  );
}

function getComplexRecipe(input, catalystTotals) {
  if (!input) return undefined;

  const bySignature = RECIPES_BY_INPUT.get(input.typeId);
  if (!bySignature) return undefined;

  const signature = createCatalystSignature(
    catalystTotals.keys(),
  );
  const indexed = bySignature.get(signature);
  if (!indexed) return undefined;

  if (Array.isArray(indexed)) {
    return indexed.find((recipe) =>
      hasRequiredAmounts(recipe, input.amount, catalystTotals)
    );
  }

  return hasRequiredAmounts(
    indexed,
    input.amount,
    catalystTotals,
  )
    ? indexed
    : undefined;
}
```

Use it from the machine tick:

```js
function selectComplexRecipe(machine) {
  const input = machine.container.getItem(INPUT_SLOT);
  const catalystTotals = readCatalystTotals(machine.container);
  const recipe = getComplexRecipe(input, catalystTotals);

  if (!recipe) {
    machine.showWarning(
      input ? "Invalid Catalysts" : "Insert Base Item",
      { resetProgress: false },
    );
    return undefined;
  }

  return { input, catalystTotals, recipe };
}
```

The only `.find()` is limited to recipes that already share the same base and exact catalyst-type signature. It is not an O(n) scan over the complete registry.

## Calculate the maximum safe batch

Lookup is only the first part. Before consuming energy or materials, calculate how many complete operations fit:

```js
function getCatalystCraftCapacity(recipe, catalystTotals) {
  let capacity = Number.MAX_SAFE_INTEGER;

  for (const catalyst of recipe.catalysts) {
    capacity = Math.min(
      capacity,
      Math.floor(
        (catalystTotals.get(catalyst.id) ?? 0)
        / catalyst.amount,
      ),
    );
  }

  return recipe.catalysts.length > 0 ? capacity : 0;
}

const inputCrafts = Math.floor(
  input.amount / recipe.input.amount,
);
const catalystCrafts = getCatalystCraftCapacity(
  recipe,
  catalystTotals,
);
const fluidCrafts = recipe.fluid
  ? Math.floor(tank.get() / recipe.fluid.amount)
  : Number.MAX_SAFE_INTEGER;
const outputCrafts = Math.floor(
  outputCapacity / recipe.output.amount,
);

const maximumCrafts = Math.min(
  inputCrafts,
  catalystCrafts,
  fluidCrafts,
  outputCrafts,
);
```

Do not consume any input, catalyst, fluid, gas, or energy until every required resource and output destination has been validated.

## Consume catalysts across several slots

When positions do not matter, one required type may be distributed across several stacks. Consume it across the accepted slots:

```js
function consumeTypeAcrossSlots(
  container,
  slots,
  typeId,
  requestedAmount,
) {
  let remaining = requestedAmount;

  for (const slot of slots) {
    if (remaining <= 0) break;

    const item = container.getItem(slot);
    if (!item || item.typeId !== typeId) continue;

    const removed = Math.min(item.amount, remaining);
    remaining -= removed;

    if (removed === item.amount) {
      container.setItem(slot, undefined);
    } else {
      item.amount -= removed;
      container.setItem(slot, item);
    }
  }

  return remaining === 0;
}

function consumeRecipeCatalysts(
  container,
  recipe,
  craftCount,
) {
  for (const catalyst of recipe.catalysts) {
    consumeTypeAcrossSlots(
      container,
      CATALYST_SLOTS,
      catalyst.id,
      catalyst.amount * craftCount,
    );
  }
}
```

Call this only after `getCatalystCraftCapacity()` proves every amount is available. The mutation function should not be responsible for discovering that a recipe is invalid halfway through consumption.

## Track the recipe ID during progress

A complex machine should persist the resolved recipe's stable ID:

```js
const ACTIVE_RECIPE_PROPERTY = "example:active_complex_recipe";
const previousRecipeId = machine.entity.getDynamicProperty(
  ACTIVE_RECIPE_PROPERTY,
);

if (previousRecipeId !== recipe.id) {
  machine.entity.setDynamicProperty(
    ACTIVE_RECIPE_PROPERTY,
    recipe.id,
  );
  machine.setProgress(0, { display: false });
}
```

Do not track only the base input ID. Two complex recipes can share the same base while using different catalysts, fluids, outputs, or costs. The recipe ID prevents progress from crossing between them.

## Object or Map?

Both provide average O(1) keyed lookup:

| Structure | Best use |
| --- | --- |
| Frozen Object | Small static catalog with simple string keys, such as the two-slot Infuser. |
| `Map` | Runtime registration, replacement, removal, nested indexes, or nontrivial compilation. |

Do not choose a `Map` merely because the recipe has many fields. Choose it when the index lifecycle benefits from `get()`, `set()`, `delete()`, and nested maps.

## Complexity comparison

Let:

- `n` be the total number of registered recipes;
- `s` be the machine's accepted catalyst slots;
- `u` be the distinct catalyst types currently inserted;
- `c` be the catalyst types required by the selected recipe.

| Approach | Per lookup |
| --- | --- |
| Scan every recipe array | O(n), plus each candidate's comparisons. |
| One-input Object or `Map` | Average O(1). |
| Two ordered inputs with a composite key | O(1) key construction and average O(1) lookup. |
| Unordered multislot signature | O(s) to read slots, O(u log u) to sort the small signature, average O(1) indexed lookup, then O(c) amount validation. |

For a machine with six fixed catalyst slots, `s`, `u`, and `c` are tightly bounded. Adding more recipes does not increase the normal tick lookup cost.

## Common mistakes

- Calling `.find()` on the complete recipe array every tick.
- Building the entire index again inside `onTick`.
- Sorting inputs whose slot positions have different meanings.
- Failing to sort inputs whose positions are interchangeable.
- Putting current stack amounts into a key for recipes that accept minimum amounts.
- Using simple string concatenation without a reliable separator.
- Forgetting to aggregate duplicate item types across several slots.
- Looking up a recipe correctly, then consuming materials before checking every output and resource requirement.
- Tracking progress by base item instead of stable recipe ID.
- Claiming the whole operation is O(1) while still needing to read a variable number of inventory slots.

## Checklist

- Recipe definitions have stable IDs.
- The index is built at module load or registration time.
- Ordered slots keep their order in the key.
- Unordered slots use a canonical sorted signature.
- Duplicate catalyst stacks are aggregated by type.
- Amounts are validated after indexed selection.
- Only a small collision bucket can require a local scan.
- Progress is reset when the resolved recipe ID changes.
- All inputs, resources, byproducts, and output capacity are validated before mutation.

Continue with [Test the Machine](./test-machine).
