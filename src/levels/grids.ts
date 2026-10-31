// Grid level builders. A grid is written as rows of characters ("012345"),
// a theme turns each character into an item, and a rule kit names the
// puzzle type. Used by the big chapters and by the design script.
import * as L from '../engine/lines';
import type { AreaDef, SlotDef, WinRule } from '../engine/types';
import { grid, type Item, type Spec } from './kit';
import { C, blockI, cardI, dieI, eggI, magnetI, tileI } from './items';
import type { Shape } from './objects';

/** A grid answer: one string per row, one character per cell. */
export type Rows = string[];

// ---- Themes: character -> item ----------------------------------------------

const TONES = [C.pink, C.mint, C.blue, C.yellow, C.lilac, C.peach];
const SYMS: Shape[] = ['heart', 'star', 'moon', 'drop', 'leaf', 'diamond'];
const SYM_COL = ['#e58f86', '#d8a54a', '#7d95c9', '#6fa8c9', '#6fae8f', '#9b84c4'];
const digit = (ch: string) => parseInt(ch, 36);

export type Theme = (ch: string, size: number) => Item;

export const THEMES = {
  /** Plain colour tiles; prop `c`. */
  colour: ((ch, size) => tileI(TONES[digit(ch)], undefined, size)) as Theme,
  /** White tiles with a coloured symbol; prop `sym`. */
  symbol: ((ch, size) => tileI('#fffaf3', SYMS[digit(ch)], size, SYM_COL[digit(ch)])) as Theme,
  /** Dice 1-6; prop `n`. */
  dice: ((ch) => dieI(digit(ch) + 1)) as Theme,
  /** Letter magnets; prop `l`. */
  letter: ((ch, size) => magnetI(ch, C.sky, size)) as Theme,
  /** Two-tone: cocoa (1) / cream (0) tiles; prop `c`. */
  twoTone: ((ch, size) => tileI(ch === '1' ? C.cocoa : C.cream, undefined, size)) as Theme,
  /** Eggs in three shades; prop `c`. */
  egg: ((ch) => eggI([C.cream, C.cocoa, C.sky][digit(ch)])) as Theme,
};

/** Numbers, written in base 36 ("a" = 10 ... "z" = 35). */
export const numberTheme = (colour: string): Theme => (ch, size) => blockI(digit(ch), colour, size);

/** Two characters per cell: colour + symbol (Graeco-Latin squares). */
export const pairTheme: Theme = (ch, size) => tileI(TONES[digit(ch[0])], SYMS[digit(ch[1])], size, '#fff');

/** Two characters per cell: rank index + suit index (cards). */
export const cardTheme = (ranks: number[], size = 36): Theme => (ch) =>
  cardI(ranks[digit(ch[0])], (['S', 'H', 'C', 'D'] as const)[digit(ch[1])], size);

// ---- Rule kits ----------------------------------------------------------------

const latin = (prop: string) => L.all(L.everyRow(L.distinct(prop)), L.everyCol(L.distinct(prop)));

export const KITS = {
  latin: (prop: string): WinRule => latin(prop),
  sudoku: (prop: string, boxH: number, boxW: number): WinRule => L.all(latin(prop), L.everyBox(boxH, L.distinct(prop), boxW)),
  graeco: (a: string, b: string, diagonals = false): WinRule =>
    L.all(latin(a), latin(b), ...(diagonals ? [L.diagonals(L.distinct(a)), L.diagonals(L.distinct(b))] : [])),
  takuzu: (n: number): WinRule => L.all(
    L.everyRow(L.countIs('c', C.cocoa, n / 2)), L.everyCol(L.countIs('c', C.cocoa, n / 2)),
    L.everyRow(L.noRunOf3('c')), L.everyCol(L.noRunOf3('c')), L.rowsDiffer('c'), L.colsDiffer('c'),
  ),
  sorted: (): WinRule => L.all(L.everyRow(L.increasing('n')), L.everyCol(L.increasing('n'))),
  magic: (total: number): WinRule =>
    L.all(L.everyRow(L.sumIs('n', total)), L.everyCol(L.sumIs('n', total)), L.diagonals(L.sumIs('n', total))),
  sums: (rowsT: number[], colsT: number[], prop = 'n'): WinRule =>
    L.all(...rowsT.map((t, r) => L.rowAt(r, L.sumIs(prop, t))), ...colsT.map((t, c) => L.colAt(c, L.sumIs(prop, t)))),
  words: (words: string[]): WinRule => L.all(L.everyRow(L.spells('l', words)), L.everyCol(L.spells('l', words))),
  /** No two alike touching, and each colour `perLine` times in every row and column. */
  quilt: (colours: number, perLine: number, diagonal = false): WinRule => L.all(
    L.noTouchingSame('c', diagonal),
    ...Array.from({ length: colours }, (_, i) => TONES[i]).flatMap((t) => [
      L.everyRow(L.countIs('c', t, perLine)), L.everyCol(L.countIs('c', t, perLine)),
    ]),
  ),
};

// ---- Spec builder --------------------------------------------------------------

/** Row and column totals of a numeric grid (base-36 digits). */
export function totals(rows: Rows, value = (ch: string) => digit(ch)): { rowsT: number[]; colsT: number[] } {
  const cells = rows.map((r) => [...r].map(value));
  return {
    rowsT: cells.map((r) => r.reduce((a, b) => a + b, 0)),
    colsT: cells[0].map((_, c) => cells.reduce((a, r) => a + r[c], 0)),
  };
}

/** Small labels: row totals at the right, column totals above. */
export function targetTags(slots: SlotDef[], rowsT: number[], colsT: number[]): AreaDef[] {
  const xs = [...new Set(slots.map((s) => s.x))].sort((a, b) => a - b);
  const ys = [...new Set(slots.map((s) => s.y))].sort((a, b) => a - b);
  const dy = ys[1] - ys[0];
  const dx = xs[1] - xs[0];
  return [
    ...rowsT.map((t, r) => ({ x: Math.min(0.95, xs[xs.length - 1] + dx * 0.85), y: ys[r], w: 0.08, h: 0, hPx: 24, className: 'tag', label: String(t) })),
    ...colsT.map((t, c) => ({ x: xs[c], y: ys[0] - dy * 0.7, w: 0.08, h: 0, hPx: 24, className: 'tag', label: String(t) })),
  ];
}

export interface GridLevel {
  id: string;
  name: string;
  hint: string;
  rows: Rows;
  /** Characters per cell (2 for colour+symbol pairs). */
  width?: number;
  theme: Theme;
  rule: WinRule;
  given: number[];
  /** Cell size in px (default fits the grid on a 320px phone). */
  cell?: number;
  cellH?: number;
  /** Extra space above the grid (for column labels). */
  top?: number;
  tags?: { rowsT: number[]; colsT: number[] };
  unique?: boolean;
}

/** Biggest square cell (px) that lets `cols` columns fit the narrowest board. */
export const cellFor = (cols: number) => Math.min(48, Math.floor((276 - (cols - 1) * 3) / cols));

export function gridSpec(g: GridLevel): Spec {
  const w = g.width ?? 1;
  const cols = g.rows[0].length / w;
  const cell = g.cell ?? cellFor(cols + (g.tags ? 0.7 : 0));
  // Column totals sit above the grid, so leave them room.
  const top = g.top ?? (g.tags?.colsT.length ? 0.07 : 0.02);
  const slots = grid(g.rows.length, cols, { cell, h: g.cellH, gap: 3, y0: top + ((g.cellH ?? cell) / 2 + 4) / 380 });
  const cells = g.rows.flatMap((r) => Array.from({ length: cols }, (_, c) => r.slice(c * w, c * w + w)));
  return {
    id: g.id, name: g.name, hint: g.hint,
    slots,
    areas: g.tags ? targetTags(slots, g.tags.rowsT, g.tags.colsT) : undefined,
    solved: cells.map((ch) => g.theme(ch, Math.max(30, cell - 4))),
    given: g.given,
    rules: [g.rule],
    unique: g.unique ?? true,
  };
}
