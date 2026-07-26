---
id: text
title: text namespace
sidebar_label: text
sidebar_position: 14
description: Use named Minecraft formatting codes, capitalize labels, and convert identifiers into readable names.
---

# `text` namespace

Namespace: `DoriosLib.text` · Package: `DoriosLib/index.js`

## FORMAT

A mutable object of named Minecraft formatting codes.

| Colors | Codes |
| --- | --- |
| `black`, `darkBlue`, `darkGreen`, `darkAqua` | `§0`, `§1`, `§2`, `§3` |
| `darkRed`, `darkPurple`, `gold`, `gray` | `§4`, `§5`, `§6`, `§7` |
| `darkGray`, `blue`, `green`, `aqua` | `§8`, `§9`, `§a`, `§b` |
| `red`, `lightPurple`, `yellow`, `white` | `§c`, `§d`, `§e`, `§f` |

| Style | Code |
| --- | --- |
| `obfuscated` | `§k` |
| `bold` | `§l` |
| `strikethrough` | `§m` |
| `underline` | `§n` |
| `italic` | `§o` |
| `reset` | `§r` |

Start independently rendered lines with `FORMAT.reset` so formatting does not inherit from surrounding UI or chat content.

```js
const { reset, green, gray } = DoriosLib.text.FORMAT;
const lines = [
  `${reset}${green}Machine running`,
  `${reset}${gray}Processing cobblestone`,
];
```

## capitalizeFirst

`capitalizeFirst(value: string): string`

Converts the input to text and uppercases only its first character. The remainder is preserved exactly. Empty strings remain empty.

## formatIdentifier

`formatIdentifier(identifier: string): string`

Removes the namespace portion, splits the remaining path on underscores, whitespace, or hyphens, lowercases each word, then capitalizes it.

```js
DoriosLib.text.formatIdentifier("minecraft:diamond_sword"); // "Diamond Sword"
DoriosLib.text.formatIdentifier("example:THERMAL-CRUSHER"); // "Thermal Crusher"
```

This produces a readable fallback label. Use localization keys for player-facing content that must support multiple languages.
