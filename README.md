# Just So

A small, cozy tidying-puzzle prototype (Vite + vanilla TypeScript, no image assets).

```sh
npm install
npm run dev -- --host   # open the printed "Network" URL on your phone (same Wi-Fi)
npm run typecheck
npm test                # checks all 100 levels: solvable, unique where intended, fit a 320px phone
```

Live build: https://ballsyblake.github.io/A-little-to-the-left/ (deployed by `.github/workflows/pages.yml`).
Every push to the working branch or `main` redeploys; to redeploy manually use
Actions > Deploy to GitHub Pages > Run workflow.

## Levels

- `src/levels/*.ts` (pencils, books, ...): the six hand-made tutorial levels.
- `src/levels/chapters/ch2.ts` .. `ch6.ts`: levels 7-100, each written as its
  *solved* state and turned into a playable level by `assemble()` in `src/levels/kit.ts`.
- Rules live in `src/engine/lines.ts` (row/column/group predicates) and `src/engine/rules.ts`.

Design helpers (print only, not part of `npm test`):

```sh
COUNTS=41,42 npx vitest run counts          # how many answers levels 41 and 42 have
GIVENS=quilt npx vitest run givens          # add givens until a level has one answer
GIVENS_REDUCE=just-so npx vitest run givens # remove givens while it stays unique
```
