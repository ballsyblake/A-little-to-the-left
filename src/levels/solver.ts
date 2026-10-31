// Solution counter for checking level designs (tests and design helpers).
// Backtracking: fill empty slots one at a time, and give up on a branch as
// soon as any rule's early check (`possible`) says it can't work out.
// Identical pieces count once, so swapping two cream eggs isn't "new".
import type { LevelConfig, PieceState } from '../engine/types';
import { isSolved, viewOf } from '../engine/wincheck';

/** Pieces as they start: givens in their slots, everything else loose. */
export function startPieces(level: LevelConfig): PieceState[] {
  return level.pieces.map((def) => ({
    def, el: {} as HTMLElement, x: def.start.x, y: def.start.y,
    rotation: def.start.rot ?? 0, slotId: def.fixedIn ?? null,
  }));
}

/**
 * Number of distinct solutions, stopping early at `limit`. Returns null if
 * the search gets too big (more than `maxNodes` placements tried) or the
 * level needs rotation (not searched).
 */
export function countSolutions(level: LevelConfig, limit = 2, maxNodes = 3_000_000): number | null {
  if (level.pieces.some((p) => p.rotatable && !p.fixedIn)) return null;
  const pieces = startPieces(level);
  const view = viewOf(level, pieces);
  // A level is won if ANY rule passes, so a branch lives while any rule could.
  const stillPossible = () => level.rules.some((r) => !r.possible || r.possible(view));

  const empty = level.slots.filter((s) => !pieces.some((p) => p.slotId === s.id));
  // Group interchangeable loose pieces by their props.
  const classes = new Map<string, PieceState[]>();
  for (const p of pieces.filter((q) => !q.slotId)) {
    const key = JSON.stringify(p.def.props ?? {});
    if (!classes.has(key)) classes.set(key, []);
    classes.get(key)!.push(p);
  }
  const pools = [...classes.values()];
  let nodes = 0;
  let found = 0;

  const fill = (k: number): boolean => {
    if (k === empty.length) {
      if (isSolved(level, pieces)) found++;
      return found < limit;
    }
    for (const pool of pools) {
      const p = pool.find((q) => !q.slotId);
      if (!p) continue;
      if (++nodes > maxNodes) return false;
      p.slotId = empty[k].id;
      const go = !stillPossible() || fill(k + 1);
      p.slotId = null;
      if (!go) return false;
    }
    return true;
  };
  fill(0);
  return nodes > maxNodes ? null : found;
}
