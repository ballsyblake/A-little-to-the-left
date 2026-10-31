// Chapter 3 (levels 21-40): twists. Givens you must work around, decoys,
// turning pieces to fit outlines, odd-sized containers, round tables.
import * as L from '../../engine/lines';
import type { BoardView } from '../../engine/types';
import { circle, groups, grid, row, type Spec } from '../kit';
import {
  C, bookI, candleI, cardI, coinI, cupI, cutleryI, cutterI, eggI, jarI, magnetI, mugI, polyI, sockI, stampI, stoneI, weightI,
} from '../items';

const turnable = { rotation: true } as const;
const WIND = { firstDelayMs: [8_000, 12_000] as [number, number], delayMs: [30_000, 45_000] as [number, number], maxOffsetPx: 26, minPlaced: 3 };

/** Two pans: the dial needle leans toward the heavier one. */
export function panNeedle(view: BoardView, boardEl: HTMLElement): void {
  let diff = 0;
  for (const s of view.slots) diff += (s.group === 'g1' ? 1 : -1) * Number(view.pieceIn(s.id)?.def.props?.kg ?? 0);
  boardEl.style.setProperty('--tilt', `${Math.max(-50, Math.min(50, diff * 5))}deg`);
}

/** A sock that also knows its hue (for rainbow order). */
const hueSock = (colour: string, hue: number, stripe?: string) => {
  const s = sockI(colour, stripe);
  return { ...s, props: { ...s.props, hue } };
};

const purses = groups([3, 3, 3], { y: 0.24, w: 38, h: 38, dir: 'col', x0: 0.2, x1: 0.8, labels: ['12p', '12p', '12p'] });
const pairsTop = groups([2, 2], { y: 0.15, w: 36, h: 58, x0: 0.28, x1: 0.72, area: 'line' });
const pairsBottom = groups([2, 2], { y: 0.34, w: 36, h: 58, x0: 0.28, x1: 0.72, area: 'line', start: 2 });
const rack = groups([3, 3], { y: 0.25, w: 34, h: 66, x0: 0.28, x1: 0.72 });
const drawer = groups([3, 2, 1], { y: 0.28, w: 26, h: 124 });
const threePans = groups([2, 2, 2], { y: 0.34, w: 40, h: 56, x0: 0.18, x1: 0.82, area: 'pan' });
const envelopes = groups([3, 3], { y: 0.25, w: 40, h: 46, x0: 0.27, x1: 0.73, area: 'envelope', labels: ['7', '11'] });
const pantry = [0.12, 0.3, 0.48].map((y, i) => groups([3], { y, w: 34, h: 66, x0: 0.5, x1: 0.5, area: 'shelf', start: i }));
const scalePans = groups([3, 3], { y: 0.42, w: 40, h: 56, x0: 0.27, x1: 0.73, area: 'pan' });
const piggy = groups([4], { y: 0.25, w: 44, h: 44, x0: 0.5, x1: 0.5, labels: ['37p'] });
const pegLine = groups([2, 2, 2], { y: 0.22, w: 36, h: 58, x0: 0.2, x1: 0.8, area: 'line' });

// Polyomino shapes as [col, row] cells.
const SHAPE = {
  L: [[0, 0], [0, 1], [0, 2], [1, 2]] as [number, number][],
  T: [[0, 0], [1, 0], [2, 0], [1, 1]] as [number, number][],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]] as [number, number][],
  I: [[0, 0], [1, 0], [2, 0]] as [number, number][],
};

export const ch3: Spec[] = [
  {
    id: 'pegboard', name: 'Pegboard', hint: 'Tap to turn. Match each outline.',
    slots: row(4, { y: 0.22, w: 52, h: 52, x0: 0.16, x1: 0.84 }),
    areas: [{ x: 0.5, y: 0.22, w: 0.96, h: 0, hPx: 72, className: 'pegboard' }],
    solved: [
      polyI('L', SHAPE.L, '#e9a3b8', 90), polyI('T', SHAPE.T, '#8fcfcf', 180),
      polyI('S', SHAPE.S, '#f6d38b', 90, 180), polyI('I', SHAPE.I, '#b9c6ef', 90, 180),
    ],
    outlines: { keys: ['shape'], ...turnable },
    turn: true,
    rules: [L.fitsOutlines],
  },
  {
    id: 'bookends', name: 'Bookends', hint: 'Two books are glued in place.',
    slots: row(7, { y: 0.27, w: 30, h: 134, x0: 0.12, x1: 0.88 }),
    areas: [{ x: 0.5, y: 0.27, w: 0.94, h: 0, hPx: 138, className: 'shelf' }],
    solved: [[0, 104], [50, 120], [100, 96], [150, 126], [200, 110], [250, 100], [300, 118]].map(([hue, h]) => bookI(hue, h, 26)),
    given: [1, 4],
    rules: [L.whole(L.monotonic('hue'))],
  },
  {
    id: 'mug-tree', name: 'Mug Tree', hint: 'Find the pattern.',
    slots: row(6, { y: 0.24, w: 44, h: 62 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.96, h: 0, hPx: 70, className: 'shelf' }],
    solved: [C.pink, C.mint, C.blue, C.pink, C.mint, C.blue].map((c) => mugI(c, 44)),
    rules: [L.whole(L.repeats('c', 3))],
  },
  {
    id: 'three-purses', name: 'Three Purses', hint: 'Twelve pence in each purse.',
    ...purses,
    solved: ([10, 1, 1, 5, 5, 2, 10, 1, 1] as const).map((v) => coinI(v)),
    rules: [L.everyGroup(L.sumIs('v', 12))],
  },
  {
    id: 'fridge-note', name: 'Fridge Note', hint: 'Someone started a word.',
    slots: row(5, { y: 0.26, w: 50, h: 56, x0: 0.14, x1: 0.86 }),
    areas: [{ x: 0.5, y: 0.26, w: 0.96, h: 0, hPx: 100, className: 'fridge' }],
    solved: [...'HEART'].map((l, i) => magnetI(l, [C.pink, C.yellow, C.mint, C.blue, C.lilac][i])),
    given: [1],
    rules: [L.whole(L.spells('l', ['HEART', 'EARTH', 'HATER']))],
    unique: true,
  },
  {
    id: 'odd-socks', name: 'Odd Socks', hint: 'One sock has lost its partner.',
    slots: [...pairsTop.slots, ...pairsBottom.slots],
    areas: [...pairsTop.areas, ...pairsBottom.areas],
    solved: [
      sockI(C.mint, C.pink), sockI(C.mint, C.pink), sockI(C.blue, '#fff'), sockI(C.blue, '#fff'),
      sockI(C.yellow), sockI(C.yellow), sockI(C.lilac, C.mint), sockI(C.lilac, C.mint),
    ],
    decoys: [sockI(C.mint, C.yellow)],
    rules: [L.everyGroup(L.same('look'))],
  },
  {
    id: 'spice-rack', name: 'Spice Rack', hint: 'By lid, then small to tall.',
    ...rack,
    solved: [jarI('#e0a46a', 38), jarI('#e0a46a', 48), jarI('#e0a46a', 58), jarI(C.sage, 42), jarI(C.sage, 50), jarI(C.sage, 60)],
    rules: [L.all(L.everyGroup(L.same('lid')), L.everyGroup(L.increasing('h')))],
  },
  {
    id: 'odd-drawer', name: 'Odd Drawer', hint: 'The drawer has odd-sized spaces.',
    ...drawer,
    solved: [
      cutleryI('knife', 180), cutleryI('knife'), cutleryI('knife', 180),
      cutleryI('fork'), cutleryI('fork', 180), cutleryI('spoon', 180),
    ],
    rules: [L.all(L.everyGroup(L.same('type')), L.sameRotation)],
    wind: WIND,
    snapRadius: 30,
  },
  {
    id: 'three-pans', name: 'Three Pans', hint: 'Make all three pans weigh the same.',
    ...threePans,
    solved: [1, 8, 2, 7, 3, 6].map(weightI),
    rules: [L.equalSums('kg')],
  },
  {
    id: 'solitaire', name: 'Solitaire', hint: 'Down in order, red and black.',
    slots: row(5, { y: 0.24, w: 42, h: 56, x0: 0.14, x1: 0.86 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.96, h: 0, hPx: 72, className: 'felt' }],
    solved: [cardI(9, 'S'), cardI(8, 'H'), cardI(7, 'C'), cardI(6, 'D'), cardI(5, 'S')],
    decoys: [cardI(7, 'H')],
    rules: [L.all(L.whole(L.monotonic('rank')), L.whole(L.neighboursDiffer('red')))],
  },
  {
    id: 'candlelight', name: 'Candlelight', hint: 'Up to the tallest, then down.',
    slots: row(7, { y: 0.25, w: 26, h: 98, x0: 0.12, x1: 0.88 }),
    areas: [{ x: 0.5, y: 0.25, w: 0.94, h: 0, hPx: 104, className: 'shelf' }],
    solved: [30, 44, 58, 72, 58, 44, 30].map((h, i) => candleI(h, [C.rose, C.peach, C.yellow, '#f7efe2', C.yellow, C.peach, C.rose][i])),
    decoys: [candleI(37, C.sky)],
    rules: [L.whole(L.peaked('h'))],
  },
  {
    id: 'stamps', name: 'Stamps', hint: 'Pay the postage exactly.',
    ...envelopes,
    solved: [stampI(1, C.mint), stampI(2, C.pink), stampI(4, C.blue), stampI(2, C.pink), stampI(4, C.blue), stampI(5, C.yellow)],
    rules: [L.all(L.groupAt('g0', L.sumIs('v', 7)), L.groupAt('g1', L.sumIs('v', 11)))],
  },
  {
    id: 'egg-box-ii', name: 'Egg Box II', hint: 'Every row and column: all different.',
    slots: grid(2, 3, { cell: 44, y0: 0.18 }),
    areas: [{ x: 0.5, y: 0.245, w: 0.56, h: 0, hPx: 112, className: 'carton' }],
    solved: [C.cocoa, C.cream, C.sky, C.cream, C.sky, C.cocoa].map(eggI),
    given: [0, 4],
    rules: [L.all(L.everyRow(L.distinct('c')), L.everyCol(L.distinct('c')))],
    unique: true,
  },
  {
    id: 'upside-down', name: 'Upside Down', hint: 'The outlines are turned.',
    slots: [...row(3, { y: 0.14, w: 52, h: 52, x0: 0.25, x1: 0.75, id: 'a' }), ...row(2, { y: 0.32, w: 52, h: 52, x0: 0.35, x1: 0.65, id: 'b' })],
    areas: [{ x: 0.5, y: 0.23, w: 0.9, h: 0, hPx: 150, className: 'runner' }],
    solved: [
      cutterI('heart', '#d9776f', 180), cutterI('moon', '#7d95c9', 90), cutterI('drop', '#6fa8c9', 270),
      cutterI('triangle', '#6fae8f', 180), cutterI('leaf', '#9b84c4', 90),
    ],
    outlines: { keys: ['shape'], ...turnable },
    turn: true,
    rules: [L.fitsOutlines],
  },
  {
    id: 'seating-plan', name: 'Seating Plan', hint: 'No two matching cups side by side.',
    slots: circle(6, { cy: 0.27, r: 78, w: 44, h: 36 }),
    areas: [{ x: 0.5, y: 0.27, w: 0.4, h: 0, hPx: 100, className: 'table' }],
    solved: [C.pink, C.mint, C.blue, C.pink, C.mint, C.blue].map((c) => cupI(c)),
    given: [0],
    rules: [L.loopNeighboursDiffer('c')],
  },
  {
    id: 'piggy-bank', name: 'Piggy Bank', hint: 'Exactly 37p, with four coins.',
    ...piggy,
    solved: ([20, 10, 5, 2] as const).map((v) => coinI(v)),
    decoys: ([50, 2, 1, 1] as const).map((v) => coinI(v)),
    rules: [L.everyGroup(L.sumIs('v', 37))],
  },
  {
    id: 'stepping-stones', name: 'Stepping Stones', hint: 'Each step goes up or down by one.',
    slots: row(6, { y: 0.24, w: 46, h: 40, x0: 0.1, x1: 0.9 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.98, h: 0, hPx: 56, className: 'stream' }],
    solved: [1, 2, 3, 2, 3, 4].map(stoneI),
    rules: [L.whole(L.steps('n', 1))],
  },
  {
    id: 'clothes-pegs', name: 'Clothes Pegs', hint: 'Pairs, in rainbow order.',
    ...pegLine,
    solved: [hueSock(C.pink, 10), hueSock(C.pink, 10), hueSock(C.yellow, 50), hueSock(C.yellow, 50), hueSock(C.blue, 220), hueSock(C.blue, 220)],
    decoys: [hueSock(C.mint, 150)],
    rules: [L.all(L.everyGroup(L.same('look')), L.whole(L.monotonicLoose('hue')))],
  },
  {
    id: 'pantry', name: 'Pantry', hint: 'One lid per shelf, small to tall.',
    slots: pantry.flatMap((p) => p.slots),
    areas: [{ x: 0.5, y: 0.3, w: 0.5, h: 0, hPx: 226, className: 'cupboard' }],
    solved: [
      jarI(C.pink, 36), jarI(C.pink, 46), jarI(C.pink, 56),
      jarI(C.sage, 40), jarI(C.sage, 50), jarI(C.sage, 60),
      jarI(C.blue, 38), jarI(C.blue, 48), jarI(C.blue, 58),
    ],
    rules: [L.all(L.everyGroup(L.same('lid')), L.everyGroup(L.increasing('h')))],
  },
  {
    id: 'dial-it-in', name: 'Dial It In', hint: 'Balance it. Two weights stay off.',
    ...scalePans,
    areas: [{ x: 0.5, y: 0.14, w: 0.34, h: 0, hPx: 64, className: 'dial' }, ...scalePans.areas],
    solved: [1, 5, 9, 3, 4, 8].map(weightI),
    decoys: [2, 6].map(weightI),
    rules: [L.equalSums('kg')],
    decorate: panNeedle,
  },
];
