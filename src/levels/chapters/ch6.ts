// Chapter 6 (levels 81-100): the hardest. Bigger grids, fewer givens,
// several rules at once. `given` lists row-major cell indices (0 = top-left).
import * as L from '../../engine/lines';
import type { SlotDef } from '../../engine/types';
import { circle, groups, grid, row, type Item, type Spec } from '../kit';
import { C, blockI, cardI, coinI, dieI, magnetI, photoI, polyI, potI, stampI, stoneI, tileI, weightI } from '../items';
import type { Shape } from '../objects';

const cells = <T,>(rows: T[][], make: (v: T, r: number, c: number) => Item): Item[] =>
  rows.flatMap((r, i) => r.map((v, j) => make(v, i, j)));

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
const latin = (prop: string) => L.all(L.everyRow(L.distinct(prop)), L.everyCol(L.distinct(prop)));

const TONES = [C.pink, C.mint, C.blue, C.yellow];
const SYMS: Shape[] = ['heart', 'star', 'moon', 'drop'];
const PAINT = { red: '#e58f86', yellow: '#f6d38b', blue: '#8fb3e8', white: '#ffffff' };

// Two orthogonal 4x4 Latin squares. The second pair also has all-different
// diagonals and 2x2 boxes, which the hardest puzzles use.
const GL_A = [[0, 1, 2, 3], [1, 0, 3, 2], [2, 3, 0, 1], [3, 2, 1, 0]];
const GL_B = [[0, 1, 2, 3], [2, 3, 0, 1], [3, 2, 1, 0], [1, 0, 3, 2]];
const GD_A = [[0, 1, 2, 3], [2, 3, 0, 1], [3, 2, 1, 0], [1, 0, 3, 2]];
const GD_B = [[0, 1, 2, 3], [3, 2, 1, 0], [1, 0, 3, 2], [2, 3, 0, 1]];
const pair = (a: number[][], b: number[][]) => a.map((r, i) => r.map((v, j) => [v, b[i][j]] as [number, number]));

const SHAPE = {
  L: [[0, 0], [0, 1], [0, 2], [1, 2]] as [number, number][],
  J: [[1, 0], [1, 1], [1, 2], [0, 2]] as [number, number][],
  P: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] as [number, number][],
  Q: [[0, 0], [1, 0], [0, 1], [1, 1], [1, 2]] as [number, number][],
  U: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] as [number, number][],
  T: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] as [number, number][],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]] as [number, number][],
};

const g3 = grid(3, 3, { cell: 46, y0: 0.16 });
const g4 = grid(4, 4, { cell: 42, y0: 0.08 });
const vault = groups([3, 3, 3, 3], { y: 0.25, w: 44, h: 44, dir: 'col', x0: 0.14, x1: 0.86, labels: ['8p', '22p', '35p', '60p'] });
const scaleA = groups([2, 2], { y: 0.16, w: 40, h: 56, x0: 0.28, x1: 0.72, area: 'pan' });
const scaleB = groups([2, 2], { y: 0.42, w: 40, h: 56, x0: 0.28, x1: 0.72, area: 'pan', start: 2 });
const mixTop = groups([2, 2, 2], { y: 0.14, w: 38, h: 42, gap: 3, x0: 0.17, x1: 0.83, area: 'bowl', colours: ['#cfe8c6', '#f8d7b0', '#dccbea'] });
const mixBottom = groups([2, 2], { y: 0.37, w: 38, h: 42, area: 'bowl', x0: 0.3, x1: 0.7, colours: ['#f6d0d6', '#d4e7f5'], start: 3 });

const magic = L.all(L.everyRow(L.sumIs('n', 15)), L.everyCol(L.sumIs('n', 15)), L.diagonals(L.sumIs('n', 15)));

export const ch6: Spec[] = [
  {
    id: 'magic-square', name: 'Magic Square', hint: 'Rows, columns and diagonals: 15. No help this time.',
    slots: g3,
    solved: cells([[8, 1, 6], [3, 5, 7], [4, 9, 2]], (n) => blockI(n, C.lilac)),
    rules: [magic],
  },
  {
    id: 'eulers-garden', name: "Euler's Garden", hint: 'Rows and columns: every colour once, every symbol once.',
    slots: g4,
    solved: cells(pair(GL_A, GL_B), ([c, s]) => tileI(TONES[c], SYMS[s], 40, '#fff')),
    given: [0, 2, 4, 6, 7, 10, 12],
    rules: [L.all(latin('c'), latin('sym'))],
    unique: true,
  },
  {
    id: 'word-square-iv', name: 'Word Square IV', hint: 'Across and down: STOP, TONE, ONCE, PEEL.',
    slots: g4,
    solved: cells([[...'STOP'], [...'TONE'], [...'ONCE'], [...'PEEL']], (l) => magnetI(l, C.sky, 40)),
    given: [0, 5, 10, 15],
    rules: [L.all(L.everyRow(L.spells('l', ['STOP', 'TONE', 'ONCE', 'PEEL'])), L.everyCol(L.spells('l', ['STOP', 'TONE', 'ONCE', 'PEEL'])))],
    unique: true,
  },
  {
    id: 'kakuro-hard', name: 'Kakuro Hard', hint: 'Rows and columns add to their numbers.',
    slots: g3,
    areas: targets(g3, [18, 13, 14], [15, 16, 14]),
    solved: cells([[9, 2, 7], [1, 8, 4], [5, 6, 3]], (n) => blockI(n, C.peach)),
    given: [3, 7],
    rules: [sums([18, 13, 14], [15, 16, 14])],
    unique: true,
  },
  {
    id: 'round-steps', name: 'Round Steps', hint: 'All the way round, each step is one up or down.',
    slots: circle(6, { cy: 0.27, r: 80, w: 48, h: 40 }),
    areas: [{ x: 0.5, y: 0.27, w: 0.4, h: 0, hPx: 96, className: 'stream' }],
    solved: [1, 2, 3, 4, 3, 2].map(stoneI),
    decoys: [stoneI(5), stoneI(1)],
    given: [1, 5],
    rules: [L.loopSteps('n', 1)],
    unique: true,
  },
  {
    id: 'photo-puzzle-ii', name: 'Photo Puzzle II', hint: 'Nine pieces, all turned.',
    slots: grid(3, 3, { cell: 52, gap: 2, y0: 0.13 }),
    areas: [{ x: 0.5, y: 0.272, w: 0.62, h: 0, hPx: 176, className: 'frame' }],
    solved: cells([[0, 1, 2], [3, 4, 5], [6, 7, 8]], (_, r, c) => photoI(r, c, 3, 52, 'boat')),
    outlines: { keys: ['cell'], rotation: true, ghost: false },
    turn: true,
    rules: [L.fitsOutlines],
  },
  {
    id: 'pegboard-iii', name: 'Pegboard III', hint: 'Two pieces are mirror images.',
    slots: [...row(3, { y: 0.13, w: 56, h: 56, x0: 0.2, x1: 0.8, id: 'a' }), ...row(2, { y: 0.33, w: 56, h: 56, x0: 0.34, x1: 0.66, id: 'b' })],
    areas: [{ x: 0.5, y: 0.23, w: 0.94, h: 0, hPx: 156, className: 'pegboard' }],
    solved: [
      polyI('P', SHAPE.P, '#e9a3b8', 90), polyI('U', SHAPE.U, '#8fcfcf', 180), polyI('T', SHAPE.T, '#f6d38b', 270),
      polyI('L', SHAPE.L, '#b9c6ef', 180), polyI('Z', SHAPE.Z, '#d9c2ea', 90, 180),
    ],
    decoys: [polyI('Q', SHAPE.Q, '#e9a3b8'), polyI('J', SHAPE.J, '#b9c6ef')],
    outlines: { keys: ['shape'], rotation: true },
    turn: true,
    rules: [L.fitsOutlines],
  },
  {
    id: 'dice-kakuro', name: 'Dice Kakuro', hint: 'Rows and columns add to their numbers.',
    slots: g3,
    areas: targets(g3, [11, 10, 13], [10, 11, 13]),
    solved: cells([[6, 2, 3], [1, 5, 4], [3, 4, 6]], dieI),
    given: [1, 3, 6],
    rules: [sums([11, 10, 13], [10, 11, 13])],
    unique: true,
  },
  {
    id: 'sorted-grid', name: 'Sorted Grid', hint: 'Bigger to the right, bigger going down.',
    slots: grid(3, 4, { cell: 44, y0: 0.12 }),
    solved: cells([[1, 2, 4, 7], [3, 5, 8, 10], [6, 9, 11, 12]], (n) => blockI(n, C.sky, 42)),
    given: [3, 4, 5, 6, 7, 8],
    rules: [L.all(L.everyRow(L.increasing('n')), L.everyCol(L.increasing('n')))],
    unique: true,
  },
  {
    id: 'stamp-kakuro', name: 'Stamp Kakuro', hint: 'Rows and columns add to their numbers.',
    slots: g3,
    areas: targets(g3, [12, 15, 18], [15, 14, 16]),
    solved: cells([[2, 7, 3], [9, 1, 5], [4, 6, 8]], (v) => stampI(v, [C.pink, C.mint, C.blue][v % 3])),
    given: [2, 6],
    rules: [sums([12, 15, 18], [15, 14, 16], 'v')],
    unique: true,
  },
  {
    id: 'durers-square', name: "Dürer's Square", hint: 'Rows, columns and diagonals all make 34.',
    slots: g4,
    solved: cells([[16, 3, 2, 13], [5, 10, 11, 8], [9, 6, 7, 12], [4, 15, 14, 1]], (n) => blockI(n, C.cream, 40)),
    given: [0, 3, 5, 6, 9, 10, 12, 15],
    rules: [L.all(L.everyRow(L.sumIs('n', 34)), L.everyCol(L.sumIs('n', 34)), L.diagonals(L.sumIs('n', 34)))],
    unique: true,
  },
  {
    id: 'grand-solitaire', name: 'Grand Solitaire', hint: 'Rows go down, red and black. Columns: one number, all suits different.',
    slots: grid(3, 4, { cell: 44, h: 56, y0: 0.09 }),
    solved: cells([[[9, 'S'], [8, 'H'], [7, 'C'], [6, 'D']], [[9, 'H'], [8, 'C'], [7, 'D'], [6, 'S']], [[9, 'C'], [8, 'D'], [7, 'S'], [6, 'H']]] as [number, 'S' | 'H' | 'C' | 'D'][][], ([r, s]) => cardI(r, s)),
    given: [0, 1, 2, 11],
    rules: [L.all(
      L.everyRow(L.monotonic('rank')), L.everyRow(L.neighboursDiffer('red')),
      L.everyCol(L.same('rank')), L.everyCol(L.distinct('suit')),
    )],
    unique: true,
  },
  {
    id: 'bank-vault', name: 'Bank Vault', hint: 'Four bags, four amounts. Two coins are spare.',
    ...vault,
    solved: ([5, 2, 1, 20, 1, 1, 20, 10, 5, 50, 5, 5] as const).map((v) => coinI(v)),
    decoys: ([2, 10] as const).map((v) => coinI(v)),
    rules: [L.all(
      L.groupAt('g0', L.sumIs('v', 8)), L.groupAt('g1', L.sumIs('v', 22)),
      L.groupAt('g2', L.sumIs('v', 35)), L.groupAt('g3', L.sumIs('v', 60)),
    )],
  },
  {
    id: 'two-scales', name: 'Two Scales', hint: 'Balance both scales. One weight stays off.',
    slots: [...scaleA.slots, ...scaleB.slots],
    areas: [...scaleA.areas, ...scaleB.areas],
    solved: [1, 9, 4, 6, 2, 8, 3, 7].map(weightI),
    decoys: [weightI(5)],
    rules: [L.all(L.balanced('g0', 'g1', 'kg'), L.balanced('g2', 'g3', 'kg'))],
  },
  {
    id: 'mini-sudoku-hard', name: 'Mini Sudoku Hard', hint: 'Rows, columns and each 2x2 corner: one of each.',
    slots: g4,
    solved: cells([[2, 0, 3, 1], [3, 1, 2, 0], [0, 3, 1, 2], [1, 2, 0, 3]], (i) => tileI(TONES[i], undefined, 40)),
    given: [1, 6, 11, 12],
    rules: [L.all(latin('c'), L.everyBox(2, L.distinct('c')))],
    unique: true,
  },
  {
    id: 'sum-ladder', name: 'Sum Ladder', hint: 'Rows climb. Columns add to their numbers.',
    slots: g3,
    areas: targets(g3, [], [6, 15, 24]),
    solved: cells([[1, 4, 7], [2, 5, 8], [3, 6, 9]], (n) => blockI(n, C.sage)),
    rules: [L.all(L.everyRow(L.increasing('n')), L.colAt(0, L.sumIs('n', 6)), L.colAt(1, L.sumIs('n', 15)), L.colAt(2, L.sumIs('n', 24)), L.everyCol(L.increasing('n')))],
    unique: true,
  },
  {
    id: 'eulers-cards', name: "Euler's Cards", hint: 'Rows, columns and diagonals: every suit once, every face once.',
    slots: grid(4, 4, { cell: 38, h: 48, gap: 5, y0: 0.07 }),
    solved: cells(pair(GD_A, GD_B), ([r, s]) => cardI([1, 11, 12, 13][r], (['S', 'H', 'C', 'D'] as const)[s], 34)),
    given: [0, 2, 5, 6, 10, 12, 15],
    rules: [L.all(latin('rank'), latin('suit'), L.diagonals(L.distinct('rank')), L.diagonals(L.distinct('suit')))],
    unique: true,
  },
  {
    id: 'paint-mixing-iii', name: 'Paint Mixing III', hint: 'Pastels need white.',
    slots: [...mixTop.slots, ...mixBottom.slots],
    areas: [...mixTop.areas, ...mixBottom.areas],
    solved: [PAINT.blue, PAINT.yellow, PAINT.red, PAINT.yellow, PAINT.red, PAINT.blue, PAINT.red, PAINT.white, PAINT.blue, PAINT.white].map(potI),
    decoys: [potI(PAINT.yellow)],
    rules: [L.all(
      L.groupAt('g0', L.holds('c', [PAINT.blue, PAINT.yellow])), L.groupAt('g1', L.holds('c', [PAINT.red, PAINT.yellow])),
      L.groupAt('g2', L.holds('c', [PAINT.red, PAINT.blue])), L.groupAt('g3', L.holds('c', [PAINT.red, PAINT.white])),
      L.groupAt('g4', L.holds('c', [PAINT.blue, PAINT.white])),
    )],
  },
  {
    id: 'photo-puzzle-iii', name: 'Photo Puzzle III', hint: 'Sixteen pieces. The corners are done.',
    slots: grid(4, 4, { cell: 42, gap: 2, y0: 0.08 }),
    areas: [{ x: 0.5, y: 0.254, w: 0.66, h: 0, hPx: 186, className: 'frame' }],
    solved: cells([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], (_, r, c) => photoI(r, c, 4, 42, 'garden')),
    given: [0, 3, 12, 15],
    outlines: { keys: ['cell'], rotation: true, ghost: false },
    turn: true,
    rules: [L.fitsOutlines],
  },
  {
    id: 'just-so', name: 'Just So', hint: 'Rows, columns, corners and diagonals: every colour once, every symbol once.',
    slots: g4,
    solved: cells(pair(GD_A, GD_B), ([c, s]) => tileI(TONES[c], SYMS[s], 40, '#fff')),
    given: [0, 3, 5, 9, 10, 14, 15],
    rules: [L.all(
      latin('c'), latin('sym'), L.everyBox(2, L.distinct('c')), L.everyBox(2, L.distinct('sym')),
      L.diagonals(L.distinct('c')), L.diagonals(L.distinct('sym')),
    )],
    unique: true,
  },
];
