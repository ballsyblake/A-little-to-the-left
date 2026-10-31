// Paint chips of one colour, sorted light to dark. Harder = more chips,
// smaller lightness steps.
import { orderedEitherWay } from '../../engine/rules';
import { swatch } from '../art';
import type { Family } from './family';
import { evenly, fitWidth } from './layout';
import { lerp } from './rng';

export const swatchesFamily: Family = ({ rng, d, id, name }) => {
  const n = 4 + Math.round(d * 3);              // 4..7 chips
  const hue = rng.range(0, 360);
  const sat = rng.range(35, 60);
  const span = lerp(46, 28, d);                 // lightness range in %
  const lights = Array.from({ length: n }, (_, i) => 88 - (span * i) / (n - 1));
  const xs = evenly(n, 0.14, 0.86);
  const w = fitWidth(xs[1] - xs[0], 42);
  const order = rng.shuffle(lights.map((_, i) => i));
  return {
    id, name,
    hint: 'Light to dark, or dark to light.',
    snapRadius: 36,
    areas: [{ x: 0.5, y: 0.3, w: 0.94, h: 0, hPx: 84, className: 'runner' }],
    slots: xs.map((x, i) => ({ id: `chip${i}`, x, y: 0.3, w: w + 4, h: 68 })),
    pieces: order.map((i, k) => ({
      id: `swatch${i}`,
      svg: swatch(`hsl(${Math.round(hue)} ${Math.round(sat)}% ${lights[i].toFixed(1)}%)`, w),
      start: { x: xs[k], y: 0.74, rot: rng.range(-8, 8) },
      props: { rank: i },
    })),
    rules: orderedEitherWay('rank'),
    solution: xs.map((_, i) => ({ slot: `chip${i}`, piece: `swatch${i}` })),
  };
};
