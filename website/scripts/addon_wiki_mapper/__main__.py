"""CLI: python -m addon_wiki_mapper <bridge-project> --id ... --output ..."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path

from .bedrock import build_manifest
from .jsonc import load


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Map a bridge. Bedrock add-on to a Dorios wiki manifest")
    parser.add_argument("project", type=Path, help="Project directory containing BP and RP")
    parser.add_argument("--id", required=True, dest="project_id", help="Stable URL/project id")
    parser.add_argument("--name", help="Display name; defaults to the project directory name")
    parser.add_argument("--config", type=Path, help="Optional JSONC exclusions and overrides")
    parser.add_argument("--output", required=True, type=Path, help="Destination manifest JSON")
    parser.add_argument("--assets-dir", type=Path, help="Copy referenced RP assets into this public project directory")
    parser.add_argument("--dependency-project", action="append", default=[], type=Path, help="Fallback bridge. project for shared RP assets")
    parser.add_argument("--no-renders", action="store_true", help="Skip automatic CPU block and entity renders")
    parser.add_argument("--vanilla-rp", type=Path, help="Versioned vanilla RP; defaults to the prepared private cache")
    parser.add_argument("--entity-render-config", type=Path, help="Explicit entity variants, materials, poses and head bones")
    return parser.parse_args()


def preserve_entity_visuals(manifest: dict, previous: dict) -> None:
    """Keep site-owned and generated associations across a source rescan."""
    old = {entry.get("identifier"): entry for entry in previous.get("content", {}).get("entities", [])}
    for entry in manifest.get("content", {}).get("entities", []):
        before = old.get(entry.get("identifier"), {})
        for field in ("render", "portrait", "face", "renderVariants"):
            value = before.get(field)
            if value and (not entry.get(field) or isinstance(value, str) and not value.startswith("auto-entities/")):
                entry[field] = value
        if before.get("publicEntity") is True:
            entry["publicEntity"] = True
        image = before.get("image")
        if image and before.get("imageKind") != "texture" and not image.startswith("textures/"):
            entry["image"], entry["imageKind"] = image, "manual"


def prepared_vanilla() -> Path | None:
    configured = os.environ.get("VANILLA_RESOURCE_PACK")
    if configured:
        return Path(configured).resolve()
    pointer = Path(__file__).resolve().parents[2] / ".cache-loader/vanilla/active.json"
    if pointer.is_file():
        payload = json.loads(pointer.read_text(encoding="utf-8"))
        source = Path(payload["resourcePack"])
        if source.is_dir():
            return source
    return None


def render_missing_assets(project_root: Path, manifest_path: Path, destination: Path, dependencies: list[Path], vanilla: Path | None = None, entity_config: Path | None = None) -> None:
    """Fill the existing manifest render field; manual images keep precedence."""
    script = Path(__file__).resolve().parents[1] / "generate-bedrock-renders.mjs"
    arguments = ["node", str(script), "--source", str(project_root), "--manifest", str(manifest_path),
        "--output", str(destination), "--allow-errors"]
    for dependency in dependencies:
        arguments.extend(["--dependency", str(dependency.resolve())])
    vanilla = vanilla or prepared_vanilla()
    if vanilla:
        arguments.extend(["--vanilla-rp", str(vanilla.resolve())])
    subprocess.run(arguments, check=True)
    entity_script = script.with_name("generate-bedrock-entity-renders.mjs")
    arguments[1] = str(entity_script)
    if entity_config:
        arguments.extend(["--config", str(entity_config.resolve())])
    subprocess.run(arguments, check=True)


def export_assets(manifest: dict, project_root: Path, destination: Path, dependency_projects: list[Path]) -> int:
    resource_packs = [project_root / "RP", *(project.resolve() / "RP" for project in dependency_projects)]
    references: set[str] = set()

    for item in manifest["content"]["items"]:
        if item.get("image"):
            references.add(item["image"])
    for block in manifest["content"]["blocks"]:
        if block.get("render"):
            references.add(block["render"])
        if block.get("itemImage"):
            references.add(block["itemImage"])
        references.update(face for face in block.get("faces", {}).values() if face)
    for entity in manifest["content"]["entities"]:
        for field in ("image", "render", "portrait", "face"):
            if entity.get(field):
                references.add(entity[field])

    copied = 0
    for reference in sorted(references):
        if reference.startswith(("/img/", "auto-entities/")):
            continue
        if reference.startswith("renders/"):
            source = project_root / "Assets" / "Renders" / Path(reference).relative_to("renders")
            source = source if source.is_file() else None
        else:
            source = next((resource_pack / Path(reference) for resource_pack in resource_packs if (resource_pack / Path(reference)).is_file()), None)
        if source is None:
            continue
        target = destination / Path(reference)
        if reference.startswith("renders/") and target.is_file():
            # Keep site-owned manual images. The CPU renderer can recover an
            # invalid target from its source after validating the actual bytes.
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied += 1
    return copied


def main() -> None:
    args = parse_args()
    config = load(args.config) if args.config else {}
    manifest = build_manifest(
        args.project,
        args.project_id,
        args.name or args.project.name,
        config,
        args.dependency_project,
    )
    if args.output.is_file():
        preserve_entity_visuals(manifest, load(args.output))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    copied = export_assets(
        manifest,
        args.project.resolve(),
        args.assets_dir.resolve(),
        args.dependency_project,
    ) if args.assets_dir else 0
    if args.assets_dir and not args.no_renders:
        render_missing_assets(args.project.resolve(), args.output.resolve(), args.assets_dir.resolve(), args.dependency_project, args.vanilla_rp, args.entity_render_config)
    counts = manifest["counts"]
    print(
        f"Wrote {args.output}: {counts['items']} items, {counts['blocks']} blocks, "
        f"{counts['entities']} entities, {counts['recipes']} recipes, "
        f"{counts['variantGroups']} variant groups"
        f"{f', {copied} assets copied' if args.assets_dir else ''}."
    )


if __name__ == "__main__":
    main()
