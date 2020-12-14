#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import { importSpace, newSpace } from './admin-sdk';
const figlet = require('figlet');
// const clear = require('clear');

// clear();
const defaultDirectory = `./builder`;


console.log(
  chalk.blueBright(
    figlet.textSync('Builder.io cli', { horizontalLayout: 'full' })
  )
);

program.version('0.1.0')
.description("A Cli for administring builder spaces")
.option('-i, --import <private key>', 'import a builder space to the local filesystem')
.option('-n, --new <root-org-private>', 'create a new builder space from the local builder folder on the root org specified')
.option('-d, --debug', 'print verbose status messages')
.option('-o, --output <folder-name>', 'output directory to import content to')
.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}

if (program.import) {
  if (program.debug) {
    console.log(chalk.green(`importing from space with private key ${program.import}`))
  }
  importSpace(program.import, program.output || defaultDirectory);
}

if (program.new) {
  if (program.debug) {
    console.log(chalk.green(`importing from space with private key ${program.new}`))
  }

  newSpace(program.new, program.root || defaultDirectory);

}