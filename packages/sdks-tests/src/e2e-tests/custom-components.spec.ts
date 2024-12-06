import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

const HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE =
  'BUILDER_EVENT: builder.registerComponent Component name: Hello';
const LAST_COMPONENT_REGISTERED_MESSAGE =
  'BUILDER_EVENT: builder.registerComponent Component name: BuilderBlockWithClassName';

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
      sdk,
    });
    await customComponentMsgPromise;
  });

  test('children placement is correct', async ({ page, sdk }) => {
    test.skip(!['angular'].includes(sdk));
    await page.goto('/children-slot-placement');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1.locator('text=inside an h1').first()).toBeVisible();
  });

  test('children content are ssred', async ({ browser, packageName }) => {
    test.skip(!['angular-ssr'].includes(packageName));

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/children-slot-placement');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1.locator('text=inside an h1').first()).toBeVisible();
  });

  test('do not register component in `page` model when restricted to `test-model`', async ({
    page,
    basePort,
    packageName,
    sdk,
  }) => {
    test.skip(!['react'].includes(packageName));
    const consoleMessages: string[] = [];
    const customComponentMsgPromise = page.waitForEvent('console', msg => {
      consoleMessages.push(msg.text());
      return msg.text().includes(LAST_COMPONENT_REGISTERED_MESSAGE);
    });
    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/custom-components-models-not-show',
      sdk,
    });
    await customComponentMsgPromise;
    expect(consoleMessages).not.toContain(HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE);
  });

  test('register component in `test-model` model when restricted to `test-model`', async ({
    page,
    basePort,
    packageName,
    sdk,
  }) => {
    test.skip(!['react'].includes(packageName));
    const customComponentMsgPromise = page.waitForEvent('console', msg =>
      msg.text().includes(HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE)
    );
    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/custom-components-models-show',
      sdk,
    });
    await customComponentMsgPromise;
  });
  test('do not render component in `page` model when restricted to `test-model`', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));
    await page.goto('/custom-components-models-not-show');
    await expect(page.locator('text=hello World').first()).not.toBeVisible();
  });

  test('render component in `test-model` model when restricted to `test-model`', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));
    await page.goto('/custom-components-models-show');
    await expect(page.locator('text=hello World').first()).toBeVisible();
  });

  test('component receives a registered component if its restricted to a model', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/custom-components-models-show');

    const selector = page.locator('#component-needs-hello');
    await expect(selector).toContainText('object');
  });

  test('component does not receive a registered component if its restricted to a model', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/custom-components-models-not-show');

    const selector = page.locator('#component-needs-hello');
    await expect(selector).toContainText('undefined');
  });
});
