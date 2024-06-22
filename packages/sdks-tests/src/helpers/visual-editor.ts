import type { Page } from '@playwright/test';
import { EMBEDDER_PORT, SDK_LOADED_MSG } from './context.js';
import type { BuilderContent } from '../specs/types.js';

const EMBEDDED_SERVER_URL = `http://localhost:${EMBEDDER_PORT}`;
const getEmbeddedServerURL = (path: string, port: number) =>
  EMBEDDED_SERVER_URL + path + '?port=' + port;

export const launchEmbedderAndWaitForSdk = async ({
  page,
  basePort,
  path,
  gotoOptions,
}: {
  page: Page;
  basePort: number;
  path: string;
  gotoOptions?: Parameters<Page['goto']>[1];
}) => {
  const msgPromise = page.waitForEvent('console', msg => msg.text().includes(SDK_LOADED_MSG));
  await page.goto(getEmbeddedServerURL(path, basePort), gotoOptions);
  await msgPromise;
};

export const sendContentUpdateMessage = async ({
  page,
  newContent,
  model,
}: {
  page: Page;
  newContent: BuilderContent;
  model: string;
}) => {
  await page.evaluate(
    msgData => {
      const contentWindow = document.querySelector('iframe')?.contentWindow;
      if (!contentWindow) throw new Error('Could not find iframe');

      contentWindow.postMessage(
        {
          type: 'builder.contentUpdate',
          data: {
            key: msgData.model,
            data: {
              id: msgData.id,
              data: msgData.data,
            },
          },
        },
        '*'
      );
    },
    { ...newContent, model }
  );
};
