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
}

function verifyPagesDirectory() {
  return fse.existsSync('pages');
}

function checkForCatchAll(prefix: string) {
  const prefixPath = path.join(process.cwd(), 'pages', prefix);
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
  const jsxIndexFilePath = path.join(process.cwd(), 'pages', 'index.jsx');
  const tsIndexFilePath = path.join(process.cwd(), 'pages', 'index.ts');
  const tsxIndexFilePath = path.join(process.cwd(), 'pages', 'index.tsx');

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
      `[ERROR] - ${chalk.yellow('--apiKey')} is required, you can find it on ${chalk.blue(
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
      `[ERROR] - ${chalk.yellow(
        '/pages'
      )} directory not found, ensure you're in a Next.js project. If you believe this is an error, please file a bug report here: ${chalk.blue(
        'https://github.com/BuilderIO/builder/issues/new?assignees=&labels=&template=bug_report.md&title=[BUG]%20-%20CLI%20Integration'
      )}`
    );
    failed = true;
  }

  if (checkForCatchAll(filePath)) {
    console.error(
      `[ERROR] - found existing catch all file in ${filePath} directory. You can remove that file, or use the ${chalk.blue(
        '--pathPrefix'
      )} option to nest the landing pages within a prefix.`
    );
    failed = true;
  }

  if (failed) {
    console.error(chalk.red(`Integration failed, please fix the above errors and try again.`));
    return;
  }

  // NOTE: remove if there are issues, test yarn
  console.info('installing the @builder.io/react sdk...', IS_YARN);
  await installPackage('@builder.io/react');

  const pageTemplateString = getTemplate('nextjs', `[...page].${useTypeScript ? 'tsx' : 'jsx'}`)
    .replace(/<<<YOUR_API_KEY>>>/g, options.apiKey)
    .replace(/<<<MODEL_NAME>>>/g, options.model);

  writeFile(
    pageTemplateString,
    path.join(process.cwd(), 'pages', filePath),
    `[...page].${extension}`
  );

  console.info(
    `[SUCCESS] - integration complete, you can now edit the page in ${chalk.blue(
      path.join(process.cwd(), 'pages', filePath, `[...page].${extension}`)
    )}`
  );

  if (options.content) {
    const builderContentUrl = `https://builder.io/api/v1/content/${options.content}`;
    console.info(
      `[SUCCESS] - opening your landing page in your browser: ${chalk.blue(builderContentUrl)}`
    );
    open(builderContentUrl);
  }

  console.info(`
    --------------------------------------------------
    --------------------------------------------------
    Congratulations! You've successfully integrated with Builder.io.
    
    Next Steps:
    1. If you had created a new 404 page, you'll want to add it to the [...page].${extension} file.
       in place of the <DefaultErrorPage> component.
    2. Commit and deply the integration to your dev/staging site so your team members can test Builder.io. Alternatively, you can use ${chalk.green(
      'Vercel'
    )} or ${chalk.green('Netlify')} to quickly deploy your project for testing.
    3. Once you've deployed to a remote url, you'll want to edit the ${chalk.blue(
      'previewUrl'
    )} property of your model here:
       ${chalk.blue(`https://builder.io//model/${options.model}`)}
    --------------------------------------------------
    --------------------------------------------------

    ${chalk.green(`We'd love to here from you! Please give us feedback on any 
    https://docs.google.com/forms/d/e/1FAIpQLScBdpNELFPX6hvWO70WuQ5W1nW5jfMglSCcUZ5w-0saXfsbEA/viewform?usp=pp_url&entry.1994483577=${options.apiKey}`)}
  `);
}
