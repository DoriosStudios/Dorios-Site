---
id: protocol-constants
title: Protocol constants
sidebar_label: Protocol constants
sidebar_position: 21
description: Public identifiers for helper entities, scheduling, gas registration, and machine-upgrade interoperability.
---

# Protocol constants

Namespace: `DoriosCore` · Package: `DoriosCore/index.js`

DoriosCore exports selected identifiers so addons can integrate without duplicating protocol strings.

```js
import {
  DEFAULT_ENTITY_ID,
  DEFAULT_SCHEDULER_PROFILE,
  REGISTER_GAS_HOLDER_EVENT_ID,
  REGISTER_GAS_ITEM_EVENT_ID,
  REGISTER_MACHINE_UPGRADE_EVENT_ID,
  SET_SCHEDULER_PROFILE_EVENT_ID,
  SET_TICK_SPEED_EVENT_ID,
  TICK_GROUP_COUNTS_PROPERTY_ID,
  TICK_GROUP_PROPERTY_ID,
} from "DoriosCore/index.js";
```

## Constants

| Constant | Value | Purpose |
| --- | --- | --- |
| `DEFAULT_ENTITY_ID` | `utilitycraft:machine_entity` | Default helper entity used by machines and generators when `settings.entity.identifier` is omitted. |
| `DEFAULT_SCHEDULER_PROFILE` | `fast` | Fallback profile for missing or unsupported scheduler settings. |
| `SET_SCHEDULER_PROFILE_EVENT_ID` | `utilitycraft:set_scheduler_profile` | Changes the active closed-machine scheduler profile. |
| `SET_TICK_SPEED_EVENT_ID` | `utilitycraft:set_tick_speed` | Updates the legacy global machinery tick-speed value. |
| `REGISTER_GAS_ITEM_EVENT_ID` | `utilitycraft:register_gas_item` | Registers item-to-gas insertion mappings. |
| `REGISTER_GAS_HOLDER_EVENT_ID` | `utilitycraft:register_gas_holder` | Registers gas extraction-holder mappings. |
| `REGISTER_MACHINE_UPGRADE_EVENT_ID` | `utilitycraft:register_machine_upgrade` | Registers upgrade item definitions and level perks. |
| `TICK_GROUP_PROPERTY_ID` | `utilitycraft:tick_group` | Entity property containing a closed-machine group from `0` through `5`. |
| `TICK_GROUP_COUNTS_PROPERTY_ID` | `utilitycraft:tick_group_counts` | World dynamic property containing the persisted five-element group-count array. |

## DEFAULT_ENTITY_ID

Use `DEFAULT_ENTITY_ID` when addon code needs to compare or explicitly reuse the standard DoriosCore helper entity.

```js
import { DEFAULT_ENTITY_ID } from "DoriosCore/index.js";

const usesStandardHelper = settings.entity.identifier === DEFAULT_ENTITY_ID;
```

A custom helper entity is valid when it provides every component, property, event, inventory size, and type family required by the DoriosCore runtime. Changing the identifier alone is not enough.

## Scheduler constants

`DEFAULT_SCHEDULER_PROFILE`, `TICK_GROUP_PROPERTY_ID`, and `TICK_GROUP_COUNTS_PROPERTY_ID` are intended for settings, diagnostics, and cross-addon coordination. Prefer [`TickScheduler`](./tick-scheduler) methods over reading or writing dynamic state directly because the class validates profiles, normalizes counts, and broadcasts lifecycle changes.

```js
import {
  DEFAULT_SCHEDULER_PROFILE,
  TickScheduler,
} from "DoriosCore/index.js";

const requestedProfile = addonConfig.scheduler ?? DEFAULT_SCHEDULER_PROFILE;
TickScheduler.setSchedulerProfile(requestedProfile);
```

## Registration event constants

The three registration constants prevent addons from embedding event IDs in several files. See [Script events](./script-events) for complete JSON payloads.

```js
import { system } from "@minecraft/server";
import { REGISTER_GAS_ITEM_EVENT_ID } from "DoriosCore/index.js";

system.sendScriptEvent(
  REGISTER_GAS_ITEM_EVENT_ID,
  JSON.stringify({
    "example:hydrogen_cell": {
      amount: 1_000,
      type: "example_hydrogen",
      output: "example:empty_gas_cell",
    },
  }),
);
```

For registrations performed inside the same script runtime, prefer the corresponding class API when one exists—for example, [`MachineUpgradeRegistry.register()`](./machine-upgrades). Script events are useful when another module or addon owns the payload and communicates through the shared protocol.

## Compatibility notes

- `SET_TICK_SPEED_EVENT_ID` remains public for existing integrations. New closed-machine refresh controls should use scheduler profiles.
- The fluid registration events are supported by DoriosCore but their identifiers are not public exports from `DoriosCore/index.js`; the [Script events](./script-events) page documents their payloads for command and compatibility use.
- These constants belong to DoriosCore's public contract. Constants not exported by `DoriosCore/index.js` are internal and should not be imported through deep file paths.
