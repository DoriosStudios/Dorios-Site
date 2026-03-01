---
id: block-components
sidebar_label: Block Components
title: Block Components
---

# Block Components

UtilityCraft provides a modular block component system that allows you
to create machines, generators, batteries, and processors directly from
block JSON --- without rewriting core logic.

Each component defines behavior, while the block JSON defines
configuration.

This system enables:

-   Tiered machines
-   Custom generators
-   Custom processing blocks
-   Energy storage systems
-   Liquid-based machines
-   Dual-input processors
-   JSON-defined recipes (no scripting required)

------------------------------------------------------------------------

# Generator Components

Passive and fuel-based energy production.

-   [Furnator](furnator) --- Item fuel generator.
-   [Magmator](magmator) --- Fluid fuel generator.
-   [Thermo Generator](thermo-generator) --- Heated liquid
    generator.
-   [Solar Panel](solar-panel) --- Passive daylight generator.
-   [Wind Turbine](wind-turbine) --- Altitude-based passive
    generator.

------------------------------------------------------------------------

# Energy Storage

-   [Battery](battery) --- Stores and distributes Dorios
    Energy (DE).

------------------------------------------------------------------------

# Processing Machines

Machines that consume energy to process items.

-   [Simple Machine](simple-machine) --- Single input
    processor.
-   [Simple Machine Liquid](simple-machine-liquid) ---
    Item-to-liquid processor.
-   [Double Machine](double-machine) --- Dual input processor.

------------------------------------------------------------------------

# Recipe System

All processing machines integrate with:

-   [Machine Recipes](machine-recipes)

Recipes can be:

-   Predefined by type
-   Fully defined inside block JSON
-   Liquid-based
-   Dual-input based

------------------------------------------------------------------------

# Basic Utility Components

-   Cobble Generator --- Passive block-based item generator.

------------------------------------------------------------------------

## Design Philosophy

Block components are designed to:

-   Be reusable across tiers
-   Separate logic from configuration
-   Minimize scripting requirements
-   Support scalable machine systems

Each component page explains configuration fields, required states, and
usage examples.
