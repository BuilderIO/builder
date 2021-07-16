import { JSXLiteComponent } from '@jsx-lite/core';
import * as vueCompilerSfc from '@vue/compiler-sfc';
import * as dedent from 'dedent';
import { getSimpleId } from './get-simple-id';
import * as json5 from 'json5';

export type CompileVueFileOptions = {
  distDir: string;
  path: string;
  contents: string;
  jsxLiteComponent: JSXLiteComponent;
};

export type FileSpec = {
  path: string;
  contents: string;
};

export async function compileVueFile(options: CompileVueFileOptions): Promise<FileSpec[]> {
  const rootPath = `${options.distDir}/vue/${options.path.replace(/\.lite\.tsx$/, '')}`;
  const parsed = vueCompilerSfc.parse(options.contents);
  const id = getSimpleId();

  if (parsed.errors.length) {
    console.warn(`Vue template compiler errors in file ${options.path}`, parsed.errors);
    console.warn(options.contents);
  }

  const compiledTemplate = vueCompilerSfc.compileTemplate({
    filename: options.path,
    source: parsed.descriptor.template.content,
    id,
    scoped: true,
  });
  if (compiledTemplate.errors.length) {
    console.warn(`Vue template compiler errors in file ${options.path}`, compiledTemplate.errors);
    console.warn(options.contents);
  }
  const compiledScript = vueCompilerSfc.compileScript(parsed.descriptor, {
    id: id,
  });

  const compiledStyles = await vueCompilerSfc.compileStyleAsync({
    id,
    filename: options.path,
    scoped: true,
    source: parsed.descriptor.styles[0]?.content || '',
  });
  if (compiledStyles.errors.length > 1) {
    console.warn(`Vue style compiler errors in file ${options.path}`, compiledTemplate.errors);
    console.warn(options.contents);
  }

  const registerComponentHook = options.jsxLiteComponent.meta.registerComponent;

  // Via https://www.npmjs.com/package/@vue/compiler-sfc README
  const entry = dedent`      
    import script from './script'
    import { render } from './render'
    import './styles.css'

    script.render = render

    ${
      !registerComponentHook
        ? ''
        : dedent`
          import { registerComponent } from '@builder.io/sdk-vue'
          registerComponent(script, ${json5.stringify(registerComponentHook)})
        `
    }
    export default script
  `;

  return [
    { path: `${rootPath}/index.js`, contents: entry },
    { path: `${rootPath}/script.js`, contents: compiledScript.content },
    { path: `${rootPath}/render.js`, contents: compiledTemplate.code },
    { path: `${rootPath}/styles.css`, contents: compiledStyles.code },
  ];
}
