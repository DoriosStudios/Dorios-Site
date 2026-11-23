# Atelier material wiki

`/wiki/atelier` is the general gallery of 34 raw materials. Every material links to
its finishes and actual shapes. Blocks have stable identifier-based URLs under
`/wiki/atelier/blocks/<namespace>/<id>`; materials use
`/wiki/atelier/materials/<family>`. All routes are generated in English, Portuguese
and Spanish, and the project/hub link uses `projectCatalog.routes.wiki`.

The React component uses the approved material gallery, ancestry before variants,
compact responsive recipe columns separated by a vertical rule, hover/focus-only
recipe surfaces and original top textures for stations. Station names remain
accessible by hover, keyboard focus and touch. Painting and chisel destinations
link to real known blocks. Acquisition routes come from actual recipes; a material
reference without a recipe path is labelled as a reference rather than an invented
manufacturing step. Recipe definitions retain their source file and identifier.

`prepare-atelier-builder.mjs` runs `generate-atelier-wiki.mjs` after generating the
existing previews. It reads the addon source selected by `ATELIER_PROJECT_PATH`,
the builder catalog, recipes and deterministic painting/chisel configuration. The
generator writes `src/data/atelierWiki.json`; it does not alter the source addon.

Images use their original files and lazy loading. All 916 custom PNGs remain
128×128; there is no reduced sprite sheet or shared color palette in production.
Original vanilla texture bytes are saved under `static/img/wiki/atelier/textures`.
The small versioned vanilla dependency snapshot `src/data/atelierVanilla.json`
allows CI to build without the developer's sibling Vanilla checkout. When adding
new vanilla materials/recipes, update that explicit snapshot and original assets
from the intended Bedrock version; generation reports missing material coverage.

The wiki describes source-derived behavior. It does not claim in-game verification
of every recipe or dynamic tool heuristic. The base mining time is the component
configuration, not an actual player/tool mining duration. Cooking time is retained
in recipe data without assuming an unverified unit in the interface.

Checks: `npm run prepare:atelier-builder`, `npm run test:site-features` and the
normal Docusaurus build. Generation should be deterministic; namespace IDs, rather
than numeric array positions, define public URLs.

Main files: `website/src/components/AtelierWiki/` (React, localized copy, relationships
and styles), `website/scripts/generate-atelier-wiki.mjs`, the preparation hook,
`website/src/data/atelierWiki.json`, `atelierVanilla.json`, the route plugin and its
tests, and the Atelier entries in the project catalog/configuration.

The UtilityCraft Ultimate logo and extension pack icons are stored separately in
`website/static/img/projects`. `utilitycraft-ultimate/asset-sources.json` records
their source paths and SHA-256 hashes. Existing site icons are preserved; differing
BP icons are stored as `bp-pack-icon.png` beside the RP icon.
