// Brute-force solution counter for checking level designs (tests only).
// Tries every distinct way to fill the empty slots with the loose pieces;
// identical pieces count once, so swapping two cream eggs isn't "new".
import type { LevelConfig, PieceState } from '../engine/types';
import { isSolved } from '../engine/wincheck';

/** Pieces as they start: givens in their slots, everything else loose. */
export function startPieces(level: LevelConfig): PieceState[] {
  return level.pieces.map((def) => ({
    def, el: {} as HTMLElement, x: def.start.x, y: def.start.y,
    rotation: def.start.rot ?? 0, slotId: def.fixedIn ?? null,
  }));
}

/**
 * Number of distinct solutions, stopping early at `limit`. Returns null
 * if the search would be too big (more than `maxLeaves` full boards) or
 * the level needs rotation (not searched).
 */
export function countSolutions(level: LevelConfig, limit = 2, maxLeaves = 3_000_000): number | null {
  if (level.pieces.some((p) => p.rotatable && !p.fixedIn)) return null;
  const pieces = startPieces(level);
  const empty = level.slots.filter((s) => !pieces.some((p) => p.slotId === s.id));
  // Group interchangeable loose pieces by their props.
  const classes = new Map<string, PieceState[]>();
  for (const p of pieces.filter((q) => !q.slotId)) {
    const key = JSON.stringify(p.def.props ?? {});
    if (!classes.has(key)) classes.set(key, []);
    classes.get(key)!.push(p);
  }
  const pools = [...classes.values()];
  let leaves = 0;
  let found = 0;

  const fill = (k: number): boolean => {
    if (k === empty.length) {
      if (++leaves > maxLeaves) return false;
      if (isSolved(level, pieces)) found++;
      return found < limit;
    }
    for (const pool of pools) {
      const p = pool.find((q) => !q.slotId);
      if (!p) continue;
      p.slotId = empty[k].id;
      const go = fill(k + 1);
      p.slotId = null;
      if (!go) return false;
    }
    return true;
  };
  fill(0);
  return leaves > maxLeaves ? null : found;
}
