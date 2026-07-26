---
id: getting-started
title: Getting Started
sidebar_label: Overview
sidebar_position: 1
description: Prepare the UtilityCraft Addon Template, choose a development workflow, and understand which files belong to your extension.
---

# Getting Started

This section takes you from an empty workspace to a running copy of the UtilityCraft Addon Template. When you finish, the example packs will be enabled in a Minecraft world and you will know where future machine code belongs.

No machine code is written yet. The purpose of this section is to establish a known-good project before changing blocks, scripts, manifests, or UI files.

## What you will complete

| Step | Page | Result |
| ---: | --- | --- |
| 1 | [Requirements](./requirements) | Confirm Minecraft, UtilityCraft, tools, and basic knowledge. |
| 2 | [Download the template](./download-template) | Create your own working copy without losing required files. |
| 3 | [Run the project](./run-project) | Export or copy the packs, enable them, and test the example kit. |
| 4 | [Understand the project structure](./project-structure) | Learn which folders are editable and which dependencies must remain untouched. |

## Choose your workflow

The template is a Regolith project, but Regolith is not required to study or reuse it.

### Regolith workflow

Recommended when you want repeatable development and release builds. The included profiles can export readable development packs or bundle scripts for a production-shaped build.

### Your own pack workflow

Use this when you already manage Bedrock packs manually or with another tool. The repository contains normal `BP` and `RP` folders. You can copy, package, or integrate those packs into your preferred workflow while preserving their manifests, files, and dependency relationships.

The tutorials identify the source file being changed instead of assuming one particular editor or deployment tool.

## Before continuing

Use a fresh copy of the template. Do not begin by copying only one machine script: a working machine also depends on block definitions, helper entities, UI files, display items, textures, language entries, and initialization order.

At the end of Getting Started, verify all of the following:

- UtilityCraft 3.5.0 or newer is installed.
- The template Behavior Pack and Resource Pack are active.
- The world loads without template scripting errors.
- `/function example/kit` gives the example content.
- You can identify addon-owned code and read-only library code.

Begin with [Requirements](./requirements).

