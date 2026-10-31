// The ordered list of levels: six hand-made tutorial levels, then the
// chapters, each described by its solved state and assembled by the kit.
import type { LevelConfig } from '../engine/types';
import { books } from './books';
import { ch2 } from './chapters/ch2';
import { ch3 } from './chapters/ch3';
import { ch4, ch5, ch6 } from './chapters/order';
import { cutlery } from './cutlery';
import { dominoes } from './dominoes';
import { fridge } from './fridge';
import { assemble } from './kit';
import { pencils } from './pencils';
import { scale } from './scale';

const TUTORIAL: LevelConfig[] = [pencils, books, cutlery, fridge, dominoes, scale];

export const LEVELS: LevelConfig[] = [...TUTORIAL, ...[...ch2, ...ch3, ...ch4, ...ch5, ...ch6].map(assemble)];
