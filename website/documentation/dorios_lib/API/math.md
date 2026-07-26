---
id: math
title: math namespace
sidebar_label: math
sidebar_position: 10
description: Clamp and scale numbers, generate random values, calculate vectors, and convert Roman numerals.
---

# `math` namespace

Namespace: `DoriosLib.math` · Package: `DoriosLib/index.js`

## clamp

`clamp(value: number, min: number, max: number): number`

Restricts a finite number to the inclusive range. Nonfinite arguments throw `TypeError`; `min > max` throws `RangeError`.

## roundTo

`roundTo(value: number, decimals?: number): number`

Rounds a finite value to an integer number of decimal places. `decimals` defaults to `0` and must be an integer; negative values round positions left of the decimal point.

```js
DoriosLib.math.roundTo(12.3456, 2); // 12.35
```

## scaleTo

`scaleTo(current: number, max: number, scale: number, mode?: ScaleMode): number`

Maps `[0, max]` into `[0, scale]`, clamps the result, and applies a rounding mode.

```ts
type ScaleMode = "floor" | "ceil" | "round" | "none";
```

The default mode is `floor`. Nonpositive `max` or `scale` returns `0`; unknown modes throw `RangeError`.

```js
const frame = DoriosLib.math.scaleTo(stored, capacity, 10, "round");
```

## randomInt

`randomInt(min: number, max: number, random?: () => number): number`

Returns an integer from the inclusive interval. Bounds are converted with `ceil(min)` and `floor(max)`. An interval containing no integer throws `RangeError`.

The optional random source enables deterministic tests.

## randomFloat

`randomFloat(min: number, max: number, random?: () => number): number`

Returns a number in `[min, max)`. Equal bounds return that value; reversed bounds throw `RangeError`.

## distance

`distance(a: Vector3, b: Vector3): number`

Calculates three-dimensional Euclidean distance.

## offset

`offset(position: Vector3, vector: Vector3, amount?: number): Vector3`

Returns a new position equal to `position + vector * amount`. Neither input object is mutated. `amount` defaults to `1` and must be finite.

## romanToInteger

`romanToInteger(numeral: string): number`

Converts a canonical Roman numeral, ignoring surrounding whitespace and letter case. Invalid or empty values return `0`. Accepted canonical values range through `MMMCMXCIX`.

## integerToRoman

`integerToRoman(value: number): string`

Converts integer values from 1 through 3999. Fractional, nonpositive, and out-of-range values return an empty string.

```js
DoriosLib.math.integerToRoman(14); // "XIV"
```
