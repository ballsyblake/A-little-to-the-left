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
  return Object.assign((b: BoardView) => rules.every((r) => r(b)), {
    possible: (b: BoardView) => rules.every((r) => !r.possible || r.possible(b)),
  });
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

/** Letters (prop) read in slot order spell any one of `words`. */
export function spellsOneOf(prop: string, words: string[]): WinRule {
  return (b) => {
    const ps = piecesInSlotOrder(b);
    return !!ps && words.includes(ps.map((p) => p.def.props?.[prop]).join(''));
  };
}

/**
 * Domino-style chain: each piece has `left` and `right` values; turning it
 * 180 degrees swaps them. Passes when every touching pair of ends matches.
 */
export function chainedEnds(left = 'left', right = 'right', loop = false): WinRule {
  return (b) => {
    const ps = piecesInSlotOrder(b);
    if (!ps) return false;
    const ends = ps.map((p) => {
      const turn = ((p.rotation % 360) + 360) % 360;
      const l = p.def.props?.[left];
      const r = p.def.props?.[right];
      if (turn === 0) return [l, r];
      if (turn === 180) return [r, l];
      return null; // sideways never counts
    });
    const chained = ends.every((e, i) => e && (i === 0 || ends[i - 1]![1] === e[0]));
    // A loop also joins the last end back to the first.
    return chained && (!loop || ends[ends.length - 1]![1] === ends[0]![0]);
  };
}

/** All slots filled and every group's total of numeric `prop` is the same. */
export function equalSums(prop: string): WinRule {
  return (b) => {
    if (!allFilled(b)) return false;
    const totals = new Map<string, number>();
    for (const s of b.slots) {
      const g = s.group ?? s.id;
      totals.set(g, (totals.get(g) ?? 0) + Number(b.pieceIn(s.id)!.def.props?.[prop]));
    }
    return new Set(totals.values()).size === 1;
  };
}
