# Dorios-Site
Dorios Studios Web Site

## Atelier custom downloads

The Atelier project page includes a custom `.mcaddon` builder after its official download links. The compiler lives in the Atelier repository; the website provides the family, finish, shape, color and tool selection interface in English, Portuguese and Spanish.

Website `npm start` and `prebuild` generate the required static resources. Locally, keep the Atelier checkout beside the `Dorios Site` directory and run `npm ci` in Atelier, or set `ATELIER_PROJECT_PATH` to that checkout. Generated files go into the ignored `website/static/atelier-builder/` directory. The development launcher acquires a local guard before running `prepare:dev`; a second `npm start` reports the existing URL instead of preparing or compiling another instance.

The Pages workflow checks out `DoriosStudios/Dorios-Atelier` at `main`, installs its compiler dependencies and prepares the resources before building the site. Push the Atelier compiler changes before deploying this website revision. The compiler documentation is `content/CUSTOM_INSTALLATION.md` in that repository.

## Download statistics

`project-stats.yml` refreshes the GitHub and CurseForge counters every six hours, after a successful site deployment, or on manual dispatch. It uses Node's built-in APIs and publishes only `project-stats.json` to the `site-stats` branch. It does not install website/Atelier dependencies, compile Docusaurus, or publish the `gh-pages` branch.

Project listings, project pages and home-page shortcuts read the public feed after hydration. The built-in HTML snapshot remains available if the feed cannot be fetched; open pages refresh every 15 minutes and on focus. Older provider records cannot replace a newer built-in snapshot. The collector seeds failed provider requests with the last published values rather than reverting counters to the repository snapshot. No token is sent to visitors. Development uses the same live feed instead of rewriting source snapshots on a timer and forcing recompilation.

The main Pages workflow builds on website changes or manual dispatch, with no scheduled full rebuild. Changes limited to the statistics collectors or cached counters run only the statistics workflow. The initial deployment of this feature still requires one full site build; later counter updates do not.

Run `node scripts/collect-project-stats.mjs` from `website` to prepare the feed locally. The ignored output is `.cache-loader/project-stats/project-stats.json`; `--previous <file>` can supply the last published feed and `--output <directory>` changes the output folder. `GITHUB_TOKEN` is optional locally and supplied by Actions in CI.
