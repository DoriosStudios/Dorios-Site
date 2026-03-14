---
id: duplicator
title: Duplicator
sidebar_label: Duplicator
---

![Duplicator Render](/img/addons/ascendant/duplicator.png)

The **Duplicator** replicates items via templates, consuming large amounts of **Dorios Energy** and **Liquified Aetherium**.

---

## Machine Information

| Setting | Value |
|----------|--------|
| **Energy Capacity** | 512,000,000 DE (512 MDE) |
| **Energy Consumption** | 10,000–30,000,000 DE/s (depends on rarity) |
| **Base Processing Rate** | 400 DE/t |
| **Fluid Tank Capacity** | 512,000 mB (Liquified Aetherium) |
| **Fluid Consumption** | 50 mB/s of recipe time |
| **Upgrade Slots** | 2 |

---

## Machine UI

> UI screenshot is not available yet in the docs assets.

---

## Usage Examples

| Input | Output |
|--------|---------|
| Valid template + Liquified Aetherium | Original item + one copied item |

---

## Crafting Recipe

> Crafting recipe image is not available yet in the docs assets.

---

## How It Works

1. Insert a valid template into the input slot.
2. Fill the internal tank with **Liquified Aetherium**.
3. Provide enough DE for the selected rarity tier.
4. Collect the original and duplicated outputs from the result slots.

---

## Restrictions

- Cannot clone Lucky Tools, banners, or potions.
- Singularity templates are crafted in the **Singularity Fabricator**.
- The cloner block itself cannot be duplicated.

---

## Cost by Rarity

| Rarity | Energy Cost (DE/s) |
| --- | --- |
| Common | 10,000 |
| Uncommon | 48,000 |
| Rare | 240,000 |
| Epic | 1,200,000 |
| Legendary | 6,000,000 |
| Mythic | 30,000,000 |

> Processing time increases with item complexity and rarity.

