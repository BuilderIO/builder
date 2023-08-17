import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import dts from 'vite-plugin-dts';
import {
  getEvaluatorPathAlias,
  getSdkOutputPath,
} from '../../output-generation';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    solidPlugin(),
    // dts({ insertTypesEntry: true })
  ],
  resolve: {
    alias: getEvaluatorPathAlias('input', 'js'),
  },
  build: {
    outDir: getSdkOutputPath(),
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ['es'],
      fileName: () => 'index.jsx',
    },
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        'solid-styled-components',
        'solid-start',
      ],
    },
  },
});
