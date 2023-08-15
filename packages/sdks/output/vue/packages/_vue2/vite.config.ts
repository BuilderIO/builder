import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2(),
    dts({ insertTypesEntry: true }),
    // https://stackoverflow.com/a/72572426
    // libCss(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'sdk',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'js-interpreter'],
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
