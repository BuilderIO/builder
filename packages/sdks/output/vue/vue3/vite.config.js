import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteOutputGenerator(),
    vue(),
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
      external: ['vue', 'js-interpreter', 'isolated-vm'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
