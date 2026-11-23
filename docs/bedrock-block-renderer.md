# Bedrock block renders

The wiki renderer uses Node.js and CPU rasterization. Sharp decodes texture
files and writes transparent PNGs; it does not render the geometry. Blender,
WebGL, a browser and a dedicated GPU are unnecessary.

Run commands from `website/` with its npm dependencies installed.

```powershell
# Fill missing renders and update the existing manifest's block.render fields.
npm run generate:bedrock-renders -- --source "C:/addons/UtilityCraft" --manifest src/wiki/projects/utilitycraft/manifest.json --output static/img/wiki/utilitycraft

# Render a particular block even if it has a manual image. Preview writes a
# separate index entry and PNG, and leaves the wiki association unchanged.
npm run generate:bedrock-renders -- --source "C:/addons/UtilityCraft" --output .cache-loader/block-preview --block utilitycraft:workbench --preview

# Select a placed orientation explicitly (repeat --state for more states).
npm run generate:bedrock-renders -- --source "C:/addons/UtilityCraft" --output .cache-loader/block-preview --block utilitycraft:workbench --preview --placed --state minecraft:facing_direction=east --size 256

# Add RP dependencies in priority order and an optional local vanilla RP.
npm run generate:bedrock-renders -- --source "C:/addons/Ascendant-Technology" --output .cache-loader/ascendant-renders --dependency "C:/addons/UtilityCraft" --vanilla-rp "C:/bedrock-samples/resource_pack"

npm run test:bedrock-renders
npm run prepare:atelier-builder
```

Without `--manifest`, the command discovers definitions under `BP/blocks`.
With a manifest, it uses exactly the wiki's `content.blocks` entries and their
`source` paths. The identifier includes the namespace, and sanitized filenames
also contain an identifier digest to avoid collisions. State-specific previews
have separate keys and never replace the default wiki render.

## Integration and ownership

Both `scripts/map_project_wiki.py` and `python -m addon_wiki_mapper` invoke the
renderer after exporting assets. `npm run sync:wiki` therefore fills missing
renders during normal project preparation. `--no-renders` disables this stage;
`--no-assets` on the project mapper also disables it. Dependency projects are
forwarded to the renderer. Existing React components keep consuming the same
relative `render` field under `/img/wiki/<project>/`.

The output directory contains:

- `renders/`: copied manual source assets. The renderer preserves valid files.
- `auto-renders/<stable-id>-<visual-hash>.png`: generated images, 128×128 by
  default. `--size` accepts integer sizes from 16 through 2048.
- `auto-renders/index.json`: a reusable mapping keyed by full block identifier,
  recording the path, origin, visual hash, configuration, selected states and
  geometry statistics.
- `auto-renders/report.json`: the latest run's generated, reused, ignored and
  error results, plus resource-loading issues.

Manual renders take precedence, including with `--force`. `--preview --block`
explicitly generates a separate automatic artifact for visual inspection.
The normal run validates and reuses an indexed image without interpreting its
source model again. Missing, corrupt or fully transparent output is rebuilt.
`--refresh` rechecks visual inputs and reuses the image if its hash is unchanged;
`--force` rerasterizes generated output. A change of renderer version or render
configuration also invalidates generated cache entries. Use `--refresh` after
changing addon assets; ordinary runs intentionally preserve existing renders.

Hashes include geometry, resolved state/visibility, block transformation,
material definitions, decoded texture inputs and tint, UVs, camera, lighting,
shadow configuration and renderer version. Writes use a temporary file and
rename. A failed refresh retains a previous valid render. Old content-addressed
PNGs are retained, so other manifests referencing them continue to work. Runs
targeting the same index should be serialized.

Individual block failures are recorded and do not stop other blocks. The CLI
returns a nonzero exit code when any block fails. Wiki preparation supplies
`--allow-errors` to keep preparing the remaining content while printing those
failures. Unsupported visual inputs produce errors, never a generic substitute.

## Rendering model

- Cuboids and fractional coordinates, cube pivots/rotations, bone pivots,
  parent hierarchies, inherited visibility, inflation and mirrored box UVs.
- All six faces, including faces rotated into view and zero-thickness planes.
  A flat surface retains its selected UV side; double-sided materials can show
  the reverse of a plane that declares only one side.
- Column vectors and affine 4×4 matrices; local cube, bone chain, then block
  transformation. Geometry pivots use model units. Component translation and
  pivots use block units relative to the block center. Rotations apply X, Y, Z.
  Bedrock model-space angle signs account for its reflected X convention.
- `minecraft:item_visual` geometry/materials by default, or the placed visual
  with `--placed`; geometry strings and objects, plus `bone_visibility`.
- Default block states and placement traits, followed by matching visual
  permutations in declaration order; `--state name=value` overrides defaults.
- A bounded Molang reader for literals, `q.block_state`/`query.block_state`,
  parentheses, arithmetic, comparisons, `!`, `&&` and `||`. It never executes
  addon JavaScript or arbitrary expressions.
- `terrain_texture.json`, wildcard/per-face/named material instances and
  aliases; per-face/box UVs, negative UV sizes and clockwise UV rotations.
  Atlas coordinates scale against the geometry's declared atlas dimensions,
  independently of the decoded texture resolution.
- PNG and uncompressed/RLE true-color or grayscale TGA, static texture tint,
  local vanilla assets and ordered RP dependencies. The project RP takes
  precedence over dependencies, which take precedence over vanilla.
- Opaque, blend, alpha-test and single/double-sided culling. Distance-dependent
  `*_to_opaque` materials use their near-distance appearance. Texture variants
  use the first configured entry deterministically.
- Orthographic isometric projection, automatic framing, nearest-texel sampling,
  directional studio lighting, approximate shadows from transformed opaque
  cuboids, internal-surface suppression for closed compatible volumes and
  per-pixel sorting/composition of translucent fragments.

The geometry conventions follow the [Microsoft geometry schema](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/schemasreference/schemas/minecraftschema_geometry_1.21.0?view=minecraft-bedrock-stable).
Coordinate conversion is cross-checked against the [Blockbench Bedrock codec](https://github.com/JannisX11/blockbench/blob/master/js/formats/bedrock/bedrock.js).
Culling and alpha behavior follow [material instances](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_material_instances?view=minecraft-bedrock-stable).

## Atelier compatibility

`atelier-previews.mjs` remains the catalog adapter, including Atelier's special
vertical-slab inventory selection and its pinned vanilla texture revision.
Projection, face generation, texture decoding, shading and rasterization are
shared modules. Its `atelier-v2` profile keeps the existing three-face fragment
and compositing behavior for compatible unrotated inventory models, preserving
the existing content hashes and image bytes. Rotated models and transformed
inventory visuals use the general geometry compiler and the same rasterizer.

## Remaining boundaries

This is a static preview renderer, not the Bedrock runtime. Arbitrary Molang,
animations, skeletal bindings, `poly_mesh`, texture meshes, `uv_lock`,
`n_way_visual_rotation`, biome-dependent tint and randomized isotropic UVs are
reported as unsupported when encountered. Geometry display transforms for
specific in-game GUI/hand contexts are not applied to the site's studio camera.
Only modern `minecraft:geometry` arrays are indexed. A legacy cube is accepted
when explicitly declared by `RP/blocks.json`; a missing custom model is an error.

Shadows approximate studio lighting and only opaque closed cuboids cast them.
This does not simulate Bedrock ambient occlusion, biome lighting, liquid
surfaces, PBR texture sets or animated texture timelines. No network download is
performed by the general pack loader; supply vanilla/dependency resources
locally. The Atelier adapter retains its existing pinned vanilla download/cache.

The real Workbench integration test uses a local UtilityCraft checkout when
available, via the workspace source resolver or `UTILITYCRAFT_RENDER_TEST_PATH`.
Otherwise it uses `scripts/fixtures/utilitycraft-workbench`, containing exact
upstream block, geometry and texture bytes with their SHA-256 hashes and source
commit recorded in `source.json`. Its terrain atlas retains the original
Workbench entry. The test is mandatory and does not skip when the checkout is
unavailable. It verifies `geometry.utilitycraft_workbench`, a 64×64 atlas,
18 cubes, 2 planes, all four configured orientations and transparent output.
Synthetic tests cover actual cube/bone rotations, which that Workbench model
alone does not exercise.
