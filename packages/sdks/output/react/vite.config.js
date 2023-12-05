import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const SERVER_ENTRY = 'server-entry';

export default defineConfig({
  plugins: [viteOutputGenerator({ pointTo: 'input' }), react()],
  build: {
    lib: {
      entry: {
        index: './src/index.ts',
        [SERVER_ENTRY]: './src/server-index.ts',
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom'],
      output: {
        globals: {
          react: 'react',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
        manualChunks(id, { getModuleIds, getModuleInfo }) {
          const moduleInfo = getModuleInfo(id);

          if (moduleInfo.importers.some((x) => x.includes('server-index.ts'))) {
            return SERVER_ENTRY;
          }
          // We move `inlined-fns` to its own file so that Rollup generates the exact same file for all bundles.
          // This is needed to fix hydration mismatches.
          else if (id.includes('inlined-fns')) {
            return 'inlined-fns';
          }
        },
        banner(chunk) {
          if (chunk.name !== SERVER_ENTRY) {
            return "'use client';";
          }
        },
      },
    },
  },
});
