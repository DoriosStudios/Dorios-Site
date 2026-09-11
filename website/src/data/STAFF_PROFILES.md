# Editing staff profiles

Staff directory and profile content lives in `staffProfiles.js`. Each object in
`profiles` creates one `/studio/staff/{id}` page.

## Basic fields

```js
{
  id: 'member-id',              // Stable URL segment. Avoid changing it later.
  name: 'Display Name',
  shortName: 'Short Name',      // Optional; used in previous/next navigation.
  role: 'Developer & Designer',
  department: 'Development',
  founder: false,               // Founders never show a "Member since" fact.
  joined: '2024',               // Use null while the date is unknown.
  image: 'member-id.png',       // File inside static/img/about.
  bio: 'Short introduction used in the directory and profile hero.',
  quote: 'Optional profile quote',
}
```

Milo504 and WeatherVictor already use `founder: true`. Their `joined` value is
therefore ignored even if it is filled accidentally.

## More than one history paragraph

An array is the clearest format and is recommended:

```js
history: [
  'First paragraph about the member and their background.',
  'Second paragraph about their work at Dorios Studios.',
],
```

The renderer also accepts a string separated by `\n\n`:

```js
history: 'First paragraph.\n\nSecond paragraph.',
```

Both examples render as two separate paragraphs. An array is easier to edit
when the biography becomes long.

## Projects

Use `projectId` when the project exists in `projectCatalog.json`. The profile
automatically receives its name, link, icon and color palette:

```js
createdProjects: [
  {
    projectId: 'utilitycraft',
    role: 'Creator & lead developer',
    summary: 'Main responsibilities or contribution.',
  },
],
```

Projects without a catalog entry can still be listed by name. They remain
non-clickable until `href` is provided:

```js
collaboratedProjects: [
  {
    name: 'Unpublished Project',
    href: null,
    image: null,
    role: 'Builder',
    summary: 'Environment and structure work.',
  },
],
```

Keep authorship in `createdProjects` and participation in
`collaboratedProjects`. A project should not be placed in both lists unless the
distinction is meaningful and explained in `role`.

## Skills, links and timeline

```js
focus: 'Systems, interfaces and quality review',
tools: ['JavaScript', 'Minecraft Script API', 'JSON UI'],
areas: ['Development', 'Interface', 'Quality'],
links: {
  GitHub: 'https://github.com/example',
  YouTube: 'https://youtube.com/@example',
},
timeline: [
  {
    period: '2024',
    title: 'Joined Dorios Studios',
    description: 'Short description of this stage.',
  },
],
```

Empty arrays and `null` values are safe. Optional sections only appear when
they have content. After adding a new member or changing an `id`, restart the
development server so Docusaurus regenerates the static route list.

