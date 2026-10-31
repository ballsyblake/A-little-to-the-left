// Checks every level, including all generated ones, without a browser.
import { describe, expect, it } from 'vitest';
import type { LevelConfig, PieceState } from '../engine/types';
import { isSolved } from '../engine/wincheck';
import { MIN_BOARD_W } from './gen/layout';
import { LEVELS } from '.';

/** Pieces as they start: nothing in a slot. */
function startState(level: LevelConfig): PieceState[] {
  return level.pieces.map((def) => ({
    def, el: {} as HTMLElement, x: def.start.x, y: def.start.y, rotation: def.start.rot ?? 0, slotId: null,
  }));
}

/** Pieces placed as the level's recorded solution says. */
function solvedState(level: LevelConfig): PieceState[] {
  const pieces = startState(level);
  for (const step of level.solution!) {
    const p = pieces.find((q) => q.def.id === step.piece)!;
    p.slotId = step.slot;
    p.rotation = step.rotation ?? 0;
  }
  return pieces;
}

describe('level list', () => {
  it('has 100 levels with unique ids', () => {
    expect(LEVELS).toHaveLength(100);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(100);
  });
});

describe.each(LEVELS.map((l, i) => [`${i + 1}. ${l.name}`, l] as const))('%s', (_, level) => {
  it('is not solved at the start', () => {
    expect(isSolved(level, startState(level))).toBe(false);
  });

  it('starts every piece inside the board, with unique piece ids', () => {
    for (const p of level.pieces) {
      expect(p.start.x).toBeGreaterThan(0.04);
      expect(p.start.x).toBeLessThan(0.96);
      expect(p.start.y).toBeGreaterThan(0.04);
      expect(p.start.y).toBeLessThan(0.96);
    }
    expect(new Set(level.pieces.map((p) => p.id)).size).toBe(level.pieces.length);
  });

  it('has no overlapping slots on the narrowest board', () => {
    for (const a of level.slots) {
      for (const b of level.slots) {
        if (a === b || Math.abs(a.y - b.y) > 0.01) continue; // only same-row neighbours
        expect(Math.abs(a.x - b.x) * MIN_BOARD_W).toBeGreaterThanOrEqual((a.w + b.w) / 2 - 0.5);
      }
    }
  });

  it.runIf(!!level.solution)('is solved by its recorded solution', () => {
    const slots = new Set(level.solution!.map((s) => s.slot));
    expect(slots.size).toBe(level.slots.length); // every slot used once
    expect(isSolved(level, solvedState(level))).toBe(true);
  });
});
