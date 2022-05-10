import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  publicDir: false,
  build: {
    outDir: 'pkg-dist',
    lib: {
      entry: 'src/index.js',
      formats: ['es', 'cjs'],
      fileName: (format) => `sdk-solid.${format}.js`,
    },
    // rollupOptions: {
    //   external: ['solid-styled-components'],
    // }
  },
});
