import babel from '@babel/core';
import tsPlugin from '@babel/plugin-syntax-typescript';
import {
  getEvaluatorPathAlias,
  getSdkOutputPath,
} from '@builder.io/sdks/output-generation/index.js';
import { execSync } from 'child_process';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import prettier from 'prettier';

/**
 * @typedef {import('@babel/core').PluginObj} babel.PluginObj
 * @typedef {babel.PluginObj} InlinePlugin
 */

const ngPackageJsonPath = path.resolve('ng-package.json');
const ngPackageJson = JSON.parse(fs.readFileSync(ngPackageJsonPath, 'utf-8'));

const outputPath = getSdkOutputPath();

// Set the destination path to the correct output path for specific SDK_ENV
ngPackageJson.dest = outputPath;

fs.writeFileSync(
  ngPackageJsonPath,
  // we needed to prettify the JSON to make sure it matches the linting rules
  await prettier.format(JSON.stringify(ngPackageJson, null, 2), {
    parser: 'json',
  }),
  'utf-8'
);

const foundFiles = glob.sync('src/**/*/choose-eval.*');

if (foundFiles.length !== 1) {
  throw new Error(
    'Expected exactly one file named `choose-eval.ts` containing "placeholder-runtime" import.'
  );
}

const chooseEvalFile = foundFiles[0];

// Helper function to transform the file
const transformFile = (filePath, replaceValue, revert = false) => {
  let hasReplacedImport = false;
  const result = babel.transformFileSync(filePath, {
    plugins: [
      tsPlugin,
      /** @returns {InlinePlugin} */
      () => {
        return {
          visitor: {
            ImportDeclaration(path) {
              const currentValue = revert
                ? replaceValue
                : 'placeholder-runtime';
              const newValue = revert ? 'placeholder-runtime' : replaceValue;
              if (path.node.source.value === currentValue) {
                path.node.source.value = newValue;
                hasReplacedImport = true;
              }
            },
            /**
             * When building EDGE bundle, force choose-eval to always use the edge evaluator
             * and skip any browser fallback logic.
             * 
             * converts chooseBrowserOrServerEval = (args) => evaluator(args)
             */
            ExportNamedDeclaration(path) {
              if (process.env.SDK_ENV !== 'edge' || revert) return;
              const decl = path.node.declaration;
              if (!decl || decl.type !== 'VariableDeclaration') return;
              const first = decl.declarations && decl.declarations[0];
              if (!first || first.type !== 'VariableDeclarator') return;
              if (first.id.type !== 'Identifier') return;
              if (first.id.name !== 'chooseBrowserOrServerEval') return;

              // Replace the entire initializer with a simple arrow function
              first.init = babel.types.arrowFunctionExpression(
                [babel.types.identifier('args')],
                babel.types.callExpression(
                  babel.types.identifier('evaluator'),
                  [babel.types.identifier('args')]
                )
              );
            },
          },
        };
      },
    ],
  });

  if (!hasReplacedImport) {
    throw new Error(
      `Expected to replace import with value ${replaceValue} in ${filePath} but no such import found.`
    );
  }

  fs.writeFileSync(filePath, result.code, 'utf-8');
};

// Transform the choose-eval.ts file to replace 'placeholder-runtime'
// to appropriate runtime value based on the SDK_ENV
const alias = getEvaluatorPathAlias();
const folderName = alias['placeholder-runtime'];
transformFile(chooseEvalFile, folderName);

let caughtError = undefined;
try {
  // Run the Angular build command
  execSync(`ng build --project sdk-angular`, { stdio: 'inherit' });

  // Remove any `package.json` generated inside the `lib/*` folder
  const packageJsonPath = path.resolve(outputPath, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    fs.unlinkSync(packageJsonPath);
  }
} catch (error) {
  caughtError = error;
} finally {
  // Revert the choose-eval.ts file to its original state i.e, "placeholder-runtime"
  transformFile(chooseEvalFile, folderName, true);
}

if (caughtError) {
  throw caughtError;
}
