// Runs a level's rules against the current board.
import type { BoardView, LevelConfig, PieceState } from './types';

/** Build the read-only view rules receive. */
export function viewOf(level: LevelConfig, pieces: PieceState[]): BoardView {
  return {
    slots: level.slots,
    pieces,
    pieceIn: (slotId) => pieces.find((p) => p.slotId === slotId),
  };
}

/** Solved if ANY of the level's rules passes. */
export function isSolved(level: LevelConfig, pieces: PieceState[]): boolean {
  const view = viewOf(level, pieces);
  return level.rules.some((rule) => rule(view));
}

/** Which of the level's solutions (rule indices) the board shows right now. */
export function passingRules(level: LevelConfig, pieces: PieceState[]): number[] {
  const view = viewOf(level, pieces);
  return level.rules.flatMap((rule, i) => (rule(view) ? [i] : []));
}
