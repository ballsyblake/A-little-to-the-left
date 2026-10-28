// The wind nuisance: now and then, gently nudges one placed piece out of its
// slot. Pure timing + state; the UI supplies the look/sound via hooks.
import type { Board } from './board';
import type { PieceState } from './types';

export interface WindConfig {
  minDelayMs: number;  // shortest gap between gusts
  maxDelayMs: number;  // longest gap between gusts
  maxOffsetPx: number; // how far a nudged piece slides
  minPlaced: number;   // don't bother the player until this many are placed
}

export interface WindHooks {
  /** Gust is arriving (play streaks/sound). `fromLeft` = direction. */
  onGust(target: PieceState, fromLeft: boolean): void;
  /** The piece has just been pushed out of its slot. */
  onNudged(target: PieceState): void;
}

/** Delay between the gust visual starting and the piece actually moving. */
const LEAD_MS = 450;

export function startWind(board: Board, cfg: WindConfig, hooks: WindHooks): () => void {
  let timer = 0;
  let stopped = false;

  const schedule = () => {
    const delay = cfg.minDelayMs + Math.random() * (cfg.maxDelayMs - cfg.minDelayMs);
    timer = window.setTimeout(gust, delay);
  };

  const gust = () => {
    if (stopped) return;
    const placed = board.pieces.filter((p) => p.slotId !== null);
    // Only when the player can see it and it would be fair.
    if (!document.hidden && !board.isLocked() && placed.length >= cfg.minPlaced) {
      const target = placed[Math.floor(Math.random() * placed.length)];
      const fromLeft = Math.random() < 0.5;
      hooks.onGust(target, fromLeft);
      timer = window.setTimeout(() => {
        // Re-check: the player may have grabbed it, or solved the level, meanwhile.
        if (!stopped && target.slotId !== null && !board.isLocked()) {
          const dist = cfg.maxOffsetPx * (0.6 + Math.random() * 0.4);
          board.nudge(target, fromLeft ? dist : -dist, fromLeft ? 6 : -6);
          hooks.onNudged(target);
        }
        schedule();
      }, LEAD_MS);
      return;
    }
    schedule();
  };

  schedule();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
