import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
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
    vue(),
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
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'js-interpreter', 'isolated-vm'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
