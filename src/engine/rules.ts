// Win-rule factories. Each returns a WinRule (board => boolean), so levels
// compose them as data, e.g. rules: [orderedBy('length', 'asc'), ...].
import type { BoardView, PieceState, WinRule } from './types';

/** Every slot holds a piece. Most rules build on this. */
export const allFilled: WinRule = (b) => b.slots.every((s) => b.pieceIn(s.id));

/** Pieces in slot order (as listed in the level), all slots filled. */
function piecesInSlotOrder(b: BoardView): PieceState[] | null {
  const out: PieceState[] = [];
  for (const s of b.slots) {
    const p = b.pieceIn(s.id);
    if (!p) return null;
    out.push(p);
  }
  return out;
}

/**
 * Slots, read in the order they're listed, hold pieces whose numeric
 * `prop` strictly increases ('asc') or decreases ('desc').
 */
export function orderedBy(prop: string, dir: 'asc' | 'desc'): WinRule {
  return (b) => {
    const ps = piecesInSlotOrder(b);
    if (!ps) return false;
    const v = ps.map((p) => Number(p.def.props?.[prop]));
    return v.every((x, i) => i === 0 || (dir === 'asc' ? x > v[i - 1] : x < v[i - 1]));
  };
}

/** Convenience: ordered by `prop` in either direction (two solutions). */
export function orderedEitherWay(prop: string): WinRule[] {
  return [orderedBy(prop, 'asc'), orderedBy(prop, 'desc')];
}
