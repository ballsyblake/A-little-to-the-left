// A piece's facts as rules see them right now: its fixed props merged with
// those of its current state (a coin's face, a mug handle's direction).
import type { PieceProps, PieceState } from './types';

export function propsOf(p: PieceState): PieceProps {
  const state = p.def.states?.[p.state]?.props;
  return state ? { ...p.def.props, ...state } : p.def.props ?? {};
}

/** Smallest difference between two angles in degrees (0..180). */
export function angleDiff(a: number, b: number): number {
  const d = (((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
}
