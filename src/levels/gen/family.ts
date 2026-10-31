// A level family: a recipe that turns (random source, difficulty 0..1)
// into a ready-to-play LevelConfig, with its solution recorded.
import type { LevelConfig } from '../../engine/types';
import type { Rng } from './rng';

export interface FamilyArgs {
  rng: Rng;
  d: number;      // difficulty, 0 = easiest, 1 = hardest
  id: string;     // stable id for saved progress
  name: string;   // display name
}

export type Family = (args: FamilyArgs) => LevelConfig;
