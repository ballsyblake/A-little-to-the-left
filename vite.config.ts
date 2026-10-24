import { defineConfig } from 'vite';

// `host: true` is the same as `npm run dev -- --host`: listen on the LAN
// so a phone on the same Wi-Fi can open the printed Network URL.
export default defineConfig({
  server: { host: true },
});
