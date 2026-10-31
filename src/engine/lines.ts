// Line rules: a predicate about a list of pieces ("all different",
// "adds up to 15"...) applied to every row, column, group or diagonal.
// Combine them with all() from rules.ts to describe logic puzzles.
import type { BoardView, PieceState, SlotDef, WinRule } from './types';

// Re-exported so level files can import every rule from one place.
export { all, chainedEnds, equalSums, sameRotation } from './rules';

/** One slot's content: a piece, or undefined while still empty. */
type Cell = PieceState | undefined;

/**
 * A question about one full line of pieces, optionally with `possible`:
 * "could this partly filled line (gaps = undefined) still pass?"
 */
export type LinePred = ((ps: PieceState[]) => boolean) & { possible?: (line: Cell[]) => boolean };

const val = (p: PieceState, prop: string) => p.def.props?.[prop];
const num = (p: PieceState, prop: string) => Number(val(p, prop));
const filled = (line: Cell[]) => line.filter((p): p is PieceState => !!p);
/** Attach an early check to a predicate. */
const withPossible = (full: (ps: PieceState[]) => boolean, possible: (line: Cell[]) => boolean): LinePred =>
  Object.assign(full, { possible });
/** Neighbouring pairs where both slots are filled. */
const filledPairs = (line: Cell[]) =>
  line.flatMap((p, i) => (i > 0 && p && line[i - 1] ? [[line[i - 1]!, p] as const] : []));

// ---- Predicates ---------------------------------------------------------

const allDistinct = (prop: string) => (ps: PieceState[]) => new Set(ps.map((p) => val(p, prop))).size === ps.length;
export const distinct = (prop: string): LinePred => withPossible(allDistinct(prop), (line) => allDistinct(prop)(filled(line)));

const allSame = (prop: string) => (ps: PieceState[]) => ps.every((p) => val(p, prop) === val(ps[0], prop));
export const same = (prop: string): LinePred => withPossible(allSame(prop), (line) => allSame(prop)(filled(line)));

/** Adds up to `total` (values are positive, so a partial sum can't exceed it). */
export const sumIs = (prop: string, total: number): LinePred => withPossible(
  (ps) => ps.reduce((a, p) => a + num(p, prop), 0) === total,
  (line) => filled(line).reduce((a, p) => a + num(p, prop), 0) <= total,
);

const rising = (prop: string) => (ps: PieceState[]) => ps.every((p, i) => i === 0 || num(p, prop) > num(ps[i - 1], prop));
/** Strictly increasing in line order. */
export const increasing = (prop: string): LinePred => withPossible(rising(prop), (line) => rising(prop)(filled(line)));

/** Strictly increasing or strictly decreasing. */
export const monotonic = (prop: string): LinePred => (ps) =>
  increasing(prop)(ps) || increasing(prop)([...ps].reverse());

export const spells = (prop: string, words: string[]): LinePred => withPossible(
  (ps) => words.includes(ps.map((p) => val(p, prop)).join('')),
  (line) => words.some((w) => line.every((p, i) => !p || w[i] === val(p, prop))),
);

/** Holds exactly these values, in any order (e.g. a bowl wants red + blue). */
export const holds = (prop: string, values: (string | number)[]): LinePred => withPossible(
  (ps) => ps.map((p) => String(val(p, prop))).sort().join() === values.map(String).sort().join(),
  (line) => {
    const left = values.map(String);
    return filled(line).every((p) => {
      const i = left.indexOf(String(val(p, prop)));
      return i >= 0 && !!left.splice(i, 1);
    });
  },
);

/** Increasing or decreasing, allowing equal neighbours (pairs side by side). */
export const monotonicLoose = (prop: string): LinePred => (ps) => {
  const v = ps.map((p) => num(p, prop));
  return v.every((x, i) => i === 0 || x >= v[i - 1]) || v.every((x, i) => i === 0 || x <= v[i - 1]);
};

/** No two neighbours share `prop` (e.g. alternating light/dark). */
export const neighboursDiffer = (prop: string): LinePred => withPossible(
  (ps) => ps.every((p, i) => i === 0 || val(p, prop) !== val(ps[i - 1], prop)),
  (line) => filledPairs(line).every(([a, b]) => val(a, prop) !== val(b, prop)),
);

/** Reads the same from both ends. */
export const palindrome = (prop: string): LinePred => withPossible(
  (ps) => ps.every((p, i) => val(p, prop) === val(ps[ps.length - 1 - i], prop)),
  (line) => line.every((p, i) => !p || !line[line.length - 1 - i] || val(p, prop) === val(line[line.length - 1 - i]!, prop)),
);

/** A repeating pattern: piece i matches piece i + period, and each block has no repeats. */
export const repeats = (prop: string, period: number): LinePred => (ps) =>
  ps.every((p, i) => i + period >= ps.length || val(p, prop) === val(ps[i + period], prop)) &&
  distinct(prop)(ps.slice(0, period));

/** Neighbours differ by exactly `step` (stepping stones). */
export const steps = (prop: string, step: number): LinePred => withPossible(
  (ps) => ps.every((p, i) => i === 0 || Math.abs(num(p, prop) - num(ps[i - 1], prop)) === step),
  (line) => filledPairs(line).every(([a, b]) => Math.abs(num(a, prop) - num(b, prop)) === step),
);

/** Exactly `n` pieces whose `prop` equals `value`. */
export const countIs = (prop: string, value: string | number, n: number): LinePred => withPossible(
  (ps) => ps.filter((p) => val(p, prop) === value).length === n,
  (line) => {
    const f = filled(line);
    const hits = f.filter((p) => val(p, prop) === value).length;
    return hits <= n && f.length - hits <= line.length - n;
  },
);

/** Never three of the same `prop` in a row. */
const noTriple = (prop: string) => (line: Cell[]) =>
  line.every((p, i) => i < 2 || !p || !line[i - 1] || !line[i - 2] ||
    !(val(p, prop) === val(line[i - 1]!, prop) && val(p, prop) === val(line[i - 2]!, prop)));
export const noRunOf3 = (prop: string): LinePred => withPossible(noTriple(prop), noTriple(prop));

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
const every = (pick: (b: BoardView) => SlotDef[][], pred: LinePred): WinRule =>
  Object.assign(
    (b: BoardView) => {
      const ls = lines(b, pick(b));
      return !!ls && ls.every(pred);
    },
    {
      // Early check: full lines must pass; partly filled ones must still be possible.
      possible: (b: BoardView) => pick(b).every((g) => {
        const line = g.map((s) => b.pieceIn(s.id));
        if (line.every(Boolean)) return pred(line as PieceState[]);
        return pred.possible ? pred.possible(line) : true;
      }),
    },
  );

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

/** Each box of a sudoku: `h` rows by `w` columns (w defaults to h). */
export const everyBox = (h: number, pred: LinePred, w = h) =>
  every((b) => by(b.slots, (s) => (s.row === undefined ? undefined : `${Math.floor(s.row / h)},${Math.floor((s.col ?? 0) / w)}`)), pred);

// ---- Neighbour rules ----------------------------------------------------
// Each is written once over "cells that may be empty"; the full rule also
// requires every slot to be filled, the early check (`possible`) doesn't.

/** Build a rule from a check that ignores empty slots. */
const neighbourRule = (check: (b: BoardView) => boolean): WinRule =>
  Object.assign((b: BoardView) => b.slots.every((s) => b.pieceIn(s.id)) && check(b), { possible: check });

/** No two touching grid cells share `prop` (diagonal = corners count too). */
export const noTouchingSame = (prop: string, diagonal = false): WinRule => neighbourRule((b) => {
  const at = new Map(b.slots.map((s) => [`${s.row},${s.col}`, b.pieceIn(s.id)]));
  for (const s of b.slots) {
    const here = at.get(`${s.row},${s.col}`);
    if (!here) continue;
    for (const [dr, dc] of diagonal ? [[0, 1], [1, 0], [1, 1], [1, -1]] : [[0, 1], [1, 0]]) {
      const n = at.get(`${(s.row ?? 0) + dr},${(s.col ?? 0) + dc}`);
      if (n && val(n, prop) === val(here, prop)) return false;
    }
  }
  return true;
});

/** Pairs of loop neighbours (last touches first) where both are filled. */
const loopPairs = (b: BoardView) => {
  const ps = b.slots.map((s) => b.pieceIn(s.id));
  return ps.flatMap((p, i) => {
    const q = ps[(i + 1) % ps.length];
    return p && q ? [[p, q] as const] : [];
  });
};

/** Around a loop (slot order, last touches first): neighbours differ. */
export const loopNeighboursDiffer = (prop: string): WinRule =>
  neighbourRule((b) => loopPairs(b).every(([p, q]) => val(p, prop) !== val(q, prop)));

/** Around a loop: neighbours (last touching first) differ by exactly `step`. */
export const loopSteps = (prop: string, step: number): WinRule =>
  neighbourRule((b) => loopPairs(b).every(([p, q]) => Math.abs(num(p, prop) - num(q, prop)) === step));

/** Around a loop: each piece matches the one directly opposite. */
export const oppositeSame = (prop: string): WinRule => neighbourRule((b) => {
  const ps = b.slots.map((s) => b.pieceIn(s.id));
  const half = ps.length / 2;
  return ps.slice(0, half).every((p, i) => !p || !ps[i + half] || val(p, prop) === val(ps[i + half]!, prop));
});

/** No two complete rows (or columns) are exactly alike. */
const linesDiffer = (pick: (b: BoardView) => SlotDef[][], prop: string) => neighbourRule((b) => {
  const full = pick(b).map((g) => g.map((s) => b.pieceIn(s.id))).filter((l) => l.every(Boolean)) as PieceState[][];
  return new Set(full.map((l) => l.map((p) => val(p, prop)).join())).size === full.length;
});
export const rowsDiffer = (prop: string): WinRule => linesDiffer(rowsOf, prop);
export const colsDiffer = (prop: string): WinRule => linesDiffer(colsOf, prop);

/** Two groups (e.g. the pans of one scale) weigh the same. */
export const balanced = (a: string, c: string, prop: string): WinRule => (b) => {
  const sum = (g: string) => {
    const ps = b.slots.filter((s) => s.group === g).map((s) => b.pieceIn(s.id));
    return ps.some((p) => !p) ? NaN : ps.reduce((t, p) => t + num(p!, prop), 0);
  };
  return sum(a) === sum(c);
};

/** Every outline slot holds a piece with its wanted props and rotation. */
export const fitsOutlines: WinRule = neighbourRule((b) =>
  b.slots.every((s) => {
    const p = b.pieceIn(s.id);
    if (!p) return true;
    const props = Object.entries(s.want ?? {}).every(([k, v]) => val(p, k) === v);
    if (s.wantRot === undefined) return props;
    const mod = s.wantRotMod ?? 360;
    const norm = (r: number) => ((r % mod) + mod) % mod;
    return props && norm(p.rotation) === norm(s.wantRot);
  }));
