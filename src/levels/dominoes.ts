// Level 5: dominoes. Line four up so touching ends match. Tap flips a domino.
// Only one chain exists (1-3-5-2-6), but it reads either way, so laying it
// out reversed (every domino flipped) also counts.
import { chainedEnds } from '../engine/rules';
import type { LevelConfig } from '../engine/types';
import { domino } from './art';

const ROW_Y = 0.3;

// [left, right] pips, plus a scrambled start (some already flipped).
const TILES = [
  { pips: [5, 2], x: 0.3, y: 0.62, rot: 184 },
  { pips: [1, 3], x: 0.7, y: 0.6, rot: -6 },
  { pips: [2, 6], x: 0.32, y: 0.82, rot: 176 },
  { pips: [3, 5], x: 0.68, y: 0.84, rot: 5 },
];

export const dominoes: LevelConfig = {
  id: 'dominoes',
  name: 'Dominoes',
  hint: 'Match the touching ends. Tap to flip.',
  snapRadius: 40,
  areas: [{ x: 0.5, y: ROW_Y, w: 0.94, h: 0, hPx: 56, className: 'runner' }],
  slots: [0.17, 0.39, 0.61, 0.83].map((x, i) => ({ id: `d${i}`, x, y: ROW_Y, w: 60, h: 32 })),
  pieces: TILES.map(({ pips: [l, r], x, y, rot }) => ({
    id: `domino-${l}-${r}`,
    svg: domino(l, r),
    start: { x, y, rot },
    props: { left: l, right: r },
    rotatable: true,
    rotateStep: 180, // one tap = flip end-for-end
  })),
  rules: [chainedEnds()],
};
