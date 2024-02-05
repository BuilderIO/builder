import { expect, type Page } from '@playwright/test';
import { MODIFIED_COLUMNS } from '../specs/columns.js';
import { MODIFIED_EDITING_STYLES } from '../specs/editing-styles.js';
import { NEW_TEXT } from '../specs/helpers.js';
import { MODIFIED_HOMEPAGE } from '../specs/homepage.js';
import type { BuilderContent } from '../specs/types.js';
import { EMBEDDER_PORT, SDK_LOADED_MSG } from './context.js';
import { test } from './helpers.js';

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

const editorTests = ({ noTrustedHosts }: { noTrustedHosts: boolean }) => {
  test('correctly updates Text block', async ({ page, basePort, packageName }) => {
    test.skip(
      packageName === 'react-native' ||
        packageName === 'next-app-dir' ||
        packageName === 'gen1-next' ||
        packageName === 'gen1-react' ||
        packageName === 'gen1-remix'
    );

    await launchEmbedderAndWaitForSdk({
      path: noTrustedHosts ? '/no-trusted-hosts' : '/',
      basePort,
      page,
    });
    await sendContentUpdateMessage(page, MODIFIED_HOMEPAGE);
    await expect(page.frameLocator('iframe').getByText(NEW_TEXT)).toBeVisible();
  });

  test('correctly updates Text block styles', async ({ page, packageName, basePort }) => {
    test.skip(
      packageName === 'react-native' ||
        packageName === 'next-app-dir' ||
        packageName === 'gen1-next' ||
        packageName === 'gen1-react' ||
        packageName === 'gen1-remix'
    );

    await launchEmbedderAndWaitForSdk({
      path: noTrustedHosts ? '/editing-styles-no-trusted-hosts' : '/editing-styles',
      basePort,
      page,
    });
    const btn1 = page.frameLocator('iframe').getByRole('link');
    await expect(btn1).toHaveCSS('background-color', 'rgb(184, 35, 35)');

    await sendContentUpdateMessage(page, MODIFIED_EDITING_STYLES);
    const btn = page.frameLocator('iframe').getByRole('link');
    await expect(btn).toHaveCSS('background-color', 'rgb(19, 67, 92)');
  });
};

test.describe('Visual Editing', () => {
  editorTests({ noTrustedHosts: false });
  test('correctly updates Text block in a Column block', async ({
    page,
    basePort,
    packageName,
  }) => {
    test.skip(
      packageName === 'react-native' ||
        packageName === 'next-app-dir' ||
        packageName === 'gen1-next' ||
        packageName === 'gen1-react' ||
        packageName === 'gen1-remix'
    );

    await launchEmbedderAndWaitForSdk({ path: '/columns', basePort, page });
    await sendContentUpdateMessage(page, MODIFIED_COLUMNS);
    await page.frameLocator('iframe').getByText(NEW_TEXT).waitFor();
  });
  test.describe('fails for empty trusted hosts', () => {
    test.fail();
    editorTests({ noTrustedHosts: true });
  });

  test.describe('Data Models', () => {
    test('correctly updates', async ({ page, packageName, basePort }) => {
      test.skip(packageName !== 'react', 'This test is only implemented for React');

      await launchEmbedderAndWaitForSdk({ path: '/data-preview', basePort, page });

      await page.frameLocator('iframe').getByText('coffee name: Epoch Chemistry').waitFor();
      await page.frameLocator('iframe').getByText('coffee info: Local coffee brand.').waitFor();
      await sendContentUpdateMessage(page, {
        data: { name: 'Anchored Coffee', info: 'Another coffee brand.' },
      });
      await page.frameLocator('iframe').getByText('coffee name: Anchored Coffee').waitFor();
      await page.frameLocator('iframe').getByText('coffee info: Another coffee brand.').waitFor();
    });
  });
});
