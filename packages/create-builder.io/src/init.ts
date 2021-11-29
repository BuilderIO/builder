import { red } from 'colorette';
import { createApp } from './create-app';
import { runInteractive } from './interactive';
import { getStarterRepo } from './starters';
import { cleanup, nodeVersionWarning } from './utils';

export const init = async (autoRun: boolean, starter: string | undefined, projectName: string) => {
  nodeVersionWarning();

  let didError = false;
  try {
    if (starter && projectName) {
      await createApp(getStarterRepo(starter), projectName, autoRun);
    } else {
      await runInteractive(starter, autoRun);
    }
  } catch (e) {
    didError = true;
    if (e instanceof Error) {
      console.error(`\n${red('✖')} ${e.message}\n`);
    }
  }
  cleanup(didError);
};
