import recast from 'recast';
import typescriptParser from 'recast/parsers/typescript.js';

/**
 *
 * @param {string} code
 * @returns
 */
const parse = (code) => recast.parse(code, { parser: typescriptParser });

/**
 * @typedef {import('vite').Plugin} Plugin
 * @type {Plugin}
 */
export const lazyifyReactComponentsVitePlugin = () => {
  return {
    name: 'lazify-components',

    transform(src, id) {
      const hasBlockImportOrExport =
        id.includes('blocks-exports.ts') ||
        id.includes('builder-registered-components.ts') ||
        id.includes('extra-components.ts');

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

        return lazyfiedCode;
      }

      return src;
    },
  };
};
