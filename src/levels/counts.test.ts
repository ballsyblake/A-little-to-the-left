// Design aid, not a check: prints how many answers each level has.
// Run with: COUNTS=1 npx vitest run counts
import { it } from 'vitest';

declare const process: { env: Record<string, string | undefined> }; // Node global in tests
import { countSolutions } from './solver';
import { LEVELS } from '.';

it.runIf(!!process.env.COUNTS)('solution counts', () => {
  const only = process.env.COUNTS === '1' ? null : new Set(process.env.COUNTS!.split(',').map(Number));
  for (const [i, level] of LEVELS.entries()) {
    if (only && !only.has(i + 1)) continue;
    const t = Date.now();
    const n = countSolutions(level, 50);
    console.log(`${i + 1}. ${level.name}: ${n === null ? 'not searched' : n >= 50 ? '50+' : n} (${Date.now() - t} ms)`);
  }
}, 600_000);
