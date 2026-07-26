---
id: download-template
title: Download the Template
sidebar_label: Download the template
sidebar_position: 3
description: Create a safe working copy of the official UtilityCraft Addon Template and prepare it for your own extension.
---

# Download the Template

The [UtilityCraft Addon Template](https://github.com/DoriosStudios/UtilityCraft-Addon-Template) is the starting point for this course. It contains complete working examples rather than isolated code fragments.

## Option 1: create a repository from the template

If GitHub shows the **Use this template** button:

1. Open the [template repository](https://github.com/DoriosStudios/UtilityCraft-Addon-Template).
2. Select **Use this template** and then **Create a new repository**.
3. Choose your repository owner and a name for the extension.
4. Clone the new repository to your computer.

This creates an independent project with its own Git history.

## Option 2: download a ZIP

1. Open the [template repository](https://github.com/DoriosStudios/UtilityCraft-Addon-Template).
2. Select **Code** and **Download ZIP**.
3. Extract the entire archive into a new project folder.
4. Do not extract only `BP` or only `RP`; the root tools, types, and configuration are part of the learning project.

This option does not require Git.

## Option 3: clone with Git

```powershell
git clone https://github.com/DoriosStudios/UtilityCraft-Addon-Template.git MyUtilityCraftAddon
cd MyUtilityCraftAddon
```

Before pushing changes, connect this working copy to a repository you own. Do not push addon changes back to the template repository.

## Verify the download

The project root should contain at least:

```text
MyUtilityCraftAddon/
├── BP/
├── RP/
├── data/
├── docs/
├── tools/
├── types/
├── config.json
├── jsconfig.json
├── package.json
└── README.md
```

If `BP`, `RP`, or `config.json` is missing, return to the repository root and download the complete project.

## Do not modify the libraries

These two folders are dependency snapshots:

```text
BP/scripts/DoriosCore/
BP/scripts/DoriosLib/
```

Treat both folders as read-only. They are included so the project can build and run against the public libraries; they are not the place for addon-owned mechanics.

Always use the public imports:

```js
import { Machine } from "DoriosCore/index.js";
import * as DoriosLib from "DoriosLib/index.js";
```

Reusable code owned by your addon belongs in an addon core such as `MYADDON_CORE`, based on the included `ExampleCore` folder.

## Before turning it into your addon

Run the unchanged template once before renaming or deleting examples. A clean run proves the environment works and makes later errors easier to locate.

After that first run, a real addon should receive:

- its own BP and RP names;
- new header and module UUIDs;
- its own namespace for owned content;
- an addon-owned replacement name for `ExampleCore`;
- updated aliases in `config.json`, `jsconfig.json`, and the bundle scripts;
- final assets that you are licensed to distribute.

Keep the UtilityCraft dependency UUIDs and compatible version requirements. Do not reuse the template's addon UUIDs in a distributed project, because two packs with the same UUID cannot coexist safely.

Next: [Run the project](./run-project).

