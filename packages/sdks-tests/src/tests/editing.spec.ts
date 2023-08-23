import { test } from './helpers.js';
import { MODIFIED_HOMEPAGE } from '../specs/homepage.js';
import { MODIFIED_COLUMNS } from '../specs/columns.js';
import type { BuilderContent } from '../specs/types.js';
import { EMBEDDER_PORT } from './context.js';
import { expect, type Page } from '@playwright/test';
import { NEW_TEXT } from '../specs/helpers.js';

const EMBEDDED_SERVER_URL = `http://localhost:${EMBEDDER_PORT}`;
const getEmbeddedServerURL = (path: string, port: number) =>
  EMBEDDED_SERVER_URL + path + '?port=' + port;

const sendContentUpdateMessage = async (page: Page, newContent: BuilderContent) => {
  await page.evaluate(msgData => {
    const contentWindow = document.querySelector('iframe')?.contentWindow;

    if (!contentWindow) throw new Error('Could not find iframe');

    console.log('sending message!');

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

test.describe('Visual Editing', () => {
  test('correctly updates Text block', async ({ page, basePort, packageName }) => {
    if (packageName === 'gen1-next' || packageName === 'gen1-react' || packageName === 'gen1-remix')
      test.skip();

    // TO-DO: temporary while we fix the SDKs
    test.skip(
      packageName === 'react-native' ||
        packageName === 'next-app-dir' ||
        packageName === 'vue3' ||
        // vue2 always works locally, but is flaky in CI
        packageName === 'vue2' ||
        packageName === 'nuxt3'
    );

    await page.goto(getEmbeddedServerURL('/', basePort));

    /**
     * Make sure the homepage loaded inside the iframe
     */
    const links = page.frameLocator('iframe').locator('a');
    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });
    await expect(columnsLink).toHaveCount(1);

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

    // TO-DO: temporary while we fix the SDKs
    test.skip(
      packageName === 'qwik-city' ||
        packageName === 'react-native' ||
        packageName === 'next-app-dir' ||
        packageName === 'vue3' ||
        // vue2 always works locally, but is
        packageName === 'vue2' ||
        packageName === 'nuxt3'
    );

    await page.goto(getEmbeddedServerURL('/columns', basePort));
    await page.frameLocator('iframe').getByText('Stack at tablet');

    await sendContentUpdateMessage(page, MODIFIED_COLUMNS);

    await expect(page.frameLocator('iframe').getByText(NEW_TEXT)).toBeVisible();
  });
});
