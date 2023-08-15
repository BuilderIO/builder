import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import {
  getEvaluatorPathAlias,
  getSdkOutputPath,
} from '../../output-generation';

const SERVER_ENTRY = 'server-entry';

export default defineConfig({
  resolve: {
    alias: getEvaluatorPathAlias('input'),
  },
  plugins: [react()],
  build: {
    outDir: getSdkOutputPath(),
    lib: {
      entry: {
        index: './src/index.ts',
        [SERVER_ENTRY]: './src/functions/get-content/index.ts',
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
        manualChunks(id) {
          if (id.includes('get-content')) {
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
