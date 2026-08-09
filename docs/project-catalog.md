# Dorios project catalog

Project pages are generated from one compact catalog instead of maintaining a
copied React panel for every add-on. The checked-in catalog is the only source
used by Docusaurus during build and deploy, so CI never needs access to a local
bridge. workspace.

## Files

- `website/project-catalog.config.jsonc` contains publication decisions and
  hand-written marketing metadata.
- `website/scripts/project_catalog_mapper.py` reads explicitly mapped bridge.
  projects and generates normalized project records.
- `website/src/data/projectCatalog.json` is the deterministic, deployable
  catalog consumed by `/projects`, project pages, wiki navigation, and the wiki
  hub.
- `website/static/img/projects/<slug>/icon.png` contains the local pack icons
  copied by the mapper.
- `website/src/components/ProjectDetailPage` renders every project route.

## Sync workflow

Run from `website` after changing an add-on manifest, pack icon, repository, or
the catalog overrides:

```powershell
python -m scripts.project_catalog_mapper `
  "C:\path\to\bridge\projects" `
  --config project-catalog.config.jsonc `
  --output src/data/projectCatalog.json `
  --assets-dir static/img/projects
```

The sync follows pack paths declared by each bridge. `config.json`, including
projects that use `packs/BP` and `packs/RP`. It resolves names from language
files, uses the highest BP/RP minimum-engine requirement, reads manifest and
repository metadata, copies only the public icon, and stores a content-aware
revision/fingerprint for staleness checks. The generated JSON omits timestamps,
so an unchanged workspace produces the same bytes on repeated syncs.

Wiki manifests should be regenerated first when their filtered counts changed.
The catalog mapper then enriches UtilityCraft and Ascendant Technology from
those manifests without loading their large content indexes in marketing-page
bundles.

## Publication model

Discovery does not publish a project. Every deployable entry must be explicitly
listed in the JSONC configuration and assigned one of these visibility states:

- `public`: displayed in the project catalog and eligible for featuring.
- `community`: displayed and identified as a community extension.
- `unlisted`: receives a stable project route but is omitted from the catalog.

Internal libraries, tools, temporary workspaces, prototypes, and duplicate
UUID/repository trees remain excluded. Every exclusion is named and justified
in `excludedBridgeProjects`; the mapper fails if a discovered workspace has no
explicit publication or exclusion decision. Legacy releases without a current
local workspace are represented as `legacy-site` records so existing URLs
continue to work while using the shared page template.

`npm run build` begins with `npm run validate:catalog`. This deploy-safe check
does not need the private bridge. directory: it validates the committed schema,
coverage counters, canonical/alias routes, visibility, and every local cover or
icon before Docusaurus starts compiling.

The canonical hierarchy is:

```text
/projects -> /projects/<slug> -> /wiki/<slug>
```

Old slugs are retained as route aliases. A wiki or documentation action is only
rendered when its target is explicitly configured; the generator does not
invent destinations for projects without documentation.
