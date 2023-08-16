import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';
import dts from 'vite-plugin-dts';
import {
  getEvaluatorPathAlias,
  getSdkOutputPath,
} from '@builder.io/sdks/output-generation';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: getEvaluatorPathAlias('input'),
  },
  plugins: [
    vue2(),
    dts({ insertTypesEntry: true }),
    // https://stackoverflow.com/a/72572426
    // libCss(),
  ],
  build: {
    outDir: getSdkOutputPath(),
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'sdk',
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
