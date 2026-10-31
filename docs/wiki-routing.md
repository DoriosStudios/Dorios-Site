# Wiki routes and internal IDs

Public URLs remain readable and retain the project, entry type, and slug.
Internal route parameters are stored separately as
`.docusaurus/dorios-generated-routes/default/r/<id>.json`. The ID is the first
20 hexadecimal characters of SHA-256 over the serialized parameters. It is
stable between builds and locales, and identical parameters reuse the same
module. The generator rejects an ID collision instead of replacing data.

The route plugin uses [Docusaurus `createData` and route modules](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis)
through `modules.routeData` instead of `props`.
This prevents Docusaurus from turning a complete public URL into the filename
of its generated parameter module. Source components remain shared; there is
no source file for each entry or sector.

## Detail sectors

Each sector is an explicit static route. Its parameters select the content
during server rendering, so opening, refreshing, or sharing the URL does not
depend on a hash or browser state.

| Entry | Sector paths after the entry URL |
| --- | --- |
| Item | `specs`, `recipes`, `drops`, `uses`, `related`, `notes` |
| Block | `specs`, `recipes`, `drops`, `locations`, `modifiers`, `sieving` |
| Machine | `specs`, `recipes`, `drops` |
| Generator | `specs`, `recipes` |

The entry URL itself is the overview (`details`). Navigation displays sectors
with applicable content. Direct links to a sector without documented data show
an empty state. Recipe entries and mechanics retain their existing detail page.

Examples:

- `/wiki/utilitycraft/machines/autosieve/specs`
- `/wiki/utilitycraft/machines/autosieve/recipes`
- `/wiki/utilitycraft/machines/autosieve/drops`
- `/pt-BR/wiki/utilitycraft/machines/autosieve/specs`

Machine recipes and drop tables are separate pages. The old machine `#drops`
tab contained recipes, so those legacy links migrate to `/recipes`. Block
`#drops`, `#locations`, and `#modifiers` links migrate to their matching pages.
Recognized item section anchors also migrate to their matching sector. New
navigation uses ordinary links, supports browser history, and preserves the
query string. Canonical and social URLs identify the selected sector.

## Verification

Run `node --test plugins/addon-wiki-routes/route-data.test.js` from `website`.
This verifies the ID contract, legacy links, actual project route generation,
localized paths, and sector parameters. Then compile the site with Docusaurus
and inspect direct sector URLs in the generated output.
