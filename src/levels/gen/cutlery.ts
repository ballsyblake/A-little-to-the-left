// Cutlery drawer: one type per compartment, all facing the same way.
// Harder = more types and pieces, plus the wind from the middle tier.
import { all, groupedBy, sameRotation } from '../../engine/rules';
import type { SlotDef } from '../../engine/types';
import { fork, knife, spoon } from '../art';
import type { Family } from './family';
import { evenly } from './layout';

const KINDS = [
  { type: 'knife', svg: knife },
  { type: 'fork', svg: fork },
  { type: 'spoon', svg: spoon },
];

export const cutleryFamily: Family = ({ rng, d, id, name }) => {
  const types = d < 0.3 ? 2 : 3;
  const per = d < 0.6 ? 2 : 3;
  const kinds = rng.shuffle(KINDS).slice(0, types);
  const centres = types === 2 ? [0.3, 0.7] : [0.18, 0.5, 0.82];
  const offsets = per === 2 ? [-0.05, 0.05] : [-0.09, 0, 0.09];
  const slots: SlotDef[] = centres.flatMap((cx, c) =>
    offsets.map((dx, i) => ({ id: `c${c}s${i}`, group: `c${c}`, x: cx + dx, y: 0.3, w: 26, h: 126 })),
  );
  const pieces = kinds.flatMap((k, c) =>
    Array.from({ length: per }, (_, i) => ({ id: `${k.type}${i}`, c, i, svg: k.svg() })),
  );
  const order = rng.shuffle(pieces);
  const xs = evenly(order.length, 0.1, 0.9);
  // At least one piece starts upside down, so turning always matters.
  const flipped = order.map(() => rng.next() < 0.4);
  flipped[rng.int(0, order.length - 1)] = true;
  return {
    id, name,
    hint: 'Tidy the drawer. Tap to turn.',
    snapRadius: 40,
    areas: centres.map((x) => ({ x, y: 0.3, w: types === 2 ? 0.36 : 0.3, h: 0, hPx: 150, className: 'compartment' })),
    slots,
    pieces: order.map((p, k) => ({
      id: p.id,
      svg: p.svg,
      start: { x: xs[k], y: 0.77, rot: (flipped[k] ? 180 : 0) + rng.range(-7, 7) },
      props: { type: kinds[p.c].type },
      rotatable: true,
    })),
    rules: [all(groupedBy('type'), sameRotation)],
    ...(d >= 0.5 && { wind: { firstDelayMs: [8_000, 12_000], delayMs: [30_000, 45_000], maxOffsetPx: 26, minPlaced: 3 } }),
    solution: pieces.map((p) => ({ slot: `c${p.c}s${p.i}`, piece: p.id, rotation: 0 })),
  };
};
