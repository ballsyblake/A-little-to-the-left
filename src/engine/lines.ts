// Line rules: a predicate about a list of pieces ("all different",
// "adds up to 15"...) applied to every row, column, group or diagonal.
// Combine them with all() from rules.ts to describe logic puzzles.
import type { BoardView, PieceState, SlotDef, WinRule } from './types';

// Re-exported so level files can import every rule from one place.
export { all, chainedEnds, equalSums, sameRotation } from './rules';

/** A question about one line of pieces. */
export type LinePred = (ps: PieceState[]) => boolean;

const val = (p: PieceState, prop: string) => p.def.props?.[prop];
const num = (p: PieceState, prop: string) => Number(val(p, prop));

// ---- Predicates ---------------------------------------------------------

export const distinct = (prop: string): LinePred => (ps) => new Set(ps.map((p) => val(p, prop))).size === ps.length;

export const same = (prop: string): LinePred => (ps) => ps.every((p) => val(p, prop) === val(ps[0], prop));

export const sumIs = (prop: string, total: number): LinePred => (ps) =>
  ps.reduce((a, p) => a + num(p, prop), 0) === total;

/** Strictly increasing in line order. */
export const increasing = (prop: string): LinePred => (ps) => ps.every((p, i) => i === 0 || num(p, prop) > num(ps[i - 1], prop));

/** Strictly increasing or strictly decreasing. */
export const monotonic = (prop: string): LinePred => (ps) =>
  increasing(prop)(ps) || increasing(prop)([...ps].reverse());

export const spells = (prop: string, words: string[]): LinePred => (ps) => words.includes(ps.map((p) => val(p, prop)).join(''));

/** Holds exactly these values, in any order (e.g. a bowl wants red + blue). */
export const holds = (prop: string, values: (string | number)[]): LinePred => (ps) =>
  ps.map((p) => String(val(p, prop))).sort().join() === values.map(String).sort().join();

/** Increasing or decreasing, allowing equal neighbours (pairs side by side). */
export const monotonicLoose = (prop: string): LinePred => (ps) => {
  const v = ps.map((p) => num(p, prop));
  return v.every((x, i) => i === 0 || x >= v[i - 1]) || v.every((x, i) => i === 0 || x <= v[i - 1]);
};

/** No two neighbours share `prop` (e.g. alternating light/dark). */
export const neighboursDiffer = (prop: string): LinePred => (ps) => ps.every((p, i) => i === 0 || val(p, prop) !== val(ps[i - 1], prop));

/** Reads the same from both ends. */
export const palindrome = (prop: string): LinePred => (ps) => ps.every((p, i) => val(p, prop) === val(ps[ps.length - 1 - i], prop));

/** A repeating pattern: piece i matches piece i + period, and each block has no repeats. */
export const repeats = (prop: string, period: number): LinePred => (ps) =>
  ps.every((p, i) => i + period >= ps.length || val(p, prop) === val(ps[i + period], prop)) &&
  distinct(prop)(ps.slice(0, period));

/** Neighbours differ by exactly `step` (stepping stones). */
export const steps = (prop: string, step: number): LinePred => (ps) =>
  ps.every((p, i) => i === 0 || Math.abs(num(p, prop) - num(ps[i - 1], prop)) === step);

/** Exactly `n` pieces whose `prop` equals `value`. */
export const countIs = (prop: string, value: string | number, n: number): LinePred => (ps) =>
  ps.filter((p) => val(p, prop) === value).length === n;

/** Never three of the same `prop` in a row. */
export const noRunOf3 = (prop: string): LinePred => (ps) =>
  ps.every((p, i) => i < 2 || !(val(p, prop) === val(ps[i - 1], prop) && val(p, prop) === val(ps[i - 2], prop)));

/** Rises strictly to a single highest point, then falls strictly. */
export const peaked = (prop: string): LinePred => (ps) => {
  const v = ps.map((p) => num(p, prop));
  const top = v.indexOf(Math.max(...v));
  return v.every((x, i) => i === 0 || (i <= top ? x > v[i - 1] : x < v[i - 1]));
};

// ---- Lines --------------------------------------------------------------

/** All slots filled? Then the pieces of the given slot lists, else null. */
function lines(b: BoardView, groups: SlotDef[][]): PieceState[][] | null {
  const out: PieceState[][] = [];
  for (const g of groups) {
    const ps = g.map((s) => b.pieceIn(s.id));
    if (ps.some((p) => !p)) return null;
    out.push(ps as PieceState[]);
  }
  return out;
}

/** Group slots by a key, keeping each group in slot order. */
function by(slots: SlotDef[], key: (s: SlotDef) => string | number | undefined): SlotDef[][] {
  const m = new Map<string | number, SlotDef[]>();
  for (const s of slots) {
    const k = key(s);
    if (k === undefined) continue;
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(s);
  }
  return [...m.values()];
}

const rowsOf = (b: BoardView) => by([...b.slots].sort((a, c) => (a.col ?? 0) - (c.col ?? 0)), (s) => s.row);
const colsOf = (b: BoardView) => by([...b.slots].sort((a, c) => (a.row ?? 0) - (c.row ?? 0)), (s) => s.col);

/** Every listed line passes `pred` (and every slot in them is filled). */
const every = (pick: (b: BoardView) => SlotDef[][], pred: LinePred): WinRule => (b) => {
  const ls = lines(b, pick(b));
  return !!ls && ls.every(pred);
};

export const everyRow = (pred: LinePred) => every(rowsOf, pred);
export const everyCol = (pred: LinePred) => every(colsOf, pred);
export const everyGroup = (pred: LinePred) => every((b) => by(b.slots, (s) => s.group), pred);

/** One particular row / column / group. */
export const rowAt = (i: number, pred: LinePred) => every((b) => [rowsOf(b)[i]], pred);
export const colAt = (i: number, pred: LinePred) => every((b) => [colsOf(b)[i]], pred);
export const groupAt = (g: string, pred: LinePred) => every((b) => [b.slots.filter((s) => s.group === g)], pred);

/** Both diagonals of a square grid. */
export const diagonals = (pred: LinePred) => every((b) => {
  const n = rowsOf(b).length;
  const at = (r: number, c: number) => b.slots.find((s) => s.row === r && s.col === c)!;
  return [
    Array.from({ length: n }, (_, i) => at(i, i)),
    Array.from({ length: n }, (_, i) => at(i, n - 1 - i)),
  ];
}, pred);

/** Slots named by id, in that order, as one line (e.g. one arm of a cross). */
export const slotsLine = (ids: string[], pred: LinePred) => every((b) => [ids.map((id) => b.slots.find((s) => s.id === id)!)], pred);

/** All slots, in slot order, as one line. */
export const whole = (pred: LinePred) => every((b) => [b.slots], pred);

/** Each 2x2 box of a 4x4 grid (mini-sudoku). */
export const everyBox = (size: number, pred: LinePred) =>
  every((b) => by(b.slots, (s) => (s.row === undefined ? undefined : `${Math.floor(s.row / size)},${Math.floor((s.col ?? 0) / size)}`)), pred);

// ---- Neighbour rules ----------------------------------------------------

/** No two touching grid cells share `prop` (diagonal = corners count too). */
export const noTouchingSame = (prop: string, diagonal = false): WinRule => (b) => {
  if (b.slots.some((s) => !b.pieceIn(s.id))) return false;
  const at = new Map(b.slots.map((s) => [`${s.row},${s.col}`, b.pieceIn(s.id)!]));
  for (const s of b.slots) {
    const here = val(at.get(`${s.row},${s.col}`)!, prop);
    for (const [dr, dc] of diagonal ? [[0, 1], [1, 0], [1, 1], [1, -1]] : [[0, 1], [1, 0]]) {
      const n = at.get(`${(s.row ?? 0) + dr},${(s.col ?? 0) + dc}`);
      if (n && val(n, prop) === here) return false;
    }
  }
  return true;
};

/** Around a loop (slot order, last touches first): neighbours differ. */
export const loopNeighboursDiffer = (prop: string): WinRule => (b) => {
  const ps = b.slots.map((s) => b.pieceIn(s.id));
  if (ps.some((p) => !p)) return false;
  return ps.every((p, i) => val(p!, prop) !== val(ps[(i + 1) % ps.length]!, prop));
};

/** Around a loop: neighbours (last touching first) differ by exactly `step`. */
export const loopSteps = (prop: string, step: number): WinRule => (b) => {
  const ps = b.slots.map((s) => b.pieceIn(s.id));
  if (ps.some((p) => !p)) return false;
  return ps.every((p, i) => Math.abs(num(p!, prop) - num(ps[(i + 1) % ps.length]!, prop)) === step);
};

/** No two rows (or columns) are exactly alike. */
export const rowsDiffer = (prop: string): WinRule => (b) => {
  const ls = lines(b, rowsOf(b));
  return !!ls && new Set(ls.map((l) => l.map((p) => val(p, prop)).join())).size === ls.length;
};
export const colsDiffer = (prop: string): WinRule => (b) => {
  const ls = lines(b, colsOf(b));
  return !!ls && new Set(ls.map((l) => l.map((p) => val(p, prop)).join())).size === ls.length;
};

/** Two groups (e.g. the pans of one scale) weigh the same. */
export const balanced = (a: string, c: string, prop: string): WinRule => (b) => {
  const sum = (g: string) => {
    const ps = b.slots.filter((s) => s.group === g).map((s) => b.pieceIn(s.id));
    return ps.some((p) => !p) ? NaN : ps.reduce((t, p) => t + num(p!, prop), 0);
  };
  return sum(a) === sum(c);
};

/** Around a loop: each piece matches the one directly opposite. */
export const oppositeSame = (prop: string): WinRule => (b) => {
  const ps = b.slots.map((s) => b.pieceIn(s.id));
  if (ps.some((p) => !p)) return false;
  const half = ps.length / 2;
  return ps.slice(0, half).every((p, i) => val(p!, prop) === val(ps[i + half]!, prop));
};

/** Every outline slot holds a piece with its wanted props and rotation. */
export const fitsOutlines: WinRule = (b) =>
  b.slots.every((s) => {
    const p = b.pieceIn(s.id);
    if (!p) return false;
    const props = Object.entries(s.want ?? {}).every(([k, v]) => val(p, k) === v);
    if (s.wantRot === undefined) return props;
    const mod = s.wantRotMod ?? 360;
    const norm = (r: number) => ((r % mod) + mod) % mod;
    return props && norm(p.rotation) === norm(s.wantRot);
  });
