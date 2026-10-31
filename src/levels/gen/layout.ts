// Layout helpers shared by the level generators. Positions are normalised
// (0..1), so they're checked against the narrowest board we support.
import type { Rng } from './rng';

/** Narrowest board width in px (320px phone minus page padding). */
export const MIN_BOARD_W = 288;

/** `n` evenly spaced values from lo to hi (centre if n = 1). */
export function evenly(n: number, lo: number, hi: number): number[] {
  if (n === 1) return [(lo + hi) / 2];
  return Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
}

/** Widest piece (px) that fits between neighbours `step` apart, minus a gap. */
export function fitWidth(step: number, max: number, gap = 6): number {
  return Math.min(max, Math.floor(step * MIN_BOARD_W) - gap);
}

/**
 * Scatter `n` pieces in rows across the lower board: even columns with a
 * little jitter and tilt so it looks like a real, untidy surface.
 */
export function scatter(
  n: number,
  rng: Rng,
  opts: { rows: number[]; perRow: number; tilt?: number },
): { x: number; y: number; rot: number }[] {
  const out: { x: number; y: number; rot: number }[] = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / opts.perRow);
    const inRow = Math.min(opts.perRow, n - row * opts.perRow);
    const xs = evenly(inRow, 0.12, 0.88);
    out.push({
      x: xs[i % opts.perRow] + rng.range(-0.015, 0.015),
      y: opts.rows[row] + rng.range(-0.015, 0.015),
      rot: rng.range(-(opts.tilt ?? 8), opts.tilt ?? 8),
    });
  }
  return out;
}

/** A random pastel colour. */
export const pastel = (hue: number) => `hsl(${Math.round(hue)} 60% 80%)`;
