// Turns raw Pointer Events on one element into higher-level gestures:
// tap, drag start, drag move, drag end. Works the same for touch and mouse.

export interface Point { x: number; y: number }

export interface GestureHandlers {
  onTap?(): void;
  onDragStart?(p: Point): void;
  onDragMove?(p: Point): void;
  onDragEnd?(p: Point): void;
}

/** Movement (px) below which a press-release counts as a tap, not a drag. */
const TAP_SLOP = 8;

/**
 * Attach gesture handling to `el`. Points are reported in the coordinate
 * space of `board` (top-left of the board = 0,0).
 * Returns a function that removes the listeners.
 */
export function bindGestures(el: HTMLElement, board: HTMLElement, h: GestureHandlers): () => void {
  let pointerId: number | null = null; // the one finger we're tracking
  let start: Point = { x: 0, y: 0 };
  let dragging = false;

  const toBoard = (e: PointerEvent): Point => {
    const r = board.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: PointerEvent) => {
    if (pointerId !== null) return;          // ignore a second finger
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    pointerId = e.pointerId;
    el.setPointerCapture(e.pointerId);       // keep receiving events off-element
    start = toBoard(e);
    dragging = false;
  };

  const move = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    const p = toBoard(e);
    if (!dragging && Math.hypot(p.x - start.x, p.y - start.y) > TAP_SLOP) {
      dragging = true;
      h.onDragStart?.(start);
    }
    if (dragging) h.onDragMove?.(p);
  };

  const up = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    if (dragging) h.onDragEnd?.(toBoard(e));
    else if (e.type === 'pointerup') h.onTap?.(); // a cancel is never a tap
    dragging = false;
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up); // e.g. OS gesture interrupted us

  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
  };
}
