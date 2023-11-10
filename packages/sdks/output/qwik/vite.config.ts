import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import tsconfigPaths from 'vite-tsconfig-paths';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig(() => {
  return {
    build: {
      target: 'esnext',
      lib: {
        entry: './src/index.ts',
        formats: ['es' as const],
        fileName: `index.qwik`,
      },
      rollupOptions: {
        external: ['@builder.io/qwik', 'js-interpreter', 'isolated-vm'],
      },
    },
    plugins: [topLevelAwait(), tsconfigPaths(), qwikVite()],
  };
});
