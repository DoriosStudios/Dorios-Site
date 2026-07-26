---
id: config
title: config namespace
sidebar_label: config
sidebar_position: 3
description: Inspect the UtilityCraft metadata and dependency options used by the installed DoriosLib entry point.
---

# `config` namespace

Namespace: `DoriosLib.config` · Package: `DoriosLib/index.js`

This namespace describes the copy of DoriosLib bundled with UtilityCraft. Addons normally read these values for diagnostics; they should announce their own metadata with [`dependencies.initialize`](./dependencies#initialize).

## ADDON_METADATA

<div class="api-signature">

`ADDON_METADATA: AddonMetadata`

</div>

Current UtilityCraft metadata announced through `dorios:dependency_checker`:

```js
{
  name: "UtilityCraft",
  author: "Dorios Studios",
  identifier: "utilitycraft",
  version: "3.5.0",
  dependencies: {},
}
```

Do not mutate this object to represent your addon. Call `dependencies.initialize(yourMetadata)` instead so both addons remain independently discoverable.

## DEPENDENCY_OPTIONS

`DEPENDENCY_OPTIONS: InitializeDependencyOptions`

UtilityCraft currently validates after 300 ticks and announces a successful result. These options are passed by the root module when it initializes UtilityCraft dependency discovery.

```js
console.warn(
  `${DoriosLib.config.ADDON_METADATA.name} ${DoriosLib.config.ADDON_METADATA.version}`,
);
```

See [dependencies](./dependencies) for the complete metadata and option contracts.
