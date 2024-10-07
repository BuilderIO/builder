import { qwikVite } from '@builder.io/qwik/optimizer';
import {
  getSdkEnv,
  viteOutputGenerator,
} from '@builder.io/sdks/output-generation/index.js';
import { defineConfig } from 'vite';

const SDK_ENV = getSdkEnv();

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        formats: ['es', 'cjs'],
        /**
         * https://github.com/BuilderIO/qwik/issues/4952
         */
        fileName: (format, entryName) =>
          `${entryName}.qwik.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['@builder.io/qwik', 'node:module', 'isolated-vm'],
        input: [
          './src/index.ts',
          SDK_ENV === 'node'
            ? './src/functions/evaluate/node-runtime/init.ts'
            : undefined,
        ].filter(Boolean),
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
      },
    },
    plugins: [viteOutputGenerator(), qwikVite()],
  };
});
