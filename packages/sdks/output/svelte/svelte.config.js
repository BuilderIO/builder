import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { getEvaluatorPathAlias } from '../../output-generation/index.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    alias: getEvaluatorPathAlias('output'),
  },
};

export default config;
