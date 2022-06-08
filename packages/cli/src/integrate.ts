import { installPackage, readFile, writeFile } from './utils';
import fse from 'fs-extra';

interface IntegrateOptions {
  apiKey: string;
  model: string;
  pathPrefix: string;
}

const NEXTJS_PAGES_TEMPLATE_PATH = './src/templates/nextjs-[pages].tsx';

function verifyPagesDirectory() {
  return fse.existsSync('pages');
}

function checkForPagesFile(prefix: string, extension: string) {
  return fse.existsSync(`./pages/${prefix}/[pages].${extension}`);
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

  if (checkForPagesFile(filePath, 'jsx')) {
    console.error(`found existing [pages].jsx file in ${filePath} directory, exiting now.`);
    failed = true;
  }

  if (failed) {
    return;
  }

  console.log('installing the @builder.io/react sdk...');
  await installPackage('@builder.io/react');

  const nextJsPagesTemplateString = readFile(NEXTJS_PAGES_TEMPLATE_PATH);
  const finalFileString = nextJsPagesTemplateString
    .replace(/<<<YOUR_API_KEY>>>/g, options.apiKey)
    .replace(/<<<MODEL_NAME>>>/g, options.model);

  writeFile(finalFileString, `./pages/${filePath}`, '[pages].jsx');

  console.log('finished.');

  // TODO:
  // if you integrate from a specific entry, then open chrome
  // to that content entry. if not, should we create a
  // content entry with demo content?
}
