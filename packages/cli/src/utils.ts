import fse from 'fs-extra';
import traverse from 'traverse';
import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import commander from 'commander';
import readline from 'readline';

const childrenProcesses: ChildProcess[] = [];

export const IS_YARN = (() => {
  return fse.existsSync(path.join(process.cwd(), 'yarn.lock'));
})();

export const readAsJson = async (path: string) => {
  const content = await fse.readFile(path);
  try {
    return JSON.parse(content.toString());
  } catch (e) {
    console.error(`error parsing ${path}`);
    throw e;
  }
};

export const intParam = (value: any, previous: any) => { 
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new commander.InvalidArgumentError('Not a number.');
  }
  return parsedValue;
}

export const getDirectories = async (source: string) =>
  (await fse.readdir(source, { withFileTypes: true })).filter(dirent => dirent.isDirectory());

export const getFiles = async (source: string) =>
  (await fse.readdir(source, { withFileTypes: true })).filter(dirent => dirent.isFile());

export const replaceField = (json: any, newValue: string, oldValue: string) => {
  return traverse(json).map(function (field) {
    if (this.key?.includes('@')) {
      // exclude meta keys from updates
      return;
    }
    if (field === oldValue) {
      this.update(newValue);
    }
  });
};

export function writeFile(fileContents: string, filePath: string, fileName: string) {
  if (!fse.existsSync(filePath)) {
    fse.mkdirSync(filePath);
  }

  fse.writeFileSync(path.join(filePath, fileName), fileContents);
}

export const isAffirmativeAnswer = (answer: string) => {
  const normalized = answer.trim().toLowerCase();
  return normalized === 'y' || normalized === 'yes';
};

const promptStdin = (question: string): Promise<string> => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
};

export const confirmAction = async (
  question: string,
  prompt: (question: string) => Promise<string> = promptStdin
): Promise<boolean> => isAffirmativeAnswer(await prompt(question));

export const BUILDER_PRIVATE_KEY_ENV_VAR = 'BUILDER_PRIVATE_KEY';

/**
 * Prefers the `-k`/`--key` flag value, falling back to BUILDER_PRIVATE_KEY so
 * a private key doesn't have to be typed on the command line, where it ends
 * up in shell history and is visible to other processes via `ps`.
 */
export const resolvePrivateKey = (
  flagValue: string | undefined,
  env: NodeJS.ProcessEnv = process.env
): string | undefined => flagValue || env[BUILDER_PRIVATE_KEY_ENV_VAR];

export function killChildren() {
  childrenProcesses.forEach(p => p.kill('SIGINT'));
}

export function installPackage(packageName: string) {
  return new Promise<void>((resolve, reject) => {
    const commands = IS_YARN
      ? ['add', packageName, '--silent', '--ignore-engines', '--no-node-version-check']
      : [
          'install',
          packageName,
          '--loglevel=error',
          '--no-audit',
          '--no-fund',
          '--no-update-notifier',
        ];

    const p = spawn(IS_YARN ? 'yarn' : 'npm', commands, {
      shell: true,
      stdio: 'inherit',
    });
    p.once('exit', () => resolve());
    p.once('error', reject);

    childrenProcesses.push(p);
  });
}
