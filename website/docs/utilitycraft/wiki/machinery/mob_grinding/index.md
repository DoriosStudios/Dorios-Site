---
id: mob-grinding-index
title: Mob Grinding
sidebar_label: Mob Grinding
description: Overview of UtilityCraft mob grinding blocks, farm flow, and the upgrades that improve automated mob setups.
---

# Mob Grinding

Mob grinding in UtilityCraft lets you automate one of the most useful loops in the game: **spawn mobs, kill them, and collect the XP they drop**.
It is a compact automation category that works especially well for resource farming, essence-based mob setups, and controlled XP collection.

<div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem", marginBottom: "1.5rem" }}>
  <img
    src="/img/addons/utilitycraft/machinery/renders/mechanical_spawner_render.png"
    alt="Mechanical Spawner"
    width="22%"
    style={{ minWidth: "170px" }}
  />
  <img
    src="/img/addons/utilitycraft/machinery/renders/mob_grinder_render.png"
    alt="Mob Grinder"
    width="22%"
    style={{ minWidth: "170px" }}
  />
  <img
    src="/img/addons/utilitycraft/machinery/renders/xp_magnet_render.png"
    alt="XP Magnet"
    width="22%"
    style={{ minWidth: "170px" }}
  />
</div>

---

## Core Farm Flow

A typical UtilityCraft mob farm looks like this:

```text
Mechanical Spawner -> Mob Grinder -> XP Magnet
```

This setup works because:

1. the **Mechanical Spawner** generates mobs from an assigned Mob Essence
2. the **Mob Grinder** damages and kills mobs inside its working area
3. the **XP Magnet** pulls nearby XP orbs into one easy-to-control location

If you also want drops collected automatically, you can add item collection blocks such as mechanical hoppers or other item transport systems nearby.

---

## Mob Grinding Basics

The main mob grinding blocks are focused on automation and utility, not Dorios Energy.

- **Mechanical Spawner** does not use DE
- **Mob Grinder** does not use DE
- **XP Magnet** does not use DE

That makes this category easy to integrate even in bases where your main power grid is still small.

---

## Main Blocks

| Block | Main Use |
|-------|-------------|
| [Mechanical Spawner](./mechanical_spawner) | Spawns a selected mob type after a Mob Essence is assigned to it. |
| [Mob Grinder](./mob_grinder) | Continuously damages mobs within a configurable area until they die. |
| [XP Magnet](./xp_magnet) | Pulls XP orbs toward its position so experience is easier to collect. |

---

## Upgrades That Matter Most

Mob grinding becomes much stronger once you start upgrading it:

| Upgrade | Best Use |
|-------|-------------|
| [Quantity Upgrade](../upgrades/utilitycraft-quantity-upgrade) | Increases how many mobs the Mechanical Spawner can produce per cycle. |
| [Damage Upgrade](../upgrades/utilitycraft-damage-upgrade) | Raises the maximum selectable damage level on a Mob Grinder. |
| [Range Upgrade](../upgrades/utilitycraft-range-upgrade) | Expands the usable radius of compatible blocks such as the Mob Grinder. |

These upgrades are what turn a simple mob chamber into a faster and more productive farm.

---

## Good Setup Tips

When building a mob farm, these ideas usually help the most:

- keep the **Mechanical Spawner** close enough that mobs remain inside the grinder chamber
- configure **Mob Grinder** range carefully so it only covers the intended kill area
- use **Damage Upgrades** when kills feel too slow
- use an **XP Magnet** near the death point so XP does not scatter across the floor
- add dedicated **item collection** if you want the farm to handle drops as well as XP

---

## XP Handling

The **XP Magnet** only moves **XP orbs**.
If you want to store XP as fluid, that is a separate system:

- let a player collect the XP from the farm
- then use [XP Drain & Spout](../transport/utilitycraft-xp-drain-spout) with a [Fluid Tank](../transport/utilitycraft-fluid-tanks) to convert player XP into stored XP fluid

---

Mob grinding is one of the most self-contained automation loops in UtilityCraft.
Once the chamber is tuned correctly, it can provide steady drops and XP with very little manual attention.
