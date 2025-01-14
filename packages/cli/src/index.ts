#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import { importSpace, newSpace } from './admin-sdk';
import { integrateWithLocalCodebase } from './integrate';
import { intParam } from './utils';
const figlet = require('figlet');

console.log(chalk.blueBright(figlet.textSync('Builder.io cli', { horizontalLayout: 'full' })));

program
  .command('import')
  .description('Import a builder space to the local file system')
  .option('-k,--key <key>', 'Private Key')
  .option('-d,--debug', 'print debugging information')
  .option('-o,--output <output>', 'Path to folder default to ./builder', './builder')
  .option('-l,--limit <limit>', 'Maximum number of content entries to request, default is 100', intParam, 100)
  .action(options => {
    importSpace(options.key, options.output, options.debug, options.limit || 100);
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

program
  .command('integrate')
  .description('integrate Builder.io with an existing codebase, currently supports Next.js')
  .option('-d,--debug', 'print debugging information')
  .option('--skip-install', 'skip installing the @builder.io/react sdk')
  .option('-s,--stack <stack>', 'currently supports nextjs', 'nextjs')
  .option('-m,--model <model>', 'name of the model you want to integrate')
  .option('-a,--apiKey <apiKey>', 'you can find your apiKey on builder.io/account/settings')
  .option(
    '-c,--content <contentId>',
    'opens the content entry in builder.io after integration has completed'
  )
  .option(
    '-p,--pathPrefix <prefix>',
    'URL path prefix where all your landing pages will be nested under',
    ''
  )
  .action(async options => {
    await integrateWithLocalCodebase(options);
  });

program.parse(process.argv);
