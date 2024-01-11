import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';
import vue2 from '@vitejs/plugin-vue2';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteOutputGenerator(),
    vue2(),
    dts({ insertTypesEntry: true }),
    // https://stackoverflow.com/a/72572426
    // libCss(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'node:module'],
      output: {
        globals: {
          vue: 'Vue',
        },
        intro: 'import "./style.css";',
      },
    },
  },
});
