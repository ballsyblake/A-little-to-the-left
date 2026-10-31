// Builds the board DOM (slots + pieces) and owns the live piece state.
import { makeDraggable, makeHandleable, render, showGrime, showState, type DragContext } from './drag';
import { createTray } from './tray';
import type { AreaDef, PieceDef, PieceState, SlotDef } from './types';

export interface BoardOptions {
  slots: SlotDef[];
  pieces: PieceDef[];
  areas?: AreaDef[];
  snapRadius: number;
  /** Height in px of a piece tray along the bottom; loose pieces start in it. */
  trayHeight?: number;
  onChange?(pieces: PieceState[], event: 'snap' | 'drop' | 'rotate', piece: PieceState): void;
}

export interface Board {
  el: HTMLElement;
  pieces: PieceState[];
  /** Stop all input (e.g. once the level is solved). */
  lock(): void;
  isLocked(): boolean;
  /** Push a piece out of its slot by dx px, tilting it by `tilt` degrees. */
  nudge(piece: PieceState, dx: number, tilt: number): void;
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
    if (a.colour) ae.style.background = a.colour;
    if (a.label) {
      const label = document.createElement('span');
      label.className = 'area-label';
      label.textContent = a.label;
      ae.append(label);
    }
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
    if (s.ghost) {
      // Outline slot: a faint copy of the piece that belongs here.
      const g = document.createElement('div');
      g.className = 'ghost';
      g.innerHTML = s.ghost;
      g.style.transform = `rotate(${s.wantRot ?? 0}deg)`;
      se.append(g);
    }
    el.append(se);
    slotEls.set(s.id, se);
  }

  const pieces: PieceState[] = opts.pieces.map((def) => {
    const pe = document.createElement('div');
    pe.className = 'piece';
    pe.innerHTML = def.svg;
    pe.dataset.id = def.id; // handy for tests and debugging
    el.append(pe);
    // Givens start in their slot, locked.
    const fixed = def.fixedIn ? opts.slots.find((s) => s.id === def.fixedIn) : undefined;
    if (fixed) pe.classList.add('is-fixed');
    if (fixed && (def.states || def.spin || def.dirt)) pe.classList.add('is-handle'); // still to work on
    if (def.dirt) {
      const grime = document.createElement('div');
      grime.className = 'grime';
      pe.append(grime);
    }
    const p: PieceState = {
      def, el: pe,
      x: fixed ? fixed.x : def.start.x,
      y: fixed ? fixed.y : def.start.y,
      rotation: def.start.rot ?? 0,
      slotId: fixed ? fixed.id : null,
      state: def.start.state ?? 0,
      dirt: def.dirt ?? 0,
    };
    showState(p);
    showGrime(p);
    return p;
  });

  const tray = opts.trayHeight ? createTray(el, opts.trayHeight, (p) => render(p, el)) : undefined;

  let hot: string | null = null;
  // Shared context for every piece's gestures.
  const ctx = (): DragContext => ({
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
    onChange: (piece, event) => opts.onChange?.(pieces, event, piece),
    tray,
    onRub,
  });
  const unbinds = [
    ...pieces.filter((p) => !p.def.fixedIn).map((p) => makeDraggable(p, ctx())),
    // Fixed pieces can still be tapped (states) or turned (spin).
    ...pieces.filter((p) => p.def.fixedIn && (p.def.states || p.def.spin)).map((p) => makeHandleable(p, ctx())),
  ];

  // The cloth: each short stretch of rubbing over a grimy piece cleans it a bit.
  let lastRub: { x: number; y: number } | null = null;
  function onRub(at: { x: number; y: number }): void {
    if (lastRub && Math.hypot(at.x - lastRub.x, at.y - lastRub.y) < 14) return;
    lastRub = at;
    for (const p of pieces) {
      if (!p.dirt) continue;
      const r = p.el.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const inside = at.x > r.left - b.left && at.x < r.right - b.left && at.y > r.top - b.top && at.y < r.bottom - b.top;
      if (!inside) continue;
      p.dirt -= 1;
      showGrime(p);
      if (p.dirt === 0) opts.onChange?.(pieces, 'rotate', p); // a polish can finish a level
    }
  }
  // Loose pieces start in the tray (laid out once the board has a size).
  let trayFilled = false;

  // Re-render on resize/rotation; normalised coords make this trivial.
  // Transitions switch on only after the first placement, so pieces appear
  // in place instead of gliding in from the board's corner.
  const ro = new ResizeObserver(() => {
    if (tray && !trayFilled) {
      trayFilled = true;
      pieces.filter((p) => !p.def.fixedIn).forEach((p) => tray.add(p));
    }
    pieces.filter((p) => !tray?.has(p)).forEach((p) => render(p, el));
    tray?.layout();
    requestAnimationFrame(() => el.classList.add('is-ready'));
  });
  ro.observe(el);

  return {
    el,
    pieces,
    lock: () => el.classList.add('is-locked'),
    isLocked: () => el.classList.contains('is-locked'),
    nudge(piece, dx, tilt) {
      piece.slotId = null;
      piece.x += dx / el.clientWidth;
      piece.rotation += tilt;
      piece.el.classList.add('is-blown'); // slower, softer slide than a snap
      render(piece, el);
      setTimeout(() => piece.el.classList.remove('is-blown'), 900);
    },
    destroy() {
      ro.disconnect();
      tray?.destroy();
      unbinds.forEach((u) => u());
      el.remove();
    },
  };
}
