// Design script, not a check: generates the big grid puzzles and their
// givens, and writes them to chapters/grid-data.json.
// Run with: DESIGN=1 npx vitest run design        (all recipes)
//           DESIGN=id1,id2 npx vitest run design  (just these)
import { it } from 'vitest';
import { RECIPES } from './chapters/recipes';
import { gridSpec } from './grids';
import { assemble } from './kit';
import { makeRng } from './rng';
import { countSolutions } from './solver';

declare const process: { env: Record<string, string | undefined> };
declare const require: (m: string) => any;

it.runIf(!!process.env.DESIGN)('design grid puzzles', () => {
  const fs = require('fs');
  const file = new URL('./chapters/grid-data.json', import.meta.url).pathname;
  const data: Record<string, { rows: string[]; given: number[] }> = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const only = process.env.DESIGN === '1' ? null : new Set(process.env.DESIGN!.split(','));

  for (const r of RECIPES.filter((x) => !only || only.has(x.id))) {
    const rng = makeRng([...r.id].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) >>> 0);
    const rows = r.make(rng);
    const cells = rows.length * (rows[0].length / (r.width ?? 1));
    const level = (given: number[]) => assemble(gridSpec({ ...r.level(rows), given }));
    const unique = (given: number[]) => countSolutions(level(given), 2, r.maxNodes ?? 400_000) === 1;

    // Remove givens one by one (in a seeded order) while the answer stays unique.
    let given = Array.from({ length: cells }, (_, i) => i);
    const t = Date.now();
    if (!unique(given)) throw new Error(`${r.id}: full grid is not a valid answer`);
    for (const i of rng.shuffle(given)) {
      const without = given.filter((g) => g !== i);
      if (unique(without)) given = without;
    }
    const minimal = given.length;
    // Easier chapters get a few givens back.
    const removed = rng.shuffle(Array.from({ length: cells }, (_, i) => i).filter((i) => !given.includes(i)));
    given = [...given, ...removed.slice(0, r.extra ?? 0)].sort((a, b) => a - b);
    data[r.id] = { rows, given };
    console.log(`${r.id}: ${given.length}/${cells} given (minimal ${minimal}) in ${Date.now() - t} ms`);
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 1) + '\n');
}, 3_600_000);
