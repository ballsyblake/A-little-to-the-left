// Chapters 4-6 (levels 41-100): bigger puzzles, in order of difficulty.
// Grid levels come from recipes + grid-data.json (made by the design
// script); the rest are hand-built in custom.ts.
import { gridSpec } from '../grids';
import type { Spec } from '../kit';
import { CUSTOM } from './custom';
import DATA from './grid-data.json';
import { RECIPES } from './recipes';

const fromRecipe = (id: string): Spec => {
  const recipe = RECIPES.find((r) => r.id === id);
  const data = (DATA as Record<string, { rows: string[]; given: number[] }>)[id];
  if (!recipe || !data) throw new Error(`no grid data for ${id}: run the design script`);
  return gridSpec({ ...recipe.level(data.rows), given: data.given });
};
const pick = (id: string): Spec => CUSTOM[id] ?? fromRecipe(id);

/** Chapter 4: bigger grids, a few extra givens. */
export const ch4: Spec[] = [
  'chequers-5', 'coaster-square-5', 'number-blocks-4', 'dice-rows-5', 'durers-square', 'quilt-5', 'tile-sudoku-6',
  'word-square-ball', 'muffin-tray-ii', 'seating-plan-10', 'quilt-6', 'eulers-tiles-4', 'kakuro-4', 'word-square-tame',
  'colour-sudoku-6', 'sorted-tray-5', 'dice-sudoku-6', 'card-grid-4', 'two-tone-6', 'big-shop',
].map(pick);

/** Chapter 5: combinations and bigger physical puzzles. */
export const ch5: Spec[] = [
  'rainbow-socks-ii', 'grand-solitaire', 'stamp-sheet-4', 'six-envelopes', 'alphabet-soup-5', 'stepping-stones-12',
  'word-square-heart', 'quilt-king-6', 'seating-plan-12', 'letter-sudoku-6', 'kakuro-ii-4', 'cross-sums', 'pegboard-ii',
  'photo-puzzle-4', 'paint-mixing-ii', 'bank-run', 'domino-snake', 'card-sudoku-4', 'candle-rows-ii', 'two-tone-ii-6',
].map(pick);

/** Chapter 6: minimal givens and the largest boards. */
export const ch6: Spec[] = [
  'pandiagonal', 'eulers-garden-5', 'word-square-card', 'kakuro-hard-4', 'round-steps-10', 'photo-puzzle-5', 'pegboard-iii',
  'dice-sudoku-hard', 'sorted-grid-5x6', 'stamp-kakuro-4', 'durers-square-ii', 'grand-solitaire-ii', 'bank-vault',
  'three-scales', 'sudoku-hard-6', 'sum-ladder-4', 'eulers-cards', 'paint-mixing-iii', 'photo-puzzle-6', 'just-so',
].map(pick);
