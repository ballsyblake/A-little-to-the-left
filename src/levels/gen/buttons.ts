// Buttons sorted into jars by colour (any jar order). Size and hole count
// vary but don't matter. Harder = more jars, more buttons per jar.
import { groupedBy } from '../../engine/rules';
import type { SlotDef } from '../../engine/types';
import { button } from '../art';
import type { Family } from './family';
import { evenly, scatter } from './layout';

const COLOURS = ['#f4b6a6', '#a8d5c2', '#b9c6ef', '#f6d38b', '#d9c2ea'];

export const buttonsFamily: Family = ({ rng, d, id, name }) => {
  const jars = d < 0.4 ? 2 : 3;
  const per = 2 + Math.round(d * 2);            // 2..4 buttons per jar
  const colours = rng.shuffle(COLOURS).slice(0, jars);
  const jarXs = jars === 2 ? [0.3, 0.7] : [0.18, 0.5, 0.82];
  const ys = evenly(per, 0.12, 0.12 + 0.095 * (per - 1));
  const slots: SlotDef[] = jarXs.flatMap((x, j) =>
    ys.map((y, k) => ({ id: `j${j}s${k}`, group: `j${j}`, x, y, w: 42, h: 38 })),
  );
  // Every button: which colour, plus decoy size/holes.
  const all = colours.flatMap((colour, c) =>
    Array.from({ length: per }, (_, k) => ({
      id: `button-${c}-${k}`, c, svg: button(colour, rng.int(28, 38), rng.next() < 0.5 ? 2 : 4),
    })),
  );
  const order = rng.shuffle(all);
  const spots = scatter(order.length, rng, { rows: [0.68, 0.84], perRow: 6, tilt: 20 });
  const jarH = 0.095 * (per - 1) + 0.12;
  return {
    id, name,
    hint: 'Sort the buttons into jars.',
    snapRadius: 32,
    areas: jarXs.map((x) => ({ x, y: ys[0] + (ys[per - 1] - ys[0]) / 2, w: jars === 2 ? 0.34 : 0.28, h: jarH, className: 'compartment' })),
    slots,
    pieces: order.map((b, i) => ({ id: b.id, svg: b.svg, start: spots[i], props: { colour: b.c } })),
    rules: [groupedBy('colour')],
    solution: all.map((b) => ({ slot: `j${b.c}s${b.id.split('-')[2]}`, piece: b.id })),
  };
};
