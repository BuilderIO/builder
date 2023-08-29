import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';

const USE_CLIENT_BUNDLE_NAME = 'USE_CLIENT_BUNDLE';
const USE_SERVER_BUNDLE_NAME = 'USE_SERVER_BUNDLE';

export default defineConfig({
  plugins: [viteOutputGenerator(), react()],
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
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
            code.includes('createContext')
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
