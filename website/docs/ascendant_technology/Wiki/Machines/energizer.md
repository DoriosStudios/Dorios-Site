---
id: energizer
title: Energizer
sidebar_label: Energizer
---

![Energizer Render](/img/addons/ascendant/energizer.png)

The **Energizer** converts common items into energized variants using only **Dorios Energy**, with no catalyst requirement.

---

## Machine Information

| Setting | Value |
|----------|--------|
| **Energy Capacity** | 256,000,000 DE (256 MDE) |
| **Energy Consumption** | 72,000–2,400,000 DE per craft |
| **Base Processing Rate** | 24,000 DE/t |
| **Input Slots** | 2 (Primary + Auxiliary) |
| **Output Slots** | 1 |
| **Upgrade Slots** | 3 |

---

## Machine UI

> UI screenshot is not available yet in the docs assets.

---

## Usage Examples

| Input | Output |
|--------|---------|
| Iron Ingot | Energized Iron Ingot |
| Iron Dust | Energized Iron Dust |
| Redstone Block | Energy Upgrade |

---

## Crafting Recipe

> Crafting recipe image is not available yet in the docs assets.

---

## How It Works

1. Insert items in the **Primary** and/or **Auxiliary** slot.
2. The machine checks for the first valid recipe.
3. If enough DE is available, processing starts automatically.
4. Collect the result from the output slot.

---

## Native Recipes

| Input | Output | Energy (DE) | Time (s) | Preferred slot |
| --- | --- | --- | --- | --- |
| Iron Ingot ×1 | Energized Iron Ingot ×1 | 96000 | 4 | Primary |
| Raw Iron ×1 | Raw Energized Iron ×1 | 104000 | 5 | Primary |
| Iron Block ×1 | Energized Iron Block ×1 | 1820000 | 18 | Primary |
| Iron Dust ×1 | Energized Iron Dust ×1 | 72000 | 3 | Auxiliary |
| Redstone Block ×1 | Energy Upgrade ×1 | 2400000 | 8 | Primary |
| Raw Iron Block ×1 | Raw Energized Iron Block ×1 | 1820000 | 5 | Primary |

> The machine processes recipes from the first input slot containing a valid recipe.

