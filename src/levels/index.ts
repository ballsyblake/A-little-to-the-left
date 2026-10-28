// The ordered list of levels. Add a level = import it and append it here.
import type { LevelConfig } from '../engine/types';
import { books } from './books';
import { cutlery } from './cutlery';
import { pencils } from './pencils';

export const LEVELS: LevelConfig[] = [pencils, books, cutlery];
