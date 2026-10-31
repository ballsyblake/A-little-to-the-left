// The ordered list of levels: six hand-made tutorial levels, then the
// chapters, each described by its solved state and assembled by the kit.
import type { LevelConfig } from '../engine/types';
import { books } from './books';
import { ch2 } from './chapters/ch2';
import { ch3 } from './chapters/ch3';
import { ch4, ch5, ch6 } from './chapters/order';
import { secondLook } from './chapters/secondLook';
import { cutlery } from './cutlery';
import { dominoes } from './dominoes';
import { fridge } from './fridge';
import { assemble, type Spec } from './kit';
import { pencils } from './pencils';
import { scale } from './scale';

const TUTORIAL: LevelConfig[] = [pencils, books, cutlery, fridge, dominoes, scale];

// Tidying chapters are wordless (the rule lives in the hint), like the
// original game; the logic-grid chapters keep their rules on screen.
const wordless = (specs: Spec[]) => specs.map((s) => ({ ...s, wordless: true }));

export const LEVELS: LevelConfig[] = [
  ...TUTORIAL,
  ...[...wordless(secondLook), ...wordless(ch2), ...wordless(ch3), ...ch4, ...ch5, ...ch6].map(assemble),
];
