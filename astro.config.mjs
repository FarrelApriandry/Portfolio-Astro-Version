// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  integrations: [react()],
  output: 'server', // or 'static' if no SSR
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
