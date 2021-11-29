import { Command } from 'commander';
import { init } from './init';
import { saveLogin } from './login';

async function run() {
  const program = new Command();
  const defaultActions = async (options: any) => {
    if (options.pkey) {
      await saveLogin({
        privateKey: options.pkey,
      });
    }
  };
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
