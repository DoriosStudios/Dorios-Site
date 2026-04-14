---
id: machines
title: UtilityCraft Machines
sidebar_label: Machines
description: Overview of UtilityCraft machines, how they behave, and how to use them for automation.
---

<h1 align="center">UtilityCraft - Machines</h1>

<p align="center">
  Machines are the core of automation in UtilityCraft.
  They let you process items, farm resources, craft components, and build production lines that keep working with minimal manual input.
</p>

<div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem", marginBottom: "1.5rem" }}>
  <img
    src="/img/addons/utilitycraft/machinery/renders/crusher_render.png"
    alt="Crusher Render"
    width="22%"
    style={{ minWidth: "180px" }}
  />
  <img
    src="/img/addons/utilitycraft/machinery/renders/autosieve_render.png"
    alt="Autosieve Render"
    width="22%"
    style={{ minWidth: "180px" }}
  />
  <img
    src="/img/addons/utilitycraft/machinery/renders/assembler_render.png"
    alt="Assembler Render"
    width="22%"
    style={{ minWidth: "180px" }}
  />
</div>

---

## What Machines Do

Most UtilityCraft machines use **Dorios Energy (DE)** to process items automatically.
They can be connected together to create full production chains, making them one of the most important progression systems in the addon.

Machines are especially useful when you want to:

- automate resource production
- avoid repeating manual crafting or processing steps
- move items from one processing stage to the next
- scale up ore, crop, mob, or material production

> The **XP Condenser** and **Way Center** are exceptions: they do **not** use Dorios Energy.

---

## Machine Basics

All UtilityCraft machines follow a few common rules:

- **Stored energy is preserved when broken.** If you pick up a powered machine, the energy inside stays stored in the block item.
- **Machines can face every direction.** You can rotate them with a wrench, or orient them when placing them.
- **Machines auto-output forward.** If a machine has items in its output slot, it will try to push them into the container or machine directly in front of it.
- **You can chain machines together.** This lets you automate many setups without needing item conduits between every step.
- **Most machines are opened from the side.** The machine entity hitbox is on the side, so to interact with the block itself you should use the top or bottom face.
- **Machines are built for automation.** A single machine is useful, but their real strength appears when several are connected into a processing line.

If you want to learn more about powering your setup, see [Dorios Energy Overview](../overview).

---

## Starter Automation Example

One of the most important early-game automation chains is:

```text
Cobble Generator -> Crusher -> Autosieve
```

This setup works because:

1. the **Cobble Generator** produces cobblestone automatically
2. the **Crusher** turns cobblestone into gravel
3. the **Autosieve** filters the gravel and gives useful drops such as ore chunks

After that, ore chunks can be processed further:

```text
Ore Chunk -> Crusher -> Dust -> Smelting
```

That said, you should **not crush every Autosieve drop automatically**.
Some drops are already valuable in their raw form, such as **diamonds** and **lapis lazuli**, so those are usually better kept as-is instead of being sent into another Crusher.

---

## Machine Categories

### Processing Machines

These machines transform items into other forms and are the backbone of most factories.

| Machine | Main Use |
|--------|--------|
| [Crusher](./crusher) | Breaks down cobblestone, ores, chunks, ingots, and many other materials into simpler or more useful forms. |
| [Electro Press](./electro_press) | Compresses materials and crafts metal plates or other pressed components. |
| [Infuser](./infuser) | Combines items and energy to create advanced materials. |
| [Incinerator](./incinerator) | Smelts items using energy instead of regular furnace fuel. |
| [Magmatic Chamber](./magmatic_chamber) | Handles heat- or magma-related processing for advanced material production. |
| [Induction Anvil](./induction_anvil) | Repairs equipment using stored energy rather than XP. |

### Automation and Production

These machines help generate items, gather materials, or keep your base supplied.

| Machine | Main Use |
|--------|--------|
| [Auto Sieve](./autosieve) | Automatically sifts gravel, sand, dirt, and similar materials to obtain resources and ore chunks. |
| [Auto Fisher](./autofisher) | Produces fishing loot automatically when set up with water and a Fishing Net. |
| [Harvester](./harvester) | Harvests nearby crops and plants automatically. |
| [Seed Synthesizer](./seed_synthesizer) | Produces seeds and plant-related materials through automated growth. |

### Block Interaction

These are useful for world interaction and hands-free block manipulation.

| Machine | Main Use |
|--------|--------|
| [Block Breaker](./block_breaker) | Breaks the block directly in front of it, useful for farms and automated generators. |
| [Block Placer](./block_placer) | Places blocks from its inventory into the world automatically. |

### Crafting and Advanced Systems

These machines are more specialized and usually appear in larger or later-game setups.

| Machine | Main Use |
|--------|--------|
| [Assembler](./assembler) | Automatically crafts items from stored ingredients. |
| [Digitizer](./digitizer) | Converts items into digital resources or crafting data for advanced systems. |

### Utility Machines

These machines support travel, storage, and other special mechanics.

| Machine | Main Use |
|--------|--------|
| [XP Condenser](./xp_condenser) | Stores experience safely and converts it into a manageable tank-based form. Does not use DE. |
| [Way Center](./way_center) | Acts as the main hub for Way Carpet teleportation networks. Does not use DE. |

---

## Building Better Setups

When designing a machine line, keep these ideas in mind:

- place machines so their output side faces the next machine in the chain
- keep power generation close, or connect everything with energy cables
- separate valuable direct drops from materials that should be processed further
- use upgrades later to improve speed, energy handling, or machine utility

For performance improvements and expansion options, see [Machine Upgrades](../upgrades).
