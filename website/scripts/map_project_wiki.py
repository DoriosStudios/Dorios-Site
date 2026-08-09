"""Map a complete bridge. Bedrock project into the Dorios wiki.

Example:
    python scripts/map_project_wiki.py "C:/bridge/projects/My-Addon" --id my-addon

The command extracts every discoverable item, block, entity, recipe and variant,
copies referenced RP/render assets, creates a generic wiki module when needed,
and registers the project so Docusaurus can generate its wiki routes.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
SITE_ROOT = SCRIPT_DIR.parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from addon_wiki_mapper.__main__ import export_assets  # noqa: E402
from addon_wiki_mapper.bedrock import build_manifest  # noqa: E402
from addon_wiki_mapper.jsonc import load  # noqa: E402

BUILT_IN_PROJECTS = {"utilitycraft", "ascendant-technology", "heavy-machinery"}
PROJECTS_ROOT = SITE_ROOT / "src" / "wiki" / "projects"
CATALOG_PATH = SITE_ROOT / "src" / "data" / "projectCatalog.json"
REGISTRY_JSON = PROJECTS_ROOT / "generatedProjects.json"
REGISTRY_JS = PROJECTS_ROOT / "generatedProjects.js"


def slugify(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Map all discoverable Bedrock content from a bridge. project into the Dorios wiki",
    )
    parser.add_argument("project", type=Path, help="bridge. project directory containing BP and RP")
    parser.add_argument("--id", dest="project_id", help="Stable URL id; inferred from the site catalog or directory name")
    parser.add_argument("--name", help="Display name; inferred from the catalog or directory name")
    parser.add_argument("--config", type=Path, help="Optional JSONC mapper exclusions and overrides")
    parser.add_argument("--dependency-project", action="append", default=[], type=Path, help="Project supplying shared RP assets; repeat as needed")
    parser.add_argument("--output", type=Path, help="Manifest destination; defaults to src/wiki/projects/<id>/manifest.json")
    parser.add_argument("--assets-dir", type=Path, help="Asset destination; defaults to static/img/wiki/<id>")
    parser.add_argument("--no-assets", action="store_true", help="Do not copy referenced textures and renders")
    parser.add_argument("--no-register", action="store_true", help="Generate data only; do not register generic wiki routes")
    parser.add_argument("--force-module", action="store_true", help="Replace an existing generic index.js (editorial modules are preserved by default)")
    parser.add_argument("--dry-run", action="store_true", help="Analyze and print counts without writing files")
    return parser.parse_args()


def read_catalog() -> list[dict[str, Any]]:
    if not CATALOG_PATH.is_file():
        return []
    payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    return payload.get("projects", [])


def catalog_record(project_root: Path, requested_id: str | None, catalog: list[dict[str, Any]]) -> dict[str, Any] | None:
    names = {project_root.name.casefold(), slugify(project_root.name)}
    if requested_id:
        names.add(requested_id.casefold())
    return next((entry for entry in catalog if (
        entry.get("id", "").casefold() in names
        or entry.get("slug", "").casefold() in names
        or entry.get("source", {}).get("bridgeProject", "").casefold() in names
    )), None)


def dependency_records(record: dict[str, Any] | None, catalog: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not record:
        return []
    matches: list[dict[str, Any]] = []
    for requirement in record.get("requires", []):
        normalized = str(requirement).casefold().strip()
        match = next((candidate for candidate in catalog if (
            normalized == candidate.get("name", "").casefold()
            or normalized.startswith(f"{candidate.get('name', '').casefold()} ")
        )), None)
        if match and match not in matches:
            matches.append(match)
    return matches


def inferred_dependency_paths(project_root: Path, records: list[dict[str, Any]]) -> list[Path]:
    paths: list[Path] = []
    for record in records:
        bridge_name = record.get("source", {}).get("bridgeProject")
        if not bridge_name:
            continue
        candidate = (project_root.parent / bridge_name).resolve()
        if (candidate / "BP").is_dir() and (candidate / "RP").is_dir():
            paths.append(candidate)
    return paths


def atomic_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(f"{path.suffix}.tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def generic_module(project_id: str, name: str, repository: str | None, dependencies: list[dict[str, Any]]) -> str:
    dependency_imports = "\n".join(
        f"import dependency{index} from '../{dependency['id']}';"
        for index, dependency in enumerate(dependencies)
    )
    dependency_values = ", ".join(f"dependency{index}" for index in range(len(dependencies)))
    repository_value = json.dumps(repository, ensure_ascii=False) if repository else "undefined"
    description = f"Generated reference for {name}, mapped directly from its behavior pack, resource pack, recipes, entities, blocks, items, and project assets."
    optional_imports = f"\n{dependency_imports}" if dependency_imports else ""
    optional_dependencies = f"\n  dependencyProjects: [{dependency_values}]," if dependency_values else ""
    return f"""import manifest from './manifest.json';
import {{createGeneratedProject}} from '../createGeneratedProject';{optional_imports}

const project = createGeneratedProject({{
  manifest,
  id: {json.dumps(project_id)},
  name: {json.dumps(name, ensure_ascii=False)},
  repository: {repository_value},{optional_dependencies}
  overview: {{
    eyebrow: 'Generated add-on reference',
    description: {json.dumps(description, ensure_ascii=False)},
    stepsTitle: 'Explore the mapped project content.',
    steps: [
      {{title: 'Browse content', copy: 'Inspect registered items, blocks, entities, and their source categories.'}},
      {{title: 'Review systems', copy: 'Open detected machines, generators, interfaces, and technical properties.'}},
      {{title: 'Check recipes', copy: 'Follow normalized crafting inputs, stations, and outputs from the behavior pack.'}},
    ],
  }},
}});

export default project;
"""


def write_registry(project_ids: list[str]) -> None:
    registered = sorted(set(project_ids) - BUILT_IN_PROJECTS)
    atomic_json(REGISTRY_JSON, registered)
    imports = "\n".join(f"import project{index} from './{project_id}';" for index, project_id in enumerate(registered))
    entries = "\n".join(f"  [project{index}.id]: project{index}," for index in range(len(registered)))
    prefix = f"{imports}\n\n" if imports else ""
    REGISTRY_JS.write_text(
        f"{prefix}const generatedProjects = {{\n{entries}\n}};\n\nexport default generatedProjects;\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    project_root = args.project.resolve()
    if not (project_root / "BP").is_dir() or not (project_root / "RP").is_dir():
        raise SystemExit(f"Project must contain BP and RP directories: {project_root}")

    catalog = read_catalog()
    record = catalog_record(project_root, args.project_id, catalog)
    project_id = args.project_id or (record and record.get("id")) or slugify(project_root.name)
    name = args.name or (record and record.get("name")) or project_root.name.replace("-", " ")
    target_root = PROJECTS_ROOT / project_id
    output = (args.output or target_root / "manifest.json").resolve()
    assets_dir = (args.assets_dir or SITE_ROOT / "static" / "img" / "wiki" / project_id).resolve()
    config_path = args.config or (target_root / "mapper.jsonc" if (target_root / "mapper.jsonc").is_file() else None)
    config = load(config_path) if config_path else {}

    dependencies = dependency_records(record, catalog)
    dependency_paths = [path.resolve() for path in args.dependency_project]
    for inferred in inferred_dependency_paths(project_root, dependencies):
        if inferred not in dependency_paths:
            dependency_paths.append(inferred)

    manifest = build_manifest(project_root, project_id, name, config, dependency_paths)
    counts = manifest["counts"]
    summary = (
        f"{counts['items']} items, {counts['catalogItems']} catalog entries, "
        f"{counts['blocks']} blocks, {counts['entities']} entities, "
        f"{counts['recipes']} recipes, {counts['variantGroups']} variant groups"
    )
    if args.dry_run:
        print(f"Dry run for {name} ({project_id}): {summary}.")
        return

    atomic_json(output, manifest)
    copied = 0 if args.no_assets else export_assets(manifest, project_root, assets_dir, dependency_paths)

    module_path = target_root / "index.js"
    if not module_path.exists() or args.force_module:
        module_path.parent.mkdir(parents=True, exist_ok=True)
        repository = record and record.get("links", {}).get("repository")
        module_path.write_text(generic_module(project_id, name, repository, dependencies), encoding="utf-8")

    if not args.no_register and project_id not in BUILT_IN_PROJECTS:
        current = json.loads(REGISTRY_JSON.read_text(encoding="utf-8")) if REGISTRY_JSON.is_file() else []
        write_registry([*current, project_id])

    asset_summary = "assets skipped" if args.no_assets else f"{copied} referenced assets copied"
    print(f"Mapped {name} ({project_id}): {summary}; {asset_summary}.")
    print(f"Manifest: {output}")
    if not args.no_assets:
        print(f"Assets:   {assets_dir}")
    print(f"Wiki:     /wiki/{project_id}")


if __name__ == "__main__":
    main()
