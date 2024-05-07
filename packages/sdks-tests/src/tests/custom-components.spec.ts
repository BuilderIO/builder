import { expect } from '@playwright/test';
import { excludeTestFor, test } from './helpers/index.js';
import { launchEmbedderAndWaitForSdk } from './helpers/visual-editor.js';

const HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE =
  'BUILDER_EVENT: builder.registerComponent Component name: Hello';

test.describe('Custom components', () => {
  test('correctly renders custom component', async ({ page }) => {
    test.skip(
      !excludeTestFor({
        angular: true,
        react: true,
      })
    );
    await page.goto('/custom-components');
    const helloWorldText = page.locator('text=hello World').first();
    await expect(helloWorldText).toBeVisible();
  });

  test('correctly captures registering of custom component', async ({ page, basePort }) => {
    test.skip(
      !excludeTestFor({
        angular: true,
        react: true,
      })
    );
    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/custom-components',
      messageCondition: msg => msg.text().includes(HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE),
    });
  });
});
