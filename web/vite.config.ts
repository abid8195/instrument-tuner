import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages serves project sites from /<repo>/, not /. Everything else
  // (manifest, icons, sw.js registration) is written relative-path-safe so
  // this is the only place the subpath needs to be known.
  base: process.env.GH_PAGES ? '/instrument-tuner/' : '/',
  plugins: [react(), tailwindcss()],
  server: { host: true },
})
