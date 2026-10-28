// Builds the board DOM (slots + pieces) and owns the live piece state.
import { makeDraggable, render } from './drag';
import type { AreaDef, PieceDef, PieceState, SlotDef } from './types';

export interface BoardOptions {
  slots: SlotDef[];
  pieces: PieceDef[];
  areas?: AreaDef[];
  snapRadius: number;
  onChange?(pieces: PieceState[], event: 'snap' | 'drop' | 'rotate'): void;
}

export interface Board {
  el: HTMLElement;
  pieces: PieceState[];
  /** Stop all input (e.g. once the level is solved). */
  lock(): void;
  destroy(): void;
}

export function createBoard(opts: BoardOptions): Board {
  const el = document.createElement('div');
  el.className = 'board';

  // Draw order: areas, then slots, then pieces on top.
  for (const a of opts.areas ?? []) {
    const ae = document.createElement('div');
    ae.className = `area ${a.className ?? ''}`;
    ae.style.left = `${(a.x - a.w / 2) * 100}%`;
    ae.style.top = `${a.y * 100}%`;
    ae.style.width = `${a.w * 100}%`;
    ae.style.height = a.hPx ? `${a.hPx}px` : `${a.h * 100}%`;
    ae.style.transform = 'translateY(-50%)'; // centre vertically either way
    el.append(ae);
  }

  const slotEls = new Map<string, HTMLElement>();
  for (const s of opts.slots) {
    const se = document.createElement('div');
    se.className = 'slot';
    se.style.left = `${s.x * 100}%`;
    se.style.top = `${s.y * 100}%`;
    se.style.width = `${s.w}px`;
    se.style.height = `${s.h}px`;
    el.append(se);
    slotEls.set(s.id, se);
  }

  const pieces: PieceState[] = opts.pieces.map((def) => {
    const pe = document.createElement('div');
    pe.className = 'piece';
    pe.innerHTML = def.svg;
    el.append(pe);
    return { def, el: pe, x: def.start.x, y: def.start.y, rotation: def.start.rot ?? 0, slotId: null };
  });

  let hot: string | null = null;
  const unbinds = pieces.map((p) =>
    makeDraggable(p, {
      board: el,
      slots: opts.slots,
      snapRadius: opts.snapRadius,
      // One piece per slot (later levels can override with capacity).
      isFree: (slot, piece) => !pieces.some((o) => o !== piece && o.slotId === slot.id),
      setHot(id) {
        if (id === hot) return;
        if (hot) slotEls.get(hot)?.classList.remove('is-hot');
        if (id) slotEls.get(id)?.classList.add('is-hot');
        hot = id;
      },
      onChange: (_piece, event) => opts.onChange?.(pieces, event),
    }),
  );

  // Re-render on resize/rotation; normalised coords make this trivial.
  const ro = new ResizeObserver(() => pieces.forEach((p) => render(p, el)));
  ro.observe(el);

  return {
    el,
    pieces,
    lock: () => el.classList.add('is-locked'),
    destroy() {
      ro.disconnect();
      unbinds.forEach((u) => u());
      el.remove();
    },
  };
}
