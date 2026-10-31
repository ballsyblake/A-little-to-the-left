// Solved-grid generators for the design script. Each returns a valid,
// randomised answer as number[][]; the design script then picks givens.
import type { Rng } from './rng';

type Grid = number[][];
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Apply row, column and symbol shuffles that keep a Latin square Latin. */
function shuffleLatin(g: Grid, opts: { rows?: number[]; cols?: number[]; symbols?: number[] }): Grid {
  const rows = opts.rows ?? range(g.length);
  const cols = opts.cols ?? range(g[0].length);
  const sym = opts.symbols ?? range(g.length);
  return rows.map((r) => cols.map((c) => sym[g[r][c]]));
}

/** n x n Latin square: every row and column holds 0..n-1 once. */
export function latin(n: number, rng: Rng): Grid {
  const base = range(n).map((r) => range(n).map((c) => (r + c) % n));
  return shuffleLatin(base, { rows: rng.shuffle(range(n)), cols: rng.shuffle(range(n)), symbols: rng.shuffle(range(n)) });
}

/** 5x5 Latin square whose two diagonals are also all different. */
export function diagonalLatin5(rng: Rng): Grid {
  const base = range(5).map((r) => range(5).map((c) => (r + 2 * c) % 5));
  return shuffleLatin(base, { symbols: rng.shuffle(range(5)) });
}

/** Sudoku of size bh*bw with boxes bh rows by bw columns (6x6: 2x3). */
export function sudoku(bh: number, bw: number, rng: Rng): Grid {
  const n = bh * bw;
  const base = range(n).map((r) => range(n).map((c) => (bw * (r % bh) + Math.floor(r / bh) + c) % n));
  // Shuffle bands of rows, rows inside a band, stacks of columns, columns inside a stack.
  const rows = rng.shuffle(range(bw)).flatMap((band) => rng.shuffle(range(bh)).map((i) => band * bh + i));
  const cols = rng.shuffle(range(bh)).flatMap((stack) => rng.shuffle(range(bw)).map((i) => stack * bw + i));
  return shuffleLatin(base, { rows, cols, symbols: rng.shuffle(range(n)) });
}

/**
 * Two orthogonal Latin squares (every pair of values appears once).
 * With `diagonals`, both diagonals are all-different too (order 4 or 5).
 */
export function graeco(n: 4 | 5, rng: Rng, diagonals: boolean): [Grid, Grid] {
  let a: Grid;
  let b: Grid;
  if (n === 4) {
    a = [[0, 1, 2, 3], [2, 3, 0, 1], [3, 2, 1, 0], [1, 0, 3, 2]];
    b = [[0, 1, 2, 3], [3, 2, 1, 0], [1, 0, 3, 2], [2, 3, 0, 1]];
  } else {
    a = range(5).map((r) => range(5).map((c) => (r + 2 * c) % 5));
    b = range(5).map((r) => range(5).map((c) => (2 * r + c) % 5));
  }
  // Row/column shuffles would break the diagonals, so only use them without.
  const rows = diagonals ? range(n) : rng.shuffle(range(n));
  const cols = diagonals ? range(n) : rng.shuffle(range(n));
  return [
    shuffleLatin(a, { rows, cols, symbols: rng.shuffle(range(n)) }),
    shuffleLatin(b, { rows, cols, symbols: rng.shuffle(range(n)) }),
  ];
}

/** Random fill by backtracking, cell by cell; `ok` checks the latest cell. */
function backtrack(rows: number, cols: number, values: number[], rng: Rng, ok: (g: Grid, r: number, c: number) => boolean): Grid {
  const g: Grid = range(rows).map(() => range(cols).map(() => -1));
  const fill = (k: number): boolean => {
    if (k === rows * cols) return true;
    const r = Math.floor(k / cols);
    const c = k % cols;
    for (const v of rng.shuffle(values)) {
      g[r][c] = v;
      if (ok(g, r, c) && fill(k + 1)) return true;
    }
    g[r][c] = -1;
    return false;
  };
  if (!fill(0)) throw new Error('no grid');
  return g;
}

/** Takuzu: n/2 of each colour per line, never three in a row, no two lines alike. */
export function takuzu(n: number, rng: Rng): Grid {
  return backtrack(n, n, [0, 1], rng, (g, r, c) => {
    const row = g[r].slice(0, c + 1);
    const col = g.slice(0, r + 1).map((x) => x[c]);
    for (const line of [row, col]) {
      for (const v of [0, 1]) if (line.filter((x) => x === v).length > n / 2) return false;
      const k = line.length;
      if (k >= 3 && line[k - 1] === line[k - 2] && line[k - 2] === line[k - 3]) return false;
    }
    if (c === n - 1 && g.slice(0, r).some((other) => other.join() === g[r].join())) return false;
    if (r === n - 1) {
      const colStr = (cc: number) => g.map((x) => x[cc]).join();
      if (range(c).some((cc) => colStr(cc) === colStr(c))) return false;
    }
    return true;
  });
}

/** Quilt: no two alike touching; with `perLine`, each colour that often per row/column. */
export function quilt(n: number, colours: number, rng: Rng, opts: { perLine?: number; diagonal?: boolean } = {}): Grid {
  return backtrack(n, n, range(colours), rng, (g, r, c) => {
    const v = g[r][c];
    const near = [[0, -1], [-1, 0], ...(opts.diagonal ? [[-1, -1], [-1, 1]] : [])];
    if (near.some(([dr, dc]) => g[r + dr]?.[c + dc] === v)) return false;
    if (opts.perLine !== undefined) {
      if (g[r].filter((x) => x === v).length > opts.perLine) return false;
      if (g.map((x) => x[c]).filter((x) => x === v).length > opts.perLine) return false;
    }
    return true;
  });
}

/** Young tableau: 1..rows*cols, every row and column increasing. */
export function young(rows: number, cols: number, rng: Rng): Grid {
  const g: Grid = range(rows).map(() => range(cols).map(() => 0));
  for (let v = 1; v <= rows * cols; v++) {
    // Cells whose top and left neighbours are already filled.
    const ready = range(rows * cols)
      .map((k) => [Math.floor(k / cols), k % cols])
      .filter(([r, c]) => !g[r][c] && (r === 0 || g[r - 1][c]) && (c === 0 || g[r][c - 1]));
    const [r, c] = rng.pick(ready);
    g[r][c] = v;
  }
  return g;
}

/** A 4x4 magic square (lines and diagonals total 34), randomly turned/flipped. */
export function magic4(rng: Rng): Grid {
  const squares: Grid[] = [
    [[16, 3, 2, 13], [5, 10, 11, 8], [9, 6, 7, 12], [4, 15, 14, 1]],
    [[1, 8, 13, 12], [14, 11, 2, 7], [4, 5, 16, 9], [15, 10, 3, 6]],
  ];
  let g = rng.pick(squares);
  for (let t = rng.int(0, 3); t > 0; t--) g = g[0].map((_, c) => g.map((row) => row[c]).reverse()); // rotate
  if (rng.next() < 0.5) g = g.map((row) => [...row].reverse()); // mirror
  if (rng.next() < 0.5) g = g.map((row) => row.map((v) => 17 - v)); // complement is magic too
  return g;
}

/** 1..n*n in random order. */
export function shuffled(n: number, rng: Rng): Grid {
  const vals = rng.shuffle(range(n * n).map((i) => i + 1));
  return range(n).map((r) => vals.slice(r * n, r * n + n));
}

/** Grid -> rows of base-36 characters (one per cell). */
export const encode = (g: Grid): string[] => g.map((row) => row.map((v) => v.toString(36)).join(''));

/** Two grids -> rows of 2-character cells. */
export const encodePairs = (a: Grid, b: Grid): string[] =>
  a.map((row, r) => row.map((v, c) => v.toString(36) + b[r][c].toString(36)).join(''));
