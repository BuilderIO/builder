import { installPackage, writeFile } from './utils';
import fse from 'fs-extra';
import path from 'path';
import { IS_YARN } from './utils';
interface IntegrateOptions {
  apiKey: string;
  model: string;
  pathPrefix: string;
  language: 'typescript' | 'javascript';
}

function verifyPagesDirectory() {
  return fse.existsSync('pages');
}

function checkForCatchAll(prefix: string, extension: string) {
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
  const extension = options.language === 'typescript' ? 'tsx' : 'jsx';

  if (!options.apiKey) {
    console.error('apiKey is required, you can find it on builder.io/account/settings');
    failed = true;
  }

  if (!options.model) {
    console.error('`model` is required, by default this is "page"');
    failed = true;
  }

  if (!verifyPagesDirectory) {
    console.error("/pages directory not found, ensure you're in a Next.js project");
    failed = true;
  }

  if (checkForCatchAll(filePath, extension)) {
    console.error(`found existing catch all file in ${filePath} directory, exiting now.`);
    failed = true;
  }

  if (failed) {
    return;
  }

  // TODO: remove if there are issues, test yarn
  console.info('installing the @builder.io/react sdk...', IS_YARN);
  await installPackage('@builder.io/react');

  const pageTemplateString = getTemplate('nextjs', `[...page].${extension}`)
    .replace(/<<<YOUR_API_KEY>>>/g, options.apiKey)
    .replace(/<<<MODEL_NAME>>>/g, options.model);

  writeFile(
    pageTemplateString,
    path.join(process.cwd(), 'pages', filePath),
    `[...page].${extension}`
  );

  console.info('finished.');

  // TODO:
  // if you integrate from a specific entry, then open chrome
  // to that content entry. if not, should we create a
  // content entry with demo content?
}
