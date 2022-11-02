import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      // this seems to be needed for the SDK's CSS to be passed down properly
      // not actually sure what this flag does internally.
      emitCss: false
    })
  ],
  server: {
    port: 3000
  }
});
