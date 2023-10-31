import fse from 'fs-extra';
import traverse from 'traverse';
import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import { createHash } from 'crypto';

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

export const updateIdsMap = (idsMap: Record<string, string>, organizationId: string) => Object.values(idsMap).reduce<
    Record<string, string>
  >(
    (modelMap, id) => ({
      ...modelMap,
      [id]: createHash('sha256')
        .update(id + organizationId)
        .digest('hex'),
    }),
    {}
  );

export const replaceIds = (obj: any, ...idsMaps: Record<string, string>[]) =>
  traverse(obj).map(function (field) {
    // we keep meta props as is for debugging puprposes
    if (this.key?.includes('@')) {
      return;
    }
    idsMaps.forEach((idsMap) => {
      if (idsMap[field]) this.update(idsMap[field])
    })
  });

export function writeFile(fileContents: string, filePath: string, fileName: string) {
  if (!fse.existsSync(filePath)) {
    fse.mkdirSync(filePath);
  }

  fse.writeFileSync(path.join(filePath, fileName), fileContents);
}

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
