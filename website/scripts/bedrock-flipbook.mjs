import {createHash} from 'node:crypto';
import sharp from 'sharp';

const millisecondsPerTick = 50;
const blendSteps = 16;
export const flipbookVersion = 1;
const resourcePath = value => value.replace(/\.(?:png|tga)$/i, '');

export function indexFlipbooks(definitions) {
  if (!Array.isArray(definitions)) throw new Error('Invalid flipbook texture list');
  const tiles = new Map(), textures = new Map();
  for (const definition of definitions) {
    const {atlas_tile: tile, flipbook_texture: texture} = definition;
    // The terrain adapter uses variant 0 when an atlas tile is an array.
    if ((definition.atlas_tile_variant ?? definition.atlas_index ?? 0) !== 0) continue;
    if (typeof tile !== 'string' || typeof texture !== 'string') continue;
    if (!tiles.has(tile)) tiles.set(tile, definition);
    const key = resourcePath(texture);
    if (!textures.has(key)) textures.set(key, definition);
  }
  return {tiles, textures};
}

export function flipbookFor(index, tile, texture) {
  return index?.tiles.get(tile) ?? index?.textures.get(resourcePath(texture));
}

export function prepareFlipbook(texture, definition) {
  if (!definition) return texture;
  const {width, height, pixels} = texture;
  const size = Math.min(width, height);
  const count = Math.max(width, height) / size;
  if (!Number.isInteger(count)) throw new Error(`Invalid flipbook strip dimensions: ${width}×${height}`);
  const ticksPerFrame = definition.ticks_per_frame ?? 1;
  const blend = definition.blend_frames !== false;
  const order = definition.frames ?? Array.from({length: count}, (_, index) => index);
  if (!Number.isSafeInteger(ticksPerFrame) || ticksPerFrame <= 0) throw new Error('Invalid flipbook ticks_per_frame');
  if (!Array.isArray(order) || !order.length || order.some(index => !Number.isInteger(index) || index < 0 || index >= count)) {
    throw new Error('Flipbook frames reference a missing tile');
  }
  const period = ticksPerFrame * order.length;
  if (!Number.isSafeInteger(period)) throw new Error('Flipbook duration exceeds the supported range');
  const horizontal = width > height;
  const frames = new Map();
  for (const index of new Set(order)) {
    const frame = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      const offset = (horizontal ? y * width + index * size : (index * size + y) * width) * 4;
      pixels.copy(frame, y * size * 4, offset, offset + size * 4);
    }
    frames.set(index, frame);
  }
  const animation = {
    period, ticksPerFrame, blend,
    pixelsAt(tick) {
      const position = (tick % period + period) % period / ticksPerFrame;
      const step = Math.floor(position);
      const from = frames.get(order[step]), to = frames.get(order[(step + 1) % order.length]);
      const amount = position - step;
      if (!blend || !amount || from === to) return from;
      const mixed = Buffer.alloc(from.length);
      for (let i = 0; i < from.length; i++) mixed[i] = Math.round(from[i] + (to[i] - from[i]) * amount);
      return mixed;
    },
  };
  const digest = createHash('sha256').update(texture.digest).update(JSON.stringify([flipbookVersion, order, ticksPerFrame, blend])).digest('hex');
  return {...texture, width: size, height: size, pixels: animation.pixelsAt(0), digest,
    animation: frames.size > 1 ? animation : undefined};
}

function greatestCommonDivisor(a, b) {
  return b ? greatestCommonDivisor(b, a % b) : a;
}

export function flipbookTimeline(textures, size) {
  const animations = [...new Set(textures.map(texture => texture.animation).filter(Boolean))];
  if (!animations.length) return null;
  let period = 1;
  for (const animation of animations) {
    period = period / greatestCommonDivisor(period, animation.period) * animation.period;
    if (!Number.isSafeInteger(period)) return null;
  }
  // Keep full frame boundaries for stepped flipbooks and cap the number of
  // intermediate samples for slow blends. Avoid unbounded output for clocks
  // whose only common cycle would require thousands of rendered images.
  const limit = Math.min(512, Math.floor(32 * 1024 * 1024 / (size * size * 4)));
  const times = new Set([0]);
  for (const animation of animations) {
    const steps = animation.blend ? Math.min(blendSteps, animation.ticksPerFrame) : 1;
    if (period / animation.ticksPerFrame * steps > limit) return null;
    for (let start = 0; start < period; start += animation.ticksPerFrame) {
      for (let step = 0; step < steps; step++) times.add(start + Math.floor(step * animation.ticksPerFrame / steps));
      if (times.size > limit) return null;
    }
  }
  const frames = [...times].sort((a, b) => a - b);
  const delays = frames.map((tick, index) => ((frames[index + 1] ?? period) - tick) * millisecondsPerTick);
  // WebP frame duration is a 24-bit field.
  if (delays.some(delay => delay > 0xffffff)) return null;
  return {frames, delays};
}

export async function writeFlipbookRender(render, size, target, timeline, tick = 0) {
  const raw = {width: size, height: size, channels: 4};
  const first = render(timeline ? 0 : tick);
  const visible = pixels => pixels.some((value, i) => i % 4 === 3 && value);
  if (!timeline) {
    if (!visible(first)) throw new Error('Model has no visible textured pixels');
    return sharp(first, {raw}).png().toFile(target);
  }

  const {frames, delays} = timeline;
  const pixels = Buffer.alloc(size * size * 4 * frames.length);
  first.copy(pixels);
  for (let i = 1; i < frames.length; i++) render(frames[i]).copy(pixels, i * first.length);
  if (!visible(pixels)) throw new Error('Model has no visible textured pixels');
  return sharp(pixels, {raw: {...raw, height: size * frames.length, pageHeight: size}})
    .webp({lossless: true, loop: 0, delay: delays, effort: 1}).toFile(target);
}