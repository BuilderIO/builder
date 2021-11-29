import open from 'open';
import os from 'os';

export const HOST = 'http://localhost:1234';
export const openBuilder = async (projectName: string, port: number = 3000) => {
  const overridePreviewUrl = encodeURIComponent(`http://localhost:${port}`);
  await open(`${HOST}/onboarding/starter?overridePreviewUrl=${overridePreviewUrl}&project_name=${projectName}`, {
    app: {
      name: 'google chrome',
    },
  });
};

export const openBuilderAuth = async (port: number, clientId: string) => {
  const host = encodeURIComponent(os.hostname());
  await open(`${HOST}/cli-auth?response_type=code&client_id=${clientId}&host=${host}`, {
    app: {
      name: 'google chrome',
    },
  });
};
