# Navigation performance

The local changes address repeated CPU work and oversized decorative images while
preserving the original source assets, pixel textures and public routes.

- `plugins/navigation-performance/` indexes the installed Docusaurus 3.9.1 chunk
  manifest on the first prefetch. It preserves hash stripping, nested chunk values,
  duplicate-path ordering, router matching and normal prefetch/preload behavior.
  The loader affects only the resolved core client module, leaves `node_modules`
  untouched and fails explicitly if the expected upstream implementation changes.
- `src/wiki/catalogIndex.mjs` replaces repeated recipe catalog scans and temporary
  array allocations with an identifier/name index. Project indexes use a WeakMap
  keyed by the localized project. Identifier priority and first-match precedence
  remain unchanged.
- The shared header/footer use 90px lossless WebP derivatives for their 30px marks.
  The animated mark mounts only during pointer hover or keyboard focus, unmounts
  afterward and respects reduced motion. The static mark remains visible while
  the animation loads or if it fails. Original full-resolution files remain intact.

## Reproduce

From `website`:

```powershell
npm run optimize:brand-images
npm run test:performance
npm run benchmark:navigation
```

The image generator requires the existing Sharp development dependency. Generated
brand derivatives are versioned; builds do not need to regenerate them.

## Measurements

Local Node 26.8.1 microbenchmark, November 23, 2026. Timings vary by machine and
concurrent work; they are algorithm timings, not browser frame rate or navigation
latency. Route data is a synthetic manifest with the current 21,608-route count.
Catalog data comes from the real UtilityCraft and Ascendant manifests.

| Work | Before | After |
| --- | ---: | ---: |
| 60 chunk lookups / 21,608 route entries | 901.449 ms | 59.030 ms index + 0.168 ms queries |
| 1,698 catalog lookups / 1,697 real entries | 37.345 ms | 3.688 ms index + 1.100 ms queries |
| White brand image | 68,250 bytes / 2000px | 1,580 bytes / 90px |
| Black brand image | 66,951 bytes / 2000px | 1,604 bytes / 90px |
| Animated brand | 1,003,118 bytes / 900px per frame | 169,014 bytes / 90px per frame |

All 48 animation frames, delays, looping and transparency are retained. The initial
header/footer no longer request the animation. Three pixels per CSS pixel cover
up to a 3x device pixel ratio at the current maximum mark size.

## Verification and limits

61 automated tests passed, including installed-core selection equivalence, one-time
index construction, incompatible-source detection, actual manifest lookup parity,
image transparency/timing and the existing renderer/wiki/download regressions.
DOM interaction checks also exercised pointer and keyboard animation lifecycle,
reduced motion, existing recipe tabs, localized download popup and builder events.

A focused no-minify Docusaurus build compiled and generated 48 representative
pages per locale (144 total across English, Portuguese and Spanish), including
the homepage, project catalog, generic wikis and Atelier pages. Strict broken-link
validation retained the full generated route catalog. Output inspection confirmed
the chunk index and optimized brand assets in all three locales, with no initial
animation image. Blog feed/search-index post-build packaging was excluded from
this focused review; this is not a complete production build.

Native browser automation was unavailable in this session. No FPS, physical-device
or deployed-site improvement is claimed. Representative compilation and static
rendering are recorded separately from a complete production build.

The generic wiki still imports data from multiple projects to support cross-project
recipes. Splitting that payload by project is a larger remaining opportunity; these
changes preserve the existing lookup behavior. Docusaurus router matching is also
unchanged; this patch optimizes the repeated chunk-manifest scan only.
