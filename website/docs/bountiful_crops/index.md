---
id: bountiful-crops
title: Bountiful Crops
sidebar_label: Bountiful Crops
---

import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

<div style={{ textAlign: "center", marginBottom: "2rem" }}>
  <img 
    src="https://media.forgecdn.net/attachments/description/null/description_a6a21599-3337-45bf-8551-71199c03a1ad.png" 
    alt="Bountiful Crops Render"
    width="70%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</div>

<p>
  <b>Bountiful Crops</b> is part of the <b>UtilityCraft</b> collection and introduces a new way to obtain resources — through <b>31 different crops</b> 
  that grow materials like iron, gold, slime, diamond, and even Nether Stars.  
  Each crop belongs to a specific <b>tier</b> and must be planted on its corresponding <b>Soil block</b>.
</p>

---

## Overview

Crops behave similarly to vanilla ones but with tier-based mechanics.  
Higher-tier crops yield rarer materials and require upgraded soils to grow.

<p align="center">
  <img 
    src="https://api.mcpedl.com/storage/submissions/182896/images/utilitycraft-v19-tractor-and-more-crops_5.png"
    alt="Soil Tier Blocks"
    width="70%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</p>

---

## Crop and Soil Tiers

| Tier | Soil Color | Description |
|------|-------------|-------------|
| **Tier 1** | Yellow Soil | Basic crops like coal, copper, and water. |
| **Tier 2** | Red Soil | Mid-tier crops like iron, lapis, and slime. |
| **Tier 3** | Blue Soil | Advanced crops like diamond, emerald, and quartz. |
| **Tier 4** | Black Soil | Endgame crops like Nether Star and Wither Skull. |

> Crops require the correct soil tier to grow.  
> Using a hoe reduces growth time by 10 seconds, except for special soils.

---

## Crafting the Base Seed

All crops start from a **Base Seed**, which can then be upgraded into specific crop seeds using their respective materials.

<p align="center">
  <img 
    src="https://media.forgecdn.net/attachments/description/1097197/description_84168185-97ac-4a2b-8162-524ecdbd402c.png"
    alt="Base Seed Recipe"
    width="40%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</p>

---

## Resource Drops

Each crop produces its respective resource and can benefit from **Fortune** enchantments.  
Fortune III significantly increases drop quantity.

| Crop | Drop | Fortune Affected |
|-------|-------|-----------------|
| Iron Crop | Iron Ingot | ✅ |
| Diamond Crop | Diamond | ✅ |
| Gold Crop | Gold Ingot | ✅ |
| Redstone Crop | Redstone Dust | ✅ |
| Lapis Crop | Lapis Lazuli | ✅ |
| Nether Star Crop | Nether Star | ✅ |
| Wither Skull Crop | Wither Skeleton Skull | ✅ |

---

## Special Crops

Some unique crops provide special items instead of basic minerals:

| Crop | Drop | Use |
|------|------|-----|
| **Water Crop** | Water Ball | Places water and substitutes water buckets in recipes. |
| **Lava Crop** | Lava Ball | Places lava and can substitute lava buckets. |
| **Obsidian Recipe** | 2 Lava Balls + 2 Water Balls | Creates Obsidian. |

<p align="center">
  <img 
    src="https://api.mcpedl.com/storage/submissions/186349/images/utilitycraft-v21-harvester-5-new-crops-and-compatibility-version_4.png"
    alt="Lava Ball Item"
    width="60%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</p>

---

## Guide Book

Players receive a <b>Guide Book</b> upon entering a world with Bountiful Crops installed.  
It contains detailed information about all soils, seeds, and crafting recipes.  

If lost, you can craft a new one:

<Carousel showArrows={true} infiniteLoop={true} showThumbs={false} showStatus={false}>
  <div>
    <img src="https://media.forgecdn.net/attachments/description/1097197/description_ad5d234e-f08a-4a19-97e7-24d1d3bbe60e.png" alt="Guide Book Recipe" />
  </div>
</Carousel>

---

## Integration with UtilityCraft

Bountiful Crops connects directly with other <b>UtilityCraft</b> systems:

- Crops can be harvested automatically using the **Harvester**.  
- Soils are compatible with **Bountiful Bonsais** for passive crop farming.  
- Items like Lava and Water Balls can fuel or interact with **UtilityCraft machines**.

> This addon extends the automation potential of UtilityCraft, turning farming into a renewable source of valuable materials.
