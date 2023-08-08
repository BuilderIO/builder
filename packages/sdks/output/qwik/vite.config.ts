import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';

type SdkEnv = 'node' | 'edge' | 'browser';

const getEvaluatorPath = (sdkEnv: SdkEnv) => {
  switch (sdkEnv) {
    case 'node':
      return './node-runtime/index.ts';
    case 'edge':
      return './non-node-runtime/index.ts';
    case 'browser':
      return './browser-runtime/index.ts';
  }
};

export default defineConfig((a) => {
  return {
    resolve: {
      alias: {
        '#code-evaluator': getEvaluatorPath(process.env.SDK_ENV as SdkEnv),
      },
    },
    build: {
      outDir: ['lib', process.env.SDK_ENV].join('/'),
      lib: {
        entry: './src/index.ts',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      rollupOptions: {
        external: ['@builder.io/qwik', 'js-interpreter', 'isolated-vm'],
      },
    },
    plugins: [qwikVite()],
  };
});
