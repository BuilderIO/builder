import open from 'open';
import os from 'os';
import { URLSearchParams } from 'url';
import { Starter } from './starters';
import { IS_YARN } from './utils';

export const HOST = 'http://beta.builder.io';
export const openBuilder = async (projectName: string, starter: Starter, port: number = 3000) => {
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

  const url = `${HOST}/onboarding/${starter.template}?${params.toString()}`;
  console.log(`🌐 Visit this URL on this device to open the editor:\n  ${url}`);
  await open(url, {
    app: {
      name: 'google chrome',
    },
  });
};

export const openBuilderAuth = async (port: number, clientId: string) => {
  const host = encodeURIComponent(os.hostname());
  const url = `${HOST}/cli-auth?response_type=code&client_id=${clientId}&host=${host}`;
  console.log(`🌐 Visit this URL on this device to log in:\n  ${url}`);
  await open(url, {
    app: {
      name: 'google chrome',
    },
  });
};
