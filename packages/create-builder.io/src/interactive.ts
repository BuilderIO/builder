import { cursor, erase } from 'sisteransi';
import { blueBright, bold, dim } from 'colorette';
import fs from 'fs-extra';
import { createApp } from './create-app';
import { STARTERS, Starter, getStarterRepo } from './starters';
import { prompt } from './vendor/prompts';
import { askQuestion, logError } from './utils';

export async function runInteractive(starterName: string | undefined, autoRun: boolean) {
  process.stdout.write(erase.screen);
  process.stdout.write(cursor.to(0, 1));

  // Get starter's repo
  if (!starterName) {
    starterName = await askStarterName();
  }
  const starter = getStarterRepo(starterName);

  // Get project name
  const projectName = await askProjectName();

  // Ask for confirmation
  const confirm = await askConfirm(starter, projectName);
  if (confirm) {
    await createApp(starter, projectName, autoRun);
  } else {
    console.log('\n  aborting...');
  }
}

async function askStarterName(): Promise<string> {
  let showOthers = true;
  while (true) {
    const { starterName }: any = await prompt([
      {
        type: 'select',
        name: 'starterName',
        message: 'Pick a starter',
        choices: getChoices(showOthers),
      },
    ]);
    showOthers = false;
    if (!starterName) {
      throw new Error(`No starter was provided, try again.`);
    }
    if (starterName === 'other') {
      console.log(`\nBuilder.io supports all major frameworks but starters are not ready just yet. \nInstead, you can get started over here: \n
 - ${blueBright('https://www.builder.io/c/docs/getting-started')}\n
 `);
    }
    if (starterName && starterName !== 'other') {
      return starterName;
    }
  }
}

function getChoices(showOthers: boolean) {
  const maxLength = Math.max(...STARTERS.map(s => s.name.length)) + 1;
  const choices = STARTERS.filter(s => s.hidden !== true).map(s => {
    const description = s.description ? dim(s.description) : '';
    return {
      title: `${padEnd(s.name, maxLength)}   ${description}`,
      value: s.name,
    };
  });
  if (showOthers) {
    choices.push({
      title: `${padEnd('Other 🔗', maxLength)}   ${dim('Angular, Vue, WebComponents...')}`,
      value: 'other',
    });
  }
  return choices;
}

async function askProjectName(): Promise<string> {
  const { projectName }: any = await prompt([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name',
      initial: 'my-builder-app',
    },
  ]);
  if (!projectName || fs.existsSync(projectName)) {
    logError(`Folder "./${projectName}" already exists, try a different project name.`);
    return await askProjectName();
  }
  return projectName;
}

async function askConfirm(_starter: Starter, _projectName: string) {
  return askQuestion(bold('Confirm?'));
}

function padEnd(str: string, targetLength: number, padString = ' ') {
  targetLength = targetLength >> 0;
  if (str.length > targetLength) {
    return str;
  }

  targetLength = targetLength - str.length;
  if (targetLength > padString.length) {
    padString += padString.repeat(targetLength / padString.length);
  }

  return String(str) + padString.slice(0, targetLength);
}
