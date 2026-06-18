---
id: script-events
sidebar_label: Script Events
title: DoriosCore Script Events
sidebar_position: 10
---

# Script Events

DoriosCore registers several `system.afterEvents.scriptEventReceive` handlers when `DoriosCore/index.js` is imported.

These events are useful for commands, cross-addon integration, and external registration of fluid containers.

---

# Events

<div class="api-grid">

<div class="api-index-item"><span class="api-method">E</span><a href="#doriosdestroymachine">dorios:destroyMachine</a></div>
<div class="api-index-item"><span class="api-method">E</span><a href="#doriosdestroygenerator">dorios:destroyGenerator</a></div>
<div class="api-index-item"><span class="api-method">E</span><a href="#doriosdestroytank">dorios:destroyTank</a></div>
<div class="api-index-item"><span class="api-method">E</span><a href="#doriosspecial_container">dorios:special_container</a></div>
<div class="api-index-item"><span class="api-method">E</span><a href="#utilitycraftregister_fluid_item">utilitycraft:register_fluid_item</a></div>
<div class="api-index-item"><span class="api-method">E</span><a href="#utilitycraftregister_fluid_holder">utilitycraft:register_fluid_holder</a></div>
<div class="api-index-item"><span class="api-method">E</span><a href="#utilitycraftset_tick_speed">utilitycraft:set_tick_speed</a></div>
<div class="api-index-item"><span class="api-method">E</span><a href="#utilitycraftset_scheduler_profile">utilitycraft:set_scheduler_profile</a></div>
<div class="api-index-item"><span class="api-method">E</span><a href="#utilitycrafttick_group">utilitycraft:tick_group</a></div>

</div>

---

## dorios:destroyMachine

Payload:

```text
x,y,z
```

Builds a fake break event, calls `Machine.onDestroy()`, then removes the block.

## dorios:destroyGenerator

Payload:

```text
x,y,z
```

Builds a fake break event, calls `Generator.onDestroy()`, then removes the block.

## dorios:destroyTank

Payload:

```text
x,y,z
```

Destroys a fluid tank block and helper entity while preserving stored fluid in the dropped item lore.

## dorios:special_container

Payload:

```json
{
  "input": [0, 1, 2],
  "output": [6, 7, 8]
}
```

Stores custom container slot information on the source entity. At least one of `input` or `output` must be present.

## utilitycraft:register_fluid_item

Payload:

```json
{
  "minecraft:lava_bucket": {
    "amount": 1000,
    "type": "lava",
    "output": "minecraft:bucket"
  },
  "custom:creative_water_cell": {
    "amount": 1000,
    "type": "water",
    "output": "custom:creative_water_cell",
    "infinite": true
  }
}
```

Adds or replaces entries in `FluidStorage.itemFluidStorages`.

## utilitycraft:register_fluid_holder

Payload:

```json
{
  "minecraft:bucket": {
    "required": 1000,
    "types": {
      "water": "minecraft:water_bucket",
      "lava": "minecraft:lava_bucket"
    }
  }
}
```

Adds or extends entries in `FluidStorage.itemFluidHolders`.

When an item already exists, its `types` map is merged. `required` is overwritten only when explicitly supplied.

## utilitycraft:set_tick_speed

Payload:

```json
20
```

Updates the legacy global tick speed dynamic property and global runtime value. The current scheduler system primarily uses scheduler profiles for closed machines.

## utilitycraft:set_scheduler_profile

Payload:

```text
fast
```

Supported values:

- `fast`
- `normal`
- `low`

Invalid values fall back to the default scheduler profile.

## utilitycraft:tick_group

Payload:

```text
add|1|addon_id
remove|1|addon_id
```

Synchronizes scheduler group counts between addons. Messages from the Core's own source id are ignored by its handler.

---

# Example

```js
system.sendScriptEvent("utilitycraft:register_fluid_item", JSON.stringify({
  "myaddon:oil_bucket": {
    amount: 1000,
    type: "oil",
    output: "minecraft:bucket",
  },
}));
```
