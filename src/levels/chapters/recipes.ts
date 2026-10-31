// Grid puzzle recipes for chapters 4-6. Each says how to generate a solved
// grid and how to present it. The design script turns recipes into
// grid-data.json (answers + givens); the chapters build levels from that.
import * as L from '../../engine/lines';
import { encode, encodePairs, diagonalLatin5, graeco, latin, magic4, quilt, shuffled, sudoku, takuzu, young } from '../generate';
import { KITS, THEMES, cardTheme, numberTheme, pairTheme, totals, type GridLevel, type Rows, type Theme } from '../grids';
import { C, stampI } from '../items';
import type { Rng } from '../rng';

export interface Recipe {
  id: string;
  /** A solved grid, as rows of characters. */
  make(rng: Rng): Rows;
  /** Everything about the level except its givens. */
  level(rows: Rows): Omit<GridLevel, 'given'>;
  width?: number;
  /** Givens added back after reaching the minimum (easier = more). */
  extra?: number;
  maxNodes?: number;
}

const LETTERS = 'ABCDEF';
const stampTheme: Theme = (ch) => stampI(parseInt(ch, 36), [C.pink, C.mint, C.blue, C.yellow][parseInt(ch, 36) % 4]);
const sumsOf = (rows: Rows) => totals(rows);
const words = (ws: string[]) => (): Rows => ws;

/** Shorthand for the common case: rows + theme + rule. */
const lvl = (id: string, name: string, hint: string, theme: Theme, rule: (rows: Rows) => GridLevel['rule'], more: Partial<GridLevel> = {}) =>
  (rows: Rows): Omit<GridLevel, 'given'> => ({ id, name, hint, rows, theme, rule: rule(rows), ...more });

const sumsLevel = (id: string, name: string, theme: Theme, prop = 'n') => (rows: Rows) => {
  const tags = sumsOf(rows);
  return { id, name, hint: 'Rows and columns add to their numbers.', rows, theme, rule: KITS.sums(tags.rowsT, tags.colsT, prop), tags };
};

export const RECIPES: Recipe[] = [
  // ---- Chapter 4: bigger grids ------------------------------------------------
  {
    id: 'chequers-5', extra: 0,
    make: () => ['10101', '01010', '10101', '01010', '10101'],
    level: lvl('chequers-5', 'Chequerboard', 'No two alike may touch.', THEMES.twoTone, () => L.noTouchingSame('c')),
  },
  { id: 'coaster-square-5', extra: 6, make: (r) => encode(latin(5, r)), level: lvl('coaster-square-5', 'Coaster Square', 'Each row and column: one of each.', THEMES.colour, () => KITS.latin('c')) },
  { id: 'number-blocks-4', extra: 4, make: (r) => encode(young(4, 4, r)), level: lvl('number-blocks-4', 'Number Blocks', 'Bigger to the right, bigger going down.', numberTheme(C.cream), () => KITS.sorted()) },
  { id: 'dice-rows-5', extra: 5, make: (r) => encode(latin(5, r)), level: lvl('dice-rows-5', 'Dice Rows', 'Each row and column: one of each face.', THEMES.dice, () => KITS.latin('n')) },
  { id: 'durers-square', extra: 4, make: (r) => encode(magic4(r)), level: lvl('durers-square', "Dürer's Square", 'Rows, columns and diagonals all make 34.', numberTheme(C.cream), () => KITS.magic(34)) },
  { id: 'quilt-5', extra: 4, make: (r) => encode(quilt(5, 3, r)), level: lvl('quilt-5', 'Patchwork', 'No two alike may touch.', THEMES.colour, () => L.noTouchingSame('c')) },
  { id: 'tile-sudoku-6', extra: 6, make: (r) => encode(sudoku(2, 3, r)), level: lvl('tile-sudoku-6', 'Tile Sudoku', 'Rows, columns and each 2x3 box: one of each.', THEMES.symbol, () => KITS.sudoku('sym', 2, 3)) },
  {
    id: 'word-square-ball', extra: 2, make: words(['BALL', 'AREA', 'LEAD', 'LADY']),
    level: lvl('word-square-ball', 'Word Square', 'Across and down: BALL, AREA, LEAD, LADY.', THEMES.letter, () => KITS.words(['BALL', 'AREA', 'LEAD', 'LADY'])),
  },
  { id: 'quilt-6', extra: 4, make: (r) => encode(quilt(6, 3, r, { perLine: 2 })), level: lvl('quilt-6', 'Quilt', 'No two alike touch. Two of each colour per row and column.', THEMES.colour, () => KITS.quilt(3, 2)) },
  {
    id: 'eulers-tiles-4', extra: 3, width: 2, make: (r) => encodePairs(...graeco(4, r, false)),
    level: lvl('eulers-tiles-4', "Euler's Tiles", 'Rows and columns: every colour once, every symbol once.', pairTheme, () => KITS.graeco('c', 'sym'), { width: 2 }),
  },
  { id: 'kakuro-4', extra: 3, make: (r) => encode(shuffled(4, r)), level: sumsLevel('kakuro-4', 'Kakuro Tray', numberTheme(C.peach)) },
  {
    id: 'word-square-tame', extra: 2, make: words(['TAME', 'AREA', 'MEAT', 'EATS']),
    level: lvl('word-square-tame', 'Word Square II', 'Across and down: TAME, AREA, MEAT, EATS.', THEMES.letter, () => KITS.words(['TAME', 'AREA', 'MEAT', 'EATS'])),
  },
  { id: 'colour-sudoku-6', extra: 4, make: (r) => encode(sudoku(2, 3, r)), level: lvl('colour-sudoku-6', 'Colour Sudoku', 'Rows, columns and each 2x3 box: one of each.', THEMES.colour, () => KITS.sudoku('c', 2, 3)) },
  { id: 'sorted-tray-5', extra: 4, make: (r) => encode(young(5, 5, r)), level: lvl('sorted-tray-5', 'Sorted Tray', 'Bigger to the right, bigger going down.', numberTheme(C.sky), () => KITS.sorted()) },
  { id: 'dice-sudoku-6', extra: 4, make: (r) => encode(sudoku(2, 3, r)), level: lvl('dice-sudoku-6', 'Dice Sudoku', 'Rows, columns and each 2x3 box: one of each face.', THEMES.dice, () => KITS.sudoku('n', 2, 3)) },
  {
    id: 'card-grid-4', extra: 0, width: 2,
    make: (r) => {
      const suits = r.shuffle([0, 1, 2, 3]);
      const ranks = r.shuffle([0, 1, 2, 3]);
      return suits.map((s) => ranks.map((k) => k.toString(36) + s.toString(36)).join(''));
    },
    level: lvl('card-grid-4', 'Card Grid', 'Rows share a suit, columns share a number.', cardTheme([2, 3, 4, 5]),
      () => L.all(L.everyRow(L.same('suit')), L.everyCol(L.same('rank'))), { width: 2, cell: 40, cellH: 52 }),
  },
  { id: 'two-tone-6', extra: 4, make: (r) => encode(takuzu(6, r)), level: lvl('two-tone-6', 'Two-Tone Tiles', 'Three of each per line, never three in a row, no lines alike.', THEMES.twoTone, () => KITS.takuzu(6)) },

  // ---- Chapter 5: harder grids ------------------------------------------------
  { id: 'stamp-sheet-4', extra: 2, make: (r) => encode(shuffled(4, r)), level: sumsLevel('stamp-sheet-4', 'Stamp Sheet', stampTheme, 'v') },
  {
    id: 'alphabet-soup-5', extra: 3, make: (r) => encode(diagonalLatin5(r)).map((row) => [...row].map((d) => LETTERS[+d]).join('')),
    level: lvl('alphabet-soup-5', 'Alphabet Soup', 'Rows, columns and both diagonals: A to E once each.', THEMES.letter,
      () => L.all(KITS.latin('l'), L.diagonals(L.distinct('l')))),
  },
  {
    id: 'word-square-heart', extra: 2, make: words(['HEART', 'EMBER', 'ABUSE', 'RESIN', 'TREND']),
    level: lvl('word-square-heart', 'Word Square III', 'Across and down: HEART, EMBER, ABUSE, RESIN, TREND.', THEMES.letter, () => KITS.words(['HEART', 'EMBER', 'ABUSE', 'RESIN', 'TREND'])),
  },
  { id: 'quilt-king-6', extra: 2, make: (r) => encode(quilt(6, 4, r, { diagonal: true })), level: lvl('quilt-king-6', 'Corner Quilt', 'No two alike may touch, not even at the corners.', THEMES.colour, () => L.noTouchingSame('c', true)) },
  {
    id: 'letter-sudoku-6', extra: 2, make: (r) => encode(sudoku(2, 3, r)).map((row) => [...row].map((d) => LETTERS[+d]).join('')),
    level: lvl('letter-sudoku-6', 'Letter Sudoku', 'Rows, columns and each 2x3 box: A to F once each.', THEMES.letter, () => KITS.sudoku('l', 2, 3)),
  },
  { id: 'kakuro-ii-4', extra: 1, make: (r) => encode(shuffled(4, r)), level: sumsLevel('kakuro-ii-4', 'Kakuro II', numberTheme(C.cream)) },
  {
    id: 'card-sudoku-4', extra: 2, width: 2, make: (r) => encodePairs(...graeco(4, r, false)),
    level: lvl('card-sudoku-4', 'Card Sudoku', 'Rows and columns: every suit once, every number once.', cardTheme([2, 3, 4, 5]),
      () => KITS.graeco('rank', 'suit'), { width: 2, cell: 40, cellH: 52 }),
  },
  { id: 'two-tone-ii-6', extra: 1, make: (r) => encode(takuzu(6, r)), level: lvl('two-tone-ii-6', 'Two-Tone Tiles II', 'Three of each per line, never three in a row, no lines alike.', THEMES.twoTone, () => KITS.takuzu(6)) },

  // ---- Chapter 6: minimal givens ---------------------------------------------
  { id: 'pandiagonal', extra: 0, make: (r) => encode(magic4(r)), level: lvl('pandiagonal', 'Magic Square', 'Rows, columns and diagonals all make 34.', numberTheme(C.lilac), () => KITS.magic(34)) },
  {
    id: 'eulers-garden-5', extra: 0, width: 2, make: (r) => encodePairs(...graeco(5, r, false)),
    level: lvl('eulers-garden-5', "Euler's Garden", 'Rows and columns: every colour once, every symbol once.', pairTheme, () => KITS.graeco('c', 'sym'), { width: 2 }),
  },
  {
    id: 'word-square-card', extra: 0, make: words(['CARD', 'AREA', 'REAR', 'DART']),
    level: lvl('word-square-card', 'Word Square IV', 'Across and down: CARD, AREA, REAR, DART.', THEMES.letter, () => KITS.words(['CARD', 'AREA', 'REAR', 'DART'])),
  },
  { id: 'kakuro-hard-4', extra: 0, make: (r) => encode(shuffled(4, r)), level: sumsLevel('kakuro-hard-4', 'Kakuro Hard', numberTheme(C.sage)) },
  { id: 'dice-sudoku-hard', extra: 0, make: (r) => encode(sudoku(2, 3, r)), level: lvl('dice-sudoku-hard', 'Dice Sudoku Hard', 'Rows, columns and each 2x3 box: one of each face.', THEMES.dice, () => KITS.sudoku('n', 2, 3)) },
  { id: 'sorted-grid-5x6', extra: 0, make: (r) => encode(young(5, 6, r)), level: lvl('sorted-grid-5x6', 'Sorted Grid', 'Bigger to the right, bigger going down.', numberTheme(C.sky), () => KITS.sorted()) },
  { id: 'stamp-kakuro-4', extra: 0, make: (r) => encode(shuffled(4, r)), level: sumsLevel('stamp-kakuro-4', 'Stamp Kakuro', stampTheme, 'v') },
  { id: 'durers-square-ii', extra: 0, make: (r) => encode(magic4(r)), level: lvl('durers-square-ii', "Dürer's Square II", 'Rows, columns and diagonals all make 34.', numberTheme(C.cream), () => KITS.magic(34)) },
  { id: 'sudoku-hard-6', extra: 0, make: (r) => encode(sudoku(2, 3, r)), level: lvl('sudoku-hard-6', 'Tile Sudoku Hard', 'Rows, columns and each 2x3 box: one of each.', THEMES.symbol, () => KITS.sudoku('sym', 2, 3)) },
  {
    id: 'sum-ladder-4', extra: 0, make: (r) => encode(young(4, 4, r)),
    level: (rows) => {
      const { colsT } = totals(rows);
      return {
        id: 'sum-ladder-4', name: 'Sum Ladder', hint: 'Rows climb. Columns add to their numbers.', rows, theme: numberTheme(C.sage),
        rule: L.all(L.everyRow(L.increasing('n')), ...colsT.map((t, c) => L.colAt(c, L.sumIs('n', t)))), tags: { rowsT: [], colsT },
      };
    },
  },
  {
    id: 'eulers-cards', extra: 0, width: 2, make: (r) => encodePairs(...graeco(4, r, true)),
    level: lvl('eulers-cards', "Euler's Cards", 'Rows, columns and diagonals: every suit once, every face once.', cardTheme([1, 11, 12, 13]),
      () => KITS.graeco('rank', 'suit', true), { width: 2, cell: 40, cellH: 52 }),
  },
  {
    id: 'just-so', extra: 0, width: 2, make: (r) => encodePairs(...graeco(5, r, true)),
    level: lvl('just-so', 'Just So', 'Rows, columns and diagonals: every colour once, every symbol once.', pairTheme, () => KITS.graeco('c', 'sym', true), { width: 2 }),
  },
];
