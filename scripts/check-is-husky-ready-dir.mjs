#!/usr/bin/env zx

import { $ } from 'zx';

$.verbose = false;

/**
 * This script is to be used by husky hooks to make sure only certain projects run the hooks, until we adopt conventional
 * logging amongst all of our mono-repo projects.
 */
const PROJECTS_THAT_USE_HUSKY = ['packages/sdks/'];

const gitPrefixArg = process.argv.find(x => x.startsWith('--git-prefix='));
const gitPrefix = (gitPrefixArg || '').split('=')[1];

if (PROJECTS_THAT_USE_HUSKY.find(project => gitPrefix.startsWith(project))) {
  process.exit(0);
} else {
  process.exit(1);
}
