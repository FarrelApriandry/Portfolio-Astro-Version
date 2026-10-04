// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
// import vercel from '@astrojs/vercel/serverless';


export default defineConfig({
  integrations: [react()],
  output: 'server', // or 'static' if no SSR
  adapter: vercel({
    webAnalytics: {
      enabled: true,  // Enable Vercel Analytics
    },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
});
