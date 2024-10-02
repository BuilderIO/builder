import { viteOutputGenerator } from '@builder.io/sdks/output-generation/index.js';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { defineConfig, Plugin } from 'vite';

const SERVER_ENTRY = 'server-entry';
const BLOCKS_EXPORTS_ENTRY = 'blocks-exports';

const typeIndexGenerator = (): Plugin => ({
  name: 'type-index-generator',
  enforce: 'pre',
  generateBundle(options, bundle) {
    const isESM = options.format === 'es';
    this.emitFile({
      type: 'asset',
      fileName: `index.d.${isESM ? 'mts' : 'cts'}`,
      source: `export * from '../../types/${isESM ? 'esm' : 'cjs'}/index.d.ts';`,
    });
  },
});

export default defineConfig({
  plugins: [viteOutputGenerator(), react(), typeIndexGenerator()],
  build: {
    // emptyOutDir: true,
    target: 'es2019',
    lib: {
      entry: {
        index: './src/index.ts',
        [SERVER_ENTRY]: './src/server-index.ts',
        [BLOCKS_EXPORTS_ENTRY]: './src/index-helpers/blocks-exports.ts',
        init: './src/functions/evaluate/node-runtime/init.ts',
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'node:module',
        'isolated-vm',
        'next/navigation',
      ],
      output: {
        globals: {
          react: 'react',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
        preserveModules: true,
        minifyInternalExports: false,
        /**
         * preserve directives from the original file
         */
        banner(chunk) {
          const filePath = chunk.facadeModuleId;
          if (chunk.importedBindings?.['react']?.includes('createContext')) {
            return "'use client';\n";
          } else if (filePath) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const DIRECTIVES = [
              "'use client'",
              '"use client"',
              '"use server"',
              "'use server'",
            ];
            const directive = DIRECTIVES.find((directive) =>
              content.startsWith(directive)
            );
            if (directive) {
              return directive + '\n';
            }
          }
          return '';
        },
      },
    },
  },
});
