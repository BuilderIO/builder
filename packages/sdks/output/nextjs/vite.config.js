import react from '@vitejs/plugin-react/dist/index.mjs';
import { defineConfig } from 'vite/dist/node/index.js';
import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';

const USE_CLIENT_BUNDLE_NAME = 'USE_CLIENT_BUNDLE';
const USE_SERVER_BUNDLE_NAME = 'USE_SERVER_BUNDLE';

/**
 * @typedef {import('vite').Plugin} VitePlugin
 *
 *
 * @returns {VitePlugin}
 */
const typeIndexGenerator = () => ({
  name: 'type-index-generator',
  enforce: 'pre',
  generateBundle(options, bundle) {
    const isESM = options.format === 'es';
    this.emitFile({
      type: 'asset',
      fileName: `index.d.${isESM ? 'mts' : 'cts'}`,
      source: `export * from '../../types/index-${
        isESM ? 'esm' : 'cjs'
      }.d.ts';`,
    });
  },
});

export default defineConfig({
  plugins: [
    viteOutputGenerator(),
    react(),
    typeIndexGenerator(),
    // dts({
    //   compilerOptions: {
    //     paths: getEvaluatorPathAlias(),
    //     outFile: 'index.d.ts',
    //     outDir: getSdkOutputPath(),
    //     module: 'commonjs',
    //   },
    //   afterBuild: () => {
    //     const dir = getSdkOutputPath();
    //     /**
    //      * https://github.com/qmhc/vite-plugin-dts/issues/267#issuecomment-1786996676
    //      */
    //     // renameSync(`${dir}/index.d.ts`, `${dir}/index.d.cts`);
    //   },
    //   copyDtsFiles: true,
    // }),
    // dts({
    //   compilerOptions: {
    //     paths: getEvaluatorPathAlias(),
    //     outDir: getSdkOutputPath(),
    //   },
    //   afterBuild: () => {
    //     const dir = getSdkOutputPath();
    //     /**
    //      * https://github.com/qmhc/vite-plugin-dts/issues/267#issuecomment-1786996676
    //      */
    //     renameSync(`${dir}/index.d.ts`, `${dir}/index.d.mts`);
    //   },
    //   copyDtsFiles: true,
    // }),
  ],
  build: {
    emptyOutDir: true,
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'next/navigation',
        'react',
        'react/jsx-runtime',
        'react-dom',
        'lru-cache',
      ],
      output: {
        manualChunks(id, { getModuleInfo }) {
          const code = getModuleInfo(id).code;
          if (
            code.match(/^['"]use client['"]/) ||
            // context file has to be in the client bundle due to `createContext` not working in RSCs.
            id.endsWith('context.ts')
          ) {
            return USE_CLIENT_BUNDLE_NAME;
          } else if (code.match(/^['"]use server['"]/)) {
            return USE_SERVER_BUNDLE_NAME;
          } else {
            return 'bundle';
          }
        },
        banner(chunk) {
          if (chunk.name === USE_CLIENT_BUNDLE_NAME) {
            return "'use client';";
          } else if (chunk.name === USE_SERVER_BUNDLE_NAME) {
            return "'use server';";
          }
        },
        globals: {
          react: 'react',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
  },
});
