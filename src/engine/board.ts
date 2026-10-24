// Builds the board DOM (slots + pieces) and owns the live piece state.
import { makeDraggable, render } from './drag';
import type { PieceDef, PieceState, SlotDef } from './types';

export interface BoardOptions {
  slots: SlotDef[];
  pieces: PieceDef[];
  snapRadius: number;
  onChange?(pieces: PieceState[], event: 'snap' | 'drop' | 'rotate'): void;
}

export interface Board {
  el: HTMLElement;
  pieces: PieceState[];
  destroy(): void;
}

export function createBoard(opts: BoardOptions): Board {
  const el = document.createElement('div');
  el.className = 'board';

  // Slots first so pieces render on top of them.
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
    return { def, el: pe, x: def.start.x, y: def.start.y, rotation: 0, slotId: null };
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
    destroy() {
      ro.disconnect();
      unbinds.forEach((u) => u());
      el.remove();
    },
  };
}
