// Checks every level without a browser: layout on the smallest board,
// recorded solution passes, start doesn't, and logic puzzles are unique.
import { describe, expect, it } from 'vitest';
import type { LevelConfig, PieceState, SlotDef } from '../engine/types';
import { isSolved } from '../engine/wincheck';
import { MIN_H, MIN_W } from './kit';
import { countSolutions, startPieces } from './solver';
import { LEVELS } from '.';

/** Pieces placed as the level's recorded solution says. */
function solvedState(level: LevelConfig): PieceState[] {
  const pieces = startPieces(level);
  for (const step of level.solution!) {
    const p = pieces.find((q) => q.def.id === step.piece)!;
    p.slotId = step.slot;
    p.rotation = step.rotation ?? 0;
  }
  return pieces;
}

/** Do two boxes (centre + size, px) overlap by more than `slack`? */
function overlap(ax: number, ay: number, a: { w: number; h: number }, bx: number, by: number, b: { w: number; h: number }, slack: number) {
  return Math.abs(ax - bx) < ((a.w + b.w) / 2) * slack && Math.abs(ay - by) < ((a.h + b.h) / 2) * slack;
}

describe('level list', () => {
  it('has 100 levels with unique ids and names', () => {
    expect(LEVELS).toHaveLength(100);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(100);
    expect(new Set(LEVELS.map((l) => l.name)).size).toBe(100);
  });
});

describe.each(LEVELS.map((l, i) => [`${i + 1}. ${l.name}`, l] as const))('%s', (_, level) => {
  it('is not solved at the start', () => {
    expect(isSolved(level, startPieces(level))).toBe(false);
  });

  it('has unique piece and slot ids', () => {
    expect(new Set(level.pieces.map((p) => p.id)).size).toBe(level.pieces.length);
    expect(new Set(level.slots.map((s) => s.id)).size).toBe(level.slots.length);
  });

  it('keeps slots on the board without overlapping (320px phone)', () => {
    const px = (s: SlotDef) => [s.x * MIN_W, s.y * MIN_H] as const;
    for (const s of level.slots) {
      const [x, y] = px(s);
      expect(x - s.w / 2, `${s.id} left`).toBeGreaterThanOrEqual(-1);
      expect(x + s.w / 2, `${s.id} right`).toBeLessThanOrEqual(MIN_W + 1);
      expect(y - s.h / 2, `${s.id} top`).toBeGreaterThanOrEqual(-1);
      expect(y + s.h / 2, `${s.id} bottom`).toBeLessThanOrEqual(MIN_H + 1);
    }
    for (const [i, a] of level.slots.entries()) {
      for (const b of level.slots.slice(i + 1)) {
        expect(overlap(...px(a), a, ...px(b), b, 0.99), `${a.id} vs ${b.id}`).toBe(false);
      }
    }
  });

  it.runIf(!!level.trayHeight)('keeps slots clear of the piece tray', () => {
    const top = MIN_H - level.trayHeight!;
    for (const s of level.slots) expect(s.y * MIN_H + s.h / 2, `${s.id} bottom`).toBeLessThanOrEqual(top + 1);
  });

  it.runIf(!!level.solution)('is solved by its recorded solution', () => {
    const filled = new Set([...level.solution!.map((s) => s.slot), ...level.pieces.flatMap((p) => p.fixedIn ?? [])]);
    expect(filled.size).toBe(level.slots.length); // every slot used once
    expect(isSolved(level, solvedState(level))).toBe(true);
  });

  it.runIf(!!level.unique)('has exactly one answer', () => {
    expect(countSolutions(level, 2)).toBe(1);
  }, 60_000);
});
