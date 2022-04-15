import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { esbuildCommonjs, viteCommonjs } from '@originjs/vite-plugin-commonjs';

const CJS_MODULES = ['@builder.io/sdk-svelte'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		},
		vite: {
			plugins: [viteCommonjs()],
			optimizeDeps: {
				esbuildOptions: {
					plugins: [esbuildCommonjs(CJS_MODULES)]
				},
				include: CJS_MODULES
			}
		}
	}
};

export default config;
