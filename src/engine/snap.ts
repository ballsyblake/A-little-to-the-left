// Snapping: find the nearest free slot to a dropped piece.
import type { Point } from './input';
import type { SlotDef } from './types';

/** Convert a slot's normalised centre to board pixels. */
export function slotCentre(slot: SlotDef, board: HTMLElement): Point {
  return { x: slot.x * board.clientWidth, y: slot.y * board.clientHeight };
}

/**
 * Return the closest slot within `radius` px of `p`, skipping any slot
 * `isFree` rejects. Returns null if nothing is close enough.
 */
export function findSnapSlot(
  p: Point,
  slots: SlotDef[],
  board: HTMLElement,
  radius: number,
  isFree: (slot: SlotDef) => boolean,
): SlotDef | null {
  let best: SlotDef | null = null;
  let bestDist = radius;
  for (const slot of slots) {
    if (!isFree(slot)) continue;
    const c = slotCentre(slot, board);
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    if (d <= bestDist) {
      best = slot;
      bestDist = d;
    }
  }
  return best;
}
