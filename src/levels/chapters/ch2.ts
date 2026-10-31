// Chapter 2 (levels 7-20): one new idea per level, gently.
import * as L from '../../engine/lines';
import { groups, grid, row, type Spec } from '../kit';
import {
  C, bookI, candleI, coinI, cutleryI, cutterI, dieI, dominoI, eggI, jarI, mugI, potI, sockI, swatchI, tileI,
} from '../items';

const fixed = <T extends object>(it: T) => ({ ...it, rotatable: false });

const pocket = groups([3, 3], { y: 0.24, w: 36, h: 36, x0: 0.27, x1: 0.73, labels: ['8p', '8p'] });
const mixing = groups([2, 2, 2], {
  y: 0.24, w: 38, h: 42, area: 'bowl', x0: 0.2, x1: 0.8, colours: ['#cfe8c6', '#f8d7b0', '#dccbea'],
});
const PAINT = { red: '#e58f86', yellow: '#f6d38b', blue: '#8fb3e8' };
const dice = groups([2, 2, 2], { y: 0.24, w: 40, h: 40, x0: 0.18, x1: 0.82, labels: ['7', '7', '7'] });
const jars = groups([3, 3], { y: 0.25, w: 34, h: 66, x0: 0.28, x1: 0.72 });
const table = groups([3, 3], { y: 0.27, w: 26, h: 124, x0: 0.28, x1: 0.72, area: 'mat' });
const line = groups([2, 2, 2], { y: 0.22, w: 36, h: 58, x0: 0.2, x1: 0.8, area: 'line' });

export const ch2: Spec[] = [
  {
    id: 'mug-hooks', name: 'Mug Hooks', hint: 'Hang them by height.',
    slots: row(5, { y: 0.24, w: 46, h: 62, x0: 0.14, x1: 0.86 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.94, h: 0, hPx: 70, className: 'shelf' }],
    solved: [mugI(C.pink, 30), mugI(C.mint, 36), mugI(C.blue, 42), mugI(C.yellow, 48), mugI(C.lilac, 54)],
    rules: [L.whole(L.monotonic('h'))],
  },
  {
    id: 'washing-line', name: 'Washing Line', hint: 'Peg up the pairs.',
    ...line,
    solved: [
      sockI(C.pink, '#fff'), sockI(C.pink, '#fff'), sockI(C.blue), sockI(C.blue), sockI(C.mint, C.yellow), sockI(C.mint, C.yellow),
    ],
    rules: [L.everyGroup(L.same('look'))],
  },
  {
    id: 'cookie-cutters', name: 'Cookie Cutters', hint: 'Every cutter has its outline.',
    slots: [...row(3, { y: 0.14, w: 52, h: 52, x0: 0.25, x1: 0.75, id: 'a' }), ...row(2, { y: 0.32, w: 52, h: 52, x0: 0.35, x1: 0.65, id: 'b' })],
    areas: [{ x: 0.5, y: 0.23, w: 0.9, h: 0, hPx: 150, className: 'runner' }],
    solved: [
      fixed(cutterI('heart', '#d9776f')), fixed(cutterI('star', '#d8a54a')), fixed(cutterI('moon', '#7d95c9')),
      fixed(cutterI('triangle', '#6fae8f')), fixed(cutterI('leaf', '#9b84c4')),
    ],
    outlines: { keys: ['shape'] },
    rules: [L.fitsOutlines],
  },
  {
    id: 'coasters', name: 'Coasters', hint: 'Light, dark, light...',
    slots: row(6, { y: 0.25, w: 42, h: 42 }),
    areas: [{ x: 0.5, y: 0.25, w: 0.96, h: 0, hPx: 56, className: 'runner' }],
    solved: [0, 1, 0, 1, 0, 1].map((d) => tileI(d ? C.cocoa : C.cream, 'circle', 42, d ? '#d7b394' : '#fff')),
    rules: [L.whole(L.neighboursDiffer('c'))],
  },
  {
    id: 'mantelpiece', name: 'Mantelpiece', hint: 'Make it look balanced.',
    slots: row(5, { y: 0.24, w: 28, h: 98, x0: 0.2, x1: 0.8 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.8, h: 0, hPx: 104, className: 'shelf' }],
    solved: [70, 52, 34, 52, 70].map((h) => candleI(h, '#f7efe2')),
    rules: [L.whole(L.palindrome('h'))],
  },
  {
    id: 'table-for-two', name: 'Table for Two', hint: 'Lay both places.',
    ...table,
    solved: (['knife', 'fork', 'spoon', 'knife', 'fork', 'spoon'] as const).map((t) => fixed(cutleryI(t))),
    rules: [L.everyGroup(L.distinct('type'))],
  },
  {
    id: 'pocket-money', name: 'Pocket Money', hint: 'Eight pence in each jar.',
    ...pocket,
    solved: ([5, 2, 1, 5, 2, 1] as const).map((v) => coinI(v)),
    rules: [L.everyGroup(L.sumIs('v', 8))],
  },
  {
    id: 'paint-chips', name: 'Paint Chips', hint: 'One of these is not like the others.',
    slots: row(6, { y: 0.24, w: 38, h: 68 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.96, h: 0, hPx: 84, className: 'runner' }],
    solved: [86, 78, 70, 62, 54, 46].map((l, i) => ({ ...swatchI(`hsl(205 45% ${l}%)`, i), props: { rank: i, fam: 'blue' } })),
    decoys: [{ ...swatchI('hsl(25 55% 66%)', 2.5), props: { rank: 2.5, fam: 'orange' } }],
    rules: [L.all(L.whole(L.monotonic('rank')), L.whole(L.same('fam')))],
  },
  {
    id: 'spice-jars', name: 'Spice Jars', hint: 'Sort by lid.',
    ...jars,
    solved: [jarI(C.red, 40, C.cream), jarI(C.red, 58, C.mint), jarI(C.red, 50, C.blue), jarI(C.sage, 44, C.pink), jarI(C.sage, 60, C.cream), jarI(C.sage, 52, C.yellow)],
    rules: [L.everyGroup(L.same('lid'))],
  },
  {
    id: 'egg-box', name: 'Egg Box', hint: 'No two the same side by side.',
    slots: grid(2, 3, { cell: 44, y0: 0.18 }),
    areas: [{ x: 0.5, y: 0.245, w: 0.56, h: 0, hPx: 112, className: 'carton' }],
    solved: [C.cocoa, C.cream, C.cocoa, C.cream, C.cocoa, C.cream].map(eggI),
    rules: [L.noTouchingSame('c')],
  },
  {
    id: 'little-library', name: 'Little Library', hint: 'Not by colour this time.',
    slots: row(6, { y: 0.27, w: 34, h: 134, x0: 0.14, x1: 0.86 }),
    areas: [{ x: 0.5, y: 0.27, w: 0.9, h: 0, hPx: 138, className: 'shelf' }],
    solved: [[200, 96], [20, 102], [120, 108], [300, 114], [60, 120], [250, 126]].map(([hue, h]) => bookI(hue, h, 28)),
    rules: [L.whole(L.monotonic('h'))],
  },
  {
    id: 'domino-run', name: 'Domino Run', hint: 'One domino is left over.',
    slots: row(4, { y: 0.24, w: 58, h: 32, x0: 0.17, x1: 0.83 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.94, h: 0, hPx: 56, className: 'runner' }],
    solved: [dominoI(2, 4), dominoI(4, 1), dominoI(1, 6), dominoI(6, 3)],
    decoys: [dominoI(5, 5)],
    turn: true,
    snapRadius: 40,
    rules: [L.chainedEnds()],
  },
  {
    id: 'paint-mixing', name: 'Paint Mixing', hint: 'Each bowl wants a colour.',
    ...mixing,
    solved: [PAINT.blue, PAINT.yellow, PAINT.red, PAINT.yellow, PAINT.red, PAINT.blue].map(potI),
    rules: [L.all(
      L.groupAt('g0', L.holds('c', [PAINT.blue, PAINT.yellow])),
      L.groupAt('g1', L.holds('c', [PAINT.red, PAINT.yellow])),
      L.groupAt('g2', L.holds('c', [PAINT.red, PAINT.blue])),
    )],
  },
  {
    id: 'dice-pairs', name: 'Dice Pairs', hint: 'Each pair adds to seven.',
    ...dice,
    solved: [1, 6, 2, 5, 3, 4].map(dieI),
    decoys: [dieI(3), dieI(6)],
    rules: [L.everyGroup(L.sumIs('n', 7))],
  },
];
