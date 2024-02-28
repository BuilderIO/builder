import {
  getSdkEnv,
  viteOutputGenerator,
} from '@builder.io/sdks/output-generation/index.js';
import react from '@vitejs/plugin-react';
import * as esbuild from 'esbuild';
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
            ? `(props) => isBrowser() 
                ? <BrowserSdk.${name} {...props} /> 
                : <${getEdgeComponentName(name)} {...props} />`
            : getEdgeComponentName(name);

        const exportsObject = importNames
          .map((name) => `${name} as ${getEdgeComponentName(name)}`)
          .join(',\n');

        /**
         * Client-code entry point with lazy-loaded components
         */
        const dynamicBlocksExportsCode = `
      "use client";
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

        const DYNAMIC_EXPORTS_FILE_NAME = 'dynamic-blocks-exports';
        const EDGE_ENTRY = 'edge-entry';

        /**
         * Edge-code entry point with re-exported components.
         */
        const edgeEntryCode = `
      export * from './${SERVER_ENTRY}.mjs';
      export * from './${DYNAMIC_EXPORTS_FILE_NAME}.mjs';
`;

        const viteContext = this;
        const emitJsFile = ({
          code,
          fileName,
          format,
        }: {
          code: string;
          fileName: string;
          format: 'esm' | 'cjs';
        }) => {
          viteContext.emitFile({
            type: 'prebuilt-chunk',
            code: esbuild.transformSync(
              format === 'esm' ? code : code.replace(/\.mjs/g, '.cjs'),
              {
                format,
                loader: 'tsx',
                target: 'es2019',
              }
            ).code,
            fileName: `${fileName}.${format === 'esm' ? 'mjs' : 'cjs'}`,
          });
        };

        emitJsFile({
          code: dynamicBlocksExportsCode,
          fileName: DYNAMIC_EXPORTS_FILE_NAME,
          format: 'esm',
        });

        emitJsFile({
          code: edgeEntryCode,
          format: 'esm',
          fileName: EDGE_ENTRY,
        });

        emitJsFile({
          code: dynamicBlocksExportsCode,
          format: 'cjs',
          fileName: DYNAMIC_EXPORTS_FILE_NAME,
        });

        emitJsFile({
          code: edgeEntryCode,
          fileName: EDGE_ENTRY,
          format: 'cjs',
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
        minifyInternalExports: false,
        manualChunks(id, { getModuleIds, getModuleInfo }) {
          const moduleInfo = getModuleInfo(id);

          /**
           * We make sure any code used by the server entry is bundled into it,
           * so that it doesn't get marked with `use client`.
           */
          if (
            moduleInfo?.importers.some((x) => x.includes('server-index.ts'))
          ) {
            return SERVER_ENTRY;
          }
        },
        banner(chunk) {
          if (chunk.name === BLOCKS_EXPORTS_ENTRY) {
            return "'use client';";
          }

          return '';
        },
      },
    },
  },
});
