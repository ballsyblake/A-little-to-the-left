// The piece tray: a strip along the bottom of the board holding every loose
// piece. Identical pieces share a pile with a count badge; the strip scrolls
// sideways when it's wider than the board. The tray only computes positions;
// render() in drag.ts draws pieces as usual.
import { bindGestures } from './input';
import type { PieceState } from './types';

const GAP = 10; // px between piles

export interface Tray {
  el: HTMLElement;
  height: number;
  has(p: PieceState): boolean;
  /** Put a piece back; `nearX` (board px) picks where its pile appears if new. */
  add(p: PieceState, nearX?: number): void;
  remove(p: PieceState): void;
  /** Is a board-px point inside the tray strip? */
  contains(y: number): boolean;
  /** Is there more tray than fits on screen? */
  canScroll(): boolean;
  /** Scroll controls, used when a sideways swipe starts on a tray piece. */
  scrollStart(): void;
  scrollMove(dx: number): void;
  scrollEnd(): void;
  layout(): void;
  destroy(): void;
}

interface Pile { key: string; pieces: PieceState[]; badge: HTMLElement }

export function createTray(
  board: HTMLElement,
  height: number,
  render: (p: PieceState) => void,
): Tray {
  const el = document.createElement('div');
  el.className = 'tray';
  el.style.height = `${height}px`;
  board.append(el);

  const piles: Pile[] = [];
  let scroll = 0;
  let scrollAtStart = 0;

  /** Pieces drawn identically (same art, same state) share a pile. */
  const keyOf = (p: PieceState) => `${p.def.svg}|${p.state}`;

  /** Footprint width in px at the piece's current rotation. */
  const widthOf = (p: PieceState) => {
    const s = p.def.size ?? { w: 44, h: 44 };
    return Math.round(p.rotation / 90) % 2 !== 0 ? s.h : s.w;
  };
  const pileWidth = (pile: Pile) => Math.max(44, ...pile.pieces.map(widthOf));
  const totalWidth = () => piles.reduce((t, p) => t + pileWidth(p) + GAP, GAP);
  const maxScroll = () => Math.max(0, totalWidth() - board.clientWidth);

  function layout(): void {
    scroll = Math.min(Math.max(0, scroll), maxScroll());
    el.classList.toggle('can-scroll-left', scroll > 1);
    el.classList.toggle('can-scroll-right', scroll < maxScroll() - 1);
    const W = board.clientWidth;
    const H = board.clientHeight;
    const cy = H - height / 2;
    let x = GAP - scroll;
    for (const pile of piles) {
      const w = pileWidth(pile);
      pile.pieces.forEach((p, i) => {
        // A pile shows a slight stack: each piece below sits 2px lower.
        p.x = (x + w / 2) / W;
        p.y = (cy + (pile.pieces.length - 1 - i) * 2) / H;
        p.el.style.zIndex = String(10 + i);
        render(p);
      });
      const n = pile.pieces.length;
      pile.badge.textContent = String(n);
      pile.badge.hidden = n < 2;
      pile.badge.style.left = `${x + w - 6}px`;
      pile.badge.style.top = `${H - height + 6}px`;
      x += w + GAP;
    }
  }

  function add(p: PieceState, nearX?: number): void {
    p.slotId = null;
    p.el.classList.add('in-tray');
    const key = keyOf(p);
    let pile = piles.find((q) => q.key === key);
    if (!pile) {
      const badge = document.createElement('span');
      badge.className = 'tray-badge';
      board.append(badge);
      pile = { key, pieces: [], badge };
      // New pile goes where it was dropped, else at the end.
      let at = piles.length;
      if (nearX !== undefined) {
        let x = GAP - scroll;
        at = piles.findIndex((q) => (x += pileWidth(q) + GAP) > nearX);
        if (at < 0) at = piles.length;
      }
      piles.splice(at, 0, pile);
    }
    pile.pieces.push(p);
    layout();
  }

  function remove(p: PieceState): void {
    p.el.classList.remove('in-tray');
    const pile = piles.find((q) => q.pieces.includes(p));
    if (!pile) return;
    pile.pieces.splice(pile.pieces.indexOf(p), 1);
    if (!pile.pieces.length) {
      pile.badge.remove();
      piles.splice(piles.indexOf(pile), 1);
    }
    layout();
  }

  const scrollStart = () => {
    scrollAtStart = scroll;
    board.classList.add('is-scrolling');
  };
  const scrollMove = (dx: number) => {
    scroll = scrollAtStart - dx;
    layout();
  };
  const scrollEnd = () => board.classList.remove('is-scrolling');

  // Swiping on the empty part of the strip scrolls it too.
  let downX = 0;
  const unbind = bindGestures(el, board, {
    onDragStart(start) {
      downX = start.x;
      scrollStart();
    },
    onDragMove: (p) => scrollMove(p.x - downX),
    onDragEnd: scrollEnd,
  });

  return {
    el,
    height,
    has: (p) => piles.some((q) => q.pieces.includes(p)),
    add,
    remove,
    contains: (y) => y > board.clientHeight - height,
    canScroll: () => maxScroll() > 0,
    scrollStart,
    scrollMove,
    scrollEnd,
    layout,
    destroy() {
      unbind();
      piles.forEach((p) => p.badge.remove());
      el.remove();
    },
  };
}
