---
id: cryo_chamber
title: Cryo Chamber
sidebar_label: Cryo Chamber
---

![Cryo Chamber Render](/img/addons/ascendant/cryo_chamber.png)

The **Cryo Chamber** is a multifunction thermal machine with three parallel modules: **Cryo Stabilizer**, **Cooling Chamber**, and **Cryofluid Generator**.

---

## Machine Information

| Setting | Value |
|----------|--------|
| **Energy Capacity** | 128,000,000 DE (128 MDE) |
| **Energy Consumption** | 1,600–64,000 DE per operation (depends on module/recipe) |
| **Base Processing Rate** | 2,400 DE/t |
| **Water Tank** | 64,000 mB |
| **Cryofluid Tank** | 64,000 mB |
| **Upgrade Slots** | Standard speed/efficiency upgrades (affect all modules) |

---

## Machine UI

> UI screenshot is not available yet in the docs assets.

---

## Usage Examples

| Module | Example |
|--------|---------|
| **Cryo Stabilizer** | Energized Iron Ingot → Iron Ingot |
| **Cooling Chamber** | Packed Ice → Blue Ice |
| **Cryofluid Generator** | Water + Titanium catalyst → Cryofluid |

---

## Crafting Recipe

> Crafting recipe image is not available yet in the docs assets.

---

## How It Works

1. Power the machine and keep water available.
2. Use each module according to its own slot/tank requirements.
3. Stabilizer recipes may consume **Cryofluid**.
4. Cooling recipes can run in parallel in the 3×3 grid.
5. Use Titanium or Raw Titanium catalysts to generate Cryofluid from water.

---

## Recipes

### Stabilization (Cryo Stabilizer)

| Input | Output | Cryofluid | Energy (DE) | Time |
| --- | --- | --- | --- | --- |
| Charged Darloonite Crystal ×1 | Darloonite Crystal ×1 | 1600 mB | 24000 | 200 ticks (10s) |
| Energized Iron Dust ×1 | Iron Dust ×1 | 250 mB | 4000 | 100 ticks (5s) |
| Energized Iron Ingot ×1 | Iron Ingot ×1 | 500 mB | 8000 | 200 ticks (10s) |
| Brute Energized Iron ×1 | Raw Iron ×1 | 500 mB | 8000 | 200 ticks (10s) |
| Energized Iron Block ×1 | Iron Block ×1 | 4000 mB | 64000 | 1200 ticks (60s) |
| Brute Energized Iron Block ×1 | Raw Iron Block ×1 | 4000 mB | 64000 | 1200 ticks (60s) |
| Refined Aetherium Shard ×1 | Aetherium Shard ×1 | 400 mB | 12000 | 300 ticks (15s) |

### Cooling (Cooling Chamber)

| Accepted inputs | Output | Fluid | Energy (DE) | Time |
| --- | --- | --- | --- | --- |
| Cooked Beef ×1 | Raw Beef ×1 | — | 2400 | 40 ticks (2s) |
| Cooked Porkchop ×1 | Raw Porkchop ×1 | — | 2400 | 40 ticks (2s) |
| Cooked Chicken ×1 | Raw Chicken ×1 | — | 2400 | 40 ticks (2s) |
| Snow Block ×1 | Ice ×1 | Water 100 mB | 1600 | 20 ticks (1s) |
| Ice ×1 | Packed Ice ×1 | — | 4000 | 60 ticks (3s) |
| Packed Ice ×1 | Blue Ice ×1 | — | 8000 | 100 ticks (5s) |

### Cryofluid Generator

- **Input:** Water tank
- **Output:** Cryofluid tank
- **Base conversion:** 1000 mB water → 800 mB Cryofluid
- **Energy cost:** 32,000 DE per 1000 mB water
- **Catalysts:**
  - **Titanium:** 1000 mB → 800 mB
  - **Raw Titanium:** 1000 mB → 1600 mB

> [!NOTE]
> Cryofluid is planned to act as improved coolant for future reactor systems in Heavy Machinery Expansion.
