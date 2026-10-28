// Level 1: five pencils into a tray, sorted by length (either direction).
import { orderedEitherWay } from '../engine/rules';
import type { LevelConfig } from '../engine/types';
import { pencil } from './art';

const LENGTHS = [120, 150, 180, 210, 240];
const COLOURS = ['#f6d38b', '#a8d5c2', '#f4b6a6', '#b9c6ef', '#d9c2ea'];

// Shuffled starting order + slight tilts so the desk looks lived-in.
const START = [
  { i: 2, x: 0.46, rot: -6 },
  { i: 4, x: 0.54, rot: 4 },
  { i: 0, x: 0.44, rot: 8 },
  { i: 3, x: 0.52, rot: -3 },
  { i: 1, x: 0.56, rot: 5 },
];

export const pencils: LevelConfig = {
  id: 'pencils',
  name: 'Pencil Tray',
  hint: 'Line the pencils up.',
  snapRadius: 40,
  // Listed top-to-bottom: rules read slots in this order.
  slots: LENGTHS.map((_, i) => ({ id: `row${i}`, x: 0.5, y: 0.12 + i * 0.085, w: 260, h: 30 })),
  pieces: START.map(({ i, x, rot }, row) => ({
    id: `pencil${i}`,
    svg: pencil(LENGTHS[i], COLOURS[i]),
    start: { x, y: 0.62 + row * 0.075, rot },
    props: { length: LENGTHS[i] },
  })),
  rules: orderedEitherWay('length'),
};
