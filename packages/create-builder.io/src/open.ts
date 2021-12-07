import open from 'open';
import os from 'os';
import { URLSearchParams } from 'url';
import { cliOptions } from './cli';
import { Starter } from './starters';
import { IS_YARN } from './utils';

let openBrowser = false;

export const didOpenBroswer = () => openBrowser;
export const HOST = 'http://builder.io';
export const openBuilder = async (projectName: string, starter: Starter, port: number = 3000) => {
  const url = getEditorURL(projectName, starter, port);
  console.log(`🌐 Visit this URL on this device to open the editor:\n  ${url}`);
  await open(url, {
    app: {
      name: 'google chrome',
    },
  });
  openBrowser = true;
};

export const getEditorURL = (projectName: string, starter: Starter, port: number = 3000) => {
  const params = new URLSearchParams();
  params.set('overridePreviewUrl', `http://localhost:${port}`);
  params.set('projectName', projectName);
  params.set('starter', starter.name);
  params.set('cpus', `${os.cpus().length}`);
  params.set('arch', os.arch());
  params.set('totalmem', `${os.totalmem()}`);
  params.set('platform', os.platform());
  params.set('node', process.version);
  params.set('yarn', `${IS_YARN}`);
  params.set('cli', 'true');
  params.set('onboarding', `${'welcome' in cliOptions}`);
  return `${HOST}/onboarding/${starter.template}?${params.toString()}`;
};

export const openBuilderAuth = async (port: number, clientId: string) => {
  const host = encodeURIComponent(os.hostname());
  const url = `${HOST}/cli-auth?response_type=code&client_id=${clientId}&host=${host}&cli=true`;
  console.log(`🌐 Visit this URL on this device to log in:\n  ${url}`);
  await open(url, {
    app: {
      name: open.apps.chrome,
    },
  });
  openBrowser = true;
};
