// Wires gestures on one piece to movement: lift on grab, follow the finger,
// snap (or rest) on release, rotate on tap.
import { bindGestures, type Point } from './input';
import { findSnapSlot, slotCentre } from './snap';
import type { Tray } from './tray';
import type { PieceState, SlotDef } from './types';

export interface DragContext {
  board: HTMLElement;
  slots: SlotDef[];
  snapRadius: number;
  /** Is this slot free for `piece`? (occupied slots are skipped) */
  isFree(slot: SlotDef, piece: PieceState): boolean;
  /** Highlight the slot that would be chosen if released now. */
  setHot(slotId: string | null): void;
  /** Called after any completed move or rotation (win check hooks in here). */
  onChange(piece: PieceState, event: 'snap' | 'drop' | 'rotate'): void;
  /** Where loose pieces live, if the level has a tray. */
  tray?: Tray;
}

/** Push a piece's state into its CSS custom properties. */
export function render(piece: PieceState, board: HTMLElement): void {
  piece.el.style.setProperty('--x', `${piece.x * board.clientWidth}px`);
  piece.el.style.setProperty('--y', `${piece.y * board.clientHeight}px`);
  piece.el.style.setProperty('--rot', `${piece.rotation}deg`);
}

let topZ = 1; // last-touched piece sits on top of the others

export function makeDraggable(piece: PieceState, ctx: DragContext): () => void {
  const { board } = ctx;
  let offset: Point = { x: 0, y: 0 }; // finger position minus piece centre
  let scrolling = false;              // this gesture scrolls the tray instead
  let downX = 0;

  const centreFrom = (p: Point): Point => ({ x: p.x - offset.x, y: p.y - offset.y });
  const pick = (c: Point) =>
    findSnapSlot(c, ctx.slots, board, ctx.snapRadius, (s) => ctx.isFree(s, piece));

  return bindGestures(piece.el, board, {
    onDragStart(p, now) {
      const { tray } = ctx;
      // In the tray, a clearly sideways swipe scrolls it; anything else
      // (including a diagonal pull toward a far slot) lifts the piece.
      scrolling = !!tray?.has(piece) && Math.abs(now.x - p.x) > 2 * Math.abs(now.y - p.y);
      if (scrolling) {
        downX = p.x;
        tray!.scrollStart();
        return;
      }
      if (tray?.has(piece)) tray.remove(piece);
      offset = { x: p.x - piece.x * board.clientWidth, y: p.y - piece.y * board.clientHeight };
      piece.slotId = null; // lifted out of its slot
      piece.el.style.zIndex = String(++topZ);
      piece.el.classList.add('is-dragging');
    },

    onDragMove(p) {
      if (scrolling) return ctx.tray!.scrollMove(p.x - downX);
      const c = centreFrom(p);
      piece.x = c.x / board.clientWidth;
      piece.y = c.y / board.clientHeight;
      render(piece, board);
      ctx.setHot(pick(c)?.id ?? null);
    },

    onDragEnd(p) {
      if (scrolling) return ctx.tray!.scrollEnd();
      piece.el.classList.remove('is-dragging');
      ctx.setHot(null);
      const slot = pick(centreFrom(p));
      if (slot) {
        const sc = slotCentre(slot, board);
        piece.x = sc.x / board.clientWidth;
        piece.y = sc.y / board.clientHeight;
        piece.slotId = slot.id;
        piece.rotation = Math.round(piece.rotation / 90) * 90; // straighten
      } else if (ctx.tray) {
        // No slot nearby: back to the tray (it renders the piece itself).
        ctx.tray.add(piece, p.x);
        ctx.onChange(piece, 'drop');
        return;
      } else {
        // No slot nearby: rest where dropped, kept inside the board.
        piece.x = Math.min(0.95, Math.max(0.05, piece.x));
        piece.y = Math.min(0.95, Math.max(0.05, piece.y));
      }
      render(piece, board); // CSS transition animates the glide into place
      ctx.onChange(piece, slot ? 'snap' : 'drop');
    },

    onTap() {
      if (!piece.def.rotatable) return;
      // Straighten any tilt, then turn. Counting up keeps CSS spinning clockwise.
      piece.rotation = Math.round(piece.rotation / 90) * 90 + (piece.def.rotateStep ?? 90);
      if (ctx.tray?.has(piece)) ctx.tray.layout(); // its footprint may have changed
      else render(piece, board);
      ctx.onChange(piece, 'rotate');
    },
  });
}
