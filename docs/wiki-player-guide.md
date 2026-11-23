# Wiki player guide

The wiki presents verified gameplay information before registry metadata. The
approved redesign kit supplied the visual direction; item statistics and recipes
come from the existing project adapters, manifests and documentation profiles.
No numbers or ingredient choices were copied from conceptual images.

## Shared presentation

- `src/wiki/playerGuide.mjs` selects meaningful item and machine data without
  changing the source objects. Unknown and generic placeholder values are omitted
  from the main presentation; zero remains a valid value.
- `AddonWiki/playerGuide.js` and its CSS module provide stat cards, equipment rows,
  a process schematic, supported upgrades and a closed technical disclosure.
- The existing wiki header, sidebar, search, breadcrumbs, recipe components, public
  routes and theme system remain in use. Existing `/specs` URLs remain valid.
- Simple equipment combines overview and capabilities in one flow, with related
  items at the end. Acquisition/drops retain their own route. Larger tool profiles
  keep separate specification navigation and the full repair/enchantment sections.
- Equipment category pages use a single vertical list. Counts are calculated from
  the real catalog; empty effect badges and prominent raw IDs are omitted.

## Data-sensitive examples

Black Heart displays its actual +3 hearts and Hearty Charms slot. Its Enderman
10% drop and The End loot 15% remain available on the drops route, including the
dimension condition. All 12 Hearty Charms remain present. Immaculate Heart includes
both +5 hearts and bonus damage +1; Dragon Heart retains its additional attack.

Aetherium Paxel and AiOT keep independent source profiles. Paxel retains durability
10,737, attack 11 and mining speed 24x; AiOT retains durability 17,895, attack 12 and
mining speed 30x. Tool roles, repair materials and enchantment groupings come from
the exact entry, with no merging based on material name.

Oak Wood Furnace shows speed, nominal cycle, fuel use and coal-equivalent yield.
The risk callout preserves the source's 1% chance per active two-tick work interval;
it does not reinterpret the chance as a per-recipe probability.

Catalyst Weaver shows the configured energy capacity, default energy consumption,
nominal base time and tank capacity. Its input schematic distinguishes the primary
material, up to six catalysts and recipe fluid, followed by the main result and
optional byproduct. Icons represent resource categories; this is explicitly a
schematic, not a selected recipe. The real recipe pages continue using their
existing ingredients, quantities, fluids and probabilities.

## Images and mobile layout

Item stages and their contained images have explicit matching square dimensions.
This replaces conflicting legacy percentage heights and narrow-width overrides.
`object-fit: contain` preserves the artwork's own ratio, including non-square
sources; pixel rendering remains enabled.

The Oak Wood Furnace had no associated isometric render. Its new transparent
128px image was generated with the existing CPU Bedrock engine and real local
Better Smelters textures. The selected variant uses cardinal direction `south`
and `better_smelters:on=true` so the active front is visible. Both the default and
selected variant are recorded in `static/img/wiki/smelters/auto-renders/index.json`.
Only the block's render association changed in the existing manifest.

To reproduce the variant from a configured local addon source:

```powershell
node scripts/generate-bedrock-renders.mjs --source "PATH/Better-Smelters" --output static/img/wiki/smelters --manifest src/wiki/projects/smelters/manifest.json --block better_smelters:oak_wood_furnace --state minecraft:cardinal_direction=south --state better_smelters:on=true --refresh
```

Explicit state variants are stored separately from the default render. The manifest
association selects that variant; a future source refresh must retain the selected
association when reproducing this illustration.

## Validation

`npm run test:wiki` runs source, presentation and route compatibility checks. The
redesign tests exercise all twelve hearts, separate tool profiles, original drop
conditions, the furnace risk interval, machine resources, placeholder omission,
localization and the generated image's state/transparency.

A focused Docusaurus review retains the full generated route catalog for strict
link validation while compiling representative pages. Browser evidence and the
review gallery live in the ignored `.cache-loader/wiki-redesign/` directory.
Viewport emulation is recorded separately from physical-device validation.

Final local validation: 68 automated tests passed across renderer, recipes, site
features, source profiles, lookup performance and route registration. After the
last localization adjustment, all 15 editorial/presentation checks passed again.
The focused no-minify Docusaurus build compiled and generated 12 representative
pages per locale (36 total) with strict broken-link validation against the complete
21,608-route catalog. Blog feeds/search-index packaging were excluded from this
review; an unrestricted production build and deployment were not performed.

Real Edge headless validation covered six example pages at widths 320, 390, 430,
768 and 1440 in both themes (60 combinations). It checked horizontal overflow,
image dimensions, useful source data, all twelve hearts and keyboard operation of
the closed technical panel. The copy-button test used a stub Clipboard transport
and verified the exact identifier; it did not modify the system clipboard.

Baseline measurements reproduced a 62x88 image element at 430px width and a 94x132
element at 768px. The final elements are 94x94 and 130x130 respectively; the artwork
retains its own aspect ratio inside those square stages. Comparison screenshots,
light-theme examples and locale examples are kept in the ignored review directory.
This is browser viewport/touch emulation, not physical-phone testing.
