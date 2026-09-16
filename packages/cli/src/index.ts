#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import { importSpace, newSpace, overwriteSpace } from './admin-sdk';
import { integrateWithLocalCodebase } from './integrate';
import { intParam } from './utils';
import { MAX_CONTENT_PAGE_SIZE } from './pagination';
const figlet = require('figlet');

console.log(chalk.blueBright(figlet.textSync('Builder.io cli', { horizontalLayout: 'full' })));

program
  .command('import')
  .description('Import a builder space to the local file system')
  .option('-k,--key <key>', 'Private Key')
  .option('-d,--debug', 'print debugging information')
  .option('-o,--output <output>', 'Path to folder default to ./builder', './builder')
  .option(
    '-l,--limit <limit>',
    'Content entries to request per page, max 100. All entries are downloaded regardless',
    intParam,
    MAX_CONTENT_PAGE_SIZE
  )
  .action(options => {
    importSpace(options.key, options.output, options.debug, options.limit);
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
  .command('overwrite')
  .description(
    'Overwrite content and models in an existing space from a local snapshot. Models are matched by name and content by id; entries in the target space that are missing from the snapshot are left untouched'
  )
  .option('-k,--key <key>', 'Private Key of the existing space to overwrite')
  .option('-d,--debug', 'print debugging information')
  .option('-i,--input <input>', 'Path to folder default to ./builder', './builder')
  .option(
    '-p,--prune',
    'Also delete content entries in the target space, for models present in the snapshot, that are not present in the snapshot. Makes the restore an exact mirror instead of a merge. Destructive and cannot be undone'
  )
  .option(
    '-y,--yes',
    'Skip the confirmation prompt for --prune, for non-interactive/scripted use'
  )
  .action(options => {
    overwriteSpace(options.key, options.input, options.debug, options.prune, options.yes);
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
