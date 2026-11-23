# Versioned vanilla resources

Run commands from `website/`. The existing `Items/` and `Renders/` paths remain
unchanged. The compatible `src/data/vanillaAssetIndex.json` retains its flat
name-to-URL shape. `static/img/wiki/vanilla/index.json` is the richer resource
catalog: full identifiers, types, render types, public paths, variants and
version/provenance fields, plus an identifier lookup. It also indexes images
declared in add-on manifests without dropping their namespaces.

## Collect sources privately

```powershell
# Download the exact official commit once, then reuse it.
node scripts/collect-vanilla-assets.mjs

# Require the already cached pin; never contact the network.
node scripts/collect-vanilla-assets.mjs --offline

# Import a local RP with an explicitly supplied version into a private snapshot.
node scripts/collect-vanilla-assets.mjs --source C:/bedrock/resource_pack --version 1.26.50.4

# Extract selected block faces into private build storage.
node scripts/extract-vanilla-faces.mjs --block minecraft:furnace --faces up,south,east --variant 0

# Update the compatible and richer public indices.
node scripts/generate-vanilla-asset-index.mjs

node --test scripts/vanilla-assets.test.mjs
```

The pin in `website/scripts/vanilla-source.config.json` identifies Bedrock
**1.26.50.4**, Mojang's sample repository, and immutable commit
`46ba6ea985fb5a92d79a9419198f10dda14c199d`. It does not track `main` or `latest`.
Changing the version requires changing the corresponding immutable commit.
The collector rejects mutable refs, a mismatched official version, and modified
cached official files. Local imports are labeled as local and have no asserted
official revision; the version must be supplied explicitly. Each local snapshot
is separated by a SHA-256 hash of its relevant files.

The active cache pointer is `.cache-loader/vanilla/active.json`. Its
`resourcePack` field can be passed to the block/entity renderer's
`--vanilla-rp` argument. The private `inventory.json` records client entity IDs,
modern and legacy geometries, terrain textures, block face mappings, material
definitions, render controllers, animations and animation controllers. It
records references; it does not execute scripts or promise to evaluate all
Molang. Models absent from the official samples remain unresolved.

GitHub Actions can cache `website/.cache-loader/vanilla` using the source config
hash as the key. On a restored cache, collection validates and reindexes the
same source without downloading it again. Source integrity hashes include all
collected model, material, controller, animation and texture bytes. The cache
contains no timestamps in content hashes. Selected face extraction also reuses
valid unchanged PNGs and reports independent failures.

Resolution is project RP, explicitly configured dependencies in order, then
the selected vanilla RP. `resolveResourceReference()` accepts that ordered
list. `resolveBlockFace()` requires an explicit texture-array variant when
multiple alternatives exist; it never guesses a variant. A face refers to the
declared terrain texture, not a fabricated render or a crop of an entity atlas.
Block face export currently accepts PNG/image formats Sharp decodes; the CPU
renderer separately supports TGA textures.

## Public metadata and publication boundary

Existing vanilla images have unknown historical source versions. The richer
index explicitly marks them `vanillaVersion: null` and
`provenance: legacy-unversioned`, rather than relabeling them with the new pin.
No existing PNG is renamed, replaced or rewritten by the importer/indexer.

New public images in `Faces/`, `Entities/` and models in `Models/` are indexed
through explicit adjacent `*.asset.json` metadata. Example metadata for an
already cleared image:

```json
{
  "identifier": "minecraft:example",
  "type": "entity",
  "renderType": "face",
  "publicPath": "/img/wiki/vanilla/Faces/entities/example.png",
  "vanillaVersion": "1.26.50.4",
  "variant": "adult",
  "geometry": "geometry.example",
  "texture": "textures/entity/example"
}
```

The indexer validates the image bytes and metadata path and rejects paths
outside the public vanilla root. The `buildVanillaAssetIndex()` API accepts
additional `{manifest, publicRoot}` entries, retaining each resource namespace.
Root-relative public paths retain their original location, including shared
images hosted under another project. Remote/data URLs stay in their original
manifests but are omitted from this index of local public resources. Named
`renderVariants` mappings are indexed separately, and available
`auto-entities/index.json` / `auto-renders/index.json` records enrich entries
with geometry, texture, hash, settings, renderer version and variant metadata.
The API accepts `assetDirectory` when indices are being prepared outside the
default `static/` tree. Entity `image` references marked `imageKind: texture` or
pointing into `textures/entity/` are explicitly classified as `textureAtlas`;
no whole atlas is promoted to `face` or `portrait` automatically.

## Rights and redistribution

Mojang's [sample license](https://github.com/Mojang/bedrock-samples/blob/46ba6ea985fb5a92d79a9419198f10dda14c199d/LICENSE.md)
reserves rights and subjects the files to the
[Minecraft EULA](https://www.minecraft.net/en-us/eula). It is not a permissive
open-source asset license. The current
[Minecraft Usage Guidelines](https://www.minecraft.net/en-us/usage-guidelines)
include models and textures among Minecraft assets, permit informational fan
websites subject to conditions, and restrict redistribution of game files.

These terms do not establish blanket permission to republish the complete RP
or all extracted source assets. Consequently the collector keeps source files,
new raw face extracts and validation renders in ignored build storage. The
face CLI rejects a destination inside the site's public `static/` directory.
Publishing a newly extracted asset or derivative requires checking the terms
for that particular use. No new raw vanilla models, atlases, materials or
controllers are copied into the public tree by default. The existing public
library remains intact; its historical publication rights are not reclassified
by this tool. This boundary is an implementation policy based on the cited
terms, not a claim that every possible derived wiki image is forbidden.
