// Books sorted into a colour gradient. Harder = more books, closer hues.
import { orderedEitherWay } from '../../engine/rules';
import { BOOK_CANVAS, book } from '../art';
import type { Family } from './family';
import { evenly, fitWidth } from './layout';
import { lerp } from './rng';

export const booksFamily: Family = ({ rng, d, id, name }) => {
  const n = 5 + Math.round(d * 3);              // 5..8 books
  const span = lerp(260, 140, d);               // hue range covered
  const hue0 = rng.range(0, 360);
  const xs = evenly(n, 0.14, 0.86);
  const width = fitWidth(xs[1] - xs[0], 32, 5);
  const order = rng.shuffle(xs.map((_, i) => i));
  return {
    id, name,
    hint: 'Make the shelf feel calm.',
    snapRadius: 36,
    areas: [{ x: 0.5, y: 0.3, w: 0.9, h: 0, hPx: BOOK_CANVAS + 8, className: 'shelf' }],
    slots: xs.map((x, i) => ({ id: `spot${i}`, x, y: 0.3, w: width + 6, h: BOOK_CANVAS + 4 })),
    pieces: order.map((i, k) => ({
      id: `book${i}`,
      // Rank (not raw hue) is what's sorted, so gradients may wrap past red.
      svg: book((hue0 + (span * i) / (n - 1)) % 360, rng.int(92, 126), width),
      start: { x: xs[k], y: 0.76, rot: rng.range(-9, 9) },
      props: { rank: i },
    })),
    rules: orderedEitherWay('rank'),
    solution: xs.map((_, i) => ({ slot: `spot${i}`, piece: `book${i}` })),
  };
};
