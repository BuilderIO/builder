import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';

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
    plugins: [viteOutputGenerator(), qwikVite()],
  };
});
