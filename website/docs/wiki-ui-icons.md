# Shared wiki UI icons

The wiki reuses small, original game sprites alongside visible labels. `WikiIcon` renders a decorative square image with nearest-neighbour display and an SVG fallback for unmapped concepts. It respects the Docusaurus base URL and never changes the block/item artwork.

## Sources and synchronization

- Ascendant Technology: `RP/textures/ui/at_icons/*.png`, 16×16. The shared library now contains 47 sprites, including the 20 already used for machine resources. Existing URLs remain unchanged under `/img/addons/ascendant/resources/glyphs/`.
- Local vanilla resource pack: `resource_pack/textures/ui/*_effect.png`, 18×18. The 33 individual effects are stored under `/img/wiki/ui/effects/`. `frozen_effect.png` is an overlay and is deliberately excluded.
- Both sets are copied byte-for-byte. No resampling, format conversion or AI generation is involved. Do not use the small glyphs as large hero artwork.

Run `npm run generate:wiki-ui-icons` from `website`. The existing `generate:ascendant-glyph-icons` command remains compatible and synchronizes both sets, so the current preparation and prebuild hooks also refresh them.

The standard source resolver uses sibling `Ascendant-Technology` and `Vanilla` projects. `ASCENDANT_TECHNOLOGY_PROJECT_PATH`, `VANILLA_PROJECT_PATH` and `BRIDGE_PROJECTS_PATH` support other checkout layouts. Builds without these local sources retain the committed sprites. There is no runtime request to the addon directories or an external CDN.

## Where they appear

- Item and machine detail navigation: overview, specifications, recipes, drops, uses, related items, notes and mining sections.
- Player statistics: health, attack, damage reduction, critical stats, movement, energy, fluid/gas capacity, processing time, mining, enchantability, fuel and storage.
- Equipment catalogs and individual equipment pages: potion effects and immunities, including regeneration, poison, wither, hunger, blindness and darkness. Immunities retain their text and add a prohibition mark over the effect icon.
- Machine guides: catalyst slots, secondary outputs, schematic fluid/catalyst inputs, and the actual supported upgrade types. Energy, speed, Hyper, stack, range, filter and quantity upgrades use their respective glyphs.

`wikiUiIcons.mjs` owns the paths and semantic mappings. Source labels are resolved before translation. This keeps English, Portuguese and Spanish on the same icon and avoids guessing an effect from an item name or description. For example, **Bonus damage** uses the attack glyph; **Strength II** uses the vanilla Strength effect. Unknown abilities use a neutral vector fallback.

All images have explicit square dimensions, `object-fit: contain`, `image-rendering: pixelated`, empty alternative text and a decorative wrapper hidden from assistive technology. Adjacent labels remain readable and supply the accessible meaning. Immunity and effect labels remain distinct.

Health values render the actual number of hearts: `+3` followed by three heart sprites, `+5` followed by five. Half-heart bonuses use the original half-heart sprite without rounding. The visible 9×9 heart inside each 16×16 source is framed with CSS at `1em`, so its visible height follows the surrounding text instead of shrinking inside transparent margins. This exception uses a positioned image inside a clipped frame; the original PNG remains unchanged. The same component supplies stat cards, catalog benefits, related items and technical attribute values. Screen readers receive the full localized value once.

An explicit `Fire resistant: Yes` item statistic renders a compact property badge with the vanilla Fire Resistance icon. It does not create a potion effect or player immunity in the data. Items and machines have one overview navigation entry; technical details remain collapsible there. Their existing `/specs` URLs remain valid and mark Overview as active. Blocks retain separate specifications because their sections have different content.

## Validation

`npm run test:wiki` includes sprite presence, dimensions, transparency, semantic separation, fallback behavior, exact copying and preservation when source packs are unavailable, alongside the existing wiki data, localization and route tests. Browser review uses a focused production build; it does not replace a full publication build or physical-device testing.

The initial implementation review compiled 14 representative routes in each of the three locales (42 HTML pages), retaining the full 21,608 generated route definitions for strict link checks. Subsequent layout corrections are reviewed first in a standalone HTML preview and then through the local development server, without repeating a production build for layout iteration. The current suite also covers repeated/fractional hearts, explicit fire-resistant flags and compatibility of old specifications routes. The 80 library sprites total 21,572 bytes and match their local pack sources byte-for-byte. Local mobile review uses simulated browser viewports, not a physical device.
