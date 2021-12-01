import open from 'open';
import os from 'os';

export const HOST = 'http://beta.builder.io';
export const openBuilder = async (projectName: string, port: number = 3000) => {
  const overridePreviewUrl = encodeURIComponent(`http://localhost:${port}`);
  const url = `${HOST}/onboarding/starter?overridePreviewUrl=${overridePreviewUrl}&project_name=${projectName}`;
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
