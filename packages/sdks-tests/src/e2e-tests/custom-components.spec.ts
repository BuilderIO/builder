import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

const HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE =
  'BUILDER_EVENT: builder.registerComponent Component name: Hello';

test.describe('Custom components', () => {
  test('correctly renders custom component', async ({ page, packageName, sdk }) => {
    test.skip(!['angular', 'react'].includes(sdk));
    test.skip(['react-sdk-next-app', 'remix', 'hydrogen'].includes(packageName));
    await page.goto('/custom-components');
    const helloWorldText = page.locator('text=hello World').first();
    await expect(helloWorldText).toBeVisible();
  });

  test('correctly captures registering of custom component', async ({
    page,
    basePort,
    packageName,
    sdk,
  }) => {
    test.skip(!['angular', 'react'].includes(sdk));
    test.skip(['react-sdk-next-app', 'remix', 'hydrogen'].includes(packageName));
    const customComponentMsgPromise = page.waitForEvent('console', msg =>
      msg.text().includes(HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE)
    );
    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/custom-components',
    });
    await customComponentMsgPromise;
  });

  test('do not show component in `page` model when restricted to `test-model`', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));
    await page.goto('/custom-components-models-not-show');
    await expect(page.locator('text=hello World').first()).not.toBeVisible();
  });

  test('show component in `test-model` model when restricted to `test-model`', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));
    await page.goto('/custom-components-models-show');
    await expect(page.locator('text=hello World').first()).toBeVisible();
  });
});
