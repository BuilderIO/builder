#!/usr/bin/env zx
import { question } from 'zx';
import { echo } from 'zx/experimental';

/**
 * @typedef { import("zx").ProcessOutput } ProcessOutput
 */

$.verbose = false;

/** @type ProcessOutput */
const currentDir = (await $`pwd`).toString().trim();

const NPM_MODULE_TO_UPDATE =
  argv.lib ??
  (await question(
    `Hey there! which npm package do you want to update across the mono-repo? (e.g. @builder.io/sdk) -> `
  ));

const versionAnswer =
  argv.version ??
  (await question(
    'and which version do you want? (e.g. "1.0.0", "dev", "latest"). Defaults to latest -> '
  ));

const VERSION = versionAnswer || 'latest';

echo`Searching for usage of ${NPM_MODULE_TO_UPDATE}! Give me a moment...`;

// Including `: ` in front to avoid matching the `package.json` of the project itself.
const grepVal = `\"${NPM_MODULE_TO_UPDATE}\": `;

// find all projects that import the module directly
/** @type ProcessOutput */
const filesGrepOutput =
  await $`grep -Rl --exclude-dir=node_modules --include=package.json . -e ${grepVal}`;

// get the relative folder paths
const folderNames = filesGrepOutput
  .toString()
  .trim()
  .split('\n')
  .map(file => file.replace('./builder/', '').replace('package.json', ''))
  .filter(x => !x.includes('packages/sdks/e2e'));

echo`\n Found "${NPM_MODULE_TO_UPDATE}" in the following projects:\n${folderNames.join('\n')}`;

const confirm = argv['force-lib-upgrade']
  ? 'yes'
  : await question(
      `Are you sure you want to update "${NPM_MODULE_TO_UPDATE}" in all of these folders to version "${VERSION}"? [y/n] -> `,
      {
        choices: ['yes', 'no'],
      }
    );

if (['yes', 'y'].includes(confirm.toLowerCase())) {
  echo`Updating ${folderNames.length} projects.`;

  for (const folderName of folderNames) {
    cd(currentDir);
    cd(folderName);
    echo`Updating ${folderName}`;
    await updateModuleInFolder();
  }

  echo`\n\n\n"${NPM_MODULE_TO_UPDATE}" successfully updated to latest version in ${folderNames.length} projects! Goodbye. 👋`;
} else {
  echo`Script aborted.`;
}

async function updateModuleInFolder() {
  /** @type string | undefined */
  let yarnVersion = undefined;
  try {
    await $`test -f yarn.lock`;
    /** @type ProcessOutput */
    const yarnVersionOutput = await $`yarn --version`;
    yarnVersion = yarnVersionOutput.toString().trim();
  } catch (error) {}

  let projectUsesNpm = false;
  try {
    await $`test -f package-lock.json`;
    projectUsesNpm = true;
  } catch (error) {}

  let isYarnWorkspaceVersion = false;
  try {
    const jqCommand = `jq '.devDependencies."${NPM_MODULE_TO_UPDATE}" == "workspace:*" or .dependencies."${NPM_MODULE_TO_UPDATE}" == "workspace:*"'`;
    await $`${jqCommand}`;
    isYarnWorkspaceVersion = true;
  } catch (error) {}

  $.verbose = true;
  if (isYarnWorkspaceVersion) {
    echo`project is using local workspace version of ${NPM_MODULE_TO_UPDATE}. Skipping...`;
  } else if (yarnVersion) {
    if (yarnVersion.startsWith('1.')) {
      echo`project is using yarn v1`;
      await $`yarn upgrade ${NPM_MODULE_TO_UPDATE}@${VERSION}`;
    } else {
      echo`project is using yarn v3.`;
      await $`yarn up ${NPM_MODULE_TO_UPDATE}@${VERSION}`;
    }
  } else if (projectUsesNpm) {
    echo`project is using npm.`;
    await $`npm install ${NPM_MODULE_TO_UPDATE}@${VERSION} --legacy-peer-deps`;
  } else {
    echo`project is using neither yarn/npm. Skipping...`;
  }
  $.verbose = false;
}
