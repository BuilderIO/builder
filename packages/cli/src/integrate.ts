import { installPackage, writeFile } from './utils';
import fse from 'fs-extra';
import path from 'path';
import { IS_YARN } from './utils';
import open from 'open';
import chalk from 'chalk';
interface IntegrateOptions {
  apiKey: string;
  model: string;
  pathPrefix: string;
  content?: string;
  skipInstall?: boolean;
}

function verifyPagesDirectory() {
  return fse.existsSync(getPathToPages());
}

// some projects nest the pages directory inside a /src directory
function getPathToPages() {
  const srcPath = path.join(process.cwd(), 'src');
  const srcPagesPath = path.join(srcPath, 'pages');
  if (fse.existsSync(srcPath) && fse.existsSync(srcPagesPath)) {
    return srcPagesPath;
  } else {
    return path.join(process.cwd(), 'pages');
  }
}

function checkForCatchAll(prefix: string) {
  const prefixPath = path.join(getPathToPages(), prefix);
  if (fse.existsSync(prefixPath)) {
    const directoryContents = fse.readdirSync(prefixPath);
    // need to look for a catch all page, it can have any name
    // so we need to look for the "[...anyWord]" pattern
    return directoryContents.find(item => /\[\.\.\.(.*)\]/.test(item));
  } else {
    return false;
  }
}

function getExtension() {
  const jsxIndexFilePath = path.join(getPathToPages(), 'index.jsx');
  const tsIndexFilePath = path.join(getPathToPages(), 'index.ts');
  const tsxIndexFilePath = path.join(getPathToPages(), 'index.tsx');

  if (fse.existsSync(jsxIndexFilePath)) {
    return 'jsx';
  } else if (fse.existsSync(tsIndexFilePath)) {
    return 'ts';
  } else if (fse.existsSync(tsxIndexFilePath)) {
    return 'tsx';
  } else {
    return 'js';
  }
}

function getTemplate(framework = 'nextjs', filename: string) {
  const filePath = path.join(__dirname, 'templates', framework, filename);
  return fse.readFileSync(filePath).toString();
}

function stripSlashes(path: string) {
  return path
    .split('/')
    .filter(item => item)
    .join('/');
}

export async function integrateWithLocalCodebase(options: IntegrateOptions) {
  let failed;
  const filePath = stripSlashes(options.pathPrefix);
  const extension = getExtension();
  const useTypeScript = extension === 'ts' || extension === 'tsx';

  if (!options.apiKey) {
    console.error(
      `[ERROR] - ${chalk.yellow('--apiKey')} is required, you can find it on ${chalk.cyan(
        'https://builder.io/account/settings'
      )}`
    );
    failed = true;
  }

  if (!options.model) {
    console.error(`[ERROR] - ${chalk.yellow('--model')} is required, by default this is "page"`);
    failed = true;
  }

  if (!verifyPagesDirectory()) {
    console.error(
      `[ERROR] - ${chalk.yellow('/pages')} directory not found, ensure you're in a Next.js project.`
    );
    failed = true;
  }

  if (checkForCatchAll(filePath)) {
    console.error(
      `[ERROR] - found existing catch all file in ${
        filePath || '/pages'
      } directory. You can remove that file, or use the ${chalk.cyan(
        '--pathPrefix'
      )} option to nest the landing pages within a prefix.`
    );
    failed = true;
  }

  if (failed) {
    const errorMessage =
      'It looks like the integration failed, please fix the above errors and try again. Our full integration guide can be found here: https://www.builder.io/c/docs/integrating-builder-pages';
    const feedbackMessage = `If you're still having issues or would like to leave us feedback on the CLI, please let us know here:\n${chalk.cyan(
      `https://docs.google.com/forms/d/e/1FAIpQLScBdpNELFPX6hvWO70WuQ5W1nW5jfMglSCcUZ5w-0saXfsbEA/viewform?usp=pp_url&entry.1994483577=${options.apiKey}`
    )}`;

    console.error(`\n${chalk.red(errorMessage)}\n\n${feedbackMessage}`);
    return;
  }

  if (!options.skipInstall) {
    // NOTE: remove if there are issues, test yarn
    console.info('installing the @builder.io/react sdk...', IS_YARN);
    await installPackage('@builder.io/react');
  }

  const pageTemplateString = getTemplate('nextjs', `[...page].${useTypeScript ? 'tsx' : 'jsx'}`)
    .replace(/<<<YOUR_API_KEY>>>/g, options.apiKey)
    .replace(/<<<MODEL_NAME>>>/g, options.model);

  writeFile(pageTemplateString, path.join(getPathToPages(), filePath), `[...page].${extension}`);

  let builderContentUrl;
  if (options.content) {
    builderContentUrl = `https://builder.io/content/${options.content}?source=builder-cli`;
    // open(builderContentUrl);
  }

  console.info(`

  
    ✨ Done! We've successfully integrated page building ✨

    ${chalk.bold(
      chalk.green(`
    Next Steps:
      • Start your dev server: \`npm run dev\`
      ${options.content ? `• Then, open: ${chalk.cyan(builderContentUrl)}` : ''}
    `)
    )}
    
    Additional notes:
    • View/edit the integration file here: ${chalk.cyan(
      path.join(getPathToPages(), filePath, `[...page].${extension}`)
    )}

    • If you have a custom 404 page, you'll want to add it to the [...page].${extension} file. in place of the <DefaultErrorPage> component.

    • Register custom components for your team to use: ${chalk.cyan(
      'https://www.builder.io/c/docs/custom-react-components'
    )}

    • Commit and deploy the code updates to your dev/staging site so your team members can test Builder.io.

    • Once you've deployed to a remote url, you'll want to edit the ${chalk.cyan(
      'previewUrl'
    )} property of your model here:
       ${chalk.cyan(`https://builder.io/models/${options.model}`)}
  `);
}
