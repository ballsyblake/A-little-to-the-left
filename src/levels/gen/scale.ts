// Kitchen scale: split the weights so both pans weigh the same.
// Harder = three weights per pan instead of two.
import { equalSums } from '../../engine/rules';
import type { SlotDef } from '../../engine/types';
import { WEIGHT_CANVAS, weight } from '../art';
import { scaleNeedle } from '../scale';
import type { Family } from './family';
import { evenly } from './layout';

/** All k-sized combinations of `items`. */
function combos<T>(items: T[], k: number): T[][] {
  if (k === 0) return [[]];
  return items.flatMap((x, i) => combos(items.slice(i + 1), k - 1).map((c) => [x, ...c]));
}

export const scaleFamily: Family = ({ rng, d, id, name }) => {
  const k = d < 0.5 ? 2 : 3;
  // Pick a left pan, then find a right pan of different weights with the same total.
  let left: number[] = [];
  let right: number[] | undefined;
  while (!right) {
    left = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, k);
    const sum = left.reduce((a, b) => a + b, 0);
    const rest = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => !left.includes(v));
    const matches = combos(rest, k).filter((c) => c.reduce((a, b) => a + b, 0) === sum);
    right = matches.length ? rng.pick(matches) : undefined;
  }
  const weights = [...left, ...right];
  const lx = k === 2 ? [0.17, 0.35] : [0.12, 0.27, 0.42];
  const pan = (g: string, xs: number[]): SlotDef[] =>
    xs.map((x, i) => ({ id: `${g}${i}`, group: g, x, y: 0.4, w: 42, h: WEIGHT_CANVAS + 4 }));
  const order = rng.shuffle(weights.map((_, i) => i));
  const xs = evenly(weights.length, 0.12, 0.88);
  return {
    id, name,
    hint: 'Balance the scale.',
    snapRadius: 40,
    areas: [
      { x: 0.5, y: 0.14, w: 0.34, h: 0, hPx: 64, className: 'dial' },
      { x: 0.27, y: 0.4, w: 0.44, h: 0, hPx: WEIGHT_CANVAS + 8, className: 'pan' },
      { x: 0.73, y: 0.4, w: 0.44, h: 0, hPx: WEIGHT_CANVAS + 8, className: 'pan' },
    ],
    slots: [...pan('L', lx), ...pan('R', lx.map((x) => 1 - x).reverse())],
    pieces: order.map((i, s) => ({
      id: `weight${i}`,
      svg: weight(weights[i]),
      start: { x: xs[s], y: 0.78, rot: rng.range(-5, 5) },
      props: { kg: weights[i] },
    })),
    rules: [equalSums('kg')],
    decorate: scaleNeedle,
    solution: weights.map((_, i) => ({ slot: i < k ? `L${i}` : `R${i - k}`, piece: `weight${i}` })),
  };
};
