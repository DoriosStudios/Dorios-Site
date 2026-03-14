---
id: residue_processor
title: Residue Processor
sidebar_label: Residue Processor
---

![Residue Processor Render](/img/addons/ascendant/residue_processor.png)

The **Residue Processor** reclaims materials from waste-like inputs, with optional byproducts based on recipe chance.

> [!NOTE]
> This machine is currently under active balancing and may change in future versions.

---

## Machine Information

| Setting | Value |
|----------|--------|
| **Energy Capacity** | 12,800,000 DE (12.8 MDE) |
| **Energy Consumption** | 2,600–7,800 DE per craft |
| **Base Processing Rate** | 16,000 DE/t |
| **Upgrade Slots** | Standard machine upgrades |

---

## Machine UI

> UI screenshot is not available yet in the docs assets.

---

## Usage Examples

| Input | Output |
|--------|---------|
| Void Essence | Aetherium Shards or Aetherium |
| Rotten Flesh | Void Essence |
| Ender Pearl Dust | Ender Pearl |

---

## Crafting Recipe

> Crafting recipe image is not available yet in the docs assets.

---

## How It Works

1. Insert a valid residue-type input.
2. Provide DE and wait for processing.
3. Collect guaranteed output and optional byproduct.

---

## Native Recipes

| Input | Output | Byproduct | Energy (DE) | Time (s) | Notes |
| --- | --- | --- | --- | --- | --- |
| Void Essence ×1 | Aetherium Shard ×2 | Iron Nugget ×2 (35%) | 5200 | 5 | Breaks down condensed void essence into usable shards with a chance to sift iron grit. |
| Void Essence ×3 | Aetherium ×1 | Aetherium Shard ×1 (50%) | 7800 | 7 | Compresses excess residue into aetherium with shard feedback for automation loops. |
| Rotten Flesh ×3 | Void Essence ×1 | — | 2600 | 4 | Reclaims trace void essence from organic scraps instead of trashing them. |
| Bone Block ×1 | Bone Meal ×9 | Void Essence ×1 (20%) | 2600 | 4 | Pulverizes bone blocks back into meal with a slim chance of void residue. |
| Ender Pearl Dust ×2 | Ender Pearl ×1 | Gravel ×1 (50%) | 4200 | 6 | Refines loose ender dust back into a stable pearl. |

> Byproduct percentages represent the chance per craft.

