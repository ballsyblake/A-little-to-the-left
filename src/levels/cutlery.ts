// Level 3: a cutlery drawer. Three compartments, three knives/forks/spoons.
// Solved when each compartment holds one type (any compartment order) and
// everything faces the same way. Tap a piece to turn it.
import { all, groupedBy, sameRotation } from '../engine/rules';
import type { LevelConfig, SlotDef } from '../engine/types';
import { fork, knife, spoon } from './art';

const TRAY_Y = 0.3;
const COMPARTMENTS = [0.18, 0.5, 0.82]; // centre x of each compartment
const OFFSETS = [-0.09, 0, 0.09];       // three places inside each

const KINDS = [
  { type: 'knife', svg: knife },
  { type: 'fork', svg: fork },
  { type: 'spoon', svg: spoon },
];

// Scrambled drawer contents: [kind index, starting rotation, x, y].
// Eight stand in a row; the sideways knife lies on its own so it
// doesn't cover (and steal touches from) the others.
const ROW = (n: number) => 0.1 + n * 0.114;
const START: [number, number, number, number][] = [
  [1, 8, ROW(0), 0.77], [2, 176, ROW(1), 0.77], [0, -5, ROW(2), 0.77], [2, 4, ROW(3), 0.77],
  [1, 184, ROW(4), 0.77], [2, -7, ROW(5), 0.77], [0, 3, ROW(6), 0.77], [1, -4, ROW(7), 0.77],
  [0, 94, 0.5, 0.56],
];

const slots: SlotDef[] = COMPARTMENTS.flatMap((cx, c) =>
  OFFSETS.map((dx, i) => ({ id: `c${c}s${i}`, group: `c${c}`, x: cx + dx, y: TRAY_Y, w: 26, h: 126 })),
);

export const cutlery: LevelConfig = {
  id: 'cutlery',
  name: 'Cutlery Drawer',
  hint: 'Tidy the drawer. Tap to turn.',
  snapRadius: 40,
  areas: COMPARTMENTS.map((x) => ({ x, y: TRAY_Y, w: 0.3, h: 0, hPx: 150, className: 'compartment' })),
  slots,
  pieces: START.map(([k, rot, x, y], n) => ({
    id: `${KINDS[k].type}${n}`,
    svg: KINDS[k].svg(),
    start: { x, y, rot },
    props: { type: KINDS[k].type },
    rotatable: true,
  })),
  rules: [all(groupedBy('type'), sameRotation)],
  // Gentle and rare: first gust 8-12 s after 3 pieces are placed, then every 30-45 s.
  wind: { firstDelayMs: [8_000, 12_000], delayMs: [30_000, 45_000], maxOffsetPx: 26, minPlaced: 3 },
};
