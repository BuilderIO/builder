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

const SDK_ENV = getSdkEnv();

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

        if (SDK_ENV === 'node') {
          copyFileSync(
            outPath + '/functions/evaluate/node-runtime/init.d.ts',
            outPath + '/init.d.mts'
          );
          copyFileSync(
            outPath + '/functions/evaluate/node-runtime/init.d.ts',
            outPath + '/init.d.cts'
          );
        }
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        ...(SDK_ENV === 'node'
          ? {
              init: resolve(
                __dirname,
                'src/functions/evaluate/node-runtime/init.ts'
              ),
              'check-os': resolve(
                __dirname,
                'src/functions/evaluate/node-runtime/check-os.ts'
              ),
            }
          : {}),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'node:module', 'isolated-vm', 'os', 'fs'],
      output: {
        globals: {
          vue: 'Vue',
        },

        /**
         * Adding CSS imports to server bundles breaks Nuxt, since `.css` is an invalid extension.
         * Instead, users should manually import the CSS file for SSR builds.
         */
        banner: SDK_ENV === 'browser' ? 'import "./style.css";' : undefined,
      },
    },
  },
});
