import {
  getSdkEnv,
  viteOutputGenerator,
} from '@builder.io/sdks/output-generation/index.js';
import react from '@vitejs/plugin-react';
import recast from 'recast';
import typescriptParser from 'recast/parsers/typescript.js';
import { defineConfig } from 'vite';

const SERVER_ENTRY = 'server-entry';
const BLOCKS_EXPORTS_ENTRY = 'blocks-exports';

const parse = (code: string) =>
  recast.parse(code, { parser: typescriptParser });

/**
 * Ran into issues with Suspense transitions when trying to lazy-load all of
 * our blocks.
 * The issue was probably caused by the SDK swapping out components altogether,
 * which didn't play nice with Suspense boundaries.
 *
 * For now, we only lazy load Content, which is what's needed to avoid downloading
 * the edge eval runtime in the browser.
 */
const LAZY_COMPONENTS = ['Content', 'ContentVariants', 'Blocks'];

/**
 *
 * - Wraps components in a `React.lazy` import
 * - For the Edge bundle, it emits a file that re-exports certain components
 * by wrapping them in logic that toggles between the browser & edge versions.
 *
 * Currently only used for the `Content` and `Blocks` components.
 */
export const lazyifyReactComponentsVitePlugin = (): import('vite').Plugin => {
  return {
    name: 'lazify-react-components',
    transform(src, id) {
      if (getSdkEnv() !== 'edge') return src;

      if (id.includes('blocks-exports.ts')) {
        const ast = parse(src);

        /**
         * Collect all the export names from the file
         */
        let importNames: string[] = [];
        recast.visit(ast, {
          visitExportNamedDeclaration(path) {
            const importName = path.node.specifiers?.[0]?.exported.name;
            const importPath = path.node.source?.value;

            if (!importName || !importPath || typeof importName !== 'string')
              return false;

            importNames.push(importName);
            return false;
          },
        });

        /**
         * Emit a file that re-exports all of the above components by wrapping
         * some of them in `lazy` logic.
         */

        const getEdgeComponentName = (name) => `EdgeSdk${name}`;

        const getComponent = (name) =>
          LAZY_COMPONENTS.includes(name)
            ? `(props) => 
              isBrowser() 
                ? React.createElement(BrowserSdk.${name}, Object.assign({}, props)) 
                : React.createElement(${getEdgeComponentName(
                  name
                )}, Object.assign({}, props))`
            : getEdgeComponentName(name);

        const exportsObject = importNames
          .map((name) => `${name} as ${getEdgeComponentName(name)}`)
          .join(',\n');

        const TOP_OF_FILE_MJS = `
      'use client';
      import React from 'react';
      
      function isBrowser() {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
      }
      
      import * as BrowserSdk from '../browser/index.mjs';
      import {${exportsObject}} from './${BLOCKS_EXPORTS_ENTRY}.mjs';
      
      ${importNames
        .map((name) => `export const ${name} = ${getComponent(name)}`)
        .join(';\n')}
      `;

        this.emitFile({
          type: 'prebuilt-chunk',
          code: TOP_OF_FILE_MJS,
          fileName: 'dynamic-blocks-exports.mjs',
        });

        const TOP_OF_FILE_CJS = `
      'use client';
      import React from 'react';
      
      function isBrowser() {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
      }
      
      const BrowserSdk = require('../browser/index.cjs');
      const {${exportsObject}} = require('./${BLOCKS_EXPORTS_ENTRY}.cjs');
      
      module.exports = {
      ${importNames.map((name) => `${name}: ${getComponent(name)}`).join(',\n')}
      };
      `;

        this.emitFile({
          type: 'prebuilt-chunk',
          code: TOP_OF_FILE_CJS,
          fileName: 'dynamic-blocks-exports.cjs',
        });

        return src;
      }

      const isComponentIndexFile =
        id.includes('index.ts') &&
        (id.includes('src/blocks/') || id.includes('src/components/')) &&
        LAZY_COMPONENTS.some((comp) =>
          id.toLowerCase().includes(comp.toLowerCase())
        );

      if (isComponentIndexFile) {
        const ast = parse(src);

        let newContent = '';

        recast.visit(ast, {
          visitExportNamedDeclaration(path) {
            const importPath = path.node.source?.value;

            if (!importPath || typeof importPath !== 'string') return false;

            let compName = importPath.split('/').pop()?.split('.')[0];

            if (!compName) {
              throw new Error(
                `Could not find component name in path: ${importPath}`
              );
            }

            // kebab-case to PascalCase
            compName = compName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

            newContent = `
            import { lazy } from 'react';
            const ${compName} = lazy(() => import('${importPath}'));
            export default ${compName};`;
            return false;
          },
        });

        return newContent;
      }

      return src;
    },
  };
};

export default defineConfig({
  plugins: [
    viteOutputGenerator({ pointTo: 'input' }),
    react(),
    lazyifyReactComponentsVitePlugin(),
  ],
  build: {
    // This is to allow Webpack 4 to consume the output.
    target: 'es2019',
    lib: {
      entry: {
        index: './src/index.ts',
        [SERVER_ENTRY]: './src/server-index.ts',
        [BLOCKS_EXPORTS_ENTRY]: './src/index-helpers/blocks-exports.ts',
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom', 'node:module'],
      output: {
        globals: {
          react: 'react',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
        manualChunks(id, { getModuleIds, getModuleInfo }) {
          const moduleInfo = getModuleInfo(id);

          if (
            moduleInfo?.importers.some((x) => x.includes('server-index.ts'))
          ) {
            return SERVER_ENTRY;
          }
        },
        banner(chunk) {
          if (chunk.name !== SERVER_ENTRY) {
            return "'use client';";
          }

          return '';
        },
      },
    },
  },
});
