// Pencils sorted by length. Harder = more pencils, smaller length steps.
import { orderedEitherWay } from '../../engine/rules';
import { pencil } from '../art';
import type { Family } from './family';
import { evenly, pastel } from './layout';
import { lerp } from './rng';

export const pencilsFamily: Family = ({ rng, d, id, name }) => {
  const n = 4 + Math.round(d * 2);                 // 4..6 pencils
  const gap = Math.round(lerp(30, 14, d));         // length step in px
  const lengths = Array.from({ length: n }, (_, i) => 240 - gap * (n - 1) + gap * i);
  const order = rng.shuffle(lengths.map((_, i) => i));
  // Slots in the top half, pencils spread over the bottom half. Long
  // pencils barely tilt: a few degrees already makes their ends overlap.
  const slotYs = evenly(n, 0.07, 0.07 + 0.072 * (n - 1));
  const startYs = evenly(n, 0.54, 0.93);
  return {
    id, name,
    hint: 'Line the pencils up.',
    snapRadius: 36,
    slots: slotYs.map((y, i) => ({ id: `row${i}`, x: 0.5, y, w: 260, h: 28 })),
    pieces: order.map((i, row) => ({
      id: `pencil${i}`,
      svg: pencil(lengths[i], pastel(rng.range(0, 360))),
      start: { x: rng.range(0.44, 0.56), y: startYs[row], rot: rng.range(-3, 3) },
      props: { length: lengths[i] },
    })),
    rules: orderedEitherWay('length'),
    solution: lengths.map((_, i) => ({ slot: `row${i}`, piece: `pencil${i}` })),
  };
};
