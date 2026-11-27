---
title: Dorios’ Insight
slug: /addons/insight
description: How to use the settings book, adjust the HUD, and read block and entity information.
---

Dorios’ Insight shows information about the block or entity you are looking at. It can also show item durability and extra player stats in the HUD. This guide covers version **1.2.2**.

## Open the settings {#settings}

<img src="/img/wiki/insight/insight_book.png" alt="Dorios’ Insight settings book" width="64" height="64" />

The addon gives you the **Dorios' Insight Settings** settings book when you first join the world. Use the book, or run `/utilitycraft:insightmenu`, to open your own settings. If you need a replacement book, combine a **wooden pickaxe** and a **spider eye** anywhere in a crafting table.

| Menu | What it controls |
| --- | --- |
| **Main Settings** | Target overlay on or off, refresh interval from 1 to 40 ticks, a targeting distance of 1 to 32 blocks, and durability for main hand, offhand and armor. The target overlay and durability HUD have separate mobile layout switches. |
| **HUD Features** | Extra armor and saturation bars, a secondary actionbar, container contents, taming status and taming or feeding items. |
| **Block Settings** | Block render, preferred tool and tool tier, coordinates, identifier, tags and block states. Supported machines can also show energy, fluids, gas or overclock level. |
| **Entity Settings** | Entity render, health, armor, air supply, active effects and optional technical details such as the identifier, families, tags and properties. |
| **Style Settings** | Panel appearance, font scale and how stats are displayed. |

## Make the panel easier to read {#hud}

On a phone, use **WAILA Mobile Layout** to adjust the target panel and **Durability Mobile Layout** to adjust the equipment indicators. Under **Block Settings**, turn on **Preferred Tool** and **Tool Tier** when checking how to mine a block. Under **HUD Features**, enable **Container Contents** to preview what is stored inside compatible containers.

[Settings implementation](https://github.com/DoriosStudios/Dorios-Insight/blob/751a500911817370d445a12a66e29eeb045d07cb/BP/scripts/core/menu.js) · [Settings book recipe](https://github.com/DoriosStudios/Dorios-Insight/blob/751a500911817370d445a12a66e29eeb045d07cb/BP/recipes/insight_settings.json)
