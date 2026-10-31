// Checks every level without a browser: layout on the smallest board,
// recorded solution passes, start doesn't, and logic puzzles are unique.
import { describe, expect, it } from 'vitest';
import type { LevelConfig, PieceDef, PieceState, SlotDef } from '../engine/types';
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

/** Footprint in px at its start rotation (sideways pieces swap w and h). */
function footprint(p: PieceDef): { w: number; h: number } {
  const quarter = Math.round((p.start.rot ?? 0) / 90) % 2 !== 0;
  return quarter ? { w: p.size!.h, h: p.size!.w } : p.size!;
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
  const loose = level.pieces.filter((p) => !p.fixedIn);

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

  it.runIf(loose.every((p) => p.size))('lays loose pieces out on the board, apart', () => {
    for (const p of loose) {
      const f = footprint(p);
      const [x, y] = [p.start.x * MIN_W, p.start.y * MIN_H];
      expect(x - f.w / 2, `${p.id} left`).toBeGreaterThanOrEqual(-2);
      expect(x + f.w / 2, `${p.id} right`).toBeLessThanOrEqual(MIN_W + 2);
      expect(y + f.h / 2, `${p.id} bottom`).toBeLessThanOrEqual(MIN_H + 2);
    }
    for (const [i, a] of loose.entries()) {
      for (const b of loose.slice(i + 1)) {
        const hit = overlap(a.start.x * MIN_W, a.start.y * MIN_H, footprint(a), b.start.x * MIN_W, b.start.y * MIN_H, footprint(b), 0.8);
        expect(hit, `${a.id} vs ${b.id}`).toBe(false);
      }
    }
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
