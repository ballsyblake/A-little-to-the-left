// Fridge magnets: spell any word from an anagram set. Harder = longer words.
// Each set lists every common English word from those letters, so a
// player's sensible answer is never rejected.
import { spellsOneOf } from '../../engine/rules';
import { magnet } from '../art';
import type { Family } from './family';
import { evenly, fitWidth, pastel, scatter } from './layout';

const SETS: string[][] = [
  ['TEA', 'EAT', 'ATE', 'ETA'], ['NOW', 'OWN', 'WON'], ['CAT', 'ACT'], ['DOG', 'GOD'],
  ['RAT', 'ART', 'TAR'], ['NAP', 'PAN'], ['POT', 'TOP', 'OPT'], ['TEN', 'NET'],
  ['STOP', 'POTS', 'TOPS', 'SPOT', 'POST', 'OPTS'], ['EAST', 'SEAT', 'EATS', 'TEAS', 'SATE', 'ETAS'],
  ['LIME', 'MILE'], ['STAR', 'RATS', 'ARTS', 'TSAR', 'TARS'], ['SNAP', 'SPAN', 'PANS', 'NAPS'],
  ['NOTE', 'TONE'], ['LEAF', 'FLEA'], ['TEAM', 'MATE', 'MEAT', 'TAME'], ['CALM', 'CLAM'],
  ['DEAR', 'READ', 'DARE'], ['WOLF', 'FLOW', 'FOWL'], ['POOL', 'LOOP', 'POLO'], ['RACE', 'CARE', 'ACRE'],
  ['HEART', 'EARTH', 'HATER'], ['LEMON', 'MELON'], ['STEAM', 'MEATS', 'TEAMS', 'MATES', 'TAMES'],
  ['PEACH', 'CHEAP'], ['NIGHT', 'THING'], ['OCEAN', 'CANOE'], ['ANGEL', 'ANGLE', 'GLEAN'], ['SPOON', 'SNOOP'],
];

export const magnetsFamily: Family = ({ rng, d, id, name }) => {
  const len = d < 0.35 ? 3 : d < 0.7 ? 4 : 5;
  const words = rng.pick(SETS.filter((s) => s[0].length === len));
  const letters = [...words[0]];
  const xs = evenly(len, 0.5 - 0.09 * (len - 1), 0.5 + 0.09 * (len - 1)); // stays on the fridge door
  const size = fitWidth(xs[1] - xs[0], 50, 6);
  const order = rng.shuffle(letters.map((_, i) => i));
  const spots = scatter(len, rng, { rows: [0.66, 0.84], perRow: 3, tilt: 12 });
  return {
    id, name,
    hint: 'Leave the fridge a word.',
    snapRadius: 36,
    areas: [{ x: 0.5, y: 0.3, w: 0.94, h: 0, hPx: 110, className: 'fridge' }],
    slots: xs.map((x, i) => ({ id: `m${i}`, x, y: 0.3, w: size + 4, h: size + 10 })),
    pieces: order.map((i, k) => ({
      id: `letter${i}`,
      svg: magnet(letters[i], pastel(rng.range(0, 360)), size),
      start: spots[k],
      props: { letter: letters[i] },
    })),
    rules: [spellsOneOf('letter', words)],
    solution: letters.map((_, i) => ({ slot: `m${i}`, piece: `letter${i}` })),
  };
};
