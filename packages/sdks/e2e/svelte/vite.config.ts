import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      // this seems to be needed for the SDK's CSS to be passed down properly
      // not actually sure what this flag does internally.
      emitCss: false,
    }),
  ],
});
