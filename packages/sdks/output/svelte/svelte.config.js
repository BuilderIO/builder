import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { getEvaluatorPathAlias } from '@builder.io/sdks/output-generation/index.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    alias: getEvaluatorPathAlias({
      pointTo: 'output',
      format: 'js',
    }),
  },
};

export default config;
