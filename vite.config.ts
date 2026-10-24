import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build works under any sub-path,
  // e.g. https://<user>.github.io/A-little-to-the-left/ on GitHub Pages.
  base: './',
  // `host: true` is the same as `npm run dev -- --host`: listen on the LAN
  // so a phone on the same Wi-Fi can open the printed Network URL.
  server: { host: true },
});
