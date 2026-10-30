// The ordered list of levels. Add a level = import it and append it here.
import type { LevelConfig } from '../engine/types';
import { books } from './books';
import { cutlery } from './cutlery';
import { dominoes } from './dominoes';
import { fridge } from './fridge';
import { pencils } from './pencils';
import { scale } from './scale';

export const LEVELS: LevelConfig[] = [pencils, books, cutlery, fridge, dominoes, scale];
