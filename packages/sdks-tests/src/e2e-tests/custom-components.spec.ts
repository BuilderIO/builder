import { expect, type Page } from '@playwright/test';
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

const testNoWrapPage = async (page: Page) => {
  await page.goto('/custom-components-nowrap');

  const buttonsStyles = [
    {
      text: 'RED BUTTON',
      color: 'rgb(255, 0, 0)',
    },
    {
      text: 'BLUE BUTTON',
      color: 'rgb(0, 0, 255)',
    },
    {
      text: 'GREEN BUTTON',
      color: 'rgb(0, 255, 0)',
    },
    {
      text: 'YELLOW BUTTON',
      color: 'rgb(255, 255, 0)',
    },
  ];

  const buttons = await page.locator('button[custom-button]').all();
  expect(buttons.length).toBe(6);
  for (let i = 2; i < 6; i++) {
    const buttonEl = buttons[i];
    await expect(buttonEl).toBeVisible();
    await expect(buttonEl).toHaveCSS('background-color', buttonsStyles[i - 2].color);
  }

  const cards = await page.locator('div[custom-card]').all();
  const colors = ['rgba(255, 254, 234, 1)', 'rgba(255, 240, 223, 1)', 'rgba(252, 241, 255, 1)'];
  expect(cards.length).toBe(3);
  for (let i = 0; i < cards.length; i++) {
    const title = await cards[i].locator('div[custom-card-title]').textContent();
    expect(title).toBe(`Card title ${i + 1}`);
    await expect(cards[i]).toHaveCSS('background-color', colors[i]);
  }
};

test.describe('Angular noWrap', () => {
  test('correctly renders', async ({ page, sdk }) => {
    test.skip(!['angular'].includes(sdk));

    await testNoWrapPage(page);
  });
  test('correctly ssrs', async ({ browser, packageName }) => {
    test.skip(!['angular-ssr'].includes(packageName));

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await testNoWrapPage(page);
  });
  test('style values are applied to the direct child element', async ({ page, sdk }) => {
    test.skip(!['angular'].includes(sdk));

    await page.goto('/custom-components-nowrap');

    const cards = await page.locator('div[custom-card]').all();
    const buttons = await page.locator('button').all();

    for (let i = 0; i < cards.length; i++) {
      const parent = cards[i].locator('xpath=..');
      await expect(parent).toHaveClass(/interactive-element/);
    }

    for (let i = 0; i < buttons.length; i++) {
      const parent = buttons[i].locator('xpath=..');
      await expect(parent).toHaveClass(/interactive-element/);
    }
  });
  test('border radius is applied to the card itself', async ({ page, sdk }) => {
    test.skip(!['angular'].includes(sdk));
    await page.goto('/custom-components-nowrap');
    const cards = await page.locator('div[custom-card]').all();

    const borderRadiuses = [
      '4px', // set in the custom component
      // set in the VE
      '50px',
      '20px',
    ];

    expect(cards.length).toBe(3);
    for (let i = 0; i < cards.length; i++) {
      await expect(cards[i]).toHaveCSS('border-radius', borderRadiuses[i]);
    }
  });
  test('correctly works with event bindings', async ({ page }) => {
    await page.goto('/custom-components-nowrap');

    const incrementButton = page.locator('text=increment');
    await incrementButton.click();
    await expect(page.locator('text=Count: 2')).toBeVisible();

    const decrementButton = page.locator('text=decrement');
    await decrementButton.click();
    await expect(page.locator('text=Count: 1')).toBeVisible();
  });
});
