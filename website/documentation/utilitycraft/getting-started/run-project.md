---
id: run-project
title: Run the Project
sidebar_label: Run the project
sidebar_position: 4
description: Validate and run the UtilityCraft Addon Template with Regolith or with a manual Bedrock pack workflow.
---

# Run the Project

The template is built as a Regolith project, but Regolith is not required. Choose the workflow that matches how you already develop Bedrock addons.

## Workflow A: run with Regolith

This is the recommended workflow because the repository already provides tested profiles for readable development exports and bundled builds.

### 1. Open the project root

Run all commands from the folder containing `config.json` and `package.json`.

### 2. Install development dependencies

```powershell
npm install
```

This installs Minecraft Script API types, TypeScript, and esbuild. It does not install UtilityCraft into Minecraft.

### 3. Validate the source

```powershell
npm run check
npm run verify:imports
```

The checks verify JavaScript types, resource display sequences, creative catalog entries, and the rule that addon code imports DoriosCore only through its public root.

### 4. Export readable development packs

```powershell
regolith run buildDev
```

The result is written to `build/` as:

```text
build/
├── UtilityCraft Addon Template BP/
└── UtilityCraft Addon Template RP/
```

Use `buildDev` while learning because the exported scripts remain readable.

### 5. Create a bundled build

```powershell
regolith run build
```

The `build` profile bundles the runtime into one script and exports production-shaped packs. Use it after the readable development build works.

| Command | Purpose |
| --- | --- |
| `regolith run buildDev` | Readable development BP and RP in `build/`. |
| `regolith run build` | Bundled, non-minified BP and RP in `build/`. |
| `regolith run release` | Minified release export using the configured local target. |
| `npm run bundle` | Script-only bundle at `dist/scripts/main.js`; it does not export complete packs. |

## Workflow B: run without Regolith

The repository contains normal Bedrock pack roots:

```text
BP/
RP/
```

If you do not use Regolith, copy, package, or integrate those two folders with your preferred Bedrock workflow. Preserve:

- every file inside each pack;
- both `manifest.json` files;
- the BP-to-RP dependency;
- the UtilityCraft BP and RP dependencies;
- `BP/scripts/DoriosCore` and `BP/scripts/DoriosLib`;
- the script entry at `BP/scripts/main.js`.

For manual development, the two folders can be placed in the corresponding Minecraft development pack locations and renamed as folders if desired. Folder names do not replace manifest UUIDs; change the manifest identifiers before distributing your own addon.

You can still use Node.js validation without Regolith:

```powershell
npm install
npm run check
npm run verify:imports
```

If your own toolchain bundles JavaScript, keep the public import aliases mapped to the local `BP/scripts/DoriosCore`, `BP/scripts/DoriosLib`, and addon-core folders.

## Enable the packs in a world

Enable all four packs:

1. UtilityCraft Resource Pack.
2. Your extension Resource Pack.
3. UtilityCraft Behavior Pack.
4. Your extension Behavior Pack.

Keep the extension Resource Pack above UtilityCraft when its `chest_screen.json` routes custom machine interfaces and references shared `@uc.*` controls. The manifests declare the required pack relationships, but the world still needs the corresponding UtilityCraft version installed.

Create or open a test world using the Script API settings required by your current Minecraft version.

## Test the unchanged template

Enter the world and run:

```mcfunction
/function example/kit
```

The function gives the example machines, generators, upgrades, resource containers, tools, and multiblock parts. Place a few blocks and open their interfaces before editing the source.

A successful first run means:

- the function is recognized;
- example blocks and items exist;
- machine screens open;
- no template error stops `scripts/main.js`;
- UtilityCraft and the extension are using compatible versions.

## Common first-run problems

| Problem | Check |
| --- | --- |
| The example function does not exist | Confirm the extension BP is enabled and contains `functions/example/kit.mcfunction`. |
| Blocks appear without textures | Confirm the extension RP is enabled and paired with its BP. |
| A shared UI control is missing | Confirm UtilityCraft RP is installed and the extension RP is above it in the stack. |
| `DoriosCore/index.js` or `DoriosLib/index.js` cannot load | Confirm the complete `BP/scripts/DoriosCore` and `BP/scripts/DoriosLib` folders were not removed. |
| A dependency version is rejected | Compare the installed UtilityCraft version with the template manifest requirement. |
| Regolith cannot find the project | Run it from the folder containing `config.json`. |

Do not begin deleting examples until this unchanged baseline works.

Next: [Understand the project structure](./project-structure).

