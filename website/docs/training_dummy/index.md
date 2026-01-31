---
id: training-dummy
title: Training Dummy
sidebar_label: Training Dummy
---

import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

<div style={{ textAlign: "center", marginBottom: "2rem" }}>
  <img 
    src="https://media.forgecdn.net/attachments/description/null/description_77905651-0d80-4e1d-ac89-78b54e3d14d1.png" 
    alt="Training Dummy Render"
    width="70%"
    style={{ borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.25)" }}
  />
</div>

<p>
  The <b>Training Dummy</b> is part of the <b>UtilityCraft</b> collection and serves as a practical testing tool for players.  
  It allows you to accurately measure your <b>damage output (DMG)</b> or <b>damage per second (DPS)</b> depending on the mode it’s set to.
</p>

<p>
  Ideal for addon developers, RPG systems, or players fine-tuning their builds — the dummy provides an exact numeric reading 
  of your performance during combat, helping you optimize your damage and attack rhythm.
</p>

---

## Overview

The dummy is a stationary target that detects hits from weapons, trinkets, or abilities.  
It calculates the amount of damage dealt and can switch between two modes:

| Mode | Description |
|------|--------------|
| **DMG Mode** | Displays total damage per hit. |
| **DPS Mode** | Displays damage per second across multiple hits. |

> You can toggle modes by **interacting** with the dummy (right-click / interact button).

---

## Features

- Real-time damage tracking.  
- Switchable modes (DMG / DPS).  
- Works with melee, ranged, and custom scripted weapons.  
- Compatible with **Dorios' Trinkets** and other UtilityCraft combat systems.  
- Does **not require experimental options** — works on stable versions of Minecraft.
