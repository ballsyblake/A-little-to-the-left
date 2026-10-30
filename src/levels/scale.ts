// Level 6: a kitchen scale. Six weights, three per pan, both pans equal.
// 1+2+9 = 3+4+5 = 12 is the only split; either pan can take either set.
// The dial needle leans toward the heavier side as you go (see decorate).
import { equalSums } from '../engine/rules';
import type { LevelConfig, SlotDef } from '../engine/types';
import { WEIGHT_CANVAS, weight } from './art';

const PAN_Y = 0.4;
const KG = [4, 9, 1, 5, 3, 2]; // scrambled starting order

const pan = (group: string, xs: number[]): SlotDef[] =>
  xs.map((x, i) => ({ id: `${group}${i}`, group, x, y: PAN_Y, w: 46, h: WEIGHT_CANVAS + 4 }));

export const scale: LevelConfig = {
  id: 'scale',
  name: 'Kitchen Scale',
  hint: 'Balance the scale.',
  snapRadius: 40,
  areas: [
    { x: 0.5, y: 0.14, w: 0.34, h: 0, hPx: 64, className: 'dial' },
    { x: 0.27, y: PAN_Y, w: 0.44, h: 0, hPx: WEIGHT_CANVAS + 8, className: 'pan' },
    { x: 0.73, y: PAN_Y, w: 0.44, h: 0, hPx: WEIGHT_CANVAS + 8, className: 'pan' },
  ],
  slots: [...pan('L', [0.12, 0.27, 0.42]), ...pan('R', [0.58, 0.73, 0.88])],
  pieces: KG.map((kg, k) => ({
    id: `weight-${kg}`,
    svg: weight(kg),
    start: { x: 0.12 + k * 0.152, y: 0.78, rot: k % 2 ? 4 : -4 },
    props: { kg },
  })),
  rules: [equalSums('kg')],
  // Live feedback: needle angle from the difference between the pans.
  decorate(view, boardEl) {
    let diff = 0;
    for (const s of view.slots) {
      const kg = Number(view.pieceIn(s.id)?.def.props?.kg ?? 0);
      diff += s.group === 'R' ? kg : -kg;
    }
    boardEl.style.setProperty('--tilt', `${Math.max(-50, Math.min(50, diff * 6))}deg`);
  },
};
