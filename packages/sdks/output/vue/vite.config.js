import {
  getSdkEnv,
  getSdkOutputPath,
  viteOutputGenerator,
} from '@builder.io/sdks/output-generation/index.js';
import vue from '@vitejs/plugin-vue';
import { copyFileSync, renameSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteOutputGenerator(),
    vue(),
    dts({
      afterBuild: () => {
        const outPath = getSdkOutputPath();
        copyFileSync(outPath + '/index.d.ts', outPath + '/index.d.mts');
        renameSync(outPath + '/index.d.ts', outPath + '/index.d.cts');
      },
    }),
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

        /**
         * Adding CSS imports to server bundles breaks Nuxt, since `.css` is an invalid extension.
         * Instead, users should manually import the CSS file for SSR builds.
         */
        banner: getSdkEnv() === 'browser' ? 'import "./style.css";' : undefined,
      },
    },
  },
});
