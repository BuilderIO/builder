import { getEvaluatorPathAlias } from '@builder.io/sdks/output-generation/index.js';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // The whole SDK is runes: it compiles the same whether the app forces runes mode or not.
    runes: true,
  },
  kit: {
    alias: getEvaluatorPathAlias({
      pointTo: 'output',
      format: 'js',
    }),
  },
};

export default config;
