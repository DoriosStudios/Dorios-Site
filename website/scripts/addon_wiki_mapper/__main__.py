"""CLI: python -m addon_wiki_mapper <bridge-project> --id ... --output ..."""

from __future__ import annotations

import argparse
import json
import shutil
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
    return parser.parse_args()


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
        if entity.get("image"):
            references.add(entity["image"])

    copied = 0
    for reference in sorted(references):
        if reference.startswith("renders/"):
            source = project_root / "Assets" / "Renders" / Path(reference).relative_to("renders")
            source = source if source.is_file() else None
        else:
            source = next((resource_pack / Path(reference) for resource_pack in resource_packs if (resource_pack / Path(reference)).is_file()), None)
        if source is None:
            continue
        target = destination / Path(reference)
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
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    copied = export_assets(
        manifest,
        args.project.resolve(),
        args.assets_dir.resolve(),
        args.dependency_project,
    ) if args.assets_dir else 0
    counts = manifest["counts"]
    print(
        f"Wrote {args.output}: {counts['items']} items, {counts['blocks']} blocks, "
        f"{counts['entities']} entities, {counts['recipes']} recipes, "
        f"{counts['variantGroups']} variant groups"
        f"{f', {copied} assets copied' if args.assets_dir else ''}."
    )


if __name__ == "__main__":
    main()
