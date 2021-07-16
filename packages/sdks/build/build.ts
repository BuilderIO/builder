import {
  componentToReact,
  componentToReactNative,
  componentToVue,
  JSXLiteComponent,
  parseJsx,
} from '@jsx-lite/core';
import * as esbuild from 'esbuild';
import * as glob from 'fast-glob';
import { outputFile, readFile, remove } from 'fs-extra';
import * as vueCompilerSfc from '@vue/compiler-sfc';
import * as dedent from 'dedent'

const cwd = process.cwd();
const DIST_DIR = `${cwd}/output`;
const TARGETS: TARGET[] = ['react-native', 'vue', 'react'];
type TARGET = 'react-native' | 'vue' | 'react';

export async function build() {
  await clean();
  const jsFiles = await buildTsFiles();
  const tsLiteFiles = await Promise.all(
    (await glob(`src/**/*.lite.tsx`, { cwd })).map(async path => ({
      path,
      jsxLiteJson: parseJsx(await readFile(path, 'utf8')),
    }))
  );

  await Promise.all(
    TARGETS.map(async target => {
      await Promise.all([outputTsFiles(target, jsFiles), outputTsxLiteFiles(target, tsLiteFiles)]);
      await outputOverrides(target);
    })
  );
}

const transpile = async ({
  path,
  content,
  target,
}: {
  path: string;
  content?: string | null;
  target?: TARGET;
}) => {
  try {
    const output = await esbuild.transform(content ?? (await readFile(path, 'utf8')), {
      format: 'esm',
      loader: 'tsx',
      target: 'es6',
    });

    if (output.warnings.length) {
      console.warn(`Warnings found in file: ${path}`, output.warnings);
    }

    let contents = output.code;

    // esbuild does not add the react-native import, so we need to add it
    if (target === 'react-native') {
      if (!contents.match(/from\s+['"]react['"]/)) {
        contents = `import * as React from 'react';\n${output.code}`;
      }
    }

    // Remove .lite extensions from imports without having to load a slow parser like babel
    // E.g. convert `import { foo } from './block.lite';` -> `import { foo } from './block';`
    contents = contents.replace(/\.lite(['"];)/g, '$1');

    return contents;
  } catch (e) {
    console.error(`Error found in file: ${path}`);
    throw e;
  }
};

async function clean() {
  const files = await glob('output/*/src/**/*');
  await Promise.all(
    files.map(async file => {
      await remove(file);
    })
  );
}

function getSimpleId() {
  return String(Math.random()).split('.')[1].toString(36);
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
        : (null as never);

    const esbuildTranspile = target === 'react-native' || target === 'react';
    if (esbuildTranspile) {
      transpiled = await transpile({ path, content: transpiled, target });
    }
    const vueCompile = target === 'vue';
    if (vueCompile) {
      const rootPath = `${DIST_DIR}/${target}/${path.replace(/\.lite\.tsx$/, '')}`;
      const parsed = vueCompilerSfc.parse(transpiled);
      const id = getSimpleId();

      const compiledTemplate = vueCompilerSfc.compileTemplate({
        filename: path,
        source: parsed.descriptor.template.content,
        id,
      });
      if (compiledTemplate.errors.length) {
        console.warn(`Vue template compiler errors in file ${path}`, compiledTemplate.errors);
        console.warn(transpiled);
      }
      const compiledScript = vueCompilerSfc.compileScript(parsed.descriptor, {
        id: id,
      });

      const compiledStyles = vueCompilerSfc.compileStyle({
        id,
        filename: path,
        source: transpiled,
      });
      if (compiledStyles.errors.length > 1) {
        console.warn(`Vue style compiler errors in file ${path}`, compiledTemplate.errors);
        console.warn(transpiled);
      }

      // Via https://www.npmjs.com/package/@vue/compiler-sfc
      const entry = dedent`      
        import script from './script'
        import { render } from './render'
        import './styles.css'

        script.render = render

        export default script
      `;
      await Promise.all([
        outputFile(`${rootPath}/index.js`, entry),
        outputFile(`${rootPath}/script.js`, compiledScript.content),
        outputFile(`${rootPath}/render.js`, compiledTemplate.code),
        outputFile(`${rootPath}/styles.css`, compiledStyles.code),
      ]);
    } else {
      return outputFile(`${DIST_DIR}/${target}/${path.replace(/\.lite\.tsx$/, '.js')}`, transpiled);
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

async function buildTsFiles() {
  const tsFiles = await glob(`src/**/*.ts`, {
    cwd: cwd,
  });

  return await Promise.all(
    tsFiles.map(async path => {
      const output = await transpile({ path });

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
