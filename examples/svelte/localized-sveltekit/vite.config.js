import { sveltekit } from '@sveltejs/kit/vite';

const config = {
	plugins: [sveltekit()],
	optimizeDeps: {
		/**
		 * `isolated-vm` is an SDK dependency that must be excluded from the
		 * pre-bundling optimization because it cannot (and shouldn't) be bundled at all.
		 */
		exclude: ['isolated-vm']
	}
};

export default config;
