// "Second Look": puzzles in the spirit of A Little to the Left. No words on
// screen (the rule is in the hint), many with two or three hidden ways to
// tidy the same things, plus hands-on actions: flip, turn, polish.
// Each object has several independent properties (length AND colour...), so
// each way is a different arrangement. `also` lists the extra ways.
import * as L from '../../engine/lines';
import { propsOf } from '../../engine/props';
import type { SlotDef } from '../../engine/types';
import { groups, row, type Item, type Spec } from '../kit';
import { C, bookI, candleI, cutleryI, dominoI, stampI } from '../items';
import {
  bulb, clockHand, cloth, coinFace, coinSize, crayon, frame, key, leaf, letterJar, mugFacing, speckledEgg,
  CRAYON_CANVAS, JAR_CANVAS, MUG_CANVAS, type CoinValue,
} from '../objects';
import { button } from '../art';

// ---- Items ---------------------------------------------------------------------

const crayonI = (hue: number, len: number): Item => ({ svg: crayon(hue, len), props: { hue, len }, w: 20, h: CRAYON_CANVAS });
const leafI = (hue: number, size: number, veins: number): Item => ({ svg: leaf(hue, size, veins), props: { hue, size, veins }, w: 52, h: 70 });
const keyI = (hue: number, len: number, teeth: number): Item => ({ svg: key(hue, len, teeth), props: { len, teeth }, w: 28, h: 96 });
const buttonI = (hue: number, d: number, holes: 2 | 4): Item => ({ svg: button(`hsl(${hue} 55% 75%)`, d, holes), props: { hue, d, holes }, w: d, h: d });
const eggI = (dark: boolean, n: number): Item => ({ svg: speckledEgg(dark ? C.cocoa : C.cream, n), props: { c: dark ? 'dark' : 'light', n }, w: 34, h: 42 });
const jarI = (hue: number, h: number, l: string): Item => ({ svg: letterJar(`hsl(${hue} 55% 72%)`, h, l), props: { hue, h, l }, w: 32, h: JAR_CANVAS });
const thickBookI = (hue: number, h: number, w: number): Item => ({ ...bookI(hue, h, w), props: { hue, h, w } });
const totalDominoI = (l: number, r: number): Item => ({ ...dominoI(l, r), props: { left: l, right: r, total: l + r } });

/** A mug fixed on its hook; tap to turn the handle. State 0 = right, 1 = left. */
const mugI = (colour: string, start: 0 | 1): Item => ({
  svg: mugFacing(colour, 44, 'R'), props: {}, w: 44, h: MUG_CANVAS, startState: start,
  states: [{ svg: mugFacing(colour, 44, 'R'), props: { dir: 'R' } }, { svg: mugFacing(colour, 44, 'L'), props: { dir: 'L' } }],
});
/** A coin; tap to flip. State 0 = heads, 1 = tails. */
const coinI = (v: CoinValue, start: 0 | 1): Item => ({
  svg: coinFace(v, 'H'), props: { v }, w: coinSize(v), h: coinSize(v), startState: start,
  states: [{ svg: coinFace(v, 'H'), props: { face: 'H' } }, { svg: coinFace(v, 'T'), props: { face: 'T' } }],
});
/** A fairy-light bulb; tap to switch. State 0 = off, 1 = on. */
const bulbI = (hue: number, start: 0 | 1): Item => ({
  svg: bulb(hue, false), props: {}, w: 28, h: 44, startState: start, solvedState: 1,
  states: [{ svg: bulb(hue, false), props: { on: 0 } }, { svg: bulb(hue, true), props: { on: 1 } }],
});
/** A hung picture frame, turned freely by dragging. `angle` is where it looks level. */
const frameI = (w: number, h: number, sky: string, startRot: number, opts: { tilt?: number; dirt?: number } = {}): Item => ({
  svg: frame(w, h, sky, opts.tilt ?? 0), props: { angle: -(opts.tilt ?? 0) }, w, h,
  spin: true, startRot, solvedRot: -(opts.tilt ?? 0), ...(opts.dirt && { dirt: opts.dirt }),
});
const CLOTH: Item = { svg: cloth(), props: {}, w: 48, h: 36, tool: 'cloth' };

// ---- Little rules made for these levels ------------------------------------------

/** Exactly `n` runs of the same `prop` (e.g. stamps in 3 colour blocks). */
const blocks = (prop: string, n: number): L.LinePred => (ps) =>
  1 + ps.filter((p, i) => i > 0 && propsOf(p)[prop] !== propsOf(ps[i - 1])[prop]).length === n;

/** The line's `prop` values read exactly `pattern` (one character each). */
const reads = (prop: string, pattern: string): L.LinePred => (ps) => ps.map((p) => String(propsOf(p)[prop])).join('') === pattern;

/** All pieces in slots show this state value. */
const allShow = (prop: string, value: string | number, n: number): L.LinePred => L.countIs(prop, value, n);

const all = <T,>(n: number, v: T) => Array.from({ length: n }, () => v);
const frameSlot = (id: string, x: number, y: number, w: number, h: number): SlotDef => ({ id, x, y, w, h });

export const secondLook: Spec[] = [
  {
    id: 'crayons', name: 'Crayons', hint: 'By length. Or is it by colour?',
    slots: row(5, { y: 0.26, w: 26, h: 152, x0: 0.2, x1: 0.8 }),
    areas: [{ x: 0.5, y: 0.26, w: 0.74, h: 0, hPx: 160, className: 'compartment' }],
    // Solved by length; hues are mixed so the rainbow order is different.
    solved: [[55, 70], [210, 85], [0, 100], [120, 115], [30, 130]].map(([h, l]) => crayonI(h, l)),
    rules: [L.whole(L.monotonic('len'))],
    also: [{ rule: L.whole(L.monotonic('hue')), order: [2, 4, 0, 3, 1] }],
  },
  {
    id: 'picture-wall', name: 'Picture Wall', hint: 'Straighten every frame. Drag around a frame to turn it.',
    slots: [frameSlot('f0', 0.3, 0.18, 84, 66), frameSlot('f1', 0.72, 0.2, 62, 80), frameSlot('f2', 0.28, 0.5, 62, 80), frameSlot('f3', 0.7, 0.52, 84, 66)],
    areas: [{ x: 0.5, y: 0.35, w: 0.94, h: 0.62, className: 'wall' }],
    solved: [frameI(84, 66, '#cfe5f0', 11), frameI(62, 80, '#f8e3cf', -9), frameI(62, 80, '#e6f2ea', 14), frameI(84, 66, '#f6d0d6', -12)],
    given: [0, 1, 2, 3],
    rules: [L.allAngled(3)],
  },
  {
    id: 'loose-change', name: 'Loose Change', hint: 'Line them up by size. Or turn them all the same way up.',
    slots: row(5, { y: 0.25, w: 46, h: 46, x0: 0.16, x1: 0.84 }),
    areas: [{ x: 0.5, y: 0.25, w: 0.9, h: 0, hPx: 60, className: 'felt' }],
    solved: [coinI(1, 1), coinI(2, 0), coinI(5, 1), coinI(10, 0), coinI(20, 1)],
    rules: [L.whole(L.monotonic('v'))],
    also: [{ rule: L.whole(allShow('face', 'H', 5)), order: [2, 0, 4, 1, 3], states: all(5, 0) }],
  },
  {
    id: 'leaf-press', name: 'Leaf Press', hint: 'Green to red, small to big, or by their veins.',
    slots: row(5, { y: 0.24, w: 50, h: 72, x0: 0.14, x1: 0.86 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.96, h: 0, hPx: 84, className: 'envelope' }],
    solved: [[120, 46, 4], [90, 54, 2], [60, 38, 6], [35, 62, 3], [10, 42, 5]].map(([h, s, v]) => leafI(h, s, v)),
    rules: [L.whole(L.monotonic('hue'))],
    also: [
      { rule: L.whole(L.monotonic('size')), order: [2, 4, 0, 1, 3] },
      { rule: L.whole(L.monotonic('veins')), order: [1, 3, 0, 4, 2] },
    ],
  },
  {
    id: 'silver-polish', name: 'Silver Polish', hint: 'Polish them all with the cloth.',
    slots: row(4, { y: 0.3, w: 30, h: 126, x0: 0.25, x1: 0.75 }),
    areas: [{ x: 0.5, y: 0.3, w: 0.66, h: 0, hPx: 150, className: 'mat' }],
    solved: (['spoon', 'spoon', 'spoon', 'spoon'] as const).map((t) => ({ ...cutleryI(t), rotatable: false, dirt: 4 })),
    given: [0, 1, 2, 3],
    tools: [CLOTH],
    rules: [L.allClean],
  },
  {
    id: 'mug-handles', name: 'Mug Handles', hint: 'Tap a mug to turn it. All one way, all the other, or facing out.',
    slots: row(6, { y: 0.3, w: 44, h: 62 }),
    areas: [{ x: 0.5, y: 0.3, w: 0.96, h: 0, hPx: 70, className: 'shelf' }],
    solved: [mugI(C.pink, 1), mugI(C.mint, 0), mugI(C.blue, 0), mugI(C.yellow, 1), mugI(C.lilac, 0), mugI(C.peach, 1)],
    given: [0, 1, 2, 3, 4, 5],
    rules: [L.whole(allShow('dir', 'R', 6))],
    also: [
      { rule: L.whole(allShow('dir', 'L', 6)), states: all(6, 1) },
      { rule: L.whole(reads('dir', 'LLLRRR')), states: [1, 1, 1, 0, 0, 0] },
    ],
  },
  {
    id: 'keyring', name: 'Keyring', hint: 'By length, or by how many teeth.',
    slots: row(5, { y: 0.24, w: 32, h: 98, x0: 0.18, x1: 0.82 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.8, h: 0, hPx: 104, className: 'pegboard' }],
    solved: [[200, 48, 3], [20, 54, 5], [120, 60, 2], [280, 66, 6], [45, 72, 4]].map(([h, l, t]) => keyI(h, l, t)),
    rules: [L.whole(L.monotonic('len'))],
    also: [{ rule: L.whole(L.monotonic('teeth')), order: [2, 0, 4, 1, 3] }],
  },
  {
    id: 'egg-cups', name: 'Egg Cups', hint: 'Light and dark taking turns. Or count the speckles.',
    slots: row(6, { y: 0.26, w: 40, h: 46 }),
    areas: [{ x: 0.5, y: 0.26, w: 0.96, h: 0, hPx: 58, className: 'carton' }],
    solved: [[true, 3], [false, 0], [true, 5], [false, 1], [true, 4], [false, 2]].map(([d, n]) => eggI(d as boolean, n as number)),
    rules: [L.whole(L.neighboursDiffer('c'))],
    also: [{ rule: L.whole(L.monotonic('n')), order: [1, 3, 5, 0, 4, 2] }],
  },
  {
    id: 'clock', name: 'Clock', hint: 'Turn the hand onto its shadow.',
    slots: [{ id: 'hand', x: 0.5, y: 0.32, w: 16, h: 120, ghost: clockHand('#b8ada0'), wantRot: 135 }],
    areas: [{ x: 0.5, y: 0.32, w: 0.72, h: 0, hPx: 200, className: 'clock' }],
    solved: [{ svg: clockHand(), props: { angle: 135 }, w: 16, h: 120, spin: true, startRot: 0, solvedRot: 135 }],
    given: [0],
    rules: [L.allAngled(5)],
  },
  {
    id: 'button-tin', name: 'Button Tin', hint: 'Small to big, by colour, or two holes before four.',
    slots: row(6, { y: 0.25, w: 42, h: 42 }),
    areas: [{ x: 0.5, y: 0.25, w: 0.96, h: 0, hPx: 56, className: 'compartment' }],
    solved: [[200, 28, 2], [30, 30, 2], [120, 32, 4], [0, 34, 4], [280, 36, 2], [60, 40, 4]].map(([h, d, n]) => buttonI(h, d, n as 2 | 4)),
    rules: [L.whole(L.monotonic('d'))],
    also: [
      { rule: L.whole(L.monotonic('hue')), order: [3, 1, 5, 2, 0, 4] },
      { rule: L.whole(L.monotonicLoose('holes')), order: [0, 1, 4, 2, 3, 5] },
    ],
  },
  {
    id: 'fairy-lights', name: 'Fairy Lights', hint: 'Tap to switch. All on, or every other one.',
    slots: row(7, { y: 0.24, w: 34, h: 46, x0: 0.1, x1: 0.9 }),
    areas: [{ x: 0.5, y: 0.2, w: 0.98, h: 0, hPx: 8, className: 'wire' }],
    solved: [[0, 1], [40, 0], [120, 0], [200, 1], [280, 1], [330, 0], [60, 1]].map(([h, s]) => bulbI(h, s as 0 | 1)),
    given: [0, 1, 2, 3, 4, 5, 6],
    rules: [L.whole(allShow('on', 1, 7))],
    also: [{ rule: L.whole(L.neighboursDiffer('on')), states: [1, 0, 1, 0, 1, 0, 1] }],
  },
  {
    id: 'candles', name: 'Candles', hint: 'Short to tall, or up to a peak and down again.',
    slots: row(5, { y: 0.25, w: 28, h: 98, x0: 0.2, x1: 0.8 }),
    areas: [{ x: 0.5, y: 0.25, w: 0.8, h: 0, hPx: 104, className: 'shelf' }],
    solved: [30, 42, 54, 66, 78].map((h, i) => candleI(h, [C.rose, C.peach, C.yellow, C.sage, C.sky][i])),
    rules: [L.whole(L.monotonic('h'))],
    also: [{ rule: L.whole(L.peaked('h')), order: [0, 2, 4, 3, 1] }],
  },
  {
    id: 'dusty-frames', name: 'Dusty Frames', hint: 'Dust them and straighten them.',
    slots: [frameSlot('f0', 0.22, 0.28, 64, 52), frameSlot('f1', 0.5, 0.28, 64, 52), frameSlot('f2', 0.78, 0.28, 64, 52)],
    areas: [{ x: 0.5, y: 0.28, w: 0.96, h: 0, hPx: 120, className: 'wall' }],
    solved: [frameI(64, 52, '#cfe5f0', -10, { dirt: 4 }), frameI(64, 52, '#f8e3cf', 13, { dirt: 4 }), frameI(64, 52, '#e6f2ea', -7, { dirt: 4 })],
    given: [0, 1, 2],
    tools: [CLOTH],
    rules: [L.all(L.allClean, L.allAngled(3))],
  },
  {
    id: 'stamp-album', name: 'Stamp Album', hint: 'By value, or in colour blocks.',
    slots: row(6, { y: 0.26, w: 42, h: 48 }),
    areas: [{ x: 0.5, y: 0.26, w: 0.96, h: 0, hPx: 62, className: 'envelope' }],
    solved: [[1, C.pink], [2, C.mint], [3, C.blue], [4, C.pink], [5, C.mint], [6, C.blue]].map(([v, c]) => stampI(v as number, c as string)),
    rules: [L.whole(L.monotonic('v'))],
    also: [{ rule: L.whole(blocks('c', 3)), order: [0, 3, 1, 4, 2, 5] }],
  },
  {
    id: 'spice-shelf', name: 'Spice Shelf', hint: 'By height, by lid colour, or by the letters.',
    slots: row(6, { y: 0.25, w: 36, h: 66 }),
    areas: [{ x: 0.5, y: 0.25, w: 0.96, h: 0, hPx: 72, className: 'shelf' }],
    solved: [[210, 36, 'D'], [0, 40, 'A'], [120, 44, 'F'], [45, 48, 'C'], [280, 52, 'E'], [170, 56, 'B']].map(([h, ht, l]) => jarI(h as number, ht as number, l as string)),
    rules: [L.whole(L.monotonic('h'))],
    also: [
      { rule: L.whole(L.monotonic('hue')), order: [1, 3, 2, 5, 0, 4] },
      { rule: L.any(L.whole(L.spells('l', ['ABCDEF'])), L.whole(L.spells('l', ['FEDCBA']))), order: [1, 5, 3, 0, 4, 2] },
    ],
  },
  {
    id: 'domino-line', name: 'Domino Line', hint: 'A chain of matching ends, or by their totals.',
    slots: row(4, { y: 0.24, w: 58, h: 32, x0: 0.17, x1: 0.83 }),
    areas: [{ x: 0.5, y: 0.24, w: 0.94, h: 0, hPx: 56, className: 'runner' }],
    solved: [totalDominoI(2, 5), totalDominoI(5, 1), totalDominoI(1, 3), totalDominoI(3, 6)],
    turn: true,
    snapRadius: 40,
    rules: [L.chainedEnds()],
    also: [{ rule: L.whole(L.monotonic('total')), order: [2, 1, 0, 3] }],
  },
  {
    id: 'crooked-on-purpose', name: 'Crooked on Purpose', hint: 'Make every horizon level. One picture was painted crooked.',
    slots: [frameSlot('f0', 0.2, 0.28, 76, 60), frameSlot('f1', 0.5, 0.28, 76, 60), frameSlot('f2', 0.8, 0.28, 76, 60)],
    areas: [{ x: 0.5, y: 0.28, w: 0.98, h: 0, hPx: 120, className: 'wall' }],
    solved: [frameI(76, 60, '#cfe5f0', 9), frameI(76, 60, '#f8e3cf', 0, { tilt: -12 }), frameI(76, 60, '#e6f2ea', -8)],
    given: [0, 1, 2],
    rules: [L.allAngled(3)],
  },
  {
    id: 'book-nook', name: 'Book Nook', hint: 'By height, by colour, or by thickness.',
    slots: row(6, { y: 0.2, w: 36, h: 134, x0: 0.14, x1: 0.86 }),
    areas: [{ x: 0.5, y: 0.2, w: 0.92, h: 0, hPx: 138, className: 'shelf' }],
    solved: [[200, 92, 26], [20, 98, 32], [120, 104, 22], [300, 110, 30], [60, 116, 24], [250, 122, 28]].map(([h, ht, w]) => thickBookI(h, ht, w)),
    rules: [L.whole(L.monotonic('h'))],
    also: [
      { rule: L.whole(L.monotonic('hue')), order: [1, 4, 2, 0, 5, 3] },
      { rule: L.whole(L.monotonic('w')), order: [2, 4, 0, 5, 3, 1] },
    ],
  },
  {
    id: 'polished-cutlery', name: 'Polished Cutlery', hint: 'Polish everything, then put it away neatly.',
    ...groups([2, 2, 2], { y: 0.28, w: 26, h: 124, x0: 0.2, x1: 0.8 }),
    solved: [cutleryI('knife'), cutleryI('knife', 180), cutleryI('fork', 180), cutleryI('fork'), cutleryI('spoon'), cutleryI('spoon', 180)].map((it) => ({ ...it, dirt: 3 })),
    tools: [CLOTH],
    rules: [L.all(L.allClean, L.everyGroup(L.same('type')), L.sameRotation)],
  },
];
