---
id: utilitycraft-documentation
title: UtilityCraft Documentation
sidebar_label: UtilityCraft
pagination_prev: null
---

# UtilityCraft Developer Documentation

This documentation is designed for **addon creators, integrators, and technical developers** who want to extend, integrate, or build on top of UtilityCraft.

Unlike the Wiki (which focuses on gameplay and usage), this section explains how UtilityCraft works internally and how to interact with its systems programmatically.

> Current status: **actively expanding**.  
> API references and integration examples will grow alongside future updates.

---

## Purpose of This Documentation

UtilityCraft is not just an addon — it is a modular automation framework that includes:

- Energy systems (Dorios Energy – DE)
- Machines and generators
- Item and fluid transport
- Upgrade systems
- Custom block components
- Internal managers (energy, liquids, inventories)

This documentation explains how to:

- Integrate third-party content with UtilityCraft  
- Register new recipes into existing machines  
- Create new machines using UtilityCraft’s base systems  
- Create generators using the internal generator framework  
- Register containers compatible with item conduits  
- Use custom components safely and efficiently  
- Follow best practices for performance and compatibility  

---

## Who This Is For

This section assumes familiarity with:

- Minecraft Bedrock scripting API  
- Custom block components  
- Scoreboards and dynamic properties  
- Behavior Pack structure  

If you are looking for gameplay explanations, visit the **Wiki section instead**.

---

## What You’ll Learn

### 1️⃣ API Integration

- How the energy system works (DE, DE/t, caps, transfer rates)  
- How machines consume and produce energy  
- How generators are structured internally  
- Network interaction and adjacency updates  
- Storage handling and internal caps  

---

### 2️⃣ Recipe Registration

UtilityCraft machines can accept externally registered recipes.

You’ll learn:

- How recipe objects are structured  
- How to register machine recipes safely  
- How to define input/output logic  
- Handling multi-output and ratio systems  
- Upgrade-aware recipe scaling  

---

### 3️⃣ Item Conduit Compatibility

To integrate containers with UtilityCraft conduits:

- Required tags and interfaces  
- Inventory expectations  
- Accepted item transfer behavior  
- Directional rules  
- Performance considerations  

---

### 4️⃣ Creating Custom Machines

UtilityCraft provides reusable logic systems so you don’t need to reinvent:

- Energy storage
- Upgrade handling
- Progress tracking
- Inventory management
- Liquid handling

This section covers:

- Required block components  
- Machine lifecycle (placement, activation, destruction)  
- Using base machine classes  
- Handling network updates  
- Safe deactivation patterns  

---

### 5️⃣ Creating Generators

Generators differ from machines.

Documentation includes:

- Passive generators  
- Combustion generators  
- Liquid combustion generators  
- Energy output behavior  
- Rate scaling per tier  
- Internal buffering logic  

---

### 6️⃣ Liquids & Scoreboard System

UtilityCraft uses a scoreboard-based liquid system for cross-addon compatibility.

Topics include:

- Tank indexing  
- Liquid type tracking  
- Transfer rules  
- Multi-tank entities  
- Compatibility constraints  

---

### 7️⃣ Performance & Best Practices

Bedrock scripting has limitations.

This section explains:

- Avoiding runaway intervals  
- Safe network node destruction  
- Efficient scanning strategies  
- Proper use of `runInterval` vs structured logic  
- Entity-based storage vs block-based storage  
- Memory leak prevention  

---

## Documentation Structure

The UtilityCraft Documentation is divided into:

- **Getting Started** – Minimal setup to begin integrating  
- **Core Systems** – Energy, liquids, upgrades  
- **Machine Framework** – Creating and extending machines  
- **Generator Framework** – Energy producers  
- **Integration** – Recipes, conduits, compatibility  
- **Examples** – Practical implementation samples  
- **Reference** – Constants, formats, expected structures  

---

## Conventions

To maintain consistency across integrations:

- Energy is expressed as `DE` and `DE/t`  
- Liquids use indexed scoreboard storage  
- Machines and generators follow tier progression  
- All integrations must be namespace-safe  
- Components must not override UtilityCraft tags without purpose  

---

## Stability and Compatibility

UtilityCraft follows versioned API principles.

- Major updates may adjust internal mechanics  
- Breaking changes will be documented  
- Deprecated patterns will be marked clearly  

When integrating, always check the documentation version against your target UtilityCraft version.

---

## Final Notes

UtilityCraft is designed to be extensible.

The goal of this documentation is to allow:

- Custom automation ecosystems  
- Third-party machine extensions  
- Modular addon ecosystems  
- Stable integration across packs  

If you are building on top of UtilityCraft, follow the integration guidelines carefully to ensure compatibility and performance stability.

---

Continue to **Getting Started** to begin integrating your first feature.