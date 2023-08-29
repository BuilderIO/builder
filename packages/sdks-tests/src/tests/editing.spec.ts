import { test } from './helpers.js';
import { MODIFIED_HOMEPAGE } from '../specs/homepage.js';
import { MODIFIED_COLUMNS } from '../specs/columns.js';
import type { BuilderContent } from '../specs/types.js';
import { type Page } from '@playwright/test';
import { NEW_TEXT } from '../specs/helpers.js';
import { EMBEDDER_PORT, SDK_LOADED_MSG } from './context.js';

const EMBEDDED_SERVER_URL = `http://localhost:${EMBEDDER_PORT}`;
const getEmbeddedServerURL = (path: string, port: number) =>
  EMBEDDED_SERVER_URL + path + '?port=' + port;

const sendContentUpdateMessage = async (page: Page, newContent: BuilderContent) => {
  await page.evaluate(msgData => {
    const contentWindow = document.querySelector('iframe')?.contentWindow;
    if (!contentWindow) throw new Error('Could not find iframe');

    contentWindow.postMessage(
      {
        type: 'builder.contentUpdate',
        data: {
          key: 'page',
          data: {
            id: msgData.id,
            data: msgData.data,
          },
        },
      },
      '*'
    );
  }, newContent);
};

const launchEmbedderAndWaitForSdk = async ({
  page,
  basePort,
  path,
}: {
  page: Page;
  basePort: number;
  path: string;
}) => {
  const msgPromise = page.waitForEvent('console', msg => msg.text() === SDK_LOADED_MSG);
  await page.goto(getEmbeddedServerURL(path, basePort));
  await msgPromise;
};

test.describe('Visual Editing', () => {
  test('correctly updates Text block', async ({ page, basePort, packageName }) => {
    if (packageName === 'gen1-next' || packageName === 'gen1-react' || packageName === 'gen1-remix')
      test.skip();

    test.skip(packageName === 'react-native' || packageName === 'next-app-dir');

    await launchEmbedderAndWaitForSdk({ path: '/', basePort, page });
    await sendContentUpdateMessage(page, MODIFIED_HOMEPAGE);
    await page.frameLocator('iframe').getByText(NEW_TEXT).waitFor();
  });
  test('correctly updates Text block in a Column block', async ({
    page,
    basePort,
    packageName,
  }) => {
    if (packageName === 'gen1-next' || packageName === 'gen1-react' || packageName === 'gen1-remix')
      test.skip();

    test.skip(packageName === 'react-native' || packageName === 'next-app-dir');

    await launchEmbedderAndWaitForSdk({ path: '/columns', basePort, page });
    await sendContentUpdateMessage(page, MODIFIED_COLUMNS);
    await page.frameLocator('iframe').getByText(NEW_TEXT).waitFor();
  });
});
