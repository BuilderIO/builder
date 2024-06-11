import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

const HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE =
  'BUILDER_EVENT: builder.registerComponent Component name: Hello';

test.describe('Custom components', () => {
  test('correctly renders custom component', async ({ page, packageName, sdk }) => {
    test.skip(!['angular', 'react'].includes(sdk));
    test.skip(['next-app-dir-client', 'remix', 'hydrogen'].includes(packageName));
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
    test.skip(['next-app-dir-client', 'remix', 'hydrogen'].includes(packageName));
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
});
