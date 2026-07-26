---
id: utils
title: utils namespace
sidebar_label: utils
sidebar_position: 16
description: Normalize array inputs, identify plain objects, parse and serialize JSON safely, and clone JSON-compatible data.
---

# `utils` namespace

Namespace: `DoriosLib.utils` · Package: `DoriosLib/index.js`

## toArray

`toArray<T>(value: T | T[]): T[]`

Returns an array input unchanged and wraps every other value in a one-element array.

```js
const definitions = DoriosLib.utils.toArray(singleOrMultipleDefinitions);
```

This helper does not clone arrays. Mutating the returned array mutates the original array input.

## isPlainObject

`isPlainObject(value: unknown): value is Record<string, unknown>`

Returns true for non-null objects whose prototype is `Object.prototype` or `null`. Arrays, class instances, ItemStacks, entities, and primitive values return false.

Use it before reading fields from untrusted parsed JSON or registry payloads.

## `utils.json` namespace

### JsonResult

Safe JSON operations use a discriminated result:

```ts
type JsonResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error };
```

Checking `result.ok` narrows the available property for TypeScript and editor tooling.

### tryParse

<div class="api-signature">

`tryParse<T = unknown>(source: string, reviver?: JsonReviver): JsonResult<T>`

</div>

Attempts `JSON.parse()` and preserves any parsing failure as an `Error`.

```js
const result = DoriosLib.utils.json.tryParse(message);

if (!result.ok) {
  console.warn("Invalid configuration JSON", result.error);
  return;
}
```

The generic type is a compile-time assertion; DoriosLib does not validate that parsed fields match it.

### parseOr

`parseOr<T>(source: string, fallback: T, reviver?: JsonReviver): T`

Returns the parsed value or the caller-supplied fallback. The fallback is returned directly, not cloned.

### tryStringify

`tryStringify(value: unknown, options?: JsonStringifyOptions): JsonResult<string>`

```ts
interface JsonStringifyOptions {
  indent?: number | string;
}
```

Attempts JSON serialization. Cyclic data, throwing `toJSON()` implementations, BigInt values, and values whose root serializes to `undefined` return a failed result.

### stringify

`stringify(value: unknown, options?: JsonStringifyOptions): string`

Serializes using the same behavior as `tryStringify()` but throws the normalized error when serialization fails.

```js
const message = DoriosLib.utils.json.stringify(payload, { indent: 2 });
```

### clone

`clone<T>(value: T): T`

Creates a deep clone by serializing and parsing the value. It intentionally supports only JSON-compatible data.

The clone does not preserve prototypes, methods, `undefined` object fields, symbols, maps, sets, Script API handles, or other non-JSON values. Circular data throws.

```js
const snapshot = DoriosLib.utils.json.clone(configuration);
```
