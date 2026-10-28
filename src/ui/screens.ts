// Screens: each builds its DOM into `app` and returns a cleanup function.
import { createBoard } from '../engine/board';
import { isSolved } from '../engine/wincheck';
import type { LevelConfig } from '../engine/types';

export interface GameScreenOptions {
  level: LevelConfig;
  levelNumber: number;
  onSolved(): void;
  onNext(): void;
}

/** The play screen for one level. */
export function showGame(app: HTMLElement, opts: GameScreenOptions): () => void {
  const { level } = opts;
  app.replaceChildren();

  const title = el('h1', 'title', `${opts.levelNumber}. ${level.name}`);
  const hint = el('p', 'hint', level.hint);

  const next = el('button', 'btn', 'Next') as HTMLButtonElement;
  next.hidden = true;
  next.addEventListener('click', opts.onNext);

  const board = createBoard({
    slots: level.slots,
    pieces: level.pieces,
    snapRadius: level.snapRadius,
    onChange(pieces, event) {
      if (event === 'snap') navigator.vibrate?.(10); // haptic tick where supported
      // Win check after every move.
      if (isSolved(level, pieces)) {
        board.lock();
        hint.textContent = 'Just so.';
        next.hidden = false;
        opts.onSolved();
      }
    },
  });

  const footer = el('div', 'footer');
  footer.append(next);
  app.append(title, hint, board.el, footer);

  return () => board.destroy();
}

/** Tiny DOM helper. */
function el(tag: string, className: string, text = ''): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  e.textContent = text;
  return e;
}
