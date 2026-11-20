"""Refresh existing wiki projects and catalog metadata from the local addon sources."""

import json
import os
from pathlib import Path
import subprocess
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from addon_wiki_mapper.jsonc import load
from project_catalog_mapper import _project_from_bridge, _with_content_metrics


SITE_ROOT = Path(__file__).resolve().parent.parent
WORKSPACE = Path(os.environ.get('BRIDGE_PROJECTS_PATH', SITE_ROOT.parents[2]))
CLEAN_UTILITYCRAFT = SITE_ROOT.parent.parent / 'wiki-sources' / 'UtilityCraft'
UTILITYCRAFT = Path(os.environ.get('UTILITYCRAFT_PROJECT_PATH',
    CLEAN_UTILITYCRAFT if (CLEAN_UTILITYCRAFT / 'BP').is_dir() else WORKSPACE / 'UtilityCraft'))


def run(*arguments):
    subprocess.run(list(map(str, arguments)), cwd=SITE_ROOT, check=True)


def main():
    catalog_path = SITE_ROOT / 'src/data/projectCatalog.json'
    catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    config = load(SITE_ROOT / 'project-catalog.config.jsonc')
    mapped = []
    for project in catalog['projects']:
        folder = project.get('source', {}).get('bridgeProject')
        if not folder:
            continue
        source = UTILITYCRAFT if project['id'] == 'utilitycraft' else WORKSPACE / folder
        if not source.is_dir():
            print(f"Preserving {project['id']}: source not available.", flush=True)
            continue
        manifest_path = SITE_ROOT / 'src/wiki/projects' / project['id'] / 'manifest.json'
        if manifest_path.is_file() and (source / 'BP').is_dir():
            arguments = [sys.executable, 'scripts/map_project_wiki.py', source,
                '--id', project['id'], '--no-register', '--dependency-project', UTILITYCRAFT]
            mapper_config = SITE_ROOT / 'wiki-maps' / f"{project['id']}.jsonc"
            if mapper_config.is_file():
                arguments.extend(['--config', mapper_config])
            run(*arguments)
            mapped.append(project['id'])

        override = _with_content_metrics(config.get('overrides', {}).get(folder, {}), SITE_ROOT)
        refreshed = _project_from_bridge(source, project['visibility'], override,
            SITE_ROOT / 'static/img/projects')
        for key in ['version', 'minecraftVersion', 'source', 'requires']:
            project[key] = refreshed[key]
        project['media']['icon'] = refreshed['media']['icon']
        project['metrics'] = refreshed['metrics']
        if manifest_path.is_file():
            counts = json.loads(manifest_path.read_text(encoding='utf-8'))['counts']
            project['metrics'].update({
                'items': counts.get('catalogItems', counts['items']),
                **{key: counts[key] for key in ['blocks', 'entities', 'recipes']},
            })
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    environment = dict(os.environ, BRIDGE_PROJECTS_PATH=str(WORKSPACE),
        UTILITYCRAFT_PROJECT_PATH=str(UTILITYCRAFT))
    for script in ['extract-utilitycraft-processing-recipes.mjs',
        'generate-ascendant-documentation-profiles.mjs', 'generate-ascendant-machine-grid.mjs',
        'generate-shared-item-documentation-profiles.mjs', 'generate-better-smelters-wiki.mjs',
        'generate-wiki-localized-names.mjs', 'sync-ascendant-glyph-icons.mjs']:
        subprocess.run(['node', f'scripts/{script}'], cwd=SITE_ROOT, env=environment, check=True)
    trinkets = WORKSPACE / 'Dorios-Trinkets/BP/scripts/register.js'
    if 'trinkets' in mapped and trinkets.is_file():
        run('node', 'scripts/extract_trinket_profiles.mjs', trinkets,
            'src/wiki/projects/trinkets/trinketProfiles.json')
    run('node', 'scripts/generate-wiki-project-metrics.cjs')
    print(f"Updated {len(mapped)} existing wiki projects; preserved publication settings and editorial metadata.")


if __name__ == '__main__':
    main()
