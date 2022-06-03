import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
  optimizeDeps: {
    // sub-dependencies of our sym-linked package must be manually included here
    include: ['solid-styled-components'],
  },
  resolve: {
    // we must preserve symlinks for our sym-linked package to work properly
    preserveSymlinks: true,
  },
});
