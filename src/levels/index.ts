// The ordered list of levels: six hand-made ones, then generated ones up
// to 100. Add a hand-made level = import it and add it to HANDMADE.
import type { LevelConfig } from '../engine/types';
import { books } from './books';
import { cutlery } from './cutlery';
import { dominoes } from './dominoes';
import { fridge } from './fridge';
import { generateLevels } from './gen';
import { pencils } from './pencils';
import { scale } from './scale';

const TOTAL = 100;
const HANDMADE: LevelConfig[] = [pencils, books, cutlery, fridge, dominoes, scale];

export const LEVELS: LevelConfig[] = [
  ...HANDMADE,
  ...generateLevels(TOTAL - HANDMADE.length, HANDMADE.length + 1),
];
