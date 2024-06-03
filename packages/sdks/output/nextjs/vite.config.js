import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const USE_CLIENT_BUNDLE_NAME = 'USE_CLIENT_BUNDLE';
const USE_SERVER_BUNDLE_NAME = 'USE_SERVER_BUNDLE';

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
      entry: './src/index.ts',
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
        manualChunks(id, { getModuleInfo }) {
          const code = getModuleInfo(id).code;
          if (
            code.match(/^['"]use client['"]/) ||
            // context file has to be in the client bundle due to `createContext` not working in RSCs.
            id.endsWith('context.ts')
          ) {
            return USE_CLIENT_BUNDLE_NAME;
          } else if (code.match(/^['"]use server['"]/)) {
            return USE_SERVER_BUNDLE_NAME;
          } else {
            return 'bundle';
          }
        },
        banner(chunk) {
          if (chunk.name === USE_CLIENT_BUNDLE_NAME) {
            return "'use client';";
          } else if (chunk.name === USE_SERVER_BUNDLE_NAME) {
            return "'use server';";
          }
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
