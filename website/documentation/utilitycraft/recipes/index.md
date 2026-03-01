---
id: recipes
title: Recipe Registration
sidebar_label: Recipes
pagination_prev: null
---

# Recipe Registration

This section explains how to register custom machine recipes into UtilityCraft using ScriptEvents.

UtilityCraft allows external addons to inject recipes dynamically at runtime.  
Recipes are transmitted using a serialized JSON payload and processed internally after the world has fully loaded.

---

## How It Works

Recipe registration follows a structured communication flow:

1. Wait for `worldLoad`.
2. Create a JavaScript object containing the recipe definition.
3. Convert the object into a string using `JSON.stringify`.
4. Send the string through a ScriptEvent.
5. UtilityCraft receives the event.
6. UtilityCraft parses the string using `JSON.parse`.
7. The recipe is validated and registered internally.

This system ensures:

- Cross-addon compatibility
- Namespace isolation
- Runtime safety
- No hard dependencies between packs

---

## Why ScriptEvents?

ScriptEvents are used because:

- They allow inter-addon communication.
- They avoid direct imports between packs.
- They are stable across modular ecosystems.
- They prevent circular dependency issues.

The sending addon does not need access to UtilityCraft’s internal code — only the event contract.

---

## Basic Registration Flow

### Wait for World Load

Recipes must only be registered after the world is ready.

```js
world.afterEvents.worldLoad.subscribe(() => {
    system.sendScriptEvent("utilitycraft:register_crusher_recipe", JSON.stringify(myRecipes));
});