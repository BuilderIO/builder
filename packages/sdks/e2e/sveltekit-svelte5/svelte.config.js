import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * A Svelte 5 app the way teams set them up today: runes forced for every component (including
 * dependencies) and async mode on. The Svelte 4 SDK does not compile under `runes: true`.
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true,
    experimental: {
      async: true,
    },
  },
  kit: {
    adapter: adapter(),
  },
};

export default config;
