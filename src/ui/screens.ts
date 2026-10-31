// Screens: each builds its DOM into `app` and returns a cleanup function.
import { createBoard } from '../engine/board';
import { passingRules, viewOf } from '../engine/wincheck';
import { startWind } from '../engine/wind';
import type { LevelConfig } from '../engine/types';
import { chime, whoosh } from './audio';
import { gustStreaks, haptic, plop, rock, settle, shiver } from './effects';
import { openHint } from './hint';

export interface GameScreenOptions {
  level: LevelConfig;
  levelNumber: number;
  /** Solutions (rule indices) already found on earlier visits. */
  found: Set<number>;
  onFound(index: number): void;
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
  const hintBtn = el('button', 'btn-back btn-hint', 'Hint');
  hintBtn.setAttribute('aria-label', 'Show a hint');
  const header = el('div', 'header');
  header.append(back, title, hintBtn);

  // Wordless levels keep the rule in the hint; the line shows progress instead.
  const total = level.rules.length;
  const found = new Set(opts.found);
  const ways = () => (total > 1 ? Array.from({ length: total }, (_, i) => (found.has(i) ? '\u25CF' : '\u25CB')).join(' ') : '');
  const hint = el('p', 'hint', level.wordless ? ways() : level.hint);

  const next = el('button', 'btn', 'Next') as HTMLButtonElement;
  next.hidden = opts.found.size === 0; // solved before: free to move on
  next.addEventListener('click', opts.onNext);

  const board = createBoard({
    slots: level.slots,
    pieces: level.pieces,
    areas: level.areas,
    snapRadius: level.snapRadius,
    trayHeight: level.trayHeight,
    onChange(pieces, event, piece) {
      if (event === 'snap') {
        haptic(10);
        plop(piece.el);
      }
      level.decorate?.(viewOf(level, pieces), board.el);
      // Win check after every move: which solutions does the board show?
      const fresh = passingRules(level, pieces).filter((i) => !found.has(i));
      if (fresh.length) void win(fresh);
    },
  });
  level.decorate?.(viewOf(level, board.pieces), board.el); // initial state

  let celebrating = false;
  async function win(fresh: number[]) {
    if (celebrating) return;
    celebrating = true;
    fresh.forEach((i) => {
      found.add(i);
      opts.onFound(i); // save progress immediately, before any animation
    });
    const all = found.size === total;
    if (all) {
      board.lock();
      stopWind();
    }
    haptic([12, 60, 12]);
    chime();
    await settle(board.el, board.pieces.map((p) => p.el));
    celebrating = false;
    // More than one way to tidy this? Say so, and leave the board playable.
    hint.textContent = all ? `Just so. ${ways()}`.trim() : `${ways()}  There's another way.`;
    next.hidden = false;
    next.classList.add('is-shown');
  }

  // Hint: sketch of the first solution not found yet (or the first one).
  let closeHint = () => {};
  hintBtn.addEventListener('click', () => {
    closeHint();
    const unfound = Array.from({ length: total }, (_, i) => i).find((i) => !found.has(i)) ?? 0;
    closeHint = openHint(app, { level, solutionIndex: unfound, board: board.el });
  });

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
    closeHint();
    stopWind();
    board.destroy();
  };
}

export interface LevelSelectOptions {
  levels: LevelConfig[];
  progress: Map<string, Set<number>>;
  onPick(index: number): void;
}

/** Grid of numbered level tiles. Every level is open; solved ones are ticked off. */
export function showLevelSelect(app: HTMLElement, opts: LevelSelectOptions): () => void {
  app.replaceChildren();
  const done = opts.levels.filter((l) => opts.progress.get(l.id)?.size).length;
  const title = el('h1', 'title title-big', 'Just So');
  const hint = el('p', 'hint', `A few small things to put right. ${done} / ${opts.levels.length}`);

  const grid = el('div', 'level-grid');
  let current: HTMLElement | null = null; // first unsolved level
  opts.levels.forEach((level, i) => {
    const foundHere = opts.progress.get(level.id) ?? new Set<number>();
    const solved = foundHere.size > 0;
    const tile = el('button', 'level-tile', String(i + 1)) as HTMLButtonElement;
    if (level.rules.length > 1) {
      // One dot per way to solve it, filled when found.
      const dots = el('span', 'tile-dots');
      dots.textContent = level.rules.map((_, k) => (foundHere.has(k) ? '\u25CF' : '\u25CB')).join('');
      tile.append(dots);
    }
    tile.classList.toggle('is-solved', solved);
    tile.title = level.name;
    tile.setAttribute('aria-label', `Level ${i + 1}: ${level.name}${solved ? ', solved' : ''}`);
    if (!solved && !current) {
      current = tile;
      tile.classList.add('is-current');
    }
    tile.addEventListener('click', () => opts.onPick(i));
    grid.append(tile);
  });

  app.append(title, hint, grid);
  // Open where the player left off.
  requestAnimationFrame(() => (current as HTMLElement | null)?.scrollIntoView({ block: 'center' }));
  return () => {};
}

/** Tiny DOM helper. */
function el(tag: string, className: string, text = ''): HTMLElement {
  const e = document.createElement(tag);
  e.className = className;
  e.textContent = text;
  return e;
}
