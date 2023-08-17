import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { outputGenerator } from '../../output-generation';

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        formats: ['es', 'cjs'],
        /**
         * https://github.com/BuilderIO/qwik/issues/4952
         */
        fileName: (format) => `index.qwik.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['@builder.io/qwik', 'js-interpreter', 'isolated-vm'],
      },
    },
    plugins: [outputGenerator(), qwikVite()],
  };
});
