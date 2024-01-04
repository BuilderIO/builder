import { qwikVite } from '@builder.io/qwik/optimizer';
import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        formats: ['es', 'cjs'],
        /**
         * https://github.com/BuilderIO/qwik/issues/4952
         */
        fileName: (format) => `index.qwik.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['@builder.io/qwik', 'node:module'],
        output: {
          manualChunks(id, { getModuleIds, getModuleInfo }) {
            const moduleInfo = getModuleInfo(id);

            // We need to move this node-only code to its own file so that `isServer` can tree-shake it.
            if (moduleInfo?.code?.includes('node:module')) {
              return 'node-evaluate';
            }
          },
        },
      },
    },
    plugins: [viteOutputGenerator(), qwikVite()],
  };
});
