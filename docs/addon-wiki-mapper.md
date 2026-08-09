# Add-on wiki mapper

The wiki UI is project-agnostic. Each add-on supplies one adapter in
`website/src/wiki/projects`, while the Python mapper turns a bridge. project
into a normalized JSON manifest.

## Pipeline

1. Read `BP/items`, `BP/blocks`, `BP/entities`, and `BP/recipes`.
2. Read `RP/texts/en_US.lang`, `item_texture.json`, and `terrain_texture.json`.
3. Exclude `BP/items/**/ui/**`, placeholder/dummy paths, and placeholder
   identifiers by default.
4. Normalize names, identifiers, categories, texture sources, block faces,
   crafting slots, results, and source paths.
5. Detect identifiers ending in `_1`, `_2`, …, `_infinite` and named tier
   prefixes such as `basic_`, `advanced_`, `expert_`, and `ultimate_`. The
   collapsed `catalog.items` entry includes ordered `variants`, which is the
   shape consumed by `AddonWiki`'s animated flipbook.
6. Write one versioned manifest. Hand-written descriptions are intentionally
   outside this generated layer.

Run from `website`:

```powershell
python -m scripts.addon_wiki_mapper `
  "C:\path\to\bridge\projects\Ascendant-Technology" `
  --id ascendant-technology `
  --name "Ascendant Technology" `
  --config wiki-maps/example.jsonc `
  --dependency-project "C:\path\to\bridge\projects\UtilityCraft" `
  --assets-dir static/img/wiki/ascendant-technology `
  --output src/wiki/generated/ascendant-technology.json
```

The optional asset exporter copies only `image` and `faces` paths referenced by
the manifest into `static/img/wiki/<project-id>`, preserving RP-relative paths.
Dependency projects are also used to resolve shared namespaces and textures.
Identifier exclusions remove matching content entries and recipes whose result
is excluded; active recipes may still reference an excluded legacy dependency.
Machine/generator classification remains a small project adapter concern
because it depends on custom components and script conventions rather than one
stable Bedrock schema.
