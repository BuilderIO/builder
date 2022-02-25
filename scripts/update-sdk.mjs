#!/usr/bin/env zx
import { echo } from 'zx/experimental';

/**
 * @typedef { import("zx").ProcessOutput } ProcessOutput
 */

const NPM_MODULE_TO_UPDATE = await question(
  `Hey there! which npm package do you want to update across the mono-repo? (e.g. @builder.io/sdk) -> `
);

echo`We're going to search for usage of ${NPM_MODULE_TO_UPDATE}! Give me a moment...`;

$.verbose = false;
// find all projects that import the module directly
/** @type ProcessOutput */
const filesGrepOutput = await $`grep -Rl --exclude-dir=node_modules --include=package.json . -e ${NPM_MODULE_TO_UPDATE}`;

// get the relative folder paths
const folderNames = filesGrepOutput
  .toString()
  .split('\n')
  .map(file => file.replace('./builder/', '').replace('package.json', ''));

echo`\n Found "${NPM_MODULE_TO_UPDATE}" in the following projects:\n${folderNames.join('\n')}`;

const confirm = await question(
  `Are you sure you want to update ${NPM_MODULE_TO_UPDATE} in all of these folders? [y/n] -> `,
  {
    choices: ['yes', 'no'],
  }
);

if (['yes', 'y'].includes(confirm.toLowerCase())) {
  echo`Updating...`;

  const temp = [folderNames[0]];

  temp.forEach(async folderName => {
    cd(folderName);

    /** @type ProcessOutput */
    const yarnTest = await $`[test -f yarn.lock] && echo "yes" || echo "no"`;
    const projectUsesYarn = yarnTest.toString() === 'yes';

    $.verbose = true;

    if (projectUsesYarn) {
      echo`project is using yarn.`;
      $`yarn upgrade ${NPM_MODULE_TO_UPDATE} --latest`;
    } else {
      echo`project is using npm.`;
      $`npm install ${NPM_MODULE_TO_UPDATE}@latest`;
    }
  });

  echo`module version update completed! Goodbye. 👋`;
} else {
  echo`Script aborted.`;
}
