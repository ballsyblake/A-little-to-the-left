// Wires gestures on one piece to movement: lift on grab, follow the finger,
// snap (or rest) on release, rotate or change state on tap. Also: pieces
// fixed in place that spin or change state, and the polishing cloth.
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
  /** The cloth moved to `p` (board px): polish whatever is under it. */
  onRub?(p: Point): void;
}

/** Show a piece's current state: swap its picture, keeping any grime layer. */
export function showState(piece: PieceState): void {
  const look = piece.def.states?.[piece.state];
  if (!look) return;
  piece.el.dataset.state = String(piece.state); // handy for tests
  const tmp = document.createElement('div');
  tmp.innerHTML = look.svg;
  piece.el.firstElementChild?.replaceWith(tmp.firstElementChild!);
}

/** Grime fades as the piece is polished. */
export function showGrime(piece: PieceState): void {
  const g = piece.el.querySelector<HTMLElement>('.grime');
  if (g) g.style.opacity = String(piece.def.dirt ? (piece.dirt / piece.def.dirt) * 0.85 : 0);
}

/** Tap on a piece with states: move to the next one. */
function nextState(piece: PieceState): boolean {
  if (!piece.def.states) return false;
  piece.state = (piece.state + 1) % piece.def.states.length;
  showState(piece);
  return true;
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
  // Tools never land in slots.
  const pick = (c: Point) =>
    piece.def.tool ? null : findSnapSlot(c, ctx.slots, board, ctx.snapRadius, (s) => ctx.isFree(s, piece));

  /** Pick the piece up (out of the tray or its slot); `centred` snaps it under the finger. */
  const lift = (p: Point, centred = false) => {
    if (ctx.tray?.has(piece)) ctx.tray.remove(piece);
    offset = centred ? { x: 0, y: 0 } : { x: p.x - piece.x * board.clientWidth, y: p.y - piece.y * board.clientHeight };
    piece.slotId = null; // lifted out of its slot
    piece.el.style.zIndex = String(++topZ);
    piece.el.classList.add('is-dragging');
  };

  return bindGestures(piece.el, board, {
    onDragStart(p, now) {
      const { tray } = ctx;
      // In a tray wider than the screen, a clearly sideways swipe scrolls
      // it; anything else lifts the piece.
      scrolling = !!tray?.has(piece) && tray.canScroll() && Math.abs(now.x - p.x) > 2 * Math.abs(now.y - p.y);
      if (scrolling) {
        downX = p.x;
        tray!.scrollStart();
        return;
      }
      lift(p);
    },

    onDragMove(p) {
      if (scrolling) {
        // Finger left the tray upward: it meant to take the piece after all.
        if (!ctx.tray!.contains(p.y + 8)) {
          ctx.tray!.scrollEnd();
          scrolling = false;
          lift(p, true);
        } else return ctx.tray!.scrollMove(p.x - downX);
      }
      const c = centreFrom(p);
      piece.x = c.x / board.clientWidth;
      piece.y = c.y / board.clientHeight;
      render(piece, board);
      if (piece.def.tool === 'cloth') ctx.onRub?.(c);
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
      if (nextState(piece)) {
        ctx.onChange(piece, 'rotate');
        return;
      }
      if (!piece.def.rotatable) return;
      // Straighten any tilt, then turn. Counting up keeps CSS spinning clockwise.
      piece.rotation = Math.round(piece.rotation / 90) * 90 + (piece.def.rotateStep ?? 90);
      if (ctx.tray?.has(piece)) ctx.tray.layout(); // its footprint may have changed
      else render(piece, board);
      ctx.onChange(piece, 'rotate');
    },
  });
}

/**
 * Pieces fixed in place that you can still handle: tap to change state,
 * or (if `spin`) drag around them to turn them freely, like straightening
 * a picture frame. Near-straight snaps to straight on release.
 */
export function makeHandleable(piece: PieceState, ctx: DragContext): () => void {
  const { board } = ctx;
  const centre = () => ({ x: piece.x * board.clientWidth, y: piece.y * board.clientHeight });
  const angleTo = (p: Point) => (Math.atan2(p.y - centre().y, p.x - centre().x) * 180) / Math.PI;
  let startAngle = 0;
  let startRot = 0;

  return bindGestures(piece.el, board, {
    onTap() {
      if (nextState(piece)) ctx.onChange(piece, 'rotate');
    },
    onDragStart(p) {
      if (!piece.def.spin) return;
      startAngle = angleTo(p);
      startRot = piece.rotation;
      piece.el.classList.add('is-spinning');
    },
    onDragMove(p) {
      if (!piece.def.spin) return;
      piece.rotation = startRot + angleTo(p) - startAngle;
      render(piece, board);
    },
    onDragEnd() {
      if (!piece.def.spin) return;
      piece.el.classList.remove('is-spinning');
      const straight = Math.round(piece.rotation / 90) * 90;
      if (Math.abs(piece.rotation - straight) < 4) piece.rotation = straight; // settle
      render(piece, board);
      ctx.onChange(piece, 'rotate');
    },
  });
}
