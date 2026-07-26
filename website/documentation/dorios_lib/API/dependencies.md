---
id: dependencies
title: dependencies namespace
sidebar_label: dependencies
sidebar_position: 6
description: Announce addon metadata, discover installed Dorios addons, compare versions, validate requirements, and report problems.
---

# `dependencies` namespace

Namespace: `DoriosLib.dependencies` · Package: `DoriosLib/index.js`

The dependency service uses a shared script event to announce metadata after world load. Each local addon can then validate its minimum-version requirements against the discovered registry.

## SCRIPT_EVENT_ID

`SCRIPT_EVENT_ID: "dorios:dependency_checker"`

Public protocol identifier used for addon metadata announcements. Prefer `initialize()` over sending this event manually.

## Metadata contracts

```ts
interface DependencyRequirement {
  version?: string;
  name?: string;
  warning?: string;
}

interface AddonMetadata {
  name: string;
  identifier: string;
  version: string;
  author?: string;
  dependencies?: Record<string, DependencyRequirement>;
}
```

| Property | Required | Description |
| --- | --- | --- |
| `name` | Yes | Human-readable addon name used in reports. |
| `identifier` | Yes | Stable discovery key. It should not change between versions. |
| `version` | Yes | Semantic-version-like installed version. |
| `author` | No | Author or organization. |
| `dependencies` | No | Requirements keyed by the dependency's stable identifier. |

## initialize

<div class="api-signature">

`initialize(metadata: AddonMetadata, options?: InitializeDependencyOptions): () => void`

</div>

```ts
interface InitializeDependencyOptions {
  validationDelayTicks?: number; // 300
  announceSuccess?: boolean;     // false
  onResult?: (result: ValidationResult, addon: AddonMetadata) => void;
}
```

Validates and clones metadata, installs shared listeners once, adds the addon to local discovery, and schedules its announcement/validation after world load.

```js
const unregister = DoriosLib.dependencies.initialize({
  name: "Example Machines",
  identifier: "example_machines",
  version: "1.2.0",
  dependencies: {
    utilitycraft: { name: "UtilityCraft", version: "3.5.0" },
  },
});
```

The returned function removes this addon from future local validation. It does not remove metadata already discovered by other runtimes and does not uninstall shared listeners.

## get

`get(identifier: string): AddonMetadata | undefined`

Returns a cloned snapshot for a discovered addon. Mutating it does not change the registry.

## getAll

`getAll(): AddonMetadata[]`

Returns cloned snapshots of every discovered addon. Ordering follows discovery insertion order and should not be treated as priority.

## validate

<div class="api-signature">

`validate(metadata: AddonMetadata, available?: ReadonlyMap<string, AddonMetadata>): ValidationResult`

</div>

```ts
interface DependencyIssue {
  identifier: string;
  name: string;
  required: string | undefined;
  found: string | undefined;
  warning: string | undefined;
}

interface ValidationResult {
  ok: boolean;
  missing: DependencyIssue[];
  outdated: DependencyIssue[];
}
```

Uses the discovered registry by default. Supplying `available` is useful for deterministic tests or diagnostics.

- A dependency absent from the map is added to `missing`.
- An installed version below the requested version is added to `outdated`.
- A requirement without `version` checks presence only.

## compareVersions

`compareVersions(left: string, right: string): -1 | 0 | 1`

Compares semantic-version-like values. Core numeric parts are compared first, missing core parts behave as zero, build metadata after `+` is ignored, and a stable release is newer than its prerelease.

```js
DoriosLib.dependencies.compareVersions("3.5.0", "3.4.9"); // 1
DoriosLib.dependencies.compareVersions("1.0.0-beta.2", "1.0.0"); // -1
```

Invalid nonnumeric core parts throw `TypeError`.

## formatReport

`formatReport(addon: AddonMetadata, result: ValidationResult): string`

Builds a Minecraft-formatted multiline message. Successful results produce a green initialization message; failures list missing and outdated dependencies with requested and discovered versions.

## report

`report(addon: AddonMetadata, result: ValidationResult, options?: { announceSuccess?: boolean }): void`

Broadcasts `formatReport()`. Failures are always reported. Successful results remain silent unless `announceSuccess` is true.

## Initialization note

The DoriosLib root initializes UtilityCraft's own metadata automatically from [`config.ADDON_METADATA`](./config). Your extension still calls `initialize()` for its separate identifier and requirements.
