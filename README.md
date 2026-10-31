# Just So

A small, cozy tidying-puzzle prototype (Vite + vanilla TypeScript, no image assets).

```sh
npm install
npm run dev -- --host   # open the printed "Network" URL on your phone (same Wi-Fi)
npm run typecheck
npm test                # checks all 100 levels are solvable and fit small screens
```

Live build: https://ballsyblake.github.io/A-little-to-the-left/ (deployed by `.github/workflows/pages.yml`).
Every push to the working branch or `main` redeploys; to redeploy manually use
Actions > Deploy to GitHub Pages > Run workflow.
