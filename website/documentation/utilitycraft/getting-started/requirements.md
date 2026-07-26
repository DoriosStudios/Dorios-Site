---
id: requirements
title: Requirements
sidebar_label: Requirements
sidebar_position: 2
description: Software, packs, versions, and basic knowledge required to use the UtilityCraft Addon Template.
---

# Requirements

The template is designed to be approachable, but it is still a Minecraft Bedrock scripting project. Prepare the required game content first, then choose whether you want the recommended development tools.

## Required

### Minecraft Bedrock

The current template manifest targets:

| Requirement | Template value |
| --- | --- |
| Minimum engine version | `1.21.120` |
| `@minecraft/server` | `2.8.0` |
| `@minecraft/server-ui` | `2.0.0` |

Use a Minecraft Bedrock version compatible with those manifest values. If the Script API version available in your game differs, update it only after checking that UtilityCraft and your addon use compatible versions.

### UtilityCraft 3.5.0 or newer

Enable both the UtilityCraft Behavior Pack and Resource Pack in the same world as the extension.

The extension uses:

- UtilityCraft as its gameplay runtime and pack dependency;
- DoriosLib as the shared Dorios library;
- DoriosCore as the machinery-focused library;
- shared UtilityCraft UI controls, geometries, and compatible systems.

Do not remove the UtilityCraft dependencies from the template manifests while following this course.

### A code editor

Use an editor that handles JSON and JavaScript. Visual Studio Code is a common choice, but it is not required.

Your editor should preserve UTF-8 text and make JSON syntax errors visible.

## Strongly recommended

### Node.js and npm

The project uses npm to install development types and run validation tools. Install a current Node.js LTS release, which includes npm.

Confirm both commands are available:

```powershell
node --version
npm --version
```

Node.js is not a Minecraft runtime dependency. It is used on your computer for type checking, import validation, resource verification, and script bundling.

### Regolith 1.8.0

The included `config.json` uses the Regolith `1.8.0` project format. Regolith provides repeatable development and production export profiles.

Confirm the command is available:

```powershell
regolith --version
```

Regolith is recommended, not mandatory. If you do not use it, you can take the `BP` and `RP` folders and manage them with your existing Bedrock pack workflow.

## Knowledge expected

You should recognize:

- the difference between a Behavior Pack and a Resource Pack;
- JSON objects, arrays, strings, numbers, and booleans;
- basic JavaScript concepts such as imports, variables, functions, objects, and classes;
- a namespaced identifier such as `myaddon:crusher`;
- how to enable packs and experimental Script API features required by your Minecraft version.

You do **not** need prior knowledge of DoriosLib, DoriosCore, UtilityCraft internals, network implementation, multiblocks, or JSON UI. Those topics are introduced when they become necessary.

## Dependency checklist

Before downloading the template, confirm:

- [ ] Minecraft can run the template's engine and Script API versions.
- [ ] UtilityCraft 3.5.0 or newer is available.
- [ ] You have a code editor.
- [ ] Node.js and npm are installed if you want the validation commands.
- [ ] Regolith 1.8.0 is installed if you want the recommended export workflow.

Next: [Download the template](./download-template).

