// The wind nuisance: now and then, gently nudges one placed piece out of its
// slot. Pure timing + state; the UI supplies the look/sound via hooks.
import type { Board } from './board';
import type { PieceState } from './types';

export interface WindConfig {
  firstDelayMs: [number, number]; // first gust, counted from reaching minPlaced
  delayMs: [number, number];      // gap between later gusts
  maxOffsetPx: number;            // how far a nudged piece slides
  minPlaced: number;              // don't bother the player until this many are placed
}

export interface WindHooks {
  /** Gust is arriving (play streaks/sound). `fromLeft` = direction. */
  onGust(target: PieceState, fromLeft: boolean): void;
  /** The piece has just been pushed out of its slot. */
  onNudged(target: PieceState): void;
}

const TICK_MS = 1000;
/** Delay between the gust visual starting and the piece actually moving. */
const LEAD_MS = 450;

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a);

/** Run a UI hook without letting a failure (e.g. audio) kill the wind loop. */
function safely(fn: () => void): void {
  try {
    fn();
  } catch (err) {
    console.warn('wind hook failed', err);
  }
}

export function startWind(board: Board, cfg: WindConfig, hooks: WindHooks): () => void {
  let nextGustAt: number | null = null; // deadline in ms, null = not armed
  let elapsed = 0;                      // "visible play time", pauses when hidden
  let pending = 0;                      // timeout id of an in-flight gust

  const tick = () => {
    if (document.hidden || board.isLocked()) return; // clock paused
    elapsed += TICK_MS;

    const placed = board.pieces.filter((p) => p.slotId !== null && !p.def.fixedIn);
    if (placed.length < cfg.minPlaced) {
      nextGustAt = null; // disarm until the player has made some progress
      return;
    }
    if (nextGustAt === null) {
      nextGustAt = elapsed + between(cfg.firstDelayMs);
      return;
    }
    if (elapsed < nextGustAt || pending) return;

    nextGustAt = elapsed + between(cfg.delayMs);
    const target = placed[Math.floor(Math.random() * placed.length)];
    const fromLeft = Math.random() < 0.5;
    safely(() => hooks.onGust(target, fromLeft));
    pending = window.setTimeout(() => {
      pending = 0;
      // Re-check: the player may have grabbed it, or solved the level, meanwhile.
      if (target.slotId === null || board.isLocked()) return;
      const dist = cfg.maxOffsetPx * (0.75 + Math.random() * 0.25);
      board.nudge(target, fromLeft ? dist : -dist, fromLeft ? 8 : -8);
      safely(() => hooks.onNudged(target));
    }, LEAD_MS);
  };

  const interval = window.setInterval(tick, TICK_MS);
  return () => {
    clearInterval(interval);
    clearTimeout(pending);
  };
}
