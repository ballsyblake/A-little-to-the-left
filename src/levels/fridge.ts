// Level 4: fridge magnets. Four letters, two valid words: PALM or LAMP.
import { spellsOneOf } from '../engine/rules';
import type { LevelConfig } from '../engine/types';
import { magnet } from './art';

const DOOR_Y = 0.3;
const LETTERS = [
  { letter: 'M', colour: '#b9c6ef', x: 0.3, y: 0.68, rot: -9 },
  { letter: 'P', colour: '#f4b6a6', x: 0.68, y: 0.64, rot: 7 },
  { letter: 'L', colour: '#a8d5c2', x: 0.45, y: 0.84, rot: 12 },
  { letter: 'A', colour: '#f6d38b', x: 0.75, y: 0.86, rot: -5 },
];

export const fridge: LevelConfig = {
  id: 'fridge',
  name: 'Fridge Magnets',
  hint: 'Leave the fridge a word.',
  snapRadius: 40,
  areas: [{ x: 0.5, y: DOOR_Y, w: 0.92, h: 0, hPx: 110, className: 'fridge' }],
  // Read left-to-right.
  slots: [0.2, 0.4, 0.6, 0.8].map((x, i) => ({ id: `m${i}`, x, y: DOOR_Y, w: 54, h: 60 })),
  pieces: LETTERS.map(({ letter, colour, x, y, rot }) => ({
    id: `letter-${letter}`,
    svg: magnet(letter, colour),
    start: { x, y, rot },
    props: { letter },
  })),
  rules: [spellsOneOf('letter', ['PALM', 'LAMP'])],
};
