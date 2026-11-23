# Wiki visual preparation

Run these commands from `website/`:

```powershell
npm run collect:vanilla-assets
npm run prepare:wiki-visuals
npm run prepare:wiki-visuals -- --offline
npm run prepare:wiki-visuals -- --download-sources
npm run validate:visual-coverage
npm run validate:visual-coverage -- --strict

npm run generate:entity-renders -- --source C:/addons/UtilityCraft --output .cache-loader/entity-test --entity utilitycraft:mechanical_spawner_zombie --config entity-options.json
npm run generate:entity-faces -- --source C:/addons/Addon --output .cache-loader/faces
npm run generate:entity-portraits -- --source C:/addons/Addon --output .cache-loader/portraits
npm run generate:vanilla-faces -- --block minecraft:furnace --faces up,south,east --variant 0
npm run generate:vanilla-assets
```

`scripts/wiki-visual-sources.config.json` explicitly lists addon repositories,
immutable revisions, dependency order and per-entity overrides. Local source
paths use the existing workspace/environment resolver. In CI, the
`--download-sources` stage fetches the configured revisions into an ignored
cache and checks that cached packs have not been edited. Update these revisions
when synchronizing the wiki to newer addon sources. The local preparation stage
intentionally uses the current local addon source when it exists.

Both `prebuild` and `prepare:dev` prepare visuals before updating the universal
index. `addon_wiki_mapper` and `map_project_wiki.py` also invoke the entity
renderer after block rendering, forwarding dependencies and the prepared
vanilla RP. `--vanilla-rp` and `--entity-render-config` provide explicit overrides;
`--no-renders` skips both CPU render adapters. A rescan preserves previous
manual/generated entity associations. Generation failures keep previously valid
images and do not stop the rest of the wiki.

GitHub Actions caches the pinned vanilla and addon sources separately from the
generated entity PNGs. Tests run on CPU before visual preparation and the
existing Docusaurus publication stages remain in place. A matching visual hash
reuses a valid PNG; missing, modified and invalid outputs are regenerated.

Preparation writes its summary to `.cache-loader/wiki-visuals/report.json`.
Coverage writes `.cache-loader/wiki-visuals/coverage.json`. Coverage is advisory
unless `--strict` is requested: many addon entities are plants, outlines or
invisible runtime helpers with no identifiable head/client model. They require
explicit configuration or cannot produce a visible render. Reports identify the
entity and each missing format; they never substitute a generic cube.

The UI uses `render` on entity detail pages and prefers `face`, `portrait`, then
`render` on compact listings. The legacy `image` remains supported for manual
images. Resource-pack texture atlases are not presented as portraits.

For material, Molang, animation and head-selection boundaries, see
[Bedrock entity renders](bedrock-entity-renderer.md). For version pinning,
resource indexing and the policy keeping new vanilla source files private, see
[Vanilla asset pipeline](vanilla-asset-pipeline.md).

The responsive header uses the existing branding, locale and theme components.
Navigation stays on one desktop row; below its space budget it becomes an
overlaid keyboard-accessible menu. The wiki retains desktop breadcrumbs and
uses a single contextual bar with transient search/navigation panels on small
screens. Machine summaries are isolated presentation copy in
`src/wiki/machineCatalog.mjs`; full detail documentation remains available.
