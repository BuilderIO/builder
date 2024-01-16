import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const SERVER_ENTRY = 'server-entry';

export default defineConfig({
  plugins: [viteOutputGenerator({ pointTo: 'input' }), react()],
  build: {
    // This is to allow Webpack 4 to consume the output.
    target: 'es2019',
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
      external: ['react', 'react/jsx-runtime', 'react-dom', 'node:module'],
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
