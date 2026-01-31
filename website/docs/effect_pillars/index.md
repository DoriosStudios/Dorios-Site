---
id: effect-pillars
title: Effect Pillars
sidebar_label: Effect Pillars
---

import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

<div style={{ textAlign: "center", marginBottom: "2rem" }}>
  <img 
    src="https://media.forgecdn.net/attachments/description/null/description_782123d5-3fd2-45a0-b186-850d98b88db6.png" 
    alt="Effect Pillars Render"
    width="70%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</div>

<p>
  <b>Effect Pillars</b> is a modular beacon-style system included in the <b>UtilityCraft</b> collection.  
  It introduces customizable <b>Pillars</b> that grant unique effects — both supportive and offensive — far beyond what vanilla beacons can do.
</p>

<p>
  By combining <b>Upgrades</b>, <b>Amplifiers</b>, and <b>Effect Beacons</b>, players can build pillars with adjustable <b>range</b> and <b>power levels</b>.  
  These structures can protect your base, enhance your abilities, or even repel hostile mobs automatically.
</p>

---

## Overview

Effect Pillars are built using a simple vertical structure made of **three parts**:

1. **Upgrade Block** – Defines the effect level.  
2. **Amplifier Block** – Determines the radius of the effect.  
3. **Effect Beacon** – Determines which effect the pillar will emit.

<p align="center">
  <img 
    src="https://media.forgecdn.net/attachments/description/null/description_c5f02ffd-a1b8-4a27-8c8b-d10009d5a7f0.png"
    alt="Pillar Structure Example"
    width="70%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</p>

> All components must be placed in the correct order for the pillar to activate.

---

## Pillar Components

### 🔸 Upgrades (Effect Level)
These determine how powerful the effect will be — similar to beacon levels.

| Upgrade Type | Effect Level | Example |
|---------------|---------------|----------|
| **Redstone Upgrade** | Level 1 | Basic strength or speed |
| **Glowstone Upgrade** | Level 2 | Medium power boost |
| **Amethyst Upgrade** | Level 3 | Maximum strength |

---

### 🔹 Amplifiers (Effect Range)
The Amplifier determines how far the pillar’s effect reaches.

| Amplifier Type | Range (Blocks) |
|----------------|----------------|
| **Iron Amplifier** | 25 |
| **Gold Amplifier** | 50 |
| **Diamond Amplifier** | 75 |
| **Netherite Amplifier** | 100 |
| **Nether Star Amplifier** | 250 |

> Amplifiers must be placed **on top of the Upgrade block**.

<p align="center">
  <img 
    src="https://api.mcpedl.com/storage/submissions/180484/images/effect-pillars-v01_3.png"
    alt="Amplifier Example"
    width="60%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</p>

---

### 🔸 Effect Beacons
Placed at the top of the pillar, these define which **effect** is granted or applied.

There are two main categories:
- **Supportive Effects (Blue Beacons):** Affect players and allies.
- **Offensive Effects (Red Beacons):** Target only hostile mobs, ideal for base defense.

| Example Effect | Type | Description |
|----------------|------|-------------|
| **Speed** | Support | Increases player movement speed. |
| **Strength** | Support | Boosts attack power. |
| **Regeneration** | Support | Gradually restores health. |
| **Poison Aura** | Offensive | Damages nearby mobs. |
| **Weakness Field** | Offensive | Reduces enemy attack damage. |

---

## Base Stone

All components are crafted using the **Base Stone**, a key ingredient used across recipes.

<p align="center">
  <img 
    src="https://api.mcpedl.com/storage/submissions/180484/images/effect-pillars-v01_18.png"
    alt="Base Stone Recipe"
    width="60%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</p>

---

## Guide Book

When entering a world for the first time, you’ll receive a <b>Guide Book</b> explaining all recipes and effects.  
If lost, it can be crafted again easily.

<p align="center">
  <img 
    src="https://media.forgecdn.net/attachments/description/1089788/description_68babfd8-5aeb-4e3c-bba5-6bf906093f7d.png"
    alt="Guide Book Recipe"
    width="60%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</p>

