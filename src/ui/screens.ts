// Screens: each builds its DOM into `app` and returns a cleanup function.
import { createBoard } from '../engine/board';
import { isSolved } from '../engine/wincheck';
import { startWind } from '../engine/wind';
import type { LevelConfig } from '../engine/types';
import { chime, whoosh } from './audio';
import { gustStreaks, haptic, plop, rock, settle, shiver } from './effects';

export interface GameScreenOptions {
  level: LevelConfig;
  levelNumber: number;
  onSolved(): void;
  onNext(): void;
  onBack(): void;
}

/** The play screen for one level. */
export function showGame(app: HTMLElement, opts: GameScreenOptions): () => void {
  const { level } = opts;
  app.replaceChildren();

  const back = el('button', 'btn-back', 'Levels');
  back.setAttribute('aria-label', 'Back to level select');
  back.addEventListener('click', opts.onBack);
  const title = el('h1', 'title', `${opts.levelNumber}. ${level.name}`);
  const header = el('div', 'header');
  header.append(back, title);

  const hint = el('p', 'hint', level.hint);

  const next = el('button', 'btn', 'Next') as HTMLButtonElement;
  next.hidden = true;
  next.addEventListener('click', opts.onNext);

  const board = createBoard({
    slots: level.slots,
    pieces: level.pieces,
    areas: level.areas,
    snapRadius: level.snapRadius,
    onChange(pieces, event, piece) {
      if (event === 'snap') {
        haptic(10);
        plop(piece.el);
      }
      // Win check after every move.
      if (isSolved(level, pieces)) void win();
    },
  });

  async function win() {
    board.lock();
    stopWind();
    opts.onSolved(); // save progress immediately, before any animation
    haptic([12, 60, 12]);
    chime();
    await settle(board.el, board.pieces.map((p) => p.el));
    hint.textContent = 'Just so.';
    next.hidden = false;
    next.classList.add('is-shown');
  }

  // Nuisance: only levels that configure it get a breeze.
  // Add ?wind=fast to the URL to get a gust every few seconds while testing.
  const fast = new URLSearchParams(location.search).get('wind') === 'fast';
  const wind = level.wind && fast
    ? { ...level.wind, firstDelayMs: [2_000, 3_000] as [number, number], delayMs: [5_000, 6_000] as [number, number] }
    : level.wind;
  let explained = false;
  const stopWind = wind
    ? startWind(board, wind, {
        onGust(target, fromLeft) {
          gustStreaks(board.el, fromLeft);
          shiver(target.el);
          whoosh();
        },
        onNudged(target) {
          rock(target.el);
          haptic(6);
          if (!explained) {
            // First gust per visit: say what happened, then restore the hint.
            explained = true;
            hint.textContent = 'A breeze nudged something out of place.';
            setTimeout(() => !board.isLocked() && (hint.textContent = level.hint), 3500);
          }
        },
      })
    : () => {};

  const footer = el('div', 'footer');
  footer.append(next);
  app.append(header, hint, board.el, footer);

  return () => {
    stopWind();
    board.destroy();
  };
}

export interface LevelSelectOptions {
  levels: LevelConfig[];
  solved: Set<string>;
  onPick(index: number): void;
}

/** Grid of level cards. A level unlocks once the previous one is solved. */
export function showLevelSelect(app: HTMLElement, opts: LevelSelectOptions): () => void {
  app.replaceChildren();
  const title = el('h1', 'title title-big', 'Just So');
  const hint = el('p', 'hint', 'A few small things to put right.');

  const list = el('div', 'level-list');
  opts.levels.forEach((level, i) => {
    const solved = opts.solved.has(level.id);
    const unlocked = i === 0 || opts.solved.has(opts.levels[i - 1].id);
    const card = el('button', `level-card${solved ? ' is-solved' : ''}`) as HTMLButtonElement;
    card.disabled = !unlocked;
    card.append(
      el('span', 'level-num', String(i + 1)),
      el('span', 'level-name', level.name),
      el('span', 'level-status', solved ? 'Solved' : unlocked ? '' : 'Locked'),
    );
    card.addEventListener('click', () => opts.onPick(i));
    list.append(card);
  });

  app.append(title, hint, list);
  return () => {};
}

/** Tiny DOM helper. */
function el(tag: string, className: string, text = ''): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  e.textContent = text;
  return e;
}
