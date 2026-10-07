// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';


export default defineConfig({
  site: 'https://portfolio.relapri.my.id',
  integrations: [react()],
  // SSR stays on for fresh admin-driven content, but public pages set
  // CDN cache headers (see index.astro) so Vercel edge serves them
  // statically between revalidations. Admin routes send no-store.
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,  // Enable Vercel Analytics
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Single heaviest island (three.js avatar). Warn earlier so
      // regressions in client JS weight show up in build logs.
      chunkSizeWarningLimit: 300,
    },
  },
});
