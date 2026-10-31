// Builds the generated levels: cycle through the families, raising the
// difficulty a notch each full cycle.
import type { LevelConfig } from '../../engine/types';
import { booksFamily } from './books';
import { buttonsFamily } from './buttons';
import { cutleryFamily } from './cutlery';
import { dominoesFamily } from './dominoes';
import type { Family } from './family';
import { magnetsFamily } from './magnets';
import { pencilsFamily } from './pencils';
import { makeRng } from './rng';
import { scaleFamily } from './scale';
import { swatchesFamily } from './swatches';

// [family, display name, how many hand-made levels already use that name]
const CYCLE: [Family, string, number][] = [
  [swatchesFamily, 'Paint Chips', 0],
  [pencilsFamily, 'Pencil Tray', 1],
  [buttonsFamily, 'Button Jars', 0],
  [booksFamily, 'Bookshelf', 1],
  [magnetsFamily, 'Fridge Magnets', 1],
  [cutleryFamily, 'Cutlery Drawer', 1],
  [dominoesFamily, 'Dominoes', 1],
  [scaleFamily, 'Kitchen Scale', 1],
];

/** `count` generated levels, numbered from `firstNumber` (1-based). */
export function generateLevels(count: number, firstNumber: number): LevelConfig[] {
  const tiers = Math.ceil(count / CYCLE.length);
  const seen = CYCLE.map(([, , handmade]) => handmade);
  return Array.from({ length: count }, (_, i) => {
    const slot = i % CYCLE.length;
    const [family, title] = CYCLE[slot];
    const number = firstNumber + i;
    seen[slot] += 1;
    return family({
      rng: makeRng(number * 7919 + 17), // seeded by level number: same level every time
      d: tiers > 1 ? Math.floor(i / CYCLE.length) / (tiers - 1) : 0,
      id: `gen-${number}`,
      name: seen[slot] > 1 ? `${title} ${seen[slot]}` : title,
    });
  });
}
