# CurseForge download counters

The site refreshes CurseForge totals during `prebuild` and `prestart`. The collector reads each public project page listed in `links.curseforge` in `website/src/data/projectCatalog.json` and extracts the exact value shown under **Details → Downloads**. No CurseForge API key or numeric project ID is required.

The last successful totals live in `website/src/data/curseForgeStats.json`. If a public page is unavailable or its markup cannot be parsed, the collector keeps that project's last valid cached total and reports the fallback in the build log.

## GitHub Actions

Scheduled builds run every six hours. Each build refreshes the cache in the runner workspace before Docusaurus produces and publishes the static site; the workflow does not commit the generated statistics back to the repository.

## Local refresh

Run the collector without any credentials:

```powershell
npm --prefix website run refresh:curseforge-stats
```
