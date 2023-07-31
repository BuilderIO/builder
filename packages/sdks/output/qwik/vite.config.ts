import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

export default defineConfig(() => {
  return {
    build: {
      target: 'es2020',
      lib: {
        entry: './src/index.ts',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.qwik.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      minify: false,
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ['@builder.io/qwik', 'js-interpreter'],
      },
    },
    plugins: [qwikVite()],
  };
});
