import babel from '@babel/core';
import tsPlugin from '@babel/plugin-syntax-typescript';
import { execSync } from 'child_process';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import prettier from 'prettier';

/**
 * @typedef {import('@babel/core').PluginObj} babel.PluginObj
 * @typedef {babel.PluginObj} InlinePlugin
 */

const sdkEnv = process.env.SDK_ENV;

if (!sdkEnv) {
  throw new Error('SDK_ENV is required to build the SDK.');
}

const ngPackageJsonPath = path.resolve('ng-package.json');
const ngPackageJson = JSON.parse(fs.readFileSync(ngPackageJsonPath, 'utf-8'));

const outputPath = {
  node: './lib/node',
  browser: './lib/browser',
}[sdkEnv];

if (!outputPath) {
  throw new Error(
    `Unknown SDK_ENV: ${sdkEnv}. Expected one of 'node', 'browser'.`
  );
}

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

const getFolderName = () => {
  return sdkEnv === 'node' ? 'node-runtime' : 'browser-runtime';
};

// Helper function to transform the file
const transformFile = (filePath, replaceValue, revert = false) => {
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
              }
            },
          },
        };
      },
    ],
  });

  fs.writeFileSync(filePath, result.code, 'utf-8');
};

// Transform the choose-eval.ts file to replace 'placeholder-runtime'
// to appropriate runtime value based on the SDK_ENV
const folderName = `./${getFolderName()}/index`;
transformFile(chooseEvalFile, folderName);

// Run the Angular build command
execSync(`ng build --project sdk-angular`, { stdio: 'inherit' });

// Remove any `package.json` generated inside the `lib/*` folder
const packageJsonPath = path.resolve(outputPath, 'package.json');

if (fs.existsSync(packageJsonPath)) {
  fs.unlinkSync(packageJsonPath);
}

// Revert the choose-eval.ts file to its original state i.e, "placeholder-runtime"
transformFile(chooseEvalFile, folderName, true);
