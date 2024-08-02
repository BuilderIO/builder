import { expect } from '@playwright/test';
import { MODIFIED_COLUMNS } from '../specs/columns.js';
import { MODIFIED_EDITING_STYLES } from '../specs/editing-styles.js';
import { NEW_TEXT } from '../specs/helpers.js';
import { MODIFIED_HOMEPAGE } from '../specs/homepage.js';
import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk, sendContentUpdateMessage } from '../helpers/visual-editor.js';

const editorTests = ({ noTrustedHosts }: { noTrustedHosts: boolean }) => {
  test('correctly updates Text block', async ({ page, basePort, packageName }) => {
    test.skip(
      packageName === 'react-native' ||
        packageName === 'nextjs-sdk-next-app' ||
        packageName === 'gen1-next' ||
        packageName === 'gen1-react' ||
        packageName === 'gen1-remix'
    );

    await launchEmbedderAndWaitForSdk({
      path: noTrustedHosts ? '/no-trusted-hosts' : '/',
      basePort,
      page,
    });
    await sendContentUpdateMessage({ page, newContent: MODIFIED_HOMEPAGE, model: 'page' });
    await expect(page.frameLocator('iframe').getByText(NEW_TEXT)).toBeVisible();
  });

  test('correctly updates Text block styles', async ({ page, packageName, basePort }) => {
    test.skip(
      packageName === 'react-native' ||
        packageName === 'nextjs-sdk-next-app' ||
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

    await sendContentUpdateMessage({ page, newContent: MODIFIED_EDITING_STYLES, model: 'page' });
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
        packageName === 'nextjs-sdk-next-app' ||
        packageName === 'gen1-next' ||
        packageName === 'gen1-react' ||
        packageName === 'gen1-remix'
    );

    await launchEmbedderAndWaitForSdk({ path: '/columns', basePort, page });
    await sendContentUpdateMessage({ page, newContent: MODIFIED_COLUMNS, model: 'page' });
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
      await sendContentUpdateMessage({
        page,
        newContent: {
          data: { name: 'Anchored Coffee', info: 'Another coffee brand.' },
        },
        model: 'coffee',
      });
      await page.frameLocator('iframe').getByText('coffee name: Anchored Coffee').waitFor();
      await page.frameLocator('iframe').getByText('coffee info: Another coffee brand.').waitFor();
    });
  });
});
