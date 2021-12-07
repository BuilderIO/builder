import { Spinner } from 'cli-spinner';
import fs, { rename } from 'fs-extra';
import { join } from 'path';
import { bold, cyan, dim, green } from 'colorette';
import { downloadStarter } from './download';
import { Starter } from './starters';
import { unZipBuffer } from './unzip';
import {
  askQuestion,
  logSuccess,
  npm,
  npmInstall,
  onlyUnix,
  printDuration,
  setTmpDirectory,
  terminalPrompt,
} from './utils';
import { BUILD, START, TEST } from './texts';
import { replaceInFile } from 'replace-in-file';
import { mustGetApiKey } from './login';
import { didOpenBroswer, getEditorURL, openBuilder } from './open';

const starterPromises = new Map<
  Starter,
  Promise<undefined | ((name: string, context: { [context: string]: string }) => Promise<void>)>
>();

export async function createApp(starter: Starter, projectName: string, autoRun: boolean) {
  if (fs.existsSync(projectName)) {
    throw new Error(
      `Folder "./${projectName}" already exists, please choose a different project name.`
    );
  }

  projectName = projectName.toLowerCase().trim();

  if (!validateProjectName(projectName)) {
    throw new Error(
      `Project name "${projectName}" is not valid. It must be a kebab-case name without spaces.`
    );
  }

  const startT = Date.now();
  const moveTo = await prepareStarter(starter);
  if (!moveTo) {
    throw new Error('starter install failed');
  }

  const apiKey = await mustGetApiKey({
    redirectURL: autoRun ? getEditorURL(projectName, starter, 3000) : undefined,
  });
  await moveTo(projectName, {
    'project-name': projectName,
    'public-key': apiKey,
  });

  const time = printDuration(Date.now() - startT);
  console.log(`${green('✔')} ${bold('All setup')} ${onlyUnix('🎉')} ${dim(time)}

  ${dim(terminalPrompt())} ${green('cd')} ${projectName}

  ${dim(terminalPrompt())} ${green(START)}
    Starts the development server.

  ${dim(terminalPrompt())} ${green(BUILD)}
    Builds your app in production mode.

${renderDocs(starter)}

  Happy coding! 🎈
`);

  if (autoRun) {
    const next = didOpenBroswer()
      ? true
      : await askQuestion(
          `Run dev server and open the builder's editor in the browser. ${bold('Confirm?')}`
        );

    if (next) {
      console.log(`
${dim('Opening dev server and editor in the browser:')}
  ${green('✔')} Opening browser...
  ${green('✔')} ${dim(terminalPrompt())} ${green('cd')} ${projectName}
  ${green('✔')} ${dim(terminalPrompt())} ${green(START)}
`);
      if (!didOpenBroswer()) {
        setTimeout(() => {
          openBuilder(projectName, starter, 3000);
        }, 2000);
      }
      await npm('start', projectName, 'inherit', {
        BROWSER: 'none',
      });
    } else {
      console.log('\n  aborting...');
    }
  }
}

function renderDocs(starter: Starter) {
  const docs = starter.docs;
  if (!docs) {
    return '';
  }
  return `
  ${dim('Further reading:')}

   ${dim('-')} ${cyan(docs)}`;
}

export function prepareStarter(starter: Starter) {
  let promise = starterPromises.get(starter);
  if (!promise) {
    promise = prepare(starter);
    // silent crash, we will handle later
    promise.catch(() => {
      return;
    });
    starterPromises.set(starter, promise);
  }
  return promise;
}

async function prepare(starter: Starter) {
  const baseDir = process.cwd();
  const tmpPath = join(baseDir, '.tmp-builder-starter');

  const loading1 = new Spinner(bold('Downloading starter'));
  loading1.setSpinnerString(18);
  loading1.start();
  const buffer = await downloadStarter(starter);
  setTmpDirectory(tmpPath);
  loading1.stop(true);
  logSuccess('Starter downloaded');

  const loading2 = new Spinner(bold('Unpacking starter'));
  loading2.setSpinnerString(18);
  loading2.start();
  await unZipBuffer(buffer, tmpPath, starter.prefix);
  loading2.stop(true);
  logSuccess('Starter unpacked');

  await npmInstall(tmpPath);
  logSuccess('Deps installed');

  return async (projectName: string, context: { [context: string]: string }) => {
    const filePath = join(baseDir, projectName);
    await rename(tmpPath, filePath);
    for (const [key, value] of Object.entries(context)) {
      await replaceInFile({
        files: [
          join(filePath, '*'),
          join(filePath, 'src/**/*'),
          join(filePath, 'pages/**/*'),
          join(filePath, 'components/**/*'),
        ],
        ignore: ['node_modules', 'dist', 'build', '.git'],
        from: new RegExp(`builder-${key}`, 'g'),
        allowEmptyPaths: true,
        to: value,
      });
    }
    setTmpDirectory(null);
  };
}

function validateProjectName(projectName: string) {
  return !/[^a-zA-Z0-9-]/.test(projectName);
}
