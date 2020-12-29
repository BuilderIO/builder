#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import { importSpace, newSpace } from './admin-sdk';
const figlet = require('figlet');
// const clear = require('clear');

// clear();
const defaultDirectory = `./builder`;

console.log(chalk.blueBright(figlet.textSync('Builder.io cli', { horizontalLayout: 'full' })));

program
  .command('import')
  .description('Import a builder space to the local file system')
  .option('-k,--key <key>', 'Private Key')
  .option('-d,--debug', 'print debugging information')
  .option('-o,--output <output>', 'Path to folder default to ./builder', './builder')
  .action(options => {
    importSpace(options.key, options.output, options.debug);
  });

program
  .command('create')
  .description('create a new space')
  .option('-k,--key <key>', 'Root organization Private Key')
  .option('-d,--debug', 'print debugging information')
  .option('-i,--input <input>', 'Path to folder default to ./builder', './builder')
  .option('-n,--name <name>', 'The new space name')
  .action(options => {
    newSpace(options.key, options.input, options.name, options.debug);
  });

program.parse(process.argv);
