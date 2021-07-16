import {
  componentToReact,
  componentToReactNative,
  componentToSolid,
  componentToVue,
  JSXLiteComponent,
  parseJsx,
} from '@jsx-lite/core';
import * as glob from 'fast-glob';
import { outputFile, readFile, remove } from 'fs-extra';
import { compileVueFile } from './helpers/compile-vue-file';
import { transpile } from './helpers/transpile';
import * as dedent from 'dedent';
import * as json5 from 'json5';
import { transpileSolidFile } from './helpers/transpile-solid-file';

const cwd = process.cwd();
const DIST_DIR = `${cwd}/output`;
const TARGETS: TARGET[] = ['react-native', 'vue', 'react', 'solid'];
export type TARGET = 'react-native' | 'vue' | 'react' | 'solid' | 'svelte';

export async function build() {
  await clean();

  const tsLiteFiles = await Promise.all(
    (await glob(`src/**/*.lite.tsx`, { cwd })).map(async path => ({
      path,
      jsxLiteJson: parseJsx(await readFile(path, 'utf8'), {
        jsonHookNames: ['registerComponent'],
      }),
    }))
  );

  await Promise.all(
    TARGETS.map(async target => {
      const jsFiles = await buildTsFiles(target);
      await Promise.all([outputTsFiles(target, jsFiles), outputTsxLiteFiles(target, tsLiteFiles)]);
      await outputOverrides(target);
    })
  );
}

async function clean() {
  const files = await glob('output/*/src/**/*');
  await Promise.all(
    files.map(async file => {
      await remove(file);
    })
  );
}

async function outputOverrides(target: TARGET) {
  const files = await glob([`overrides/${target}/**/*`, `!overrides/${target}/node_modules/**/*`]);
  await Promise.all(
    files.map(async file => {
      let contents = await readFile(file, 'utf8');

      const esbuildTranspile = file.match(/\.tsx?$/);
      if (esbuildTranspile) {
        contents = await transpile({ path: file, target });
      }

      await outputFile(
        file.replace('overrides/', `${DIST_DIR}/`).replace(/\.tsx?$/, '.js'),
        contents
      );
    })
  );
}

async function outputTsxLiteFiles(
  target: TARGET,
  files: { path: string; jsxLiteJson: JSXLiteComponent }[]
) {
  const output = files.map(async ({ path, jsxLiteJson }) => {
    let transpiled =
      target === 'react-native'
        ? componentToReactNative(jsxLiteJson, {
            stateType: 'useState',
          })
        : target === 'vue'
        ? componentToVue(jsxLiteJson)
        : target === 'react'
        ? componentToReact(jsxLiteJson)
        : target === 'solid'
        ? componentToSolid(jsxLiteJson)
        : (null as never);

    const original = transpiled;

    const solidTranspile = target === 'solid';
    if (solidTranspile) {
      transpiled = await transpileSolidFile({
        contents: transpiled,
        path,
        jsxLiteComponent: jsxLiteJson,
      });
    }

    const esbuildTranspile = target === 'react-native' || target === 'react';
    if (esbuildTranspile) {
      transpiled = await transpile({ path, content: transpiled, target });
      const registerComponentHook = jsxLiteJson.meta.registerComponent;
      if (registerComponentHook) {
        transpiled = dedent`
          import { registerComponent } from '../functions/register-component';

          ${transpiled}

          registerComponent(${jsxLiteJson.name}, ${json5.stringify(registerComponentHook)});
        
        `;
      }
    }
    const vueCompile = target === 'vue';
    if (vueCompile) {
      const files = await compileVueFile({
        distDir: DIST_DIR,
        contents: transpiled,
        path,
        jsxLiteComponent: jsxLiteJson,
      });
      await Promise.all(files.map(file => outputFile(file.path, file.contents)));
    } else {
      return await Promise.all([
        outputFile(`${DIST_DIR}/${target}/${path.replace(/\.lite\.tsx$/, '.js')}`, transpiled),
        outputFile(`${DIST_DIR}/${target}/${path.replace(/\.original\.jsx$/, '.js')}`, original),
      ]);
    }
  });
  await Promise.all(output);
}

async function outputTsFiles(target: TARGET, files: { path: string; output: string }[]) {
  const output = files.map(({ path, output }) => {
    return outputFile(`${DIST_DIR}/${target}/${path.replace(/\.tsx?$/, '.js')}`, output);
  });
  await Promise.all(output);
}

async function buildTsFiles(target: TARGET) {
  const tsFiles = await glob(`src/**/*.ts`, {
    cwd: cwd,
  });

  return await Promise.all(
    tsFiles.map(async path => {
      const output = await transpile({ path, target });

      return {
        path,
        output,
      };
    })
  );
}

if (require.main === module) {
  build().catch(console.error);
}
