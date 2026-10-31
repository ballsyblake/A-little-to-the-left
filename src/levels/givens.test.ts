// Design aid, not a check: for chapter levels meant to have one answer,
// greedily suggest extra givens until the solver finds exactly one.
// Run with: GIVENS=quilt,mini-sudoku npx vitest run givens
import { it } from 'vitest';
import { ch2 } from './chapters/ch2';
import { ch3 } from './chapters/ch3';
import { ch4 } from './chapters/ch4';
import { ch5 } from './chapters/ch5';
import { ch6 } from './chapters/ch6';
import { makeRng } from './rng';
import { assemble, type Spec } from './kit';
import { countSolutions } from './solver';

declare const process: { env: Record<string, string | undefined> }; // Node global in tests

it.runIf(!!process.env.GIVENS)('suggest givens', () => {
  const ids = new Set(process.env.GIVENS!.split(','));
  for (const spec of [...ch2, ...ch3, ...ch4, ...ch5, ...ch6].filter((s: Spec) => ids.has(s.id))) {
    const given = [...(spec.given ?? [])];
    let n = countSolutions(assemble({ ...spec, given }), 100);
    while (n !== null && n > 1) {
      let best: [number, number] | null = null;
      for (let i = 0; i < spec.slots.length; i++) {
        if (given.includes(i)) continue;
        const m = countSolutions(assemble({ ...spec, given: [...given, i] }), 100);
        if (m !== null && m >= 1 && (!best || m < best[1])) best = [i, m];
      }
      if (!best) break;
      given.push(best[0]);
      n = best[1];
    }
    console.log(`${spec.id}: given [${given.join(', ')}] -> ${n}`);
  }
}, 600_000);

// Reduce mode: start fully given and remove givens while the answer stays
// unique. Gives near-minimal (harder) puzzles. GIVENS_REDUCE=id1,id2
it.runIf(!!process.env.GIVENS_REDUCE)('reduce givens', () => {
  const ids = new Set(process.env.GIVENS_REDUCE!.split(','));
  for (const spec of [...ch2, ...ch3, ...ch4, ...ch5, ...ch6].filter((s: Spec) => ids.has(s.id))) {
    let given = spec.slots.map((_, i) => i);
    const order = makeRng(given.length * 31 + spec.id.length).shuffle(given);
    for (const i of order) {
      const without = given.filter((g) => g !== i);
      if (countSolutions(assemble({ ...spec, given: without }), 2, 1_500_000) === 1) given = without;
    }
    console.log(`${spec.id}: given [${[...given].sort((a, b) => a - b).join(', ')}] (${given.length} of ${spec.slots.length})`);
  }
}, 1_800_000);
