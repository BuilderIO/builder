import {
  componentToReact,
  componentToReactNative,
  componentToVue,
  JSXLiteComponent,
  parseJsx,
} from '@jsx-lite/core';
import * as esbuild from 'esbuild';
import * as glob from 'fast-glob';
import { outputFile, readFile } from 'fs-extra';

const cwd = process.cwd();
const DIST_DIR = `${cwd}/dist`;
const TARGETS = ['react-native', 'vue', 'react'];

export async function build() {
  const jsFiles = await buildTsFiles();
  const tsLiteFiles = await Promise.all(
    (await glob(`${cwd}/src/**/*.lite.tsx`)).map(async path => ({
      path,
      jsxLiteJson: parseJsx(await readFile(path, 'utf8')),
    }))
  );

  await Promise.all(
    TARGETS.map(async target => {
      await Promise.all([outputTsFiles(target, jsFiles), outputTsxLiteFiles(target, tsLiteFiles)]);
    })
  );
}

async function outputTsxLiteFiles(
  target: string,
  files: { path: string; jsxLiteJson: JSXLiteComponent }[]
) {
  const output = files.map(({ path, jsxLiteJson }) => {
    const transpiled =
      target === 'react-native'
        ? componentToReactNative(jsxLiteJson)
        : target === 'vue'
        ? componentToVue(jsxLiteJson)
        : target === 'react'
        ? componentToReact(jsxLiteJson)
        : componentToReact(jsxLiteJson);

    return outputFile(`${DIST_DIR}/${target}/${path.replace(/\.tsx?$/, '.js')}`, transpiled);
  });
  await Promise.all(output);
}

async function outputTsFiles(
  target: string,
  files: { path: string; output: esbuild.TransformResult }[]
) {
  const output = files.map(({ path, output }) => {
    const { code } = output;
    return outputFile(`${DIST_DIR}/${target}/${path.replace(/\.tsx?$/, '.js')}`, code);
  });
  await Promise.all(output);
}

async function buildTsFiles() {
  const tsFiles = await glob(`src/**/*.ts`, {
    cwd: cwd,
  });

  return await Promise.all(
    tsFiles
      .map(async path => {
        try {
          const output = await esbuild.transform(await readFile(path, 'utf8'), {
            format: 'esm',
            loader: 'tsx',
          });

          if (output.warnings.length) {
            console.warn(`Warnings found in file: ${path}`, output.warnings);
          }
          return {
            path,
            output,
          };
        } catch (e) {
          console.error(`Error found in file: ${path}`, e);
        }
      })
      .filter(Boolean)
  );
}

if (require.main === module) {
  build().catch(console.error);
}
