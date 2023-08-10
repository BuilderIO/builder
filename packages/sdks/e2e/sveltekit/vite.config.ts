import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      // allow: ['*'],
      strict: false,
    },
  },
  plugins: [
    // @ts-ignore
    sveltekit({
      // this seems to be needed for the SDK's CSS to be passed down properly
      // not actually sure what this flag does internally.
      emitCss: false,
    }),
  ],
});
