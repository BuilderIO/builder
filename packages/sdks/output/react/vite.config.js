import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';

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
      external: ['isolated-vm', 'react', 'react/jsx-runtime', 'react-dom'],
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
