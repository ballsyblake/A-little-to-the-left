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

/** Passes only when every given rule passes. */
export function all(...rules: WinRule[]): WinRule {
  return (b) => rules.every((r) => r(b));
}

/**
 * Slots are grouped (slot.group, e.g. a drawer compartment). Passes when all
 * slots are filled, each group holds a single value of `prop`, and no two
 * groups share a value. Which group gets which value doesn't matter.
 */
export function groupedBy(prop: string): WinRule {
  return (b) => {
    if (!allFilled(b)) return false;
    const valueOf = new Map<string, string | number>(); // group -> its value
    for (const s of b.slots) {
      const v = b.pieceIn(s.id)!.def.props?.[prop];
      if (v === undefined) return false;
      const g = s.group ?? s.id;
      if (!valueOf.has(g)) valueOf.set(g, v);
      else if (valueOf.get(g) !== v) return false;
    }
    return new Set(valueOf.values()).size === valueOf.size;
  };
}

/** Every slotted piece faces the same way (rotation compared mod 360). */
export const sameRotation: WinRule = (b) => {
  const turns = b.slots
    .map((s) => b.pieceIn(s.id))
    .filter((p): p is PieceState => !!p)
    .map((p) => ((p.rotation % 360) + 360) % 360);
  return turns.every((t) => t === turns[0]);
};
