import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['isolated-vm'],
  },
  resolve: {
    // we must preserve symlinks for our sym-linked package to work properly
    preserveSymlinks: true,
  },
});
