import babel from '@babel/core';
import generate from '@babel/generator';
import tsPlugin from '@babel/plugin-syntax-typescript';
import tsPreset from '@babel/preset-typescript';
import t from '@babel/types';
import fs from 'fs';
import glob from 'glob';

/**
 * - run after mitosis build, before sdk builds
 * - make sdk build depend on this
 * = this depends on mitosis build
 *
 * - add watch cmd that combines sdkbuild and this
 */

/**
 * @typedef {import('@babel/core').PluginObj} babel.PluginObj
 * @typedef {babel.PluginObj} InlinePlugin
 */

const buildInlineFns = async () => {
  console.log('Building inline functions...');

  const inlineFnsFile = glob.glob('src/**/*/inlined-fns.*', { sync: true })[0];

  if (!inlineFnsFile) {
    throw new Error('No inline functions file found.');
  }

  /**
   *
   * @param {babel.NodePath<babel.types.MemberExpression>} path
   */
  const checkIsToStringExport = (path) => {
    const prop = path.node?.property;
    if (!t.isExpression(prop)) return false;
    if (prop.name !== 'toString') return false;

    // make sure we dont modify any other `toString()` calls
    if (!path.findParent((p) => p.isExportNamedDeclaration())) return false;

    return true;
  };

  const newFile = babel.transformFileSync(inlineFnsFile, {
    plugins: [
      [tsPlugin, { isTSX: true }],
      /** @returns {InlinePlugin} */
      () => ({
        visitor: {
          MemberExpression(path, _context) {
            if (!checkIsToStringExport(path)) return;

            const nameOfFn = path.node.object.name;

            const program = path.findParent((p) => p.isProgram());

            /**
             * @type {babel.NodePath<babel.types.FunctionDeclaration> | null}
             */
            let fnNode = null;

            program.traverse({
              FunctionDeclaration(path) {
                if (nameOfFn !== path.node.id.name) return;

                fnNode = path;
              },
            });

            if (!fnNode) throw new Error('No function node found.');

            const generated = generate.default(fnNode.path).code;
            const stringifiedNode = babel.transformSync(generated, {
              filename: 'generated.js',
              configFile: false,
              babelrc: false,
              comments: false,
              presets: [[tsPreset, { isTSX: true, allExtensions: true }]],
            }).code;

            const parentToReplace = path.findParent((p) =>
              t.isVariableDeclarator(p.parent)
            );

            parentToReplace.replaceWith(t.stringLiteral(stringifiedNode));

            /**
             * @type {babel.NodePath<babel.types.FunctionDeclaration>}
             */
            const k = fnNode;
            k.remove();
          },
        },
      }),
    ],
  });

  fs.writeFileSync('src/inlined-fns.ts', newFile.code);
};

buildInlineFns();
