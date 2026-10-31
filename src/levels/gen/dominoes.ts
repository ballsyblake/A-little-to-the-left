// Dominoes chained end to end. The generator lays a valid chain, then
// shuffles and flips tiles. Any other valid chain also counts.
import { chainedEnds } from '../../engine/rules';
import { domino } from '../art';
import type { Family } from './family';

export const dominoesFamily: Family = ({ rng, d, id, name }) => {
  const n = d < 0.5 ? 3 : 4;
  // Chain values v0..vn with no repeats next to each other or as a tile.
  let values: number[];
  do {
    values = [rng.int(1, 6)];
    while (values.length <= n) {
      const v = rng.int(1, 6);
      if (v !== values[values.length - 1]) values.push(v);
    }
  } while (new Set(values.slice(0, -1).map((v, i) => [v, values[i + 1]].sort().join())).size < n);
  const tiles = values.slice(0, -1).map((v, i) => ({ id: `domino${i}`, l: v, r: values[i + 1] }));
  const order = rng.shuffle(tiles);
  const flipped = order.map(() => rng.next() < 0.5);
  flipped[rng.int(0, n - 1)] = true;
  const spots = n === 3
    ? [{ x: 0.3, y: 0.62 }, { x: 0.7, y: 0.64 }, { x: 0.5, y: 0.84 }]
    : [{ x: 0.3, y: 0.62 }, { x: 0.7, y: 0.6 }, { x: 0.32, y: 0.82 }, { x: 0.68, y: 0.84 }];
  const xs = n === 3 ? [0.25, 0.5, 0.75] : [0.17, 0.39, 0.61, 0.83];
  return {
    id, name,
    hint: 'Match the touching ends. Tap to flip.',
    snapRadius: 40,
    areas: [{ x: 0.5, y: 0.3, w: 0.94, h: 0, hPx: 56, className: 'runner' }],
    slots: xs.map((x, i) => ({ id: `d${i}`, x, y: 0.3, w: 60, h: 32 })),
    pieces: order.map((t, k) => ({
      id: t.id,
      svg: domino(t.l, t.r),
      start: { ...spots[k], rot: (flipped[k] ? 180 : 0) + rng.range(-6, 6) },
      props: { left: t.l, right: t.r },
      rotatable: true,
      rotateStep: 180,
    })),
    rules: [chainedEnds()],
    solution: tiles.map((t, i) => ({ slot: `d${i}`, piece: t.id, rotation: 0 })),
  };
};
