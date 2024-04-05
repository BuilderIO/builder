import type { Page } from '@playwright/test';
import { EMBEDDER_PORT, SDK_LOADED_MSG } from '../context.js';

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
  const msgPromise = page.waitForEvent('console', msg => msg.text() === SDK_LOADED_MSG);
  await page.goto(getEmbeddedServerURL(path, basePort), gotoOptions);
  await msgPromise;
};
