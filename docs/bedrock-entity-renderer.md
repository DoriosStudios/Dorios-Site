# Bedrock entity renders

The entity adapter reuses `bedrock-geometry.mjs`, `bedrock-renderer.mjs` and
`bedrock-pack.mjs`. Geometry transformations, box/per-face UVs, pixel sampling,
opaque-volume shadows, fragment depth sorting and transparent composition have
one implementation shared with block renders. Sharp only decodes textures and
encodes PNGs. No Blender, WebGL, GPU or addon JavaScript is involved.

Run from `website/`:

```powershell
# Discover BP/entities, generate missing/changed images and update wiki fields.
node scripts/generate-bedrock-entity-renders.mjs --source C:/addons/Example --output static/img/wiki/example --manifest src/wiki/projects/example/manifest.json --dependency C:/addons/Dependency --vanilla-rp C:/pinned/resource_pack --allow-errors

# Inspect one entity without changing the published manifest.
node scripts/generate-bedrock-entity-renders.mjs --source C:/addons/Example --output .cache-loader/entity-preview --entity example:creature --format fullBody,portrait,face --config .cache-loader/entity-overrides.json

# Only faces, or only portraits.
node scripts/generate-bedrock-entity-renders.mjs --source C:/addons/Example --output .cache-loader/entity-faces --format face
node scripts/generate-bedrock-entity-renders.mjs --source C:/addons/Example --output .cache-loader/entity-portraits --format portrait

node --test scripts/bedrock-entity.test.mjs scripts/bedrock-renderer.test.mjs
```

`generateEntityRenders(options)` exposes the same interface to preparation tools.
`formats` is an array containing `fullBody`, `portrait` and/or `face`. `entity`
accepts a full identifier or a unique manifest record id. Output size defaults
to 128 pixels; `--size` accepts integer sizes from 16 to 2048. CLI failures return
nonzero unless `--allow-errors` was supplied. Each incompatible entity/format
is reported independently, so another entity or format can still succeed.

## Resolution and static appearance

Behavior records and client definitions match by their **full identifier**.
Resource resolution searches the project's RP, configured dependency RPs in
order, then the selected vanilla RP. The adapter indexes client definitions,
modern and legacy geometry, render controllers, material definitions, animation
definitions and animation-controller metadata. A vanilla geometry can therefore
use the project's texture; a dependency can provide a client/model/material.

Render controllers support symbolic `Geometry.*`, `Texture.*`, `Material.*`,
arrays indexed by a known integer expression, conditional controller activation,
ternary selection, wildcard material rules and `part_visibility`. Explicit
numeric BP `minecraft:variant`, `minecraft:mark_variant`, `minecraft:skin_id`
and default entity properties supply values when declared. Other query values
must be configured. Array bounds and missing aliases are checked rather than
silently selecting the first entry. The expression reader handles the bounded
arithmetic/comparison/boolean language from the block adapter, never `eval`.

Each selected controller supplies one geometry and one texture stage. Multiple
controllers share a single depth/compositing pass even when their atlas sizes
differ. A controller with several texture stages requires explicit layer
configuration because shader-specific texture mixing cannot be inferred from
the names alone. Supported alpha methods are opaque, blend and the existing
alpha-test variants; inherited material states and known entity shader families
identify these methods. Custom material names with no available definition
require an explicit `materialMethods` entry. Official Bedrock sample RPs may omit
engine shader definitions entirely; their named materials are not automatically
treated as known shader implementations.

The default pose uses the model's bind rotations. Runtime animation scripts and
animation-controller transitions are not evaluated. A configured static
animation can contribute **constant bone rotations**; numeric `pose` rotations
can also be added to the bind pose. Keyframes, position/scale animations, Molang
animation channels and skeletal bindings need additional treatment and report
errors when requested. Legacy `neverRender` bones retain their transformations
but omit their own cubes, preserving visible descendants.

## Full body, portrait and face

Full body uses the whole model with a three-quarter orthographic camera. Portrait
keeps complete cubes whose transformed centers lie in the upper half of each
controller model, or configured portrait bone groups. This avoids cutting UVs or
using a flat atlas as a face. Unusual proportions can use `portraitBones` and
per-format camera settings instead of this heuristic.

Face uses frontal projection of an actual head bone group and its descendants.
Ancestors remain in the hierarchy to preserve their rotations, but their cubes
are omitted. Automatic detection requires a unique `head`, `skull`, `face` or
`cranium` bone (or a unique matching compound name). Ambiguous/nonhuman anatomy
requires explicit `headBones`. A missing head is a reported failure, never a
random crop of the texture.

Images use nearest-texel sampling, transparent PNGs, automatic framing and a
moderate studio light profile. Optional `camera`, `lighting`, `shadows`, `zoom`
and `padding` settings apply per format. The rasterizer's existing block framing
defaults are unchanged; only entity rendering opts into uncapped head fitting.

## Explicit configuration

Pass a JSON/JSONC file through `--config`, or the same object through `overrides`:

```json
{
  "defaults": {
    "queries": {"is_baby": false},
    "render": {"size": 128, "shadows": true},
    "formats": {"face": {"camera": {"direction": [0, 0, -1]}}}
  },
  "entities": {
    "minecraft:zombie": {
      "materialMethods": {"zombie": "alpha_test"},
      "pose": {"rightArm": [-10, 0, 0], "leftArm": [-10, 0, 0]}
    },
    "example:sensor": {
      "headBones": ["optical_unit"],
      "portraitBones": ["optical_unit", "upper_hull"],
      "visibility": {"damaged_shell": false},
      "properties": {"example:skin": 2},
      "expressions": {"math.mod(query.variant, 2)": 0}
    },
    "example:layered": {
      "layers": [
        {"geometry": "Geometry.default", "textures": ["Texture.default"], "materials": [{"*": "Material.default"}]},
        {"geometry": "Geometry.overlay", "textures": ["Texture.overlay"], "materials": [{"*": "Material.overlay"}], "renderMethod": "blend"}
      ]
    }
  }
}
```

Defaults are merged with the entity entry at the top level; a specific nested
object replaces the corresponding default nested object. `symbols` can override
an exact symbolic expression, and `expressions` can supply the result of an
explicitly reviewed Molang expression. These settings are data, not executable
code. `staticAnimation` accepts an animation id or a client animation alias.
Optional top-level/per-entity `variant` stores separate `renderVariants` fields
without replacing the default render association.

## Manifests, ownership and cache

The adapter preserves existing `image` and updates optional `render`, `portrait`,
`face`, or `renderVariants.<variant>` fields. A flat `textures/entity/...` image
does not count as a portrait. Valid manual fields have priority even with
`--force`. `--replace-manual` explicitly changes the association to generated
output; the original manual file is still never overwritten.

Source manual images can be provided as
`Assets/EntityRenders/<local-id>/{fullBody,portrait,face}.png`. Full body also
accepts `Assets/Renders/<local-id>.png` and `<local-id>_render.png`. Valid manual
copies already present in the site are preserved. Namespaced hashed entity keys
prevent generated filename collisions across identifiers/projects.

Generated output is separate:

- `auto-entities/<stable-id>/<format>-<visual-hash>.png`.
- `auto-entities/index.json`: full identifier, format, variant, path, visual
  hash, settings, geometry ids, texture paths, diagnostics and model statistics.
- `auto-entities/report.json`: generated/reused/ignored/error counts and separate
  missing behavior/client/geometry/texture, unresolved controller, unsupported
  variant/material/head/pose and rendering failure diagnostics.

Every run rechecks current model, texture and material content, then reuses a
valid content-addressed PNG. Unchanged images are not rasterized or rewritten;
corrupt/missing output is regenerated. Hashes include normalized geometry/UVs,
pose, visibility, selected materials/textures, transparency, variant, format,
camera, lighting, framing, resolution and both renderer versions. Failed refresh
retains the previous valid manifest association. Writes use temporary files and
rename; runs sharing an output index must be serialized.

## Validation and limits

Automated tests cover all three formats, rotated bones/cubes, inflation/mirror,
fractional geometry, non-head anatomy, hierarchy preservation, legacy geometry,
dependency resolution, addon textures with vanilla geometry, controller arrays
and variants, multiple texture layers, translucent materials, static pose,
unknown Molang, missing assets, content cache invalidation, corrupt image repair,
manual preservation, variant isolation and per-entity failure isolation. The
existing block-renderer suite still checks Atelier-compatible behavior and the
real UtilityCraft Workbench (64×64 atlas, 18 cubes, 2 planes, four orientations).

Local visual validation additionally rendered the official **1.26.50.4** zombie
from immutable Bedrock samples commit
`46ba6ea985fb5a92d79a9419198f10dda14c199d` in all three formats, using an explicit
adult query and alpha-test material profile. The real UtilityCraft mechanical
spawner zombie client also rendered all three formats using its configured
`spawner_type` bone as the frontal group. The vanilla example remains in ignored build cache. Addon renders can be
associated with public manifests by the wiki preparation stage. Source collection/publication policies belong
to the versioned vanilla import pipeline.

This is **not complete Bedrock entity runtime support**. Remaining limitations
include arbitrary Molang/functions, dynamic animation-controller execution,
position/scale/keyframe animations, attachables/equipment, entity skin shader
effects, shader-specific multistage texture composition, dynamic tint/UV effects,
mesh/binding geometry and PBR. Shader color/UV/runtime-lighting fields and client
scale scripts produce explicit neutral-profile warnings instead of claiming the
runtime effect was reproduced. Head/portrait heuristics need overrides for
unusual anatomy or separate controller geometries. Shadows remain approximate
opaque-cuboid shadows, not Bedrock world lighting.
