// Hand-built large levels for chapters 4-6: puzzles that aren't a single
// grid (round tables, paths, pegboards, jigsaws, bags, bowls, scales).
// `given` lists slot indices that start filled and locked.
import * as L from '../../engine/lines';
import type { AreaDef, SlotDef } from '../../engine/types';
import { circle, grid, groups, row, type Item, type Spec } from '../kit';
import { C, blockI, candleI, cardI, coinI, cupI, dominoI, photoI, polyI, potI, sockI, stampI, stoneI, weightI } from '../items';
import type { Scene } from '../objects';

type Suit = 'S' | 'H' | 'C' | 'D';
const SUITS: Suit[] = ['S', 'H', 'C', 'D'];

/** Merge several group layouts into one level layout. */
const merge = (...parts: { slots: SlotDef[]; areas: AreaDef[] }[]) => ({
  slots: parts.flatMap((p) => p.slots),
  areas: parts.flatMap((p) => p.areas),
});

const hueSock = (colour: string, hue: number, stripe?: string): Item => {
  const s = sockI(colour, stripe);
  return { ...s, props: { ...s.props, hue } };
};

const PAINT = { red: '#e58f86', yellow: '#f6d38b', blue: '#8fb3e8', white: '#ffffff' };
const BOWL = { green: '#cfe8c6', orange: '#f8d7b0', purple: '#dccbea', brown: '#d9c3ad', pink: '#f6d0d6', sky: '#d4e7f5', peach: '#fbe3cf', lavender: '#e6defa' };
const MIX = {
  green: [PAINT.blue, PAINT.yellow], orange: [PAINT.red, PAINT.yellow], purple: [PAINT.red, PAINT.blue],
  brown: [PAINT.red, PAINT.yellow, PAINT.blue], pink: [PAINT.red, PAINT.white], sky: [PAINT.blue, PAINT.white],
  peach: [PAINT.red, PAINT.yellow, PAINT.white], lavender: [PAINT.red, PAINT.blue, PAINT.white],
};
type Mix = keyof typeof MIX;

/** A paint-mixing level from rows of bowls. */
function paintLevel(id: string, name: string, hint: string, rowsOfBowls: Mix[][], ys: number[], decoys: string[]): Spec {
  let g = 0;
  const parts = rowsOfBowls.map((bowls, r) => {
    const part = groups(bowls.map((b) => MIX[b].length), {
      y: ys[r], w: 38, h: 42, gap: 3, area: 'bowl', start: g,
      // One bowl: centred; two: closer together; three: across the board.
      x0: [0.5, 0.28, 0.2][bowls.length - 1], x1: [0.5, 0.72, 0.8][bowls.length - 1], colours: bowls.map((b) => BOWL[b]),
    });
    g += bowls.length;
    return part;
  });
  const all = rowsOfBowls.flat();
  return {
    id, name, hint, ...merge(...parts),
    solved: all.flatMap((b) => MIX[b]).map(potI),
    decoys: decoys.map(potI),
    rules: [L.all(...all.map((b, i) => L.groupAt(`g${i}`, L.holds('c', MIX[b]))))],
  };
}

/** A coin-bag level: bags of coins stacked in columns, each with a target. */
function bagsLevel(id: string, name: string, hint: string, bags: number[][], decoys: number[], o: { rows?: number; y?: number[] } = {}): Spec {
  const perRow = Math.ceil(bags.length / (o.rows ?? 1));
  const ys = o.y ?? [0.27];
  let g = 0;
  const parts = ys.map((y, r) => {
    const these = bags.slice(r * perRow, r * perRow + perRow);
    const part = groups(these.map((b) => b.length), {
      y, w: 44, h: 44, dir: 'col', start: g, x0: these.length > 4 ? 0.12 : 0.18, x1: these.length > 4 ? 0.88 : 0.82,
      labels: these.map((b) => `${b.reduce((a, v) => a + v, 0)}p`),
    });
    g += these.length;
    return part;
  });
  return {
    id, name, hint, ...merge(...parts),
    solved: bags.flat().map((v) => coinI(v as 1)),
    decoys: decoys.map((v) => coinI(v as 1)),
    rules: [L.all(...bags.map((b, i) => L.groupAt(`g${i}`, L.sumIs('v', b.reduce((a, v) => a + v, 0)))))],
  };
}

/** A jigsaw: an n x n picture, every piece turned. */
function photoLevel(id: string, name: string, hint: string, n: number, cell: number, scene: Scene, given: number[] = []): Spec {
  const slots = grid(n, n, { cell, gap: 1, y0: 0.02 + (cell / 2 + 4) / 380 });
  const span = (n * (cell + 1)) / 288;
  return {
    id, name, hint, slots,
    areas: [{ x: 0.5, y: slots[0].y + ((n - 1) * (cell + 1)) / 2 / 380, w: span + 0.03, h: 0, hPx: n * (cell + 1) + 8, className: 'frame' }],
    solved: slots.map((s) => photoI(s.row!, s.col!, n, cell, scene)),
    given,
    outlines: { keys: ['cell'], rotation: true, ghost: false },
    turn: true,
    rules: [L.fitsOutlines],
  };
}

// Polyomino shapes as [col, row] cells.
const P = {
  L: [[0, 0], [0, 1], [0, 2], [1, 2]], J: [[1, 0], [1, 1], [1, 2], [0, 2]], T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  I: [[0, 0], [1, 0], [2, 0]], P: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], Q: [[0, 0], [1, 0], [0, 1], [1, 1], [1, 2]],
  U: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], T5: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]], V: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  F: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], F2: [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2]], W: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]],
  N: [[1, 0], [1, 1], [0, 2], [1, 2], [0, 3]], N2: [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3]],
} as Record<string, [number, number][]>;
const PCOL = ['#e9a3b8', '#8fcfcf', '#f6d38b', '#b9c6ef', '#d9c2ea', '#bcd3a1', '#f7c9a0', '#a9d3ef'];

/** Pegboard rows of outline slots. */
const pegRows = (counts: number[], ys: number[], size: number) =>
  counts.flatMap((n, r) => row(n, { y: ys[r], w: size, h: size, x0: n === 1 ? 0.5 : 0.2, x1: n === 1 ? 0.5 : 0.8, id: `r${r}` }));

// A plus-shaped cross of 9 cells: across is row 2, down is column 2.
const crossSlots: SlotDef[] = [
  ...[0, 1, 3, 4].map((r) => ({ id: `d${r}`, row: r, col: 2, x: 0.5, y: 0.07 + r * 0.118, w: 40, h: 40 })),
  ...[0, 1, 2, 3, 4].map((c) => ({ id: `a${c}`, row: 2, col: c, x: 0.5 + (c - 2) * 0.153, y: 0.07 + 2 * 0.118, w: 40, h: 40 })),
];
const ACROSS = ['a0', 'a1', 'a2', 'a3', 'a4'];
const DOWN = ['d0', 'd1', 'a2', 'd3', 'd4'];

export const CUSTOM: Record<string, Spec> = {
  'cross-sums': {
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

  'muffin-tray-ii': {
    id: 'muffin-tray-ii', name: 'Muffin Tray', hint: 'Columns make 13. Top row climbs. Bottom row makes 56.',
    slots: grid(2, 6, { cell: 42, gap: 3, y0: 0.1 }),
    solved: [1, 2, 3, 4, 5, 7, 12, 11, 10, 9, 8, 6].map((n) => blockI(n, C.peach, 40)),
    rules: [L.all(L.everyCol(L.sumIs('n', 13)), L.rowAt(0, L.increasing('n')), L.rowAt(1, L.sumIs('n', 56)))],
    unique: true,
  },
  'seating-plan-10': {
    id: 'seating-plan-10', name: 'Seating Plan II', hint: 'Couples sit opposite. Big and small take turns. No matching neighbours.',
    slots: circle(10, { cy: 0.33, r: 102, w: 46, h: 38 }),
    areas: [{ x: 0.5, y: 0.33, w: 0.5, h: 0, hPx: 140, className: 'table' }],
    solved: [C.pink, C.mint, C.blue, C.yellow, C.lilac, C.pink, C.mint, C.blue, C.yellow, C.lilac].map((c, i) => cupI(c, i % 2 === 0)),
    given: [0, 1, 2, 3],
    rules: [L.all(L.loopNeighboursDiffer('c'), L.oppositeSame('c'), L.loopNeighboursDiffer('big'))],
    unique: true,
  },
  'big-shop': bagsLevel('big-shop', 'Big Shop', 'Fill each bag exactly. Three coins are spare.',
    [[20, 10, 5, 2], [10, 5, 2, 1], [50, 20, 10, 1], [5, 2, 1, 1]], [20, 5, 2]),
  'rainbow-socks-ii': {
    id: 'rainbow-socks-ii', name: 'Rainbow Socks', hint: 'Pairs in columns, top row in rainbow order. Three socks are odd.',
    slots: grid(2, 6, { cell: 42, h: 60, gap: 3, y0: 0.11 }),
    solved: [0, 1].flatMap(() => [[C.rose, 10], [C.peach, 30], [C.yellow, 50], [C.sage, 100], [C.teal, 180], [C.blue, 225]].map(([c, h]) => hueSock(c as string, h as number))),
    decoys: [hueSock(C.lilac, 280), hueSock(C.mint, 150, '#fff'), hueSock(C.pink, 10, C.yellow)],
    rules: [L.all(L.everyCol(L.same('look')), L.rowAt(0, L.increasing('hue')))],
  },
  'grand-solitaire': {
    id: 'grand-solitaire', name: 'Grand Solitaire', hint: 'Rows go down, red and black. Columns: one number, four suits.',
    slots: grid(4, 4, { cell: 42, h: 54, gap: 3, y0: 0.09 }),
    solved: [0, 1, 2, 3].flatMap((r) => [9, 8, 7, 6].map((rank, c) => cardI(rank, SUITS[(r + c) % 4]))),
    given: [0, 4, 8, 12],
    rules: [L.all(L.everyRow(L.monotonic('rank')), L.everyRow(L.neighboursDiffer('red')), L.everyCol(L.same('rank')), L.everyCol(L.distinct('suit')))],
  },
  'six-envelopes': {
    id: 'six-envelopes', name: 'Six Envelopes', hint: 'Pay each postage exactly. Two stamps are spare.',
    ...merge(
      groups([2, 2, 2], { y: 0.14, w: 40, h: 46, gap: 3, x0: 0.18, x1: 0.82, area: 'envelope', labels: ['5', '7', '9'] }),
      groups([2, 2, 2], { y: 0.4, w: 40, h: 46, gap: 3, x0: 0.18, x1: 0.82, area: 'envelope', labels: ['12', '10', '15'], start: 3 }),
    ),
    solved: [1, 4, 3, 4, 2, 7, 5, 7, 4, 6, 7, 8].map((v) => stampI(v, [C.pink, C.mint, C.blue, C.yellow][v % 4])),
    decoys: [1, 6].map((v) => stampI(v, [C.pink, C.mint, C.blue, C.yellow][v % 4])),
    rules: [L.all(...[5, 7, 9, 12, 10, 15].map((t, i) => L.groupAt(`g${i}`, L.sumIs('v', t))))],
  },
  'stepping-stones-12': {
    id: 'stepping-stones-12', name: 'Stepping Stones II', hint: 'Follow the path like reading a book. Each step is one up or down.',
    slots: [0.12, 0.3, 0.48].flatMap((y, r) => row(4, { y, w: 48, h: 40, x0: 0.16, x1: 0.84, id: `r${r}` })),
    areas: [{ x: 0.5, y: 0.3, w: 0.96, h: 0, hPx: 200, className: 'stream' }],
    solved: [1, 2, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6].map(stoneI),
    given: [0],
    rules: [L.whole(L.steps('n', 1))],
  },
  'seating-plan-12': {
    id: 'seating-plan-12', name: 'Seating Plan III', hint: 'Colours repeat every four seats. Big and small take turns. No matching neighbours.',
    slots: circle(12, { cy: 0.35, r: 112, w: 46, h: 38 }),
    areas: [{ x: 0.5, y: 0.35, w: 0.56, h: 0, hPx: 160, className: 'table' }],
    solved: Array.from({ length: 12 }, (_, i) => cupI([C.pink, C.mint, C.blue, C.yellow][i % 4], i % 2 === 0)),
    given: [0],
    rules: [L.all(L.loopNeighboursDiffer('c'), L.whole(L.repeats('c', 4)), L.loopNeighboursDiffer('big'))],
  },
  'pegboard-ii': {
    id: 'pegboard-ii', name: 'Pegboard II', hint: 'Seven outlines. Two pieces are mirror images and fit nowhere.',
    slots: pegRows([3, 3, 1], [0.1, 0.29, 0.48], 58),
    areas: [{ x: 0.5, y: 0.29, w: 0.94, h: 0, hPx: 222, className: 'pegboard' }],
    solved: [
      polyI('L', P.L, PCOL[0], 270), polyI('T', P.T, PCOL[1], 90), polyI('S', P.S, PCOL[2], 90, 180), polyI('O', P.O, PCOL[3], 0, 90),
      polyI('P', P.P, PCOL[4], 180), polyI('U', P.U, PCOL[5], 270), polyI('I', P.I, PCOL[6], 90, 180),
    ],
    decoys: [polyI('J', P.J, PCOL[0]), polyI('Q', P.Q, PCOL[4])],
    outlines: { keys: ['shape'], rotation: true },
    turn: true,
    rules: [L.fitsOutlines],
  },
  'photo-puzzle-4': photoLevel('photo-puzzle-4', 'Photo Puzzle', 'Sixteen pieces, all turned. Tap to turn.', 4, 52, 'house'),
  'paint-mixing-ii': paintLevel('paint-mixing-ii', 'Paint Mixing II', 'Brown takes all three. Pastels need white.',
    [['green', 'orange', 'purple'], ['brown', 'pink'], ['sky']], [0.12, 0.33, 0.54], [PAINT.yellow]),
  'bank-run': bagsLevel('bank-run', 'Bank Run', 'Fill each bag exactly. Three coins are spare.',
    [[5, 2, 1], [10, 2, 1], [10, 10, 5], [20, 10, 1], [50, 10, 10]], [2, 5, 20]),
  'domino-snake': {
    id: 'domino-snake', name: 'Domino Snake', hint: 'Eight dominoes in a closed chain, read like a book.',
    slots: [0.15, 0.33].flatMap((y, r) => row(4, { y, w: 58, h: 32, x0: 0.17, x1: 0.83, id: `r${r}` })),
    areas: [{ x: 0.5, y: 0.24, w: 0.96, h: 0, hPx: 116, className: 'runner' }],
    solved: [[1, 3], [3, 5], [5, 2], [2, 6], [6, 4], [4, 1], [1, 5], [5, 1]].map(([l, r]) => dominoI(l, r)),
    decoys: [dominoI(3, 3), dominoI(6, 2)],
    turn: true,
    snapRadius: 40,
    rules: [L.chainedEnds('left', 'right', true)],
  },
  'candle-rows-ii': {
    id: 'candle-rows-ii', name: 'Candle Rows', hint: 'Each shelf rises then falls. Columns share a colour.',
    slots: [0.15, 0.45].flatMap((y, r) => row(6, { y, w: 30, h: 98, x0: 0.13, x1: 0.87, id: `r${r}` })).map((s, i) => ({ ...s, row: Math.floor(i / 6), col: i % 6 })),
    areas: [0.15, 0.45].map((y) => ({ x: 0.5, y, w: 0.94, h: 0, hPx: 106, className: 'shelf' })),
    solved: [[30, 44, 58, 72, 51, 37], [40, 54, 68, 79, 61, 33]].flatMap((hs) => hs.map((h, c) => candleI(h, [C.rose, C.peach, C.yellow, C.sky, C.sage, C.lilac][c]))),
    decoys: [candleI(47, C.yellow)],
    rules: [L.all(L.everyRow(L.peaked('h')), L.everyCol(L.same('c')))],
  },
  'round-steps-10': {
    id: 'round-steps-10', name: 'Round Steps', hint: 'All the way round, each step is one up or down. Two stones are spare.',
    slots: circle(10, { cy: 0.34, r: 104, w: 48, h: 40 }),
    areas: [{ x: 0.5, y: 0.34, w: 0.5, h: 0, hPx: 140, className: 'stream' }],
    solved: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2].map(stoneI),
    decoys: [stoneI(1), stoneI(6)],
    given: [0],
    rules: [L.loopSteps('n', 1)],
    unique: true,
  },
  'photo-puzzle-5': photoLevel('photo-puzzle-5', 'Photo Puzzle II', 'Twenty-five pieces, all turned.', 5, 48, 'boat'),
  'pegboard-iii': {
    id: 'pegboard-iii', name: 'Pegboard III', hint: 'Eight outlines. Three pieces are mirror images and fit nowhere.',
    slots: pegRows([3, 3, 2], [0.1, 0.3, 0.5], 62),
    areas: [{ x: 0.5, y: 0.3, w: 0.96, h: 0, hPx: 236, className: 'pegboard' }],
    solved: [
      polyI('P', P.P, PCOL[0], 90), polyI('U', P.U, PCOL[1], 180), polyI('T5', P.T5, PCOL[2], 270), polyI('V', P.V, PCOL[3], 90),
      polyI('F', P.F, PCOL[4], 180), polyI('W', P.W, PCOL[5], 90), polyI('N', P.N, PCOL[6], 270), polyI('Z', P.Z, PCOL[7], 90, 180),
    ],
    decoys: [polyI('Q', P.Q, PCOL[0]), polyI('F2', P.F2, PCOL[4]), polyI('N2', P.N2, PCOL[6])],
    outlines: { keys: ['shape'], rotation: true },
    turn: true,
    rules: [L.fitsOutlines],
  },
  'grand-solitaire-ii': {
    id: 'grand-solitaire-ii', name: 'Grand Solitaire II', hint: 'Rows go down, red and black. Columns: one number, no suit twice.',
    slots: grid(4, 6, { cell: 42, h: 54, gap: 3, y0: 0.09 }),
    solved: [0, 1, 2, 3].flatMap((r) => [9, 8, 7, 6, 5, 4].map((rank, c) => cardI(rank, SUITS[(r + c) % 4], 38))),
    given: [0, 6, 12, 18],
    rules: [L.all(L.everyRow(L.monotonic('rank')), L.everyRow(L.neighboursDiffer('red')), L.everyCol(L.same('rank')), L.everyCol(L.distinct('suit')))],
  },
  'bank-vault': bagsLevel('bank-vault', 'Bank Vault', 'Six bags, six amounts. Three coins are spare.',
    [[2, 1], [5, 2], [10, 2], [10, 5], [20, 10], [50, 10]], [1, 5, 20], { rows: 2, y: [0.16, 0.51] }),
  'three-scales': {
    id: 'three-scales', name: 'Three Scales', hint: 'Balance all three scales. One weight stays off.',
    ...merge(...[0.1, 0.32, 0.54].map((y, i) => groups([2, 2], { y, w: 42, h: 56, gap: 4, x0: 0.28, x1: 0.72, area: 'pan', start: i * 2 }))),
    solved: [1, 9, 4, 6, 2, 8, 3, 7, 2, 6, 3, 5].map(weightI),
    decoys: [weightI(4)],
    rules: [L.all(L.balanced('g0', 'g1', 'kg'), L.balanced('g2', 'g3', 'kg'), L.balanced('g4', 'g5', 'kg'))],
  },
  'paint-mixing-iii': paintLevel('paint-mixing-iii', 'Paint Mixing III', 'Eight bowls. Pastels need white; the soft ones need three.',
    [['green', 'orange', 'purple'], ['brown', 'peach'], ['pink', 'sky'], ['lavender']], [0.09, 0.27, 0.45, 0.63], [PAINT.white, PAINT.yellow]),
  'photo-puzzle-6': photoLevel('photo-puzzle-6', 'Photo Puzzle III', 'Thirty-six pieces. The corners are done.', 6, 43, 'garden', [0, 5, 30, 35]),
};
