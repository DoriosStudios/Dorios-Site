# Universal project download statistics

The website remains on GitHub Pages. `project-stats.yml` runs collectors every six
hours and publishes only data on `site-stats`: `project-stats-v2.json` for the new
hook and `project-stats.json` in its original schema for older deployments. The React hook polls
that public feed independently of the Docusaurus build. This implementation does
not deploy the new Worker or create a Cloudflare database automatically.

## Providers and project configuration

`website/src/data/downloadProviders.json` registers display metadata, metric type,
the adapter filename and an optional catalog link key. `projectSources()` derives
the existing GitHub, CurseForge and MCPEDL sources from real catalog URLs. Projects
can add or override sources with `statisticsSources`; source IDs are unique per
project. Catalog regeneration also preserves these settings from
`project-catalog.config.jsonc`.

GitHub Releases and CurseForge adapters reuse the existing collectors. CurseForge
uses exact counters only, from its API when credentials/ID are available or its
public Details section otherwise. MCPEDL is displayed as a configured source whose
counter is not available; its link does not contribute a fictitious zero.

To add another provider, register its metadata/adapter filename, implement
`collect(source, {project, previous, request, env})` in
`website/scripts/statistics/providers/`, and configure sources. The result is
`{value, updatedAt, metric?, metadata?}`. Failures may throw; the collector isolates
them. Neither aggregation nor the statistics component needs a platform-specific
branch. Unknown icon names use the generic platform icon.

Use different source IDs and URLs for multiple repositories/accounts of the same
provider. Use the **same `countingKey`** when two integrations report the same
underlying events. A shared key contributes once. Distinct platforms count their
own downloads, not unique people. Overlap cannot be inferred from equal numbers.
Do not add Analytics events as a second source for the internal download ledger.

`enabled:false` preserves a visible disabled source without counting it;
`countable:false` identifies a configured platform without a usable counter.
Supported metrics are `downloads`, `download-starts` and `clicks`. Clicks are
aggregated separately and excluded from the main download number. Internal custom
packages are explicitly labelled **downloads started**, including in the popup.

## Schema and reliability

Schema 2 stores `projects[id].sources[]`, including stable ID, provider, counting
key, metric, value, timestamps, metadata and availability state. Missing values are
`null`. Safe nonnegative integers only are accepted. An individual failure, older
snapshot or counter regression retains the last valid value and timestamp and
marks it stale. A replaced source identity does not inherit another source's
counter. Disabling/removing sources intentionally changes which totals contribute.

Schema 1 is migrated without losing reliable historical counts. The original URL
retains schema 1, because old validators would reject a schema 2 payload even if it
contained compatibility fields. The workflow restores schema 2 preferentially to
preserve internal-source counters, falling back to schema 1 on the first migration.
The frontend keeps its build snapshot and most recent live counters on network
failure. Counts do not decrease when an older feed arrives. Every source's last
successful update is available in the popup.

Run from `website`:

```powershell
node scripts/collect-project-stats.mjs --previous path/to/old-feed.json --output .cache-loader/project-stats
node scripts/collect-project-stats.mjs --offline --output .cache-loader/project-stats-check
npm run test:site-features
```

The offline command checks migration/cache behavior without requesting external
providers. Node 22.13 or newer is required for the local SQLite Worker tests.

## Custom Install service: setup still required

The implementation lives in `services/download-counter`. It uses a D1 event ledger
with `(project,event_id)` uniqueness and a trigger that increments the aggregate in
the same atomic insert. The same attempt UUID therefore cannot count twice, even
after retries or Worker restarts. Events store only project, anonymous random
attempt UUID, type and server timestamp; no IP, selection, user agent or user ID is
stored in D1. Keep the ledger if permanent deduplication is required; deleting old
IDs permits very old retries to count again.

The binding rate limiter uses the transient Cloudflare connection IP as its key,
with 10 requests per 60 seconds. It does not write IPs into the database. This is
basic abuse protection: [Cloudflare's rate limits are approximate and apply per
location](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
Origin validation does not prove a package was saved; non-browser clients can
forge Origin. No client-side instrumentation can attest successful installation.

Before enabling production:

1. In `services/download-counter`, authenticate Wrangler to the chosen account:
   `npx wrangler@4 login`.
2. Create D1: `npx wrangler@4 d1 create dorios-downloads`. Put the returned real
   database ID into `wrangler.jsonc` instead of its explicit placeholder.
3. Apply the schema:
   `npx wrangler@4 d1 execute dorios-downloads --remote --file schema.sql`.
4. Set a strong read secret: `npx wrangler@4 secret put READ_TOKEN`.
5. Review allowed production origins and project/event pairs in `wrangler.jsonc`.
   For local testing only, add the actual localhost origin to a local configuration.
6. Deploy: `npx wrangler@4 deploy`. The API uses the [D1 Worker binding](https://developers.cloudflare.com/d1/worker-api/d1-database/).
7. Set the repository Actions variable `DOWNLOAD_COUNTER_URL` to the real Worker
   origin, and secret `DOWNLOAD_COUNTER_READ_TOKEN` to the same read token. The
   site build receives only the public URL; the secret is used only by the collector.
8. Build/deploy the website once to configure the public event URL, then run the
   project-statistics workflow. Later count refreshes do not build the site.

`POST /events` requires an allowed Origin, JSON under 1024 bytes, configured project
and event, and a v4 UUID. Request example:

```json
{"project":"atelier","event":"custom-install-started","eventId":"b8e2abb3-d7a3-496d-bb26-8899c639a748"}
```

`GET /counters` requires `Authorization: Bearer <READ_TOKEN>` and returns schema 1
aggregates to the internal adapter. Unconfigured infrastructure stays **unavailable**;
the website does not pretend the counter is operational or expose a fake zero.

The builder generates one UUID per compile/download attempt. Only after a successful
worker result and invoking the blob download does it submit telemetry. Repeated
worker completion messages are ignored; transport retries reuse the same UUID.
Clicking the explicit download-again link starts a new attempt. Telemetry failures
are swallowed and never prevent the local `.mcaddon` download. Selection preset
downloads and simply opening the builder are not counted.

## Validation boundaries

Main implementation files:

| Area | Files |
| --- | --- |
| Provider contracts/configuration | `website/src/data/downloadProviders.json`, `downloadSources.mjs`, `projectStatistics.mjs`, `projects.js`, `projectCatalog.json` |
| Collectors/adapters | `website/scripts/collect-project-stats.mjs`, `statistics/collect.mjs`, `statistics/providers/*.mjs`, existing `refresh-github-release-stats.mjs` and `refresh-curseforge-stats.mjs` |
| Live interface | Existing `website/src/hooks/useProjectStatistics.js` consumes the extended normalizer; `components/DownloadStatistics/`, `ProjectDetailPage/index.js`, project catalog badge and `i18n/site.js` |
| Local download event | `website/src/data/downloadEvents.mjs`, `components/AtelierBuilder/index.js`, `docusaurus.config.js` |
| Persistent service | `services/download-counter/worker.mjs`, `schema.sql`, `wrangler.jsonc`, `worker.test.mjs` |
| CI and config preservation | `.github/workflows/project-stats.yml`, `.github/workflows/deploy.yml`, `website/project-catalog.config.jsonc`, `scripts/project_catalog_mapper.py` |
| Tests | `website/scripts/project-statistics.test.mjs`, `atelier-wiki.test.mjs`, route registration tests, and `npm run test:site-features` |

Tests cover all current historical counters, migration, invalid/unavailable values,
provider isolation, multiple instances, shared keys, disabling sources, monotonic
cache updates, client retries, and actual SQLite persistence/trigger deduplication.
SQLite tests exercise the SQL locally; they do not establish a deployed Cloudflare
service. A public endpoint, real D1 binding, Actions secrets and live browser-to-Worker
traffic still require the setup above.
The statistics workflow runs the provider/migration and SQLite ledger tests before
collecting or publishing a feed, without installing the Docusaurus dependencies.

Local implementation verification: 27 feature/editorial/route tests and the 29
existing renderer tests passed. DOM interactions exercised popup click, Escape,
outside dismissal, three locales, recipe tabs, painting targets and the real
builder's success-only event hook with a simulated Worker. All 916 preview files
remained byte-identical to their prior copies. A representative no-minify review
compiled and rendered 43 selected pages per locale (129 total), retaining the full
generated route catalog for strict broken-link checking. Blog feed/search-index
packaging was skipped for that focused review; this is not an unrestricted
production build. Native browser automation was unavailable, so no visual browser
or physical mobile-device verification is claimed.

A read-only live Atelier collection refreshed GitHub successfully. CurseForge
returned HTTP 403, retaining its historical counter as stale. MCPEDL remained
excluded, and the unconfigured internal endpoint remained unavailable. No new
feed, website or Worker was published during this local implementation.
