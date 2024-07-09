import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const SERVER_ENTRY = 'server-entry';
const BLOCKS_EXPORTS_ENTRY = 'blocks-exports';

/**
 * @typedef {import('vite').Plugin} VitePlugin
 *
 *
 * @returns {VitePlugin}
 */
const typeIndexGenerator = () => ({
  name: 'type-index-generator',
  enforce: 'pre',
  generateBundle(options, bundle) {
    const isESM = options.format === 'es';
    this.emitFile({
      type: 'asset',
      fileName: `index.d.${isESM ? 'mts' : 'cts'}`,
      source: `export * from '../../types/${isESM ? 'esm' : 'cjs'}/index.d.ts';`,
    });
  },
});

export default defineConfig({
  plugins: [viteOutputGenerator(), react(), typeIndexGenerator()],
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: './src/index.ts',
        [SERVER_ENTRY]: './src/server-index.ts',
        [BLOCKS_EXPORTS_ENTRY]: './src/index-helpers/blocks-exports.ts',
        init: './src/functions/evaluate/node-runtime/init.ts',
      },
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'node:module',
        'next/navigation',
        'react',
        'react/jsx-runtime',
        'react-dom',
        'lru-cache',
      ],
      output: {
        minifyInternalExports: false,
        manualChunks(id, { getModuleIds, getModuleInfo }) {
          const moduleInfo = getModuleInfo(id);

          /**
           * We make sure any code used by the server entry is bundled into it,
           * so that it doesn't get marked with `use client`.
           */
          if (
            moduleInfo?.importers.some((x) => x.includes('server-index.ts'))
          ) {
            return SERVER_ENTRY;
          }
        },
        banner(chunk) {
          if (chunk.name === BLOCKS_EXPORTS_ENTRY) {
            return "'use client';";
          }

          return '';
        },
        globals: {
          react: 'react',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
  },
});
