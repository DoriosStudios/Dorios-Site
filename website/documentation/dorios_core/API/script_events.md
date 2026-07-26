---
id: script-events
title: DoriosCore script events
sidebar_label: Script events
sidebar_position: 22
description: Payload reference for destruction, resource registration, upgrades, and scheduler synchronization events.
---

# DoriosCore script events

Importing `DoriosCore/index.js` installs DoriosCore's `system.afterEvents.scriptEventReceive` dispatcher. These events support commands and cross-addon communication.

```js
import { system } from "@minecraft/server";
import { REGISTER_GAS_ITEM_EVENT_ID } from "DoriosCore/index.js";
```

:::tip
Within ordinary addon code, prefer the documented class or registry method when one is available. Script events are most useful across module boundaries, from commands, or when the sender should not directly own the receiver's registry.
:::

## Event summary

| Event ID | Payload | Purpose |
| --- | --- | --- |
| `dorios:destroyMachine` | `x,y,z` | Runs the machine destruction lifecycle. |
| `dorios:destroyGenerator` | `x,y,z` | Runs the generator destruction lifecycle. |
| `dorios:destroyTank` | `x,y,z` | Drops a fluid tank while preserving stored liquids. |
| `utilitycraft:register_fluid_item` | JSON object | Registers items that insert liquids. |
| `utilitycraft:register_fluid_holder` | JSON object | Registers items that extract liquids. |
| `utilitycraft:register_gas_item` | JSON object | Registers items that insert gases. |
| `utilitycraft:register_gas_holder` | JSON object | Registers items that extract gases. |
| `utilitycraft:register_machine_upgrade` | JSON object | Registers machine-upgrade items. |
| `utilitycraft:set_tick_speed` | JSON number | Updates the legacy global tick speed. |
| `utilitycraft:set_scheduler_profile` | Profile ID | Changes the closed-machine scheduler profile. |
| `utilitycraft:tick_group` | Pipe-delimited text | Synchronizes scheduler group counts between addons. |

## Destruction events

### dorios:destroyMachine

Payload:

```text
x,y,z
```

The source entity's dimension is used to resolve the coordinates. DoriosCore builds a break-like event, calls `Machine.onDestroy()`, and then removes the block. When the normal lifecycle cannot complete, it falls back to destroying the block with a command.

### dorios:destroyGenerator

Uses the same `x,y,z` payload and removal flow, calling `Generator.onDestroy()`.

### dorios:destroyTank

Uses the same `x,y,z` payload. DoriosCore finds a helper entity at the position whose type ID contains `tank`, creates the block item, stores every indexed liquid as resource lore, removes the entity and block, and spawns the preserved item.

These events are lifecycle infrastructure. Addon-owned block code normally calls the public destruction method appropriate to its class instead of sending an event.

## Liquid item registration

### utilitycraft:register_fluid_item

Registers an item that inserts a concrete amount and type into a compatible liquid storage.

```json
{
  "example:coolant_cell": {
    "amount": 1000,
    "type": "example_coolant",
    "output": "example:empty_fluid_cell"
  },
  "example:creative_coolant_cell": {
    "amount": 1000,
    "type": "example_coolant",
    "output": "example:creative_coolant_cell",
    "infinite": true
  }
}
```

| Field | Required | Description |
| --- | --- | --- |
| `amount` | Yes | Numeric liquid amount provided by the item. |
| `type` | Yes | Liquid type stored in the target. |
| `output` | Runtime use | Item returned after insertion. |
| `infinite` | No | Keeps a creative source item reusable when supported by the interaction. |

Entries without numeric `amount` or string `type` are skipped. Valid entries replace an existing mapping with the same item ID.

### utilitycraft:register_fluid_holder

Registers an empty or reusable holder that extracts supported liquid types.

```json
{
  "example:empty_fluid_cell": {
    "required": 1000,
    "types": {
      "example_coolant": "example:coolant_cell",
      "water": "example:water_cell"
    }
  }
}
```

| Field | Required | Description |
| --- | --- | --- |
| `required` | Yes for a new holder | Amount removed from storage to create the filled item. |
| `types` | Yes | Map from liquid type to filled output item ID. |

For an existing holder, `types` is merged and `required` changes only when the payload explicitly supplies a number.

## Gas item registration

The gas events use separate registries and do not share liquid mappings.

### utilitycraft:register_gas_item

```json
{
  "example:hydrogen_cell": {
    "amount": 1000,
    "type": "example_hydrogen",
    "output": "example:empty_gas_cell"
  }
}
```

The field rules match `register_fluid_item`: `amount` must be numeric and `type` must be a string. A valid entry replaces any existing gas mapping for that item ID.

### utilitycraft:register_gas_holder

```json
{
  "example:empty_gas_cell": {
    "required": 1000,
    "types": {
      "example_hydrogen": "example:hydrogen_cell",
      "example_oxygen": "example:oxygen_cell"
    }
  }
}
```

The field and merge rules match `register_fluid_holder`.

The public constants `REGISTER_GAS_ITEM_EVENT_ID` and `REGISTER_GAS_HOLDER_EVENT_ID` contain these event IDs.

## Machine-upgrade registration

### utilitycraft:register_machine_upgrade

Registers one or more exact upgrade item IDs.

```json
{
  "example:balanced_upgrade": {
    "type": "balanced_upgrade",
    "value": 1,
    "levels": {
      "1": {
        "speed": 0.25,
        "energy_cost": 0.1,
        "process_batch": 0
      },
      "2": {
        "speed": 0.5,
        "energy_cost": 0.25,
        "process_batch": 1
      }
    }
  }
}
```

Each entry is passed to `MachineUpgradeRegistry.register(itemTypeId, registration)`. Invalid definitions are rejected individually so other entries can still register. See [Machine upgrades](./machine-upgrades) for every field, validation rule, and boost calculation.

The public constant `REGISTER_MACHINE_UPGRADE_EVENT_ID` contains this event ID.

## Scheduler events

### utilitycraft:set_scheduler_profile

Payload:

```text
normal
```

Supported IDs are `fast`, `normal`, and `low`. Input is trimmed and normalized to lowercase; an unsupported value selects `fast`.

Use `SET_SCHEDULER_PROFILE_EVENT_ID` when sending the event from script, or call `TickScheduler.setSchedulerProfile()` directly.

### utilitycraft:tick_group

Payload:

```text
add|3|example_addon
```

| Segment | Allowed value | Description |
| --- | --- | --- |
| Action | `add` or `remove` | Count delta to apply. |
| Group | `1` through `5` | Scheduler group whose count changes. |
| Source | Addon source ID | Messages whose source is `utilitycraft` are ignored by DoriosCore to prevent processing its own broadcast. |

`TickScheduler.assignTickGroup()` and `releaseTickGroup()` send these messages automatically. Custom machinery should use those methods instead of constructing payloads.

### utilitycraft:set_tick_speed

Payload is a positive JSON number:

```text
20
```

The handler stores the number in `utilitycraft:tickSpeed` and updates the shared runtime tick-speed value. Invalid, nonnumeric, and nonpositive payloads are ignored with a warning.

This is a compatibility protocol. Current closed-machine refresh behavior is controlled by scheduler profiles.

## Example: register a gas cell from another module

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

## Error handling

- Malformed JSON registration payloads are rejected and logged.
- Invalid entries inside a valid payload are skipped.
- Destroy-event failures and invalid tick-speed payloads are logged.
- Event handlers do not throw validation errors back to the sender.

See [Protocol constants](./protocol-constants) for every event identifier exported from the public entry point.
