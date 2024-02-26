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
 * @typedef {import('vite').Plugin} Plugin
 * @returns {Plugin}
 */
export const lazyifyReactComponentsVitePlugin = () => {
  return {
    name: 'lazify-react-components',
    transform(src, id) {
      const isBlocksExports = id.includes('blocks-exports.ts');
      const hasBlockImportOrExport =
        isBlocksExports ||
        id.includes('builder-registered-components.ts') ||
        id.includes('extra-components.ts');

      let importNames = [];

      if (hasBlockImportOrExport) {
        const ast = parse(src);

        recast.visit(ast, {
          visitExportNamedDeclaration(path) {
            const importName = path.node.specifiers?.[0]?.exported.name;
            const importPath = path.node.source?.value;

            if (!importName || !importPath) {
              return false;
            }

            path.replace(
              parse(
                `export const ${importName} = lazy(() => import('${importPath}'));`
              ).program.body[0]
            );

            importNames.push(importName);
            return false;
          },
          visitImportDeclaration(path) {
            const importName = path.node.specifiers?.[0]?.local?.name;
            const isDefaultImport =
              (path.node.specifiers?.[0].type === 'ImportSpecifier' &&
                path.node.specifiers?.[0]?.imported?.name === 'default') ||
              path.node.specifiers?.[0].type === 'ImportDefaultSpecifier';

            const importPath = path.node.source?.value;

            if (!importName || !importPath || !isDefaultImport) {
              return false;
            }

            path.replace(
              parse(
                `const ${importName} = lazy(() => import('${importPath}'));`
              ).program.body[0]
            );

            return false;
          },
        });

        ast.program.body.unshift(
          parse(`import { lazy } from 'react';`).program.body[0]
        );

        const lazyfiedCode = recast.prettyPrint(ast);

        if (isBlocksExports && getSdkEnv() === 'edge') {
          const TOP_OF_FILE_MJS = `
import React from 'react';

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

import * as BrowserSdk from '../browser/index.mjs';
import * as EdgeSdk from './index.mjs';

${importNames
  .map(
    (name) =>
      `export const ${name} = (props) => isBrowser() ? React.createElement(BrowserSdk.${name}, Object.assign({}, props)) : React.createElement(EdgeSdk.${name}, Object.assign({}, props));`
  )
  .join('\n')}
        `;

          this.emitFile({
            type: 'prebuilt-chunk',
            code: TOP_OF_FILE_MJS,
            fileName: 'dynamic-blocks-exports.mjs',
          });

          const TOP_OF_FILE_CJS = `
import React from 'react';

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

import * as BrowserSdk from '../browser/index.cjs';
import * as EdgeSdk from './index.cjs';

module.exports = {
${importNames
  .map(
    (name) =>
      `${name}: (props) => isBrowser() ? React.createElement(BrowserSdk.${name}, Object.assign({}, props)) : React.createElement(EdgeSdk.${name}, Object.assign({}, props)),`
  )
  .join('\n')}
};
        `;

          this.emitFile({
            type: 'prebuilt-chunk',
            code: TOP_OF_FILE_CJS,
            fileName: 'dynamic-blocks-exports.cjs',
          });
        }
        return lazyfiedCode;
      }

      return src;
    },
  };
};
