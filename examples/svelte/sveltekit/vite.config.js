import { sveltekit } from '@sveltejs/kit/vite';

/**
 * @type {import('vite').UserConfig}
 */
const config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		// `isolated-vm` must be excluded from the pre-bundling optimization because
		// it cannot (and shouldn't) be bundled at all.
		exclude: ['isolated-vm']
	}
};

export default config;
