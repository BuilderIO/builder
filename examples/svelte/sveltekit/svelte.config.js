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
		// This vite config is needed to build our Builder Svelte SDK, which is a CJS module at the moment.
		// https://github.com/vitejs/vite/issues/2579#issuecomment-1025058519
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
