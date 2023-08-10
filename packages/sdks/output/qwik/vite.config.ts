import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import {
  getEvaluatorPathAlias,
  getSdkOutputPath,
} from '../../output-generation';

export default defineConfig(() => {
  return {
    resolve: {
      alias: getEvaluatorPathAlias('input'),
    },
    build: {
      outDir: getSdkOutputPath(),
      lib: {
        entry: './src/index.ts',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['@builder.io/qwik', 'js-interpreter', 'isolated-vm'],
      },
    },
    plugins: [qwikVite()],
  };
});
