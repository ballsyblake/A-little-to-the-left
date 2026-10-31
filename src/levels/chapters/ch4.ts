// Chapter 4 (levels 41-60): grids. Rows and columns start to matter:
// no two alike touching, every row different, magic sums, word squares.
import * as L from '../../engine/lines';
import type { AreaDef, SlotDef } from '../../engine/types';
import { circle, groups, grid, type Item, type Spec } from '../kit';
import { C, blockI, cardI, coinI, cupI, dieI, jarI, magnetI, tileI } from '../items';
import type { Shape } from '../objects';

/** Fill a grid's slots (row-major) from a 2D answer. */
const cells = <T,>(rows: T[][], make: (v: T) => Item): Item[] => rows.flat().map(make);

/** Index of (r, c) in a row-major grid with `cols` columns. */
const at = (cols: number) => (r: number, c: number) => r * cols + c;

/** Small text labels beside a 3x3 grid: row targets on the right, column targets on top. */
function targets(slots: SlotDef[], rowsT: number[], colsT: number[]): AreaDef[] {
  const xs = [...new Set(slots.map((s) => s.x))].sort((a, b) => a - b);
  const ys = [...new Set(slots.map((s) => s.y))].sort((a, b) => a - b);
  const dy = ys[1] - ys[0];
  return [
    ...rowsT.map((t, r) => ({ x: xs[xs.length - 1] + 0.15, y: ys[r], w: 0.1, h: 0, hPx: 26, className: 'tag', label: String(t) })),
    ...colsT.map((t, c) => ({ x: xs[c], y: ys[0] - dy * 0.72, w: 0.1, h: 0, hPx: 26, className: 'tag', label: String(t) })),
  ];
}

const TONES = [C.pink, C.mint, C.blue, C.yellow];
const SYMS: Shape[] = ['heart', 'star', 'moon', 'drop'];
const SYM_COL = ['#e58f86', '#d8a54a', '#7d95c9', '#6fa8c9'];
const symTile = (i: number) => tileI('#fffaf3', SYMS[i], 40, SYM_COL[i]);
const colourTile = (i: number) => tileI(TONES[i], undefined, 40);

const lines3 = (t: number) => L.all(L.everyRow(L.sumIs('n', t)), L.everyCol(L.sumIs('n', t)));
const latin = (prop: string) => L.all(L.everyRow(L.distinct(prop)), L.everyCol(L.distinct(prop)));

const g3 = grid(3, 3, { cell: 46, y0: 0.12 });
const g3low = grid(3, 3, { cell: 46, y0: 0.16 });
const g4 = grid(4, 4, { cell: 42, y0: 0.08 });
const g23 = grid(2, 3, { cell: 46, y0: 0.16 });
const shop = groups([3, 3, 3], { y: 0.24, w: 38, h: 38, dir: 'col', x0: 0.2, x1: 0.8, labels: ['16p', '25p', '31p'] });

const KAKURO = [[1, 5, 9], [8, 3, 2], [4, 7, 6]];
const MAGIC = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
const SUDOKU = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
const i3 = at(3);
const i4 = at(4);

export const ch4: Spec[] = [
  {
    id: 'chequers', name: 'Chequers', hint: 'No two alike may touch.',
    slots: g3,
    solved: cells([[1, 0, 1], [0, 1, 0], [1, 0, 1]], (d) => tileI(d ? C.cocoa : C.cream, undefined, 42)),
    rules: [L.noTouchingSame('c')],
    unique: true,
  },
  {
    id: 'coaster-square', name: 'Coaster Square', hint: 'Each row and column: one of each.',
    slots: g3,
    solved: cells([[0, 1, 2], [1, 2, 0], [2, 0, 1]], colourTile),
    given: [i3(0, 0), i3(1, 0), i3(2, 2)],
    rules: [latin('c')],
    unique: true,
  },
  {
    id: 'number-blocks', name: 'Number Blocks', hint: 'Bigger to the right, bigger going down.',
    slots: g23,
    solved: cells([[1, 2, 3], [4, 5, 6]], (n) => blockI(n)),
    rules: [L.all(L.everyRow(L.increasing('n')), L.everyCol(L.increasing('n')))],
  },
  {
    id: 'pantry-grid', name: 'Pantry Grid', hint: 'One lid per shelf. Each column grows going down.',
    slots: grid(3, 3, { cell: 40, h: 66, y0: 0.1 }),
    solved: [[30, 44, 56], [36, 48, 60], [40, 52, 62]].flatMap((hs, r) => hs.map((h) => jarI([C.pink, C.sage, C.blue][r], h))),
    rules: [L.all(L.everyRow(L.same('lid')), L.everyCol(L.increasing('h')))],
  },
  {
    id: 'lo-shu', name: 'Lo Shu', hint: 'Every row, column and diagonal adds to 15.',
    slots: g3,
    solved: cells(MAGIC, (n) => blockI(n)),
    given: [i3(0, 0), i3(0, 1), i3(1, 1)],
    rules: [L.all(lines3(15), L.diagonals(L.sumIs('n', 15)))],
    unique: true,
  },
  {
    id: 'quilt', name: 'Quilt', hint: 'No two alike may touch.',
    slots: g3,
    solved: cells([[0, 1, 2], [2, 0, 1], [1, 2, 0]], colourTile),
    given: [i3(0, 0), i3(1, 1), i3(0, 2), i3(2, 0)],
    rules: [L.noTouchingSame('c')],
    unique: true,
  },
  {
    id: 'tile-sudoku', name: 'Tile Sudoku', hint: 'Each row and column: one of each.',
    slots: g4,
    solved: cells(SUDOKU, symTile),
    given: [i4(0, 0), i4(0, 3), i4(1, 1), i4(1, 2), i4(2, 0), i4(2, 3), i4(3, 1)],
    rules: [latin('sym')],
    unique: true,
  },
  {
    id: 'word-square', name: 'Word Square', hint: 'Words across and down: CAT, ARE, TEN.',
    slots: grid(3, 3, { cell: 48, y0: 0.13 }),
    solved: cells([[...'CAT'], [...'ARE'], [...'TEN']], (l) => magnetI(l, C.yellow, 44)),
    given: [i3(1, 1)],
    rules: [L.all(L.everyRow(L.spells('l', ['CAT', 'ARE', 'TEN'])), L.everyCol(L.spells('l', ['CAT', 'ARE', 'TEN'])))],
    unique: true,
  },
  {
    id: 'muffin-tray', name: 'Muffin Tray', hint: 'Columns make 7. Top row climbs. Bottom row makes 15.',
    slots: g23,
    solved: cells([[1, 2, 3], [6, 5, 4]], (n) => blockI(n, C.peach)),
    rules: [L.all(L.everyCol(L.sumIs('n', 7)), L.rowAt(0, L.increasing('n')), L.rowAt(1, L.sumIs('n', 15)))],
    unique: true,
  },
  {
    id: 'seating-plan-ii', name: 'Seating Plan II', hint: 'Couples sit opposite. No matching neighbours.',
    slots: circle(8, { cy: 0.29, r: 88, w: 44, h: 36 }),
    areas: [{ x: 0.5, y: 0.29, w: 0.46, h: 0, hPx: 120, className: 'table' }],
    solved: [C.pink, C.mint, C.blue, C.yellow, C.pink, C.mint, C.blue, C.yellow].map((c) => cupI(c)),
    given: [0, 1],
    rules: [L.all(L.loopNeighboursDiffer('c'), L.oppositeSame('c'))],
  },
  {
    id: 'quilt-ii', name: 'Quilt II', hint: 'No two alike may touch.',
    slots: g4,
    solved: cells([[0, 1, 0, 2], [1, 2, 1, 0], [0, 1, 2, 1], [2, 0, 1, 0]], colourTile),
    given: [i4(0, 0), i4(0, 3), i4(1, 2), i4(2, 2), i4(3, 0), i4(3, 3)],
    rules: [L.noTouchingSame('c')],
    unique: true,
  },
  {
    id: 'lo-shu-ii', name: 'Lo Shu II', hint: 'Every row, column and diagonal adds to 15.',
    slots: g3,
    solved: cells(MAGIC, (n) => blockI(n, C.sage)),
    given: [i3(1, 2), i3(2, 2)],
    rules: [L.all(lines3(15), L.diagonals(L.sumIs('n', 15)))],
    unique: true,
  },
  {
    id: 'kakuro-tray', name: 'Kakuro Tray', hint: 'Rows and columns add to their numbers.',
    slots: g3low,
    areas: targets(g3low, [15, 13, 17], [13, 15, 17]),
    solved: cells(KAKURO, (n) => blockI(n)),
    given: [i3(0, 0), i3(1, 1), i3(1, 0)],
    rules: [L.all(
      L.rowAt(0, L.sumIs('n', 15)), L.rowAt(1, L.sumIs('n', 13)), L.rowAt(2, L.sumIs('n', 17)),
      L.colAt(0, L.sumIs('n', 13)), L.colAt(1, L.sumIs('n', 15)), L.colAt(2, L.sumIs('n', 17)),
    )],
    unique: true,
  },
  {
    id: 'word-square-ii', name: 'Word Square II', hint: 'Words across and down: BAT, ARE, TEA.',
    slots: grid(3, 3, { cell: 48, y0: 0.13 }),
    solved: cells([[...'BAT'], [...'ARE'], [...'TEA']], (l) => magnetI(l, C.mint, 44)),
    rules: [L.all(L.everyRow(L.spells('l', ['BAT', 'ARE', 'TEA'])), L.everyCol(L.spells('l', ['BAT', 'ARE', 'TEA'])))],
    unique: true,
  },
  {
    id: 'mini-sudoku', name: 'Mini Sudoku', hint: 'Rows, columns and each 2x2 corner: one of each.',
    slots: g4,
    areas: [0, 1].flatMap((br) => [0, 1].map((bc) => ({ x: 0.5 + (bc - 0.5) * 0.329, y: 0.08 + (br * 2 + 0.5) * 0.124, w: 0.32, h: 0, hPx: 94, className: 'box' }))),
    solved: cells(SUDOKU, colourTile),
    given: [i4(0, 1), i4(1, 3), i4(2, 0), i4(3, 2), i4(1, 0), i4(0, 3), i4(2, 1)],
    rules: [L.all(latin('c'), L.everyBox(2, L.distinct('c')))],
    unique: true,
  },
  {
    id: 'sorted-tray', name: 'Sorted Tray', hint: 'Bigger to the right, bigger going down.',
    slots: g3,
    solved: cells([[1, 2, 5], [3, 4, 7], [6, 8, 9]], (n) => blockI(n, C.sky)),
    given: [i3(1, 1), i3(0, 2)],
    rules: [L.all(L.everyRow(L.increasing('n')), L.everyCol(L.increasing('n')))],
  },
  {
    id: 'dice-grid', name: 'Dice Grid', hint: 'Every row and column adds to 10.',
    slots: g3,
    solved: cells([[1, 3, 6], [5, 4, 1], [4, 3, 3]], dieI),
    given: [i3(0, 0), i3(1, 1), i3(2, 2)],
    rules: [L.all(L.everyRow(L.sumIs('n', 10)), L.everyCol(L.sumIs('n', 10)))],
  },
  {
    id: 'card-grid', name: 'Card Grid', hint: 'Rows share a suit, columns share a number.',
    slots: grid(3, 3, { cell: 42, h: 56, y0: 0.11 }),
    solved: cells([[[1, 'S'], [2, 'S'], [3, 'S']], [[1, 'H'], [2, 'H'], [3, 'H']], [[1, 'C'], [2, 'C'], [3, 'C']]] as [number, 'S' | 'H' | 'C'][][], ([r, s]) => cardI(r, s)),
    given: [i3(0, 0), i3(1, 1)],
    rules: [L.all(L.everyRow(L.same('suit')), L.everyCol(L.same('rank')))],
    unique: true,
  },
  {
    id: 'eulers-tiles', name: "Euler's Tiles", hint: 'Rows and columns: every colour once, every symbol once.',
    slots: g3,
    solved: cells([[[0, 0], [1, 1], [2, 2]], [[1, 2], [2, 0], [0, 1]], [[2, 1], [0, 2], [1, 0]]], ([c, s]) => tileI(TONES[c], SYMS[s], 42, '#fff')),
    given: [i3(0, 0), i3(1, 1), i3(0, 1)],
    rules: [L.all(latin('c'), latin('sym'))],
    unique: true,
  },
  {
    id: 'big-shop', name: 'Big Shop', hint: 'Each bag costs what it says.',
    ...shop,
    solved: ([10, 5, 1, 10, 10, 5, 20, 10, 1] as const).map((v) => coinI(v)),
    decoys: ([2, 50] as const).map((v) => coinI(v)),
    rules: [L.all(L.groupAt('g0', L.sumIs('v', 16)), L.groupAt('g1', L.sumIs('v', 25)), L.groupAt('g2', L.sumIs('v', 31)))],
  },
];
