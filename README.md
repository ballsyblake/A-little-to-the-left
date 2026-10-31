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

## How it plays (after A Little to the Left)

- **Hidden ways:** many levels can be tidied in 2-3 different ways (by length,
  by colour...). Each way found fills a dot on the level tile; "Next" appears
  after the first, and the board stays playable to look for the others.
- **Wordless:** tidying levels show no rule on screen. The Hint button opens a
  sketch of the next unfound way under pencil scribble; rub to reveal. The
  written rule is there too, blurred until tapped.
- **Hands-on:** tap pieces to flip/switch them, drag around a frame to
  straighten it, and scrub with the cloth to polish.

## Levels

- `src/levels/*.ts` (pencils, books, ...): the six hand-made tutorial levels.
- `src/levels/chapters/secondLook.ts`: levels 7-25, in the spirit of A Little to the Left.
- `src/levels/chapters/ch2.ts`, `ch3.ts`: levels 26-59, each written as its *solved*
  state and turned into a playable level by `assemble()` in `src/levels/kit.ts`.
- `src/levels/chapters/order.ts`: levels 60-119. Grid puzzles come from
  `recipes.ts` + `grid-data.json`; the rest are hand-built in `custom.ts`.
- Rules live in `src/engine/lines.ts` (row/column/group predicates, each with an
  early "could this still work?" check) and `src/engine/rules.ts`.
- Loose pieces start in the scrolling tray (`src/engine/tray.ts`).

Design helpers (print or write data only, not part of `npm test`):

```sh
DESIGN=1 npx vitest run design               # regenerate grid-data.json (answers + givens)
DESIGN=quilt-6 npx vitest run design         # just one recipe
COUNTS=41,42 npx vitest run counts           # how many answers levels 41 and 42 have
GIVENS=seating-plan-10 npx vitest run givens # add givens until a level has one answer
GIVENS_REDUCE=just-so npx vitest run givens  # remove givens while it stays unique
```
