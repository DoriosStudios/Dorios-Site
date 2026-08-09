# CurseForge download counters

The site refreshes CurseForge totals during `prebuild` and `prestart`. The API key is read only by `website/scripts/refresh-curseforge-stats.mjs` from `CURSEFORGE_API_KEY`; it is never imported by React or written to the generated site.

Public project IDs live in `website/src/data/curseForgeProjects.json`. The last successful totals live in `website/src/data/curseForgeStats.json`, so builds remain deterministic when the API or secret is unavailable.

## GitHub Actions secret

In `DoriosStudios/Dorios-Site`, open **Settings → Secrets and variables → Actions → New repository secret** and create:

- Name: `CURSEFORGE_API_KEY`
- Secret: the raw CurseForge API key, without quotes

The deploy workflow exposes it only to the build step. Scheduled builds run every six hours and refresh the committed cache in memory before producing the deployed site. The key is masked by GitHub and is not included in the artifact.

The same secret can be configured without placing it in shell history:

```powershell
gh secret set CURSEFORGE_API_KEY --repo DoriosStudios/Dorios-Site
```

The command prompts for the value through standard input.

## Local refresh

Set the key only for the current PowerShell process, refresh, and then remove it:

```powershell
$env:CURSEFORGE_API_KEY = Read-Host -MaskInput 'CurseForge API key'
npm --prefix website run refresh:curseforge-stats
Remove-Item Env:CURSEFORGE_API_KEY
```

Never place the key in JavaScript under `src`, a JSON data file, the workflow YAML, screenshots, logs, or a committed `.env` file. If a key is exposed, revoke and rotate it in the CurseForge developer console.
