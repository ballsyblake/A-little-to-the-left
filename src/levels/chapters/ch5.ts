// Chapter 5 (levels 61-80): combinations. Two rules at once, puzzles that
// need turning AND placing, loops, and a few classic logic grids.
import * as L from '../../engine/lines';
import type { SlotDef } from '../../engine/types';
import { circle, groups, grid, row, type Item, type Spec } from '../kit';
import {
  C, blockI, candleI, cardI, coinI, cupI, dominoI, jarI, magnetI, photoI, polyI, potI, sockI, stampI, stoneI, tileI,
} from '../items';
import type { Shape } from '../objects';

const cells = <T,>(rows: T[][], make: (v: T, r: number, c: number) => Item): Item[] =>
  rows.flatMap((r, i) => r.map((v, j) => make(v, i, j)));
const at = (cols: number) => (r: number, c: number) => r * cols + c;
const i4 = at(4);
// Elsewhere, `given` lists plain row-major cell indices (0 = top-left).

const hueSock = (colour: string, hue: number, stripe?: string) => {
  const s = sockI(colour, stripe);
  return { ...s, props: { ...s.props, hue } };
};

/** Row/column target tags beside a grid. */
function targets(slots: SlotDef[], rowsT: number[], colsT: number[]) {
  const xs = [...new Set(slots.map((s) => s.x))].sort((a, b) => a - b);
  const ys = [...new Set(slots.map((s) => s.y))].sort((a, b) => a - b);
  const dy = ys[1] - ys[0];
  return [
    ...rowsT.map((t, r) => ({ x: Math.min(0.93, xs[xs.length - 1] + 0.15), y: ys[r], w: 0.1, h: 0, hPx: 26, className: 'tag', label: String(t) })),
    ...colsT.map((t, c) => ({ x: xs[c], y: ys[0] - dy * 0.72, w: 0.1, h: 0, hPx: 26, className: 'tag', label: String(t) })),
  ];
}
const sums = (rowsT: number[], colsT: number[], prop = 'n') =>
  L.all(...rowsT.map((t, r) => L.rowAt(r, L.sumIs(prop, t))), ...colsT.map((t, c) => L.colAt(c, L.sumIs(prop, t))));

const PAINT = { red: '#e58f86', yellow: '#f6d38b', blue: '#8fb3e8' };
const SYMS: Shape[] = ['heart', 'star', 'moon', 'drop'];
const SYM_COL = ['#e58f86', '#d8a54a', '#7d95c9', '#6fa8c9'];

const SHAPE = {
  L: [[0, 0], [0, 1], [0, 2], [1, 2]] as [number, number][],
  J: [[1, 0], [1, 1], [1, 2], [0, 2]] as [number, number][],
  T: [[0, 0], [1, 0], [2, 0], [1, 1]] as [number, number][],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]] as [number, number][],
  O: [[0, 0], [1, 0], [0, 1], [1, 1]] as [number, number][],
  I: [[0, 0], [1, 0], [2, 0]] as [number, number][],
};

const g23 = grid(2, 3, { cell: 44, y0: 0.18 });
const g3k = grid(3, 3, { cell: 46, y0: 0.16 });
const envTop = groups([2, 2], { y: 0.13, w: 40, h: 46, x0: 0.28, x1: 0.72, area: 'envelope', labels: ['5', '7'] });
const envBottom = groups([2, 2], { y: 0.37, w: 40, h: 46, x0: 0.28, x1: 0.72, area: 'envelope', labels: ['9', '12'], start: 2 });
const mixTop = groups([2, 2], { y: 0.14, w: 38, h: 42, area: 'bowl', x0: 0.3, x1: 0.7, colours: ['#cfe8c6', '#f8d7b0'] });
const mixBottom = groups([2, 3], { y: 0.37, w: 38, h: 42, area: 'bowl', x0: 0.25, x1: 0.7, colours: ['#dccbea', '#d9c3ad'], start: 2 });
const bags = groups([3, 3, 3], { y: 0.24, w: 44, h: 44, dir: 'col', x0: 0.2, x1: 0.8, labels: ['23p', '17p', '40p'] });

// Stepping stones laid as a snake: left to right, then back right to left.
const snake: SlotDef[] = [
  ...row(4, { y: 0.15, w: 46, h: 40, x0: 0.16, x1: 0.84, id: 'a' }),
  ...row(4, { y: 0.33, w: 46, h: 40, x0: 0.16, x1: 0.84, id: 'b' }).reverse(),
];

// A plus-shaped cross of 9 cells: across is row 2, down is column 2.
const crossSlots: SlotDef[] = [
  ...[0, 1, 3, 4].map((r) => ({ id: `d${r}`, row: r, col: 2, x: 0.5, y: 0.07 + r * 0.118, w: 40, h: 40 })),
  ...[0, 1, 2, 3, 4].map((c) => ({ id: `a${c}`, row: 2, col: c, x: 0.5 + (c - 2) * 0.153, y: 0.07 + 2 * 0.118, w: 40, h: 40 })),
];
const ACROSS = ['a0', 'a1', 'a2', 'a3', 'a4'];
const DOWN = ['d0', 'd1', 'a2', 'd3', 'd4'];

export const ch5: Spec[] = [
  {
    id: 'rainbow-socks', name: 'Rainbow Socks', hint: 'Pairs in columns, top row in rainbow order.',
    slots: grid(2, 4, { cell: 40, h: 60, y0: 0.13 }),
    solved: [...[[C.pink, 10], [C.yellow, 50], [C.mint, 150], [C.blue, 220]], ...[[C.pink, 10], [C.yellow, 50], [C.mint, 150], [C.blue, 220]]]
      .map(([c, h]) => hueSock(c as string, h as number)),
    decoys: [hueSock(C.lilac, 280), hueSock(C.peach, 30, '#fff')],
    rules: [L.all(L.everyCol(L.same('look')), L.rowAt(0, L.monotonic('hue')))],
  },
  {
    id: 'solitaire-ii', name: 'Solitaire II', hint: 'Rows go down, red and black. Columns match.',
    slots: grid(2, 4, { cell: 44, h: 56, y0: 0.14 }),
    solved: [cardI(8, 'S'), cardI(7, 'H'), cardI(6, 'C'), cardI(5, 'D'), cardI(8, 'D'), cardI(7, 'C'), cardI(6, 'H'), cardI(5, 'S')],
    decoys: [cardI(7, 'S')],
    rules: [L.all(
      L.everyRow(L.monotonic('rank')), L.everyRow(L.neighboursDiffer('red')),
      L.everyCol(L.same('rank')), L.everyCol(L.distinct('red')),
    )],
  },
  {
    id: 'stamp-sheet', name: 'Stamp Sheet', hint: 'Rows and columns add to their numbers.',
    slots: g23,
    areas: targets(g23, [11, 10], [6, 6, 9]),
    solved: cells([[1, 4, 6], [5, 2, 3]], (v) => stampI(v, [C.pink, C.mint, C.blue, C.yellow, C.lilac, C.peach][v - 1])),
    given: [0],
    rules: [sums([11, 10], [6, 6, 9], 'v')],
    unique: true,
  },
  {
    id: 'four-envelopes', name: 'Four Envelopes', hint: 'Pay each postage exactly.',
    slots: [...envTop.slots, ...envBottom.slots],
    areas: [...envTop.areas, ...envBottom.areas],
    solved: [[1, C.mint], [4, C.blue], [3, C.pink], [4, C.blue], [2, C.yellow], [7, C.lilac], [5, C.peach], [7, C.lilac]].map(([v, c]) => stampI(v as number, c as string)),
    rules: [L.all(
      L.groupAt('g0', L.sumIs('v', 5)), L.groupAt('g1', L.sumIs('v', 7)),
      L.groupAt('g2', L.sumIs('v', 9)), L.groupAt('g3', L.sumIs('v', 12)),
    )],
  },
  {
    id: 'stepping-stones-ii', name: 'Stepping Stones II', hint: 'Follow the path. Each step is one up or down.',
    slots: snake,
    areas: [{ x: 0.5, y: 0.24, w: 0.94, h: 0, hPx: 120, className: 'stream' }],
    solved: [1, 2, 3, 4, 5, 4, 3, 2].map(stoneI),
    given: [0],
    rules: [L.whole(L.steps('n', 1))],
  },
  {
    id: 'word-square-iii', name: 'Word Square III', hint: 'Across and down: CARD, AREA, REAR, DART.',
    slots: grid(4, 4, { cell: 42, y0: 0.08 }),
    solved: cells([[...'CARD'], [...'AREA'], [...'REAR'], [...'DART']], (l) => magnetI(l, C.peach, 40)),
    given: [i4(0, 0), i4(1, 1), i4(2, 2), i4(3, 3), i4(0, 3)],
    rules: [L.all(L.everyRow(L.spells('l', ['CARD', 'AREA', 'REAR', 'DART'])), L.everyCol(L.spells('l', ['CARD', 'AREA', 'REAR', 'DART'])))],
    unique: true,
  },
  {
    id: 'quilt-iii', name: 'Quilt III', hint: 'No two alike may touch, not even at the corners.',
    slots: grid(4, 4, { cell: 42, y0: 0.08 }),
    solved: cells([[0, 1, 0, 1], [2, 3, 2, 3], [0, 1, 0, 1], [2, 3, 2, 3]], (i) => tileI([C.pink, C.mint, C.blue, C.yellow][i], undefined, 40)),
    given: [0, 1, 4, 5, 10, 15],
    rules: [L.noTouchingSame('c', true)],
    unique: true,
  },
  {
    id: 'seating-plan-iii', name: 'Seating Plan III', hint: 'Couples opposite. Big and small cups take turns.',
    slots: circle(8, { cy: 0.29, r: 88, w: 46, h: 38 }),
    areas: [{ x: 0.5, y: 0.29, w: 0.46, h: 0, hPx: 120, className: 'table' }],
    solved: [[C.pink, 1], [C.mint, 0], [C.blue, 1], [C.yellow, 0], [C.pink, 1], [C.mint, 0], [C.blue, 1], [C.yellow, 0]].map(([c, b]) => cupI(c as string, !!b)),
    given: [0, 1],
    rules: [L.all(L.loopNeighboursDiffer('c'), L.oppositeSame('c'), L.loopNeighboursDiffer('big'))],
    unique: true,
  },
  {
    id: 'tile-sudoku-ii', name: 'Tile Sudoku II', hint: 'Rows, columns and each 2x2 corner: one of each.',
    slots: grid(4, 4, { cell: 42, y0: 0.08 }),
    solved: cells([[1, 3, 0, 2], [0, 2, 1, 3], [3, 1, 2, 0], [2, 0, 3, 1]], (i) => tileI('#fffaf3', SYMS[i], 40, SYM_COL[i])),
    given: [0, 7, 9, 14, 2, 4],
    rules: [L.all(L.everyRow(L.distinct('sym')), L.everyCol(L.distinct('sym')), L.everyBox(2, L.distinct('sym')))],
    unique: true,
  },
  {
    id: 'kakuro-ii', name: 'Kakuro II', hint: 'Rows and columns add to their numbers.',
    slots: g3k,
    areas: targets(g3k, [12, 17, 16], [16, 14, 15]),
    solved: cells([[3, 8, 1], [6, 2, 9], [7, 4, 5]], (n) => blockI(n, C.cream)),
    given: [4, 1],
    rules: [sums([12, 17, 16], [16, 14, 15])],
    unique: true,
  },
  {
    id: 'cross-sums', name: 'Cross Sums', hint: 'Across and down both add to 25, and both climb.',
    slots: crossSlots,
    // solved[] follows crossSlots order: d0, d1, d3, d4, then a0..a4.
    // Down 2,3,5,6,9 and across 1,4,5,7,8: both total 25 and climb.
    solved: [2, 3, 6, 9, 1, 4, 5, 7, 8].map((n) => blockI(n, C.sage, 40)),
    rules: [L.all(
      L.slotsLine(ACROSS, L.sumIs('n', 25)), L.slotsLine(DOWN, L.sumIs('n', 25)),
      L.slotsLine(ACROSS, L.increasing('n')), L.slotsLine(DOWN, L.increasing('n')),
    )],
  },
  {
    id: 'pegboard-ii', name: 'Pegboard II', hint: 'One piece is a mirror image. It does not fit.',
    slots: [...row(3, { y: 0.13, w: 54, h: 54, x0: 0.22, x1: 0.78, id: 'a' }), ...row(2, { y: 0.32, w: 54, h: 54, x0: 0.36, x1: 0.64, id: 'b' })],
    areas: [{ x: 0.5, y: 0.225, w: 0.92, h: 0, hPx: 150, className: 'pegboard' }],
    solved: [
      polyI('L', SHAPE.L, '#e9a3b8', 270), polyI('T', SHAPE.T, '#8fcfcf', 90), polyI('S', SHAPE.S, '#f6d38b', 90, 180),
      polyI('O', SHAPE.O, '#b9c6ef', 0, 90), polyI('I', SHAPE.I, '#d9c2ea', 90, 180),
    ],
    decoys: [polyI('J', SHAPE.J, '#e9a3b8')],
    outlines: { keys: ['shape'], rotation: true },
    turn: true,
    rules: [L.fitsOutlines],
  },
  {
    id: 'photo-puzzle', name: 'Photo Puzzle', hint: 'Put the picture back together. Tap to turn.',
    slots: grid(2, 2, { cell: 66, gap: 2, y0: 0.17 }),
    areas: [{ x: 0.5, y: 0.26, w: 0.52, h: 0, hPx: 150, className: 'frame' }],
    solved: cells([[0, 1], [2, 3]], (_, r, c) => photoI(r, c, 2, 66, 'house')),
    outlines: { keys: ['cell'], rotation: true, ghost: false },
    turn: true,
    rules: [L.fitsOutlines],
  },
  {
    id: 'paint-mixing-ii', name: 'Paint Mixing II', hint: 'Brown takes all three.',
    slots: [...mixTop.slots, ...mixBottom.slots],
    areas: [...mixTop.areas, ...mixBottom.areas],
    solved: [PAINT.blue, PAINT.yellow, PAINT.red, PAINT.yellow, PAINT.red, PAINT.blue, PAINT.red, PAINT.yellow, PAINT.blue].map(potI),
    rules: [L.all(
      L.groupAt('g0', L.holds('c', [PAINT.blue, PAINT.yellow])), L.groupAt('g1', L.holds('c', [PAINT.red, PAINT.yellow])),
      L.groupAt('g2', L.holds('c', [PAINT.red, PAINT.blue])), L.groupAt('g3', L.holds('c', [PAINT.red, PAINT.yellow, PAINT.blue])),
    )],
  },
  {
    id: 'bank-run', name: 'Bank Run', hint: 'Fill each bag exactly. Three coins are spare.',
    ...bags,
    solved: ([20, 2, 1, 10, 5, 2, 20, 10, 10] as const).map((v) => coinI(v)),
    decoys: ([5, 1, 50] as const).map((v) => coinI(v)),
    rules: [L.all(L.groupAt('g0', L.sumIs('v', 23)), L.groupAt('g1', L.sumIs('v', 17)), L.groupAt('g2', L.sumIs('v', 40)))],
  },
  {
    id: 'domino-circle', name: 'Domino Circle', hint: 'A chain whose ends meet too.',
    slots: row(4, { y: 0.24, w: 58, h: 32, x0: 0.17, x1: 0.83 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.94, h: 0, hPx: 56, className: 'runner' }],
    solved: [dominoI(1, 3), dominoI(3, 5), dominoI(5, 2), dominoI(2, 1)],
    decoys: [dominoI(4, 6), dominoI(6, 2)],
    turn: true,
    snapRadius: 40,
    rules: [L.chainedEnds('left', 'right', true)],
  },
  {
    id: 'card-sudoku', name: 'Card Sudoku', hint: 'Rows and columns: every suit once, every number once.',
    slots: grid(3, 3, { cell: 42, h: 56, y0: 0.11 }),
    solved: cells([[[1, 'S'], [2, 'H'], [3, 'C']], [[2, 'C'], [3, 'S'], [1, 'H']], [[3, 'H'], [1, 'C'], [2, 'S']]] as [number, 'S' | 'H' | 'C'][][], ([r, s]) => cardI(r, s)),
    given: [0, 1, 3],
    rules: [L.all(L.everyRow(L.distinct('suit')), L.everyCol(L.distinct('suit')), L.everyRow(L.distinct('rank')), L.everyCol(L.distinct('rank')))],
    unique: true,
  },
  {
    id: 'candle-rows', name: 'Candle Rows', hint: 'Each shelf rises then falls. Columns share a colour.',
    slots: [...row(4, { y: 0.14, w: 30, h: 98, x0: 0.2, x1: 0.8, id: 'a' }), ...row(4, { y: 0.4, w: 30, h: 98, x0: 0.2, x1: 0.8, id: 'b' })]
      .map((s, i) => ({ ...s, row: Math.floor(i / 4), col: i % 4 })),
    areas: [{ x: 0.5, y: 0.27, w: 0.78, h: 0, hPx: 196, className: 'cupboard' }],
    solved: [[30, C.rose], [58, C.peach], [72, C.sky], [44, C.sage], [37, C.rose], [65, C.peach], [51, C.sky], [30, C.sage]].map(([h, c]) => candleI(h as number, c as string)),
    rules: [L.all(L.everyRow(L.peaked('h')), L.everyCol(L.same('c')))],
  },
  {
    id: 'spice-grid', name: 'Spice Grid', hint: 'Lids: one of each per row and column. Jars grow right and down.',
    slots: grid(3, 3, { cell: 40, h: 66, y0: 0.1 }),
    solved: cells([[30, 34, 40], [36, 44, 50], [42, 52, 60]], (h, r, c) => jarI([C.pink, C.sage, C.blue][(r + c) % 3], h)),
    given: [2, 1, 4, 5],
    rules: [L.all(
      L.everyRow(L.distinct('lid')), L.everyCol(L.distinct('lid')),
      L.everyRow(L.increasing('h')), L.everyCol(L.increasing('h')),
    )],
    unique: true,
  },
  {
    id: 'two-tone-tiles', name: 'Two-Tone Tiles', hint: 'Two of each per line, never three in a row, no lines alike.',
    slots: grid(4, 4, { cell: 42, y0: 0.08 }),
    solved: cells([[0, 1, 1, 0], [1, 0, 0, 1], [0, 0, 1, 1], [1, 1, 0, 0]], (d) => tileI(d ? C.cocoa : C.cream, undefined, 40)),
    given: [0, 6, 11, 13, 1],
    rules: [L.all(
      L.everyRow(L.countIs('c', C.cocoa, 2)), L.everyCol(L.countIs('c', C.cocoa, 2)),
      L.everyRow(L.noRunOf3('c')), L.everyCol(L.noRunOf3('c')),
      L.rowsDiffer('c'), L.colsDiffer('c'),
    )],
    unique: true,
  },
];
