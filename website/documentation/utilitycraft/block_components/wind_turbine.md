---
id: wind-turbine
sidebar_label: Wind Turbine
title: Wind Turbine Block Component
---

# Wind Turbine Block Component

The `utilitycraft:wind_turbine` block component allows you to create
passive generators that produce Dorios Energy (DE) based on altitude.

Wind Turbines generate more energy at higher elevations and may suffer
penalties at lower heights depending on configuration.

------------------------------------------------------------------------

## Component Structure

``` json
"utilitycraft:wind_turbine": {
  "entity": {
    "name": "wind_turbine",
    "type": "passive"
  },
  "generator": {
    "energy_cap": 256000,
    "rate_speed_base": 32
  },
  "max_altitude_multiplier": 4,
  "altitude": {
    "min": 20,
    "base": 63,
    "bonus_step": 16,
    "penalty_step": 8,
    "step_ratio": 0.125,
    "max_multiplier": 3
  }
}
```

------------------------------------------------------------------------

## Entity Configuration

-   **name** *(optional)*\
    Custom name assigned to the internal entity.\
    Used to link the block with its UI.\
    If omitted, the system uses the full block identifier as the entity
    name.

-   **type** *(required)*

For the Wind Turbine:

-   `type: "passive"`\
    Indicates the generator produces energy automatically without
    consuming items or fluids.

------------------------------------------------------------------------

## Generator Configuration

-   **energy_cap** *(required)*\
    Maximum energy storage in DE.

-   **rate_speed_base** *(required)*\
    Base energy generation per tick before altitude modifiers.

The system automatically adjusts internally to respect the world refresh
speed.

------------------------------------------------------------------------

## Altitude Configuration

Wind Turbines scale energy output based on height.

-   **max_altitude_multiplier**\
    Absolute cap multiplier applied to generation.

### altitude object

-   **min**\
    Minimum Y level required for generation.

-   **base**\
    Reference Y level used to calculate bonuses.

-   **bonus_step**\
    Blocks required above `base` to increase generation.

-   **penalty_step**\
    Blocks below `base` before penalties apply.

-   **step_ratio**\
    Multiplier added (or removed) per step.

-   **max_multiplier**\
    Maximum multiplier allowed from altitude scaling.

------------------------------------------------------------------------

## Required Tick Component

Wind Turbines must include `minecraft:tick` to update passive
generation.

Example:

``` json
"minecraft:tick": {
  "interval_range": [2, 2]
}
```

------------------------------------------------------------------------

## Example Advanced Wind Turbine Block

``` json
{
  "format_version": "1.20.80",
  "minecraft:block": {
    "description": {
      "identifier": "utilitycraft:advanced_wind_turbine",
      "menu_category": {
        "category": "construction"
      },
      "traits": {
        "minecraft:placement_direction": {
          "enabled_states": [
            "minecraft:cardinal_direction"
          ],
          "y_rotation_offset": 180
        }
      },
      "states": {
        "utilitycraft:on": [false, true]
      }
    },
    "components": {
      "utilitycraft:wind_turbine": {
        "entity": {
          "name": "wind_turbine",
          "type": "passive"
        },
        "generator": {
          "energy_cap": 256000,
          "rate_speed_base": 32
        },
        "max_altitude_multiplier": 4,
        "altitude": {
          "min": 20,
          "base": 63,
          "bonus_step": 16,
          "penalty_step": 8,
          "step_ratio": 0.125,
          "max_multiplier": 3
        }
      },
      "minecraft:geometry": "geometry.utilitycraft_wind_turbine",
      "minecraft:material_instances": {
        "aspas": {
          "texture": "utilitycraft_wind_turbine_still",
          "render_method": "alpha_test"
        },
        "*": {
          "texture": "utilitycraft_advanced_wind_turbine_off",
          "render_method": "alpha_test"
        }
      },
      "minecraft:tick": {
        "interval_range": [2, 2]
      },
      "minecraft:selection_box": {
        "origin": [-8, 0, -8],
        "size": [16, 16, 16]
      },
      "minecraft:collision_box": {
        "origin": [-8, 0, -8],
        "size": [16, 16, 16]
      },
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 1
      },
      "minecraft:destructible_by_explosion": false,
      "tag:dorios:generator": {},
      "tag:dorios:energy": {},
      "tag:minecraft:is_pickaxe_item_destructible": {}
    }
  }
}
```
