import * as vueCompilerSfc from '@vue/compiler-sfc';
import * as dedent from 'dedent';
import { getSimpleId } from './get-simple-id';

export type CompileVueFileOptions = {
  distDir: string;
  path: string;
  contents: string;
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

  // Via https://www.npmjs.com/package/@vue/compiler-sfc
  const entry = dedent`      
    import script from './script'
    import { render } from './render'
    import './styles.css'

    script.render = render

    export default script
  `;

  return [
    { path: `${rootPath}/index.js`, contents: entry },
    { path: `${rootPath}/script.js`, contents: compiledScript.content },
    { path: `${rootPath}/render.js`, contents: compiledTemplate.code },
    { path: `${rootPath}/styles.css`, contents: compiledStyles.code },
  ];
}
