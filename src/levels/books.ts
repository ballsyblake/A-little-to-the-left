// Level 2: six books on a shelf, sorted into a colour (hue) gradient,
// left-to-right either way. Heights vary but don't matter: a red herring.
import { orderedEitherWay } from '../engine/rules';
import type { LevelConfig } from '../engine/types';
import { BOOK_CANVAS, book } from './art';

const HUES = [0, 30, 55, 120, 195, 260];      // red -> purple
const HEIGHTS = [104, 122, 96, 116, 125, 108]; // deliberately unrelated to hue
const START_ORDER = [3, 0, 5, 1, 4, 2];        // scrambled hue indices
const TILTS = [-8, 5, -3, 9, -6, 4];

const SHELF_Y = 0.3;
const slotX = (i: number) => 0.17 + i * 0.132;

export const books: LevelConfig = {
  id: 'books',
  name: 'Bookshelf',
  hint: 'Make the shelf feel calm.',
  snapRadius: 40,
  areas: [{ x: 0.5, y: SHELF_Y, w: 0.9, h: 0, hPx: BOOK_CANVAS + 8, className: 'shelf' }],
  // Listed left-to-right: rules read slots in this order.
  slots: HUES.map((_, i) => ({ id: `spot${i}`, x: slotX(i), y: SHELF_Y, w: 38, h: BOOK_CANVAS + 4 })),
  pieces: START_ORDER.map((i, k) => ({
    id: `book${i}`,
    svg: book(HUES[i], HEIGHTS[i]),
    start: { x: slotX(k), y: 0.76, rot: TILTS[k] },
    props: { hue: HUES[i] },
  })),
  rules: orderedEitherWay('hue'),
};
