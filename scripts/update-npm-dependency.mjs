#!/usr/bin/env zx
import { echo } from 'zx/experimental';

/**
 * @typedef { import("zx").ProcessOutput } ProcessOutput
 */

$.verbose = false;

/** @type ProcessOutput */
const currentDir = (await $`pwd`).toString().trim();

const NPM_MODULE_TO_UPDATE = await question(
  `Hey there! which npm package do you want to update across the mono-repo? (e.g. @builder.io/sdk) -> `
);

echo`Searching for usage of ${NPM_MODULE_TO_UPDATE}! Give me a moment...`;

// Including `: ` in front to avoid matching the `package.json` of the project itself.
const grepVal = `\"${NPM_MODULE_TO_UPDATE}\": `;

// find all projects that import the module directly
/** @type ProcessOutput */
const filesGrepOutput = await $`grep -Rl --exclude-dir=node_modules --include=package.json . -e ${grepVal}`;

// get the relative folder paths
const folderNames = filesGrepOutput
  .toString()
  .trim()
  .split('\n')
  .map(file => file.replace('./builder/', '').replace('package.json', ''));

echo`\n Found "${NPM_MODULE_TO_UPDATE}" in the following projects:\n${folderNames.join('\n')}`;

const confirm = await question(
  `Are you sure you want to update "${NPM_MODULE_TO_UPDATE}" in all of these folders to the latest version? [y/n] -> `,
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
  let projectUsesYarn = false;
  try {
    await $`test -f yarn.lock`;
    projectUsesYarn = true;
  } catch (error) {}

  $.verbose = true;
  if (projectUsesYarn) {
    echo`project is using yarn.`;
    await $`yarn upgrade ${NPM_MODULE_TO_UPDATE} --latest`;
  } else {
    echo`project is using npm.`;
    await $`npm install ${NPM_MODULE_TO_UPDATE}@latest --legacy-peer-deps`;
  }
  $.verbose = false;
}
