// Wires gestures on one piece to movement: lift on grab, follow the finger,
// snap (or rest) on release, rotate on tap.
import { bindGestures, type Point } from './input';
import { findSnapSlot, slotCentre } from './snap';
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
}

/** Push a piece's state into its CSS custom properties. */
export function render(piece: PieceState, board: HTMLElement): void {
  piece.el.style.setProperty('--x', `${piece.x * board.clientWidth}px`);
  piece.el.style.setProperty('--y', `${piece.y * board.clientHeight}px`);
  piece.el.style.setProperty('--rot', `${piece.rotation}deg`);
}

export function makeDraggable(piece: PieceState, ctx: DragContext): () => void {
  const { board } = ctx;
  let offset: Point = { x: 0, y: 0 }; // finger position minus piece centre

  const centreFrom = (p: Point): Point => ({ x: p.x - offset.x, y: p.y - offset.y });
  const pick = (c: Point) =>
    findSnapSlot(c, ctx.slots, board, ctx.snapRadius, (s) => ctx.isFree(s, piece));

  return bindGestures(piece.el, board, {
    onDragStart(p) {
      offset = { x: p.x - piece.x * board.clientWidth, y: p.y - piece.y * board.clientHeight };
      piece.slotId = null; // lifted out of its slot
      piece.el.classList.add('is-dragging');
    },

    onDragMove(p) {
      const c = centreFrom(p);
      piece.x = c.x / board.clientWidth;
      piece.y = c.y / board.clientHeight;
      render(piece, board);
      ctx.setHot(pick(c)?.id ?? null);
    },

    onDragEnd(p) {
      piece.el.classList.remove('is-dragging');
      ctx.setHot(null);
      const slot = pick(centreFrom(p));
      if (slot) {
        const sc = slotCentre(slot, board);
        piece.x = sc.x / board.clientWidth;
        piece.y = sc.y / board.clientHeight;
        piece.slotId = slot.id;
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
      piece.rotation += 90; // keep counting up so CSS always spins clockwise
      render(piece, board);
      ctx.onChange(piece, 'rotate');
    },
  });
}
