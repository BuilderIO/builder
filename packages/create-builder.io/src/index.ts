import { Command } from 'commander';
import { init } from './init';
import { saveLogin, defaultActions } from './login';

async function run() {
  const program = new Command();
  program
    .option('-d,--debug', 'print debugging information')
    .option('--pkey [pkey]', 'set private key manually')
    .description('create a new space')
    .option('--starter [starter]', 'print debugging information')
    .option('--name [name]', 'project name')
    .option('--welcome [welcome]', 'starts the onboarding user flow')
    .action(async options => {
      const welcome = options.welcome;
      if (welcome) {
        await saveLogin({
          apiKey: welcome,
        });
      }

      await defaultActions(options);
      await init(true, options.starter, options.name);
    });

  program.parse(process.argv);
}

run();
