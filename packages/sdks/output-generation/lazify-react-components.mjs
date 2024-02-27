import recast from 'recast';
import typescriptParser from 'recast/parsers/typescript.js';
import { getSdkEnv } from './index.js';

/**
 *
 * @param {string} code
 * @returns
 */
const parse = (code) => recast.parse(code, { parser: typescriptParser });

/**
 * Ran into issues with Suspense transitions when trying to lazy-load all of
 * our blocks.
 * The issue was probably caused by the SDK swapping out components altogether,
 * which didn't play nice with Suspense boundaries.
 *
 * For now, we only lazy load Content, which is what's needed to avoid downloading
 * the edge eval runtime in the browser.
 */
const LAZY_COMPONENTS = ['Content', 'ContentVariants'];

/**
 *
 * @param {string[]} importNames
 * @param {import('rollup').PluginContext['emitFile']} emitFile
 */
const emitDynamicExports = (importNames, emitFile) => {
  const getComponent = (name) =>
    LAZY_COMPONENTS.includes(name)
      ? `(props) => 
        isBrowser() 
          ? React.createElement(BrowserSdk.${name}, Object.assign({}, props)) 
          : React.createElement(EdgeSdk.${name}, Object.assign({}, props))`
      : `EdgeSdk.${name}`;

  const TOP_OF_FILE_MJS = `
'use client';
import React from 'react';

function isBrowser() {
return typeof window !== 'undefined' && typeof document !== 'undefined';
}

import * as BrowserSdk from '../browser/index.mjs';
import * as EdgeSdk from './index.mjs';

${importNames
  .map((name) => `export const ${name} = ${getComponent(name)}`)
  .join(';\n')}
`;

  emitFile({
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
const EdgeSdk = require('./index.cjs');

module.exports = {
${importNames.map((name) => `${name}: ${getComponent(name)}`).join(',\n')}
};
`;

  emitFile({
    type: 'prebuilt-chunk',
    code: TOP_OF_FILE_CJS,
    fileName: 'dynamic-blocks-exports.cjs',
  });
};

/**
 *
 * - Wraps components in a `React.lazy` import
 * - For the Edge bundle, it emits a file that re-exports certain components
 * by wrapping them in logic that toggles between the browser & edge versions.
 *
 * Currently only used for the `Content` component.
 *
 * @typedef {import('vite').Plugin} Plugin
 * @returns {Plugin}
 */
export const lazyifyReactComponentsVitePlugin = () => {
  return {
    name: 'lazify-react-components',
    transform(src, id) {
      if (getSdkEnv() !== 'edge') return src;

      if (id.includes('blocks-exports.ts')) {
        const ast = parse(src);

        /**
         * Collect all the export names from the file
         */
        let importNames = [];
        recast.visit(ast, {
          visitExportNamedDeclaration(path) {
            const importName = path.node.specifiers?.[0]?.exported.name;
            const importPath = path.node.source?.value;

            if (!importName || !importPath) return false;

            importNames.push(importName);
            return false;
          },
        });

        /**
         * Emit a file that re-exports all of the above components by wrapping
         * some of them in `lazy` logic.
         */
        emitDynamicExports(importNames, this.emitFile);

        return src;
      }

      const isComponentIndexFile =
        id.includes('index.ts') &&
        (id.includes('src/blocks/') || id.includes('src/components/')) &&
        LAZY_COMPONENTS.some((comp) => id.includes(comp));

      if (isComponentIndexFile) {
        const ast = parse(src);

        let newContent = '';

        recast.visit(ast, {
          visitExportNamedDeclaration(path) {
            const importPath = path.node.source?.value;

            if (!importPath) return false;

            let compName = importPath.split('/').pop().split('.')[0];
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
