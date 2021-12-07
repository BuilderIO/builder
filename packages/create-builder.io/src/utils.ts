import { ChildProcess, spawn } from 'child_process';
import {
  existsSync,
  readdirSync,
  lstatSync,
  unlinkSync,
  rmdirSync,
  readFile,
  readdir,
} from 'fs-extra';
import { join } from 'path';
import { bold, green, red, yellow } from 'colorette';
import { prompt } from './vendor/prompts';
import { saveLogin } from './login';

export const IS_YARN = (() => {
  const config = process.env['npm_config_registry'];
  return !!(config && config.includes('yarn'));
})();

const childrenProcesses: ChildProcess[] = [];
let tmpDirectory: string | null = null;

export function setTmpDirectory(dir: string | null) {
  tmpDirectory = dir;
  if (dir) {
    rimraf(dir);
    process.once('uncaughtException', () => cleanup(true));
    process.once('exit', () => cleanup());
    process.once('SIGINT', () => cleanup());
    process.once('SIGTERM', () => cleanup());
  }
}

export function cleanup(didError = false) {
  if (tmpDirectory) {
    killChildren();
  }
  setTimeout(() => {
    if (tmpDirectory) {
      rimraf(tmpDirectory);
      tmpDirectory = null;
    }
    process.exit(didError ? 1 : 0);
  }, 200);
}

export function killChildren() {
  childrenProcesses.forEach(p => p.kill('SIGINT'));
}

export function npm(command: string, projectPath: string, stdio: any = 'ignore', env?: any) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(IS_YARN ? 'yarn' : 'npm', [command], {
      shell: true,
      stdio,
      cwd: projectPath,
      env: {
        ...process.env,
        ...env,
      },
    });
    p.once('exit', () => resolve());
    p.once('error', reject);

    childrenProcesses.push(p);
  });
}

export function npmInstall(projectPath: string) {
  return new Promise<void>((resolve, reject) => {
    const commands = IS_YARN
      ? ['--silent', '--ignore-engines', '--no-node-version-check']
      : ['install', '--loglevel=error', '--no-audit', '--no-fund', '--no-update-notifier'];
    const p = spawn(IS_YARN ? 'yarn' : 'npm', commands, {
      shell: true,
      stdio: 'inherit',
      cwd: projectPath,
    });
    p.once('exit', () => resolve());
    p.once('error', reject);

    childrenProcesses.push(p);
  });
}

export function rimraf(dir_path: string) {
  if (existsSync(dir_path)) {
    readdirSync(dir_path).forEach(entry => {
      const entry_path = join(dir_path, entry);
      if (lstatSync(entry_path).isDirectory()) {
        rimraf(entry_path);
      } else {
        unlinkSync(entry_path);
      }
    });
    rmdirSync(dir_path);
  }
}

export function onlyUnix(str: string) {
  return isWin() ? str : '';
}

export function printDuration(duration: number) {
  if (duration > 1000) {
    return `in ${(duration / 1000).toFixed(2)} s`;
  } else {
    const ms = parseFloat(duration.toFixed(3));
    return `in ${ms} ms`;
  }
}

export function isWin() {
  return process.platform === 'win32';
}

export function terminalPrompt() {
  return isWin() ? '>' : '$';
}

export const kebabCase = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
};

export const omit = (obj: { [key: string]: any }, fields: string[]) => {
  const shallowCopy = { ...obj };
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i];
    delete shallowCopy[key];
  }
  return shallowCopy;
};

export function nodeVersionWarning() {
  try {
    const v = process.version.replace('v', '').split('.');
    const major = parseInt(v[0], 10);
    if (major < 14) {
      console.error(
        yellow(
          `Your current version of Node is ${process.version}, however the recommendation is a minimum of Node v14. Use nvm to easy switch between nodejs versions: https://github.com/nvm-sh/nvm`
        )
      );
    }
  } catch (e) {}
}

export const readAsJson = async (path: string) => {
  const content = await readFile(path);
  try {
    return JSON.parse(content.toString());
  } catch (e) {
    console.error(`error parsing ${path}`);
    throw e;
  }
};

export const getDirectories = async (source: string) =>
  (await readdir(source, { withFileTypes: true })).filter(dirent => dirent.isDirectory());

export const getFiles = async (source: string) =>
  (await readdir(source, { withFileTypes: true })).filter(dirent => dirent.isFile());

export const logSuccess = (str: string) => {
  console.log(`${green('✔')} ${bold(str)}`);
};

export const logError = (str: string) => {
  console.log(`${red('❌')} ${str}`);
};

export const askQuestion = async (message: string) => {
  const { confirm }: any = await prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      initial: true,
    },
  ]);
  return confirm;
};
