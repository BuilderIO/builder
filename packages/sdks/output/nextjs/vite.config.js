import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import {
  getEvaluatorPathAlias,
  getSdkOutputPath,
} from '../../output-generation';

const USE_CLIENT_BUNDLE_NAME = 'USE_CLIENT_BUNDLE';
const USE_SERVER_BUNDLE_NAME = 'USE_SERVER_BUNDLE';

export default defineConfig({
  resolve: {
    alias: getEvaluatorPathAlias('input'),
  },
  plugins: [react()],
  build: {
    outDir: getSdkOutputPath(),
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'isolated-vm',
        'next/navigation',
        'react',
        'react/jsx-runtime',
        'react-dom',
        // 'lru-cache',
      ],
      output: {
        manualChunks(id, { getModuleInfo }) {
          if (getModuleInfo(id).code.match(/^['"]use client['"]/)) {
            return USE_CLIENT_BUNDLE_NAME;
          } else if (getModuleInfo(id).code.match(/^['"]use server['"]/)) {
            return USE_SERVER_BUNDLE_NAME;
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
