import { componentToReactNative, parseJsx } from '@jsx-lite/core';
import * as esbuild from 'esbuild';
import * as glob from 'fast-glob';
import { outputFile, readFile } from 'fs-extra';

const cwd = process.cwd();
const DIST_DIR = `${cwd}/dist`;
const TARGETS = ['react-native', 'vue', 'react'];

export async function build() {
  const jsFiles = await buildTsFiles();
  const tsLiteFiles = await glob(`${cwd}/src/**/*.lite.tsx`);

  await Promise.all(
    TARGETS.map(async target => {
      await outputTsFiles(target, jsFiles);
    })
  );
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
