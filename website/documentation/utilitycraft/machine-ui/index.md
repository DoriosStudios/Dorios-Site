---
id: machine-ui
title: Machine UI
sidebar_label: Overview
sidebar_position: 1
description: Build a standard UtilityCraft interface for the scripted machine created in the previous tutorial.
---

# Machine UI

In this section you will replace the template's temporary crusher interface with a small addon-owned UI. The finished screen displays the machine name, live status, energy, input, progress, output, and the standard information tab.

The UI reuses UtilityCraft's shared controls:

```json
{
  "input@uc.input_slot": {
    "collection_index": 3
  }
}
```

`uc` is the namespace defined by `UtilityCraft/RP/ui/ui_core.json`. Your addon references that namespace directly; it does not copy or modify the file.

:::danger Do not copy UI Core
Keep `ui_core.json`, its shared textures, and its `uc` namespace inside UtilityCraft. Your extension owns only its UI layout, routing, localization, block textures, and scripts.
:::

## Before you start

Complete [Your First Machine](../first-machine/) first. This tutorial expects the Example Thermal Crusher to use the following helper-entity indices:

| Index | Content | Written by | Displayed with |
| ---: | --- | --- | --- |
| `0` | Energy display item | `machine.displayEnergy()` | `uc.energy_bar` |
| `1` | Status label item | `machine.setLabel()` | `uc.text_label` |
| `2` | Progress frame item | `machine.displayProgress()` | `uc.progress_display` |
| `3` | Recipe input | Player or item IO | `uc.input_slot` |
| `4` | Recipe output | Machine script | `uc.output_slot` |
| `5–8` | Reserved for upgrades | Later tutorial | `uc.upgrades_tab` |
| `9–14` | Reserved for six item-IO buttons | Later tutorial | `uc.io_tab` |

The indices are a contract. If the script writes progress to slot `2`, the UI must also read progress from `collection_index: 2`.

## What belongs to each layer

| Layer | Responsibility |
| --- | --- |
| Helper entity | Provides the `container_items` collection and inventory slots. |
| Machine script | Writes energy, labels, progress, outputs, upgrades, and IO button states. |
| Addon JSON UI | Chooses which collection indices to display and where to place them. |
| UtilityCraft UI Core | Supplies reusable controls such as slots, bars, screens, and tabs. |
| Language file | Supplies the entity title and the information-tab description. |

JSON UI does not process recipes, consume energy, move items, or calculate progress. It renders the values already owned by the machine runtime.

## Files used

| File | Purpose |
| --- | --- |
| `RP/ui/first_machine_ui.json` | New addon-owned machine layout. |
| `RP/ui/_ui_defs.json` | Loads the new UI file. |
| `RP/ui/chest_screen.json` | Routes the helper entity's title to the new layout. |
| `RP/texts/en_US.lang` | Provides the entity name and information text. |
| `BP/scripts/examples/machines/thermalCrusher.js` | Continues to update energy, label, and progress slots. |

## Tutorial order

1. [Create the UI file](./create-ui-file)
2. [Display input and output](./input-output)
3. [Add a progress bar](./progress-bar)
4. [Add labels](./labels)
5. [Add Info, IO, and Upgrades tabs](./standard-tabs)

The pages are cumulative. Each page replaces or extends the UI created on the previous one.

For every shared control and exposed variable, see the [UtilityCraft Machine UI Core reference](../ui_core/).

Start with [Create the UI file](./create-ui-file).

