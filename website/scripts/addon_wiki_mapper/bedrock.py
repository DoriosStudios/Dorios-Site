"""Parsers that normalize a bridge. Bedrock project into one wiki manifest."""

from __future__ import annotations

import fnmatch
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from .jsonc import load
from .variants import group_variants

FORMATTING_CODE = re.compile(r"§.")
DEFAULT_IDENTIFIER_EXCLUDES = ("*placeholder*", "*dummy*", "*ui_placeholder*")
IMAGE_EXTENSIONS = {".png", ".tga", ".jpg", ".jpeg", ".webp"}


def _friendly_name(identifier: str) -> str:
    value = identifier.split(":", 1)[-1]
    return re.sub(r"[_/-]+", " ", value).strip().title()


def _slug(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def _source(path: Path, project_root: Path) -> str:
    return path.relative_to(project_root).as_posix()


def _category(path: Path, collection_root: Path) -> str:
    relative = path.relative_to(collection_root)
    parent = relative.parts[0] if len(relative.parts) > 1 else "General"
    return parent.replace("_", " ").replace("-", " ").title()


def _lang_index(resource_pack: Path) -> dict[str, str]:
    index: dict[str, str] = {}
    lang_path = resource_pack / "texts" / "en_US.lang"
    if not lang_path.exists():
        return index
    for raw_line in lang_path.read_text(encoding="utf-8-sig", errors="replace").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        clean = FORMATTING_CODE.sub("", value.replace("\\n", "\n")).splitlines()[0].strip()
        index[key.strip()] = clean
    return index


def _localized_name(identifier: str, kind: str, lang: dict[str, str]) -> str:
    keys = (
        f"item.{identifier}",
        f"item.{identifier}.name",
        f"tile.{identifier}.name",
        f"entity.{identifier}.name",
    )
    for key in keys:
        if key in lang and lang[key]:
            return lang[key]
    return _friendly_name(identifier)


def _texture_index(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    payload = load(path)
    result: dict[str, str] = {}
    for key, record in payload.get("texture_data", {}).items():
        texture = record.get("textures") if isinstance(record, dict) else record
        if isinstance(texture, list):
            texture = texture[0] if texture else None
        if isinstance(texture, str):
            result[key] = texture
    return result


def _existing_texture(
    resource_pack: Path,
    texture_ref: str | None,
    dependency_resource_packs: Iterable[Path] = (),
) -> str | None:
    if not texture_ref:
        return None
    clean = texture_ref.replace("\\", "/")
    resource_packs = [resource_pack, *dependency_resource_packs]
    for extension in (".png", ".tga", ".jpg", ".jpeg"):
        if any((candidate_root / f"{clean}{extension}").exists() for candidate_root in resource_packs):
            return f"{clean}{extension}"
    if any((candidate_root / clean).exists() for candidate_root in resource_packs):
        return clean
    return None


def _icon_key(components: dict[str, Any]) -> str | None:
    icon = components.get("minecraft:icon")
    if isinstance(icon, str):
        return icon
    if isinstance(icon, dict):
        return icon.get("textures", {}).get("default") or icon.get("texture")
    return None


def _material_faces(
    components: dict[str, Any],
    textures: dict[str, str],
    resource_pack: Path,
    dependency_resource_packs: list[Path],
) -> dict[str, str | None]:
    material_instances = components.get("minecraft:material_instances", {})
    fallback = material_instances.get("*", {})

    def face(*names: str) -> str | None:
        record = next((material_instances.get(name) for name in names if material_instances.get(name)), fallback)
        if isinstance(record, str) and record in material_instances:
            record = material_instances[record]
        key = record.get("texture") if isinstance(record, dict) else record
        return _existing_texture(resource_pack, textures.get(key, key), dependency_resource_packs)

    return {
        "top": face("up", "top"),
        "left": face("west", "left", "south"),
        "right": face("north", "right", "east"),
    }


def _legacy_block_faces(
    resource_pack: Path,
    textures: dict[str, str],
    dependency_resource_packs: list[Path],
) -> dict[str, dict[str, str | None]]:
    blocks_path = resource_pack / "blocks.json"
    if not blocks_path.exists():
        return {}
    payload = load(blocks_path)
    result: dict[str, dict[str, str | None]] = {}

    for identifier, record in payload.items():
        if identifier == "format_version" or not isinstance(record, dict):
            continue
        texture_record = record.get("textures")

        def face(*names: str) -> str | None:
            value: Any = texture_record
            if isinstance(texture_record, dict):
                value = next((texture_record.get(name) for name in names if texture_record.get(name)), None)
                if value is None:
                    value = texture_record.get("side") or texture_record.get("all")
                if value is None and texture_record:
                    value = next(iter(texture_record.values()))
            if isinstance(value, list):
                value = value[0] if value else None
            if isinstance(value, dict):
                value = value.get("path")
            return _existing_texture(resource_pack, textures.get(value, value), dependency_resource_packs) if isinstance(value, str) else None

        result[identifier] = {
            "top": face("up", "top"),
            "left": face("west", "left", "south"),
            "right": face("north", "right", "east"),
        }
    return result


def _client_entity_images(resource_pack: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    for path in _json_files(resource_pack / "entity"):
        try:
            root = load(path).get("minecraft:client_entity", {})
        except (OSError, ValueError, TypeError):
            continue
        description = root.get("description", {})
        identifier = description.get("identifier")
        texture_record = description.get("textures", {})
        texture = next(iter(texture_record.values()), None) if isinstance(texture_record, dict) else None
        resolved = _existing_texture(resource_pack, texture)
        if identifier and resolved:
            result[identifier] = resolved
    return result


def _render_index(project_root: Path) -> dict[str, str]:
    """Index the hand-authored inventory renders shipped beside a bridge. project."""
    renders_root = project_root / "Assets" / "Renders"
    if not renders_root.is_dir():
        return {}
    result: dict[str, str] = {}
    for path in sorted(renders_root.rglob("*")):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            public_path = (Path("renders") / path.relative_to(renders_root)).as_posix()
            result.setdefault(path.stem.lower(), public_path)
    return result


def _block_render(identifier: str, renders: dict[str, str]) -> str | None:
    local_id = identifier.split(":", 1)[-1].lower()
    for candidate in (local_id, f"{local_id}_render"):
        if candidate in renders:
            return renders[candidate]
    return None


def _geometry_identifiers(block_root: dict[str, Any]) -> list[str]:
    candidates = [block_root.get("components", {})]
    candidates.extend(permutation.get("components", {}) for permutation in block_root.get("permutations", []))
    geometries: list[str] = []
    for components in candidates:
        geometry = components.get("minecraft:geometry")
        if isinstance(geometry, str):
            geometries.append(geometry)
        elif isinstance(geometry, dict) and isinstance(geometry.get("identifier"), str):
            geometries.append(geometry["identifier"])
    return geometries


def _plant_item_image(
    identifier: str,
    geometries: list[str],
    items: list[dict[str, Any]],
    config: dict[str, Any],
) -> str | None:
    if not any("crop" in geometry.lower() for geometry in geometries):
        return None

    local_id = identifier.split(":", 1)[-1]
    overrides = config.get("blockItemIcons", {})
    target_id = overrides.get(identifier) or overrides.get(local_id)
    if not target_id:
        target_id = local_id if local_id.endswith("_seeds") else re.sub(r"_crop$", "_seeds", local_id)
    target_local_id = target_id.split(":", 1)[-1]
    item = next((entry for entry in items if entry["id"] == target_local_id), None)
    return item.get("image") if item else None


def _patterns(config: dict[str, Any], key: str) -> tuple[str, ...]:
    return tuple(config.get("exclude", {}).get(key, []))


def _identifier_excluded(identifier: str, config: dict[str, Any]) -> bool:
    identifier_patterns = DEFAULT_IDENTIFIER_EXCLUDES + _patterns(config, "identifierPatterns")
    return any(fnmatch.fnmatch(identifier.lower(), pattern.lower()) for pattern in identifier_patterns)


def _excluded(kind: str, path: Path, identifier: str, collection_root: Path, config: dict[str, Any]) -> bool:
    relative = path.relative_to(collection_root)
    segments = {segment.lower() for segment in relative.parts}
    if kind == "items" and "ui" in segments:
        return True
    if {"placeholder", "placeholders", "dummy"} & segments:
        return True
    if _identifier_excluded(identifier, config):
        return True
    source_value = relative.as_posix()
    return any(fnmatch.fnmatch(source_value.lower(), pattern.lower()) for pattern in _patterns(config, "pathPatterns"))


def _json_files(root: Path) -> Iterable[Path]:
    return sorted(root.rglob("*.json")) if root.exists() else ()


def _parse_items(
    project_root: Path,
    behavior_pack: Path,
    resource_pack: Path,
    lang: dict[str, str],
    config: dict[str, Any],
    dependency_resource_packs: list[Path],
) -> list[dict[str, Any]]:
    collection_root = behavior_pack / "items"
    textures: dict[str, str] = {}
    for dependency_resource_pack in dependency_resource_packs:
        textures.update(_texture_index(dependency_resource_pack / "textures" / "item_texture.json"))
    textures.update(_texture_index(resource_pack / "textures" / "item_texture.json"))
    entries: list[dict[str, Any]] = []
    for path in _json_files(collection_root):
        try:
            root = load(path).get("minecraft:item", {})
        except (OSError, ValueError, TypeError):
            continue
        identifier = root.get("description", {}).get("identifier")
        if not identifier or _excluded("items", path, identifier, collection_root, config):
            continue
        components = root.get("components", {})
        icon = _icon_key(components)
        entries.append({
            "id": identifier.split(":", 1)[-1],
            "slug": _slug(identifier.split(":", 1)[-1]),
            "identifier": identifier,
            "name": _localized_name(identifier, "item", lang),
            "category": _category(path, collection_root),
            "image": _existing_texture(resource_pack, textures.get(icon, icon), dependency_resource_packs),
            "source": _source(path, project_root),
        })
    deduplicated: dict[str, dict[str, Any]] = {}
    for entry in entries:
        deduplicated.setdefault(entry["identifier"], entry)
    return sorted(deduplicated.values(), key=lambda entry: entry["name"].lower())


def _machine_metadata(root: dict[str, Any], components: dict[str, Any]) -> dict[str, Any] | None:
    """Extract the stable, user-facing parts of Dorios machine components.

    The add-ons use several custom component names, but their ``entity`` and
    ``machine`` payloads share one schema. Keeping the normalized subset in the
    generated manifest lets the wiki document actual behavior without exposing
    the entire internal block definition.
    """
    component_entry = next((
        (key, value)
        for key, value in components.items()
        if isinstance(value, dict)
        and (
            isinstance(value.get("entity"), dict)
            or isinstance(value.get("machine"), dict)
            or isinstance(value.get("generator"), dict)
            or "energy_cap" in value
        )
    ), None)
    if component_entry is None:
        return None

    component_key, component_value = component_entry
    entity = component_value.get("entity", {})
    machine = component_value.get("machine", {})
    generator = component_value.get("generator", {})
    power = (
        machine if isinstance(machine, dict) and machine
        else generator if isinstance(generator, dict) and generator
        else component_value if "energy_cap" in component_value else {}
    )
    upgrades_value = components.get("utilitycraft:machine_upgrades", [])
    upgrades = [
        {
            key: upgrade[key]
            for key in ("type", "slot", "max")
            if key in upgrade
        }
        for upgrade in upgrades_value
        if isinstance(upgrade, dict)
    ] if isinstance(upgrades_value, list) else []
    recipe_value = components.get("utilitycraft:machine_recipes", {})
    recipe_type = recipe_value.get("type") if isinstance(recipe_value, dict) else None
    tick_value = components.get("minecraft:tick", {})
    tick_interval = tick_value.get("interval_range") if isinstance(tick_value, dict) else None
    placement = root.get("description", {}).get("traits", {}).get("minecraft:placement_direction", {})
    enabled_states = placement.get("enabled_states", []) if isinstance(placement, dict) else []

    interfaces: list[str] = []
    if power.get("energy_cap", 0) > 0 and (power.get("energy_cost", 0) > 0 or power.get("rate_speed_base", 0) > 0):
        interfaces.append("Energy")
    if "tag:dorios:item" in components:
        interfaces.append("Items")
    if "tag:dorios:fluid" in components or "fluid" in str(entity.get("type", "")):
        interfaces.append("Fluids")
    if "tag:dorios:gas" in components or "gas" in str(entity.get("type", "")):
        interfaces.append("Gases")

    metadata = {
        "component": component_key,
        "entityType": entity.get("type"),
        "inventorySize": entity.get("inventory_size"),
        "inputSlot": entity.get("input_slot"),
        "inputRange": entity.get("input_range"),
        "outputSlot": entity.get("output_slot"),
        "outputRange": entity.get("output_range"),
        "systemKind": "generator" if generator else "machine" if machine else "energy",
        "energyCapacity": power.get("energy_cap"),
        "energyCost": power.get("energy_cost"),
        "baseRate": power.get("rate_speed_base"),
        "fluidCapacity": power.get("fluid_cap"),
        "fluidTypes": power.get("fluid_types"),
        "gasCapacity": power.get("gas_cap"),
        "gasTypes": power.get("gas_types"),
        "recipeType": recipe_type,
        "upgradeSlots": machine.get("upgrades"),
        "upgrades": upgrades,
        "interfaces": interfaces,
        "tickInterval": tick_interval,
        "directional": any(str(state).endswith("direction") for state in enabled_states),
    }
    return {
        key: value
        for key, value in metadata.items()
        if value is not None and value != []
    }


def _block_metadata(root: dict[str, Any], components: dict[str, Any]) -> dict[str, Any]:
    """Extract player-facing physical block properties without inventing defaults."""
    mining = components.get("minecraft:destructible_by_mining")
    explosion = components.get("minecraft:destructible_by_explosion")
    loot = components.get("minecraft:loot")
    placement = root.get("description", {}).get("traits", {}).get("minecraft:placement_direction", {})
    enabled_states = placement.get("enabled_states", []) if isinstance(placement, dict) else []
    tool_tags = {
        "tag:minecraft:is_pickaxe_item_destructible": "Pickaxe",
        "tag:minecraft:is_axe_item_destructible": "Axe",
        "tag:minecraft:is_shovel_item_destructible": "Shovel",
        "tag:minecraft:is_hoe_item_destructible": "Hoe",
    }

    metadata: dict[str, Any] = {
        "breakTime": mining.get("seconds_to_destroy") if isinstance(mining, dict) else None,
        "mineable": mining is not False if mining is not None else None,
        "explosionResistance": (
            "Immune" if explosion is False
            else explosion.get("explosion_resistance") if isinstance(explosion, dict)
            else None
        ),
        "lightEmission": components.get("minecraft:light_emission"),
        "friction": components.get("minecraft:friction"),
        "mapColor": components.get("minecraft:map_color"),
        "lootTable": loot if isinstance(loot, str) else loot.get("table") if isinstance(loot, dict) else None,
        "tool": next((label for tag, label in tool_tags.items() if tag in components), None),
        "directional": any(str(state).endswith("direction") for state in enabled_states),
    }
    return {key: value for key, value in metadata.items() if value is not None}


def _parse_blocks(
    project_root: Path,
    behavior_pack: Path,
    resource_pack: Path,
    lang: dict[str, str],
    config: dict[str, Any],
    dependency_resource_packs: list[Path],
    items: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    collection_root = behavior_pack / "blocks"
    textures: dict[str, str] = {}
    for dependency_resource_pack in dependency_resource_packs:
        textures.update(_texture_index(dependency_resource_pack / "textures" / "terrain_texture.json"))
    textures.update(_texture_index(resource_pack / "textures" / "terrain_texture.json"))
    legacy_faces = _legacy_block_faces(resource_pack, textures, dependency_resource_packs)
    renders = _render_index(project_root)
    entries: list[dict[str, Any]] = []
    for path in _json_files(collection_root):
        try:
            root = load(path).get("minecraft:block", {})
        except (OSError, ValueError, TypeError):
            continue
        identifier = root.get("description", {}).get("identifier")
        if not identifier or _excluded("blocks", path, identifier, collection_root, config):
            continue
        components = root.get("components", {})
        visual_candidates = [components]
        visual_candidates.extend(
            permutation.get("components", {})
            for permutation in root.get("permutations", [])
            if permutation.get("components", {}).get("minecraft:material_instances")
        )
        faces: dict[str, str | None] = {"top": None, "left": None, "right": None}
        for visual_components in visual_candidates:
            candidate_faces = _material_faces(
                visual_components,
                textures,
                resource_pack,
                dependency_resource_packs,
            )
            faces = {
                position: faces[position] or candidate_faces.get(position)
                for position in ("top", "left", "right")
            }
            if all(faces.values()):
                break
        fallback_faces = legacy_faces.get(identifier, {})
        faces = {position: faces.get(position) or fallback_faces.get(position) for position in ("top", "left", "right")}
        geometries = _geometry_identifiers(root)
        entry = {
            "id": identifier.split(":", 1)[-1],
            "slug": _slug(identifier.split(":", 1)[-1]),
            "identifier": identifier,
            "name": _localized_name(identifier, "block", lang),
            "category": _category(path, collection_root),
            "render": _block_render(identifier, renders),
            "itemImage": _plant_item_image(identifier, geometries, items, config),
            "faces": faces,
            "componentKeys": sorted(components),
            "machineData": _machine_metadata(root, components),
            "source": _source(path, project_root),
        }
        block_data = _block_metadata(root, components)
        if block_data:
            entry["blockData"] = block_data
        entries.append(entry)
    deduplicated: dict[str, dict[str, Any]] = {}
    for entry in entries:
        deduplicated.setdefault(entry["identifier"], entry)
    return sorted(deduplicated.values(), key=lambda entry: entry["name"].lower())


def _parse_entities(project_root: Path, behavior_pack: Path, resource_pack: Path, lang: dict[str, str], config: dict[str, Any]) -> list[dict[str, Any]]:
    collection_root = behavior_pack / "entities"
    client_images = _client_entity_images(resource_pack)
    entries: list[dict[str, Any]] = []
    for path in _json_files(collection_root):
        try:
            root = load(path).get("minecraft:entity", {})
        except (OSError, ValueError, TypeError):
            continue
        identifier = root.get("description", {}).get("identifier")
        if not identifier or _excluded("entities", path, identifier, collection_root, config):
            continue
        entries.append({
            "id": identifier.split(":", 1)[-1],
            "slug": _slug(identifier.split(":", 1)[-1]),
            "identifier": identifier,
            "name": _localized_name(identifier, "entity", lang),
            "category": _category(path, collection_root),
            "image": client_images.get(identifier),
            "source": _source(path, project_root),
        })
    deduplicated: dict[str, dict[str, Any]] = {}
    for entry in entries:
        deduplicated.setdefault(entry["identifier"], entry)
    return sorted(deduplicated.values(), key=lambda entry: entry["name"].lower())


def _ingredient(record: Any) -> dict[str, Any] | None:
    if isinstance(record, str):
        return {"id": record, "count": 1}
    if not isinstance(record, dict):
        return None
    identifier = record.get("item") or record.get("tag")
    return {"id": identifier, "count": record.get("count", 1)} if identifier else None


def _result(record: Any) -> dict[str, Any] | None:
    if isinstance(record, list):
        record = record[0] if record else None
    return _ingredient(record)


def _parse_recipe(path: Path, project_root: Path) -> dict[str, Any] | None:
    try:
        payload = load(path)
    except (OSError, ValueError, TypeError):
        return None
    recipe_key = next((key for key in payload if key.startswith("minecraft:recipe_")), None)
    if not recipe_key:
        return None
    root = payload[recipe_key]
    identifier = root.get("description", {}).get("identifier")
    if not identifier:
        return None
    slots: list[dict[str, Any] | None] = [None] * 9
    if recipe_key == "minecraft:recipe_shaped":
        key_map = root.get("key", {})
        for row_index, row in enumerate(root.get("pattern", [])[:3]):
            for column_index, symbol in enumerate(row[:3]):
                if symbol != " ":
                    slots[row_index * 3 + column_index] = _ingredient(key_map.get(symbol))
    elif recipe_key == "minecraft:recipe_shapeless":
        for index, ingredient in enumerate(root.get("ingredients", [])[:9]):
            slots[index] = _ingredient(ingredient)
    elif recipe_key == "minecraft:recipe_smithing_transform":
        for index, field in enumerate(("template", "base", "addition")):
            slots[index] = _ingredient(root.get(field))
    else:
        slots[0] = _ingredient(root.get("input"))
    tags = root.get("tags", [])
    return {
        "id": identifier.split(":", 1)[-1],
        "identifier": identifier,
        "kind": recipe_key.removeprefix("minecraft:recipe_"),
        "station": tags[0] if tags else recipe_key.removeprefix("minecraft:recipe_"),
        "slots": slots,
        "slotCount": sum(slot is not None for slot in slots),
        "result": _result(root.get("result") or root.get("output")),
        "source": _source(path, project_root),
    }


def _parse_recipes(project_root: Path, behavior_pack: Path, config: dict[str, Any]) -> list[dict[str, Any]]:
    recipes = [
        parsed
        for path in _json_files(behavior_pack / "recipes")
        if (parsed := _parse_recipe(path, project_root))
        and not _identifier_excluded((parsed.get("result") or {}).get("id", ""), config)
    ]
    deduplicated: dict[str, dict[str, Any]] = {}
    for recipe in recipes:
        deduplicated.setdefault(recipe["identifier"], recipe)
    normalized = list(deduplicated.values())
    local_id_counts: dict[str, int] = {}
    for recipe in normalized:
        local_id_counts[recipe["id"]] = local_id_counts.get(recipe["id"], 0) + 1
    for recipe in normalized:
        if local_id_counts[recipe["id"]] > 1:
            recipe["id"] = _slug(recipe["identifier"])
    return sorted(normalized, key=lambda recipe: recipe["identifier"])


def build_manifest(
    project_root: Path,
    project_id: str,
    project_name: str,
    config: dict[str, Any] | None = None,
    dependency_projects: list[Path] | None = None,
) -> dict[str, Any]:
    project_root = project_root.resolve()
    behavior_pack = project_root / "BP"
    resource_pack = project_root / "RP"
    if not behavior_pack.is_dir():
        raise ValueError(f"{project_root} must contain a BP directory")
    config = config or {}
    dependency_resource_packs = [(project.resolve() / "RP") for project in (dependency_projects or [])]
    lang = _lang_index(resource_pack)
    items = _parse_items(project_root, behavior_pack, resource_pack, lang, config, dependency_resource_packs)
    blocks = _parse_blocks(project_root, behavior_pack, resource_pack, lang, config, dependency_resource_packs, items)
    entities = _parse_entities(project_root, behavior_pack, resource_pack, lang, config)
    recipes = _parse_recipes(project_root, behavior_pack, config)
    catalog_items, variant_groups = group_variants(items)

    return {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "project": {"id": project_id, "name": project_name},
        "counts": {
            "items": len(items),
            "catalogItems": len(catalog_items),
            "blocks": len(blocks),
            "entities": len(entities),
            "recipes": len(recipes),
            "variantGroups": len(variant_groups),
        },
        "content": {
            "items": items,
            "blocks": blocks,
            "entities": entities,
            "recipes": recipes,
        },
        "catalog": {"items": catalog_items},
        "variantGroups": variant_groups,
    }
