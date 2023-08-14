import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import {
  getEvaluatorPathAlias,
  getSdkOutputPath,
} from '../../output-generation';
import * as packageJson from './package.json';

const USE_CLIENT_BUNDLE_NAME = 'USE_CLIENT_BUNDLE';

export default defineConfig({
  resolve: {
    alias: getEvaluatorPathAlias('input'),
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: getSdkOutputPath(),
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        ...Object.keys(packageJson.peerDependencies).map(
          (key) => new RegExp(`node_modules/${key}`)
        ),
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        manualChunks(id, { getModuleInfo }) {
          if (getModuleInfo(id).code.match(/^['"]use client['"]/)) {
            return USE_CLIENT_BUNDLE_NAME;
          }
        },
        banner(chunk) {
          if (chunk.name === USE_CLIENT_BUNDLE_NAME) {
            return "'use client';";
          }
        },
      },
    },
  },
});
