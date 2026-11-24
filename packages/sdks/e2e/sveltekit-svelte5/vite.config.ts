import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

/**
 * Newer SvelteKit names client chunks by hash only. The dynamic-loading e2e tests find the lazily
 * loaded component's chunk by name (`LazyComponent.[hash].js`), as older SvelteKit emitted it.
 */
const namedChunks = (): Plugin => ({
  name: 'e2e-named-chunks',
  apply: 'build',
  outputOptions(options) {
    if (typeof options.chunkFileNames !== 'string' || !options.chunkFileNames.includes('immutable'))
      return null;
    return {
      ...options,
      chunkFileNames: options.chunkFileNames.replace('[hash]', '[name].[hash]'),
    };
  },
});

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    fs: {
      strict: false,
    },
  },
  plugins: [sveltekit(), namedChunks()],
});
