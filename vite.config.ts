import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Base absolue : requise par BrowserRouter (URLs sans #). L'hôte doit renvoyer
// index.html en fallback pour les routes profondes (rechargement sur /kpi, etc.).
// `BASE_PATH` permet de servir le site sous un sous-chemin (ex. GitHub Pages
// projet : /cc-poc/). En local, il reste à '/'.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Port dédié (≠ 5173 par défaut) pour cohabiter avec d'autres projets Vite.
  server: { port: 8616, strictPort: true },
  preview: { port: 8616, strictPort: true },
});
