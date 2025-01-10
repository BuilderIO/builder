import { expect, type Page } from '@playwright/test';
import { test } from '../helpers/index.js';

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
      color: 'rgb(0, 128, 0)',
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
  const colors = ['rgb(255, 254, 234)', 'rgb(255, 240, 223)', 'rgb(252, 241, 255)'];
  expect(cards.length).toBe(3);
  for (let i = 0; i < cards.length; i++) {
    const title = await cards[i].locator('h2[custom-card-title]').innerText();
    expect(title).toBe(`Card title ${i + 1}`);
    await expect(cards[i]).toHaveCSS('background-color', colors[i]);
  }
};

test.describe.only('Angular noWrap', () => {
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

    const card = page.locator('div[custom-card]').first();
    const isCardParentInteractiveElement = await card.evaluate(child => {
      return (
        child.parentElement && child.parentElement.tagName.toLowerCase() === 'interactive-element'
      );
    });
    expect(isCardParentInteractiveElement).toBe(true);

    const button = page.locator('button[custom-button]').first();
    const isButtonParentInteractiveElement = await button.evaluate(child => {
      return (
        child.parentElement && child.parentElement.tagName.toLowerCase() === 'interactive-element'
      );
    });
    expect(isButtonParentInteractiveElement).toBe(true);
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
  test('correctly works with event bindings', async ({ page, sdk }) => {
    test.skip(!['angular'].includes(sdk));
    await page.goto('/custom-components-nowrap');

    const incrementButton = page.locator('text=increment');
    await incrementButton.click();
    await expect(page.locator('text=Count: 2')).toBeVisible();

    const decrementButton = page.locator('text=decrement');
    await decrementButton.click();
    await expect(page.locator('text=Count: 1')).toBeVisible();
  });
});
