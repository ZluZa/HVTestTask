import { defineConfig } from 'vite';

export default defineConfig({
  // Keep the build portable between a domain root and a GitHub Pages subpath.
  base: './',
});
