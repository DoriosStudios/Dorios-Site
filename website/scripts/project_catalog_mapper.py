"""Generate the small deploy-safe project catalog consumed by the website.

This is an explicit local sync step. Docusaurus never reads a bridge. workspace
during a build, because that workspace is not available in CI.
"""

from __future__ import annotations

import argparse
import configparser
import hashlib
import json
import re
import shutil
from pathlib import Path
from typing import Any

from scripts.addon_wiki_mapper.jsonc import load


FORMATTING_CODE = re.compile(r"§.")
MARKDOWN_LINK = re.compile(r"\[([^\]]+)\]\([^\)]+\)")
PUBLIC_VISIBILITIES = ("public", "community", "unlisted")


def _clean_text(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    value = FORMATTING_CODE.sub("", value)
    value = MARKDOWN_LINK.sub(r"\1", value)
    value = re.sub(r"[`*_>#|]", "", value)
    return re.sub(r"\s+", " ", value).strip()


def _slug(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def _version(value: Any) -> str | None:
    if isinstance(value, list):
        return ".".join(str(part) for part in value)
    return str(value) if value not in (None, "") else None


def _max_version(*values: str | None) -> str | None:
    present = [value for value in values if value]
    if not present:
        return None

    def key(value: str) -> tuple[int, ...]:
        return tuple(int(part) for part in re.findall(r"\d+", value))

    return max(present, key=key)


def _safe_load(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        payload = load(path)
        return payload if isinstance(payload, dict) else {}
    except (OSError, ValueError, TypeError):
        return {}


def _pack_roots(project_root: Path) -> tuple[Path | None, Path | None, str | None]:
    config_path = project_root / "config.json"
    config = _safe_load(config_path)
    packs = config.get("packs", {}) if isinstance(config.get("packs"), dict) else {}

    def resolve(config_key: str, fallbacks: tuple[str, ...]) -> Path | None:
        configured = packs.get(config_key)
        candidates = ([str(configured)] if configured else []) + list(fallbacks)
        for raw_candidate in candidates:
            candidate = (project_root / raw_candidate).resolve()
            if candidate.is_dir():
                return candidate
        return None

    behavior = resolve("behaviorPack", ("BP", "packs/BP"))
    resource = resolve("resourcePack", ("RP", "packs/RP"))
    target = config.get("targetVersion")
    return behavior, resource, str(target) if target else None


def _manifest(pack_root: Path | None) -> dict[str, Any]:
    return _safe_load(pack_root / "manifest.json") if pack_root else {}


def _lang_name(resource_pack: Path | None, key: str) -> str | None:
    if not resource_pack or not key or key == "pack.name":
        return None
    lang_path = resource_pack / "texts" / "en_US.lang"
    if not lang_path.exists():
        return None
    for raw_line in lang_path.read_text(encoding="utf-8-sig", errors="replace").splitlines():
        if "=" not in raw_line or raw_line.lstrip().startswith("#"):
            continue
        candidate, value = raw_line.split("=", 1)
        if candidate.strip() == key:
            return _clean_text(value)
    return None


def _repository(project_root: Path) -> str | None:
    config_path = project_root / ".git" / "config"
    if not config_path.exists():
        return None
    parser = configparser.ConfigParser()
    try:
        parser.read(config_path, encoding="utf-8")
    except (configparser.Error, OSError):
        return None
    for section in parser.sections():
        if section.startswith('remote "') and parser.has_option(section, "url"):
            remote = parser.get(section, "url").strip()
            remote = re.sub(r"^git@github\.com:", "https://github.com/", remote)
            remote = re.sub(r"^ssh://git@github\.com/", "https://github.com/", remote)
            return remote.removesuffix(".git")
    return None


def _revision(project_root: Path) -> str | None:
    head_path = project_root / ".git" / "HEAD"
    if not head_path.exists():
        return None
    head = head_path.read_text(encoding="utf-8", errors="replace").strip()
    if head.startswith("ref: "):
        ref_path = project_root / ".git" / head.removeprefix("ref: ")
        if ref_path.exists():
            head = ref_path.read_text(encoding="utf-8", errors="replace").strip()
        else:
            packed_refs = project_root / ".git" / "packed-refs"
            if packed_refs.exists():
                ref_name = head_path.read_text(encoding="utf-8", errors="replace").strip().removeprefix("ref: ")
                match = re.search(rf"^([0-9a-f]{{40}}) {re.escape(ref_name)}$", packed_refs.read_text(encoding="utf-8", errors="replace"), re.MULTILINE)
                head = match.group(1) if match else ""
    return head[:12] if re.fullmatch(r"[0-9a-f]{12,40}", head) else None


def _readme_summary(project_root: Path) -> str | None:
    readme = next((path for path in sorted(project_root.glob("README*")) if path.is_file()), None)
    if not readme:
        return None
    lines = readme.read_text(encoding="utf-8", errors="replace").splitlines()
    paragraph: list[str] = []
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            if paragraph:
                break
            continue
        if line.startswith(("#", "!", "<", "[!", "---", "http://", "https://")):
            continue
        paragraph.append(line)
    summary = _clean_text(" ".join(paragraph))
    return summary[:420].rstrip() if summary else None


def _count_json(root: Path | None, folder: str) -> int:
    target = root / folder if root else None
    return sum(1 for _ in target.rglob("*.json")) if target and target.exists() else 0


def _metrics(behavior_pack: Path | None) -> dict[str, int]:
    values = {
        "items": _count_json(behavior_pack, "items"),
        "blocks": _count_json(behavior_pack, "blocks"),
        "entities": _count_json(behavior_pack, "entities"),
        "recipes": _count_json(behavior_pack, "recipes"),
        "structures": sum(1 for _ in (behavior_pack / "structures").rglob("*.mcstructure"))
        if behavior_pack and (behavior_pack / "structures").exists() else 0,
    }
    return {key: value for key, value in values.items() if value}


def _fingerprint(paths: list[Path], base: Path) -> str:
    digest = hashlib.sha256()
    expanded: list[Path] = []
    for path in paths:
        if not path.exists():
            continue
        if path.is_dir():
            expanded.extend(candidate for candidate in path.rglob("*") if candidate.is_file())
        else:
            expanded.append(path)
    for path in sorted(expanded, key=lambda item: item.as_posix()):
        try:
            relative = path.relative_to(base).as_posix()
        except ValueError:
            relative = path.name
        digest.update(relative.encode("utf-8"))
        digest.update(path.read_bytes())
    return digest.hexdigest()[:16]


def _copy_icon(project_root: Path, behavior_pack: Path | None, resource_pack: Path | None, destination: Path) -> str | None:
    candidates = [
        resource_pack / "pack_icon.png" if resource_pack else None,
        behavior_pack / "pack_icon.png" if behavior_pack else None,
        project_root / "pack_icon.png",
    ]
    source = next((candidate for candidate in candidates if candidate and candidate.is_file()), None)
    if not source:
        return None
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    return destination.name


def _visibility_index(config: dict[str, Any]) -> dict[str, str]:
    result: dict[str, str] = {}
    for visibility in PUBLIC_VISIBILITIES:
        for folder in config.get("visibility", {}).get(visibility, []):
            if folder in result:
                raise SystemExit(f"Bridge workspace is listed in multiple visibility groups: {folder}")
            result[folder] = visibility
    return result


def _project_from_bridge(
    project_root: Path,
    visibility: str,
    override: dict[str, Any],
    assets_root: Path,
) -> dict[str, Any]:
    behavior_pack, resource_pack, target_version = _pack_roots(project_root)
    behavior_manifest = _manifest(behavior_pack)
    resource_manifest = _manifest(resource_pack)
    primary_manifest = behavior_manifest or resource_manifest
    behavior_header = behavior_manifest.get("header", {}) if isinstance(behavior_manifest.get("header"), dict) else {}
    resource_header = resource_manifest.get("header", {}) if isinstance(resource_manifest.get("header"), dict) else {}
    header = primary_manifest.get("header", {}) if isinstance(primary_manifest.get("header"), dict) else {}
    manifest_name = _clean_text(header.get("name"))
    localized_name = _lang_name(resource_pack, str(header.get("name", "")))
    name = override.get("name") or localized_name or (manifest_name if manifest_name and manifest_name != "pack.name" else project_root.name)
    slug = override.get("slug") or _slug(name)
    repository = override.get("repository") or _repository(project_root)
    revision = _revision(project_root)
    version = _version(header.get("version"))
    min_engine = _max_version(
        _version(behavior_header.get("min_engine_version")),
        _version(resource_header.get("min_engine_version")),
    )
    metrics = {**_metrics(behavior_pack), **override.get("metrics", {})}
    summary = override.get("summary") or _readme_summary(project_root) or f"A Minecraft Bedrock project from the Dorios Studios workspace: {name}."
    icon_destination = assets_root / slug / "icon.png"
    icon_name = _copy_icon(project_root, behavior_pack, resource_pack, icon_destination)
    cover = override.get("cover")
    icon = f"/img/projects/{slug}/{icon_name}" if icon_name else "/img/dorios_logo_blackbg.png"
    ownership = "community" if visibility == "community" else "official"
    project_route = f"/projects/{slug}"
    wiki_path = override.get("wikiPath")
    aliases = [f"/projects/{alias}" for alias in override.get("aliases", [])]
    source_files = [
        path for path in (
            behavior_pack / "manifest.json" if behavior_pack else None,
            resource_pack / "manifest.json" if resource_pack else None,
            project_root / "config.json",
            resource_pack / "texts" / "en_US.lang" if resource_pack else None,
            resource_pack / "pack_icon.png" if resource_pack else None,
            behavior_pack / "pack_icon.png" if behavior_pack else None,
        ) if path
    ]
    if behavior_pack:
        source_files.extend(behavior_pack / folder for folder in ("items", "blocks", "entities", "recipes", "structures"))
    source_files.extend(sorted(project_root.glob("README*")))
    links = {
        "repository": repository,
        "releases": f"{repository}/releases" if repository else None,
        "curseforge": override.get("curseforge"),
        "mcpedl": override.get("mcpedl"),
    }
    return {
        "id": slug,
        "slug": slug,
        "aliases": aliases,
        "name": name,
        "summary": summary,
        "description": override.get("description") or summary,
        "kind": override.get("kind", "Add-On"),
        "category": override.get("category", "Minecraft Bedrock"),
        "tags": override.get("tags", []),
        "ownership": ownership,
        "visibility": visibility,
        "lifecycle": override.get("lifecycle", "Development"),
        "featuredRank": override.get("featuredRank"),
        "free": True,
        "version": version,
        "minecraftVersion": min_engine or target_version,
        "requires": override.get("requires", []),
        "routes": {"project": project_route, "wiki": wiki_path},
        "links": {key: value for key, value in links.items() if value},
        "media": {
            "cover": cover,
            "icon": icon,
            "coverFit": override.get("coverFit", "cover"),
            "alt": f"{name} project artwork",
        },
        "metrics": metrics,
        "source": {
            "kind": "bridge",
            "bridgeProject": project_root.name,
            "revision": revision,
            "fingerprint": _fingerprint(source_files, project_root),
        },
    }


def _legacy_project(record: dict[str, Any]) -> dict[str, Any]:
    slug = record["slug"]
    links = {
        key: record.get(key)
        for key in ("curseforge", "mcpedl", "repository")
        if record.get(key)
    }
    return {
        "id": slug,
        "slug": slug,
        "aliases": [f"/projects/{alias}" for alias in record.get("aliases", [])],
        "name": record["name"],
        "summary": record["summary"],
        "description": record.get("description", record["summary"]),
        "kind": record.get("kind", "Add-On"),
        "category": record.get("category", "Minecraft Bedrock"),
        "tags": record.get("tags", []),
        "ownership": "official",
        "visibility": "public",
        "lifecycle": record.get("lifecycle", "Released"),
        "featuredRank": record.get("featuredRank"),
        "free": True,
        "version": record.get("version"),
        "minecraftVersion": record.get("minecraftVersion"),
        "requires": record.get("requires", []),
        "routes": {
            "project": f"/projects/{slug}",
            "wiki": record.get("wikiPath"),
        },
        "links": links,
        "media": {
            "cover": record.get("cover"),
            "icon": record.get("icon", "/img/dorios_logo_blackbg.png"),
            "coverFit": record.get("coverFit", "cover"),
            "alt": f"{record['name']} project artwork",
        },
        "metrics": record.get("metrics", {}),
        "source": {"kind": "legacy-site"},
    }


def _with_content_metrics(override: dict[str, Any], config_root: Path) -> dict[str, Any]:
    result = dict(override)
    content_manifest = result.get("contentManifest")
    if not content_manifest:
        return result
    payload = _safe_load((config_root / content_manifest).resolve())
    counts = payload.get("counts", {}) if isinstance(payload.get("counts"), dict) else {}
    generated_metrics = {
        "items": counts.get("catalogItems", counts.get("items")),
        "blocks": counts.get("blocks"),
        "entities": counts.get("entities"),
        "recipes": counts.get("recipes"),
    }
    result["metrics"] = {
        **{key: value for key, value in generated_metrics.items() if value is not None},
        **result.get("metrics", {}),
    }
    return result


def _validate_catalog(catalog: dict[str, Any], config_root: Path) -> None:
    errors: list[str] = []
    seen_ids: set[str] = set()
    seen_slugs: set[str] = set()
    seen_routes: dict[str, str] = {}
    seen_wikis: dict[str, str] = {}
    for project in catalog["projects"]:
        for key, seen in (("id", seen_ids), ("slug", seen_slugs)):
            value = project[key]
            if value in seen:
                errors.append(f"Duplicate project {key}: {value}")
            seen.add(value)
        for route in (project["routes"]["project"], *project["aliases"]):
            if route in seen_routes:
                errors.append(f"Project route collision: {route} ({seen_routes[route]}, {project['id']})")
            seen_routes[route] = project["id"]
        wiki_route = project["routes"].get("wiki")
        if wiki_route:
            if wiki_route in seen_wikis:
                errors.append(f"Wiki route collision: {wiki_route} ({seen_wikis[wiki_route]}, {project['id']})")
            seen_wikis[wiki_route] = project["id"]
        for media_key in ("cover", "icon"):
            media_path = project["media"].get(media_key)
            if media_path and media_path.startswith("/"):
                local_path = config_root / "static" / media_path.lstrip("/")
                if not local_path.is_file():
                    errors.append(f"Missing {media_key} for {project['id']}: {media_path}")
    if errors:
        raise SystemExit("Project catalog validation failed:\n- " + "\n- ".join(errors))


def build_catalog(
    bridge_root: Path,
    config: dict[str, Any],
    config_root: Path,
    assets_root: Path,
) -> dict[str, Any]:
    visibility_by_folder = _visibility_index(config)
    excluded = config.get("excludedBridgeProjects", {})
    if not isinstance(excluded, dict):
        raise SystemExit("excludedBridgeProjects must be an object keyed by bridge workspace name.")
    overrides = config.get("overrides", {})
    discovered = sorted((path for path in bridge_root.iterdir() if path.is_dir()), key=lambda path: path.name.lower())
    discovered_names = {path.name for path in discovered}
    classified_names = set(visibility_by_folder) | set(excluded)
    overlap = set(visibility_by_folder) & set(excluded)
    unclassified = discovered_names - classified_names
    missing = classified_names - discovered_names
    coverage_errors = []
    if overlap:
        coverage_errors.append(f"both publishable and excluded: {', '.join(sorted(overlap))}")
    if unclassified:
        coverage_errors.append(f"missing publication decision: {', '.join(sorted(unclassified))}")
    if missing:
        coverage_errors.append(f"configured workspace not found: {', '.join(sorted(missing))}")
    if coverage_errors:
        raise SystemExit("Bridge catalog coverage failed:\n- " + "\n- ".join(coverage_errors))
    projects = [
        _project_from_bridge(
            path,
            visibility_by_folder[path.name],
            _with_content_metrics(overrides.get(path.name, {}), config_root),
            assets_root,
        )
        for path in discovered
        if path.name in visibility_by_folder
    ]
    projects.extend(_legacy_project(record) for record in config.get("legacyProjects", []))
    visibility_rank = {"public": 0, "community": 1, "unlisted": 2}
    projects.sort(key=lambda project: (
        project.get("featuredRank") is None,
        project.get("featuredRank") or 99,
        visibility_rank.get(project["visibility"], 9),
        project["name"].lower(),
    ))
    catalog = {
        "schemaVersion": config.get("schemaVersion", 1),
        "inventory": {
            "discoveredBridgeProjects": len(discovered),
            "classifiedBridgeProjects": len(classified_names),
            "mappedBridgeProjects": sum(1 for project in projects if project["source"]["kind"] == "bridge"),
            "excludedBridgeProjects": len(excluded),
            "legacySiteProjects": sum(1 for project in projects if project["source"]["kind"] == "legacy-site"),
        },
        "projects": projects,
    }
    _validate_catalog(catalog, config_root)
    return catalog


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bridge_root", type=Path)
    parser.add_argument("--config", type=Path, default=Path("project-catalog.config.jsonc"))
    parser.add_argument("--output", type=Path, default=Path("src/data/projectCatalog.json"))
    parser.add_argument("--assets-dir", type=Path, default=Path("static/img/projects"))
    args = parser.parse_args()

    bridge_root = args.bridge_root.resolve()
    if not bridge_root.is_dir():
        raise SystemExit(f"Bridge project root does not exist: {bridge_root}")
    config = load(args.config)
    catalog = build_catalog(bridge_root, config, args.config.resolve().parent, args.assets_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        f"Wrote {args.output}: {len(catalog['projects'])} deployable projects "
        f"from {catalog['inventory']['discoveredBridgeProjects']} classified bridge workspaces; "
        f"{catalog['inventory']['excludedBridgeProjects']} explicitly excluded."
    )


if __name__ == "__main__":
    main()
