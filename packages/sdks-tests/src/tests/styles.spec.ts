import { expect } from '@playwright/test';
import {
  excludeTestFor,
  expectStylesForElement,
  findTextInPage,
  getClassSelector,
  isRNSDK,
  test,
} from './helpers.js';

// RN SDK does not use ScrollView in Symbol
const FIRST_BLOCK_SYMBOL_SELECTOR = `${getClassSelector('builder-blocks')} > div`;

const FIRST_BLOCK_SELECTOR = isRNSDK
  ? // ScrollView adds an extra div wrapper
    `${getClassSelector('builder-blocks')} > div > div`
  : `${getClassSelector('builder-blocks')} > div`;

test.describe('Styles', () => {
  test('data-binding-styles', async ({ page }) => {
    await page.goto('/data-binding-styles');
    await expect(page.locator(`text="This text should be red..."`)).toHaveCSS(
      'color',
      'rgb(255, 0, 0)'
    );
  });

  test.describe('Style Bindings', () => {
    test('Content', async ({ page }) => {
      await page.goto('/content-bindings');

      const expected = {
        'border-top-left-radius': '10px',
        'border-top-right-radius': '22px',
        'border-bottom-left-radius': '40px',
        'border-bottom-right-radius': '30px',
      };

      const locator = page
        .locator(FIRST_BLOCK_SELECTOR)
        .filter({ hasText: 'Enter some text...' })
        .last();

      await expectStylesForElement({ expected, locator });
      // TODO: fix this
      // check the title is correct
      // title: 'some special title'
    });
    test('Symbol', async ({ page }) => {
      await page.goto('/symbol-bindings');

      const expected = {
        'border-top-left-radius': '10px',
        'border-top-right-radius': '220px',
        'border-bottom-left-radius': '30px',
        'border-bottom-right-radius': '40px',
      };
      const locator = page
        .locator(FIRST_BLOCK_SYMBOL_SELECTOR)
        .filter({ hasText: 'Enter some text...' })
        .last();

      await expectStylesForElement({ expected, locator });
      // TODO: fix this
      // check the title is correct
      // title: 'some special title'
    });
  });

  test('Should apply responsive styles correctly on tablet/mobile', async ({ page }) => {
    await page.goto('/columns');

    await findTextInPage({ page, text: 'Stack at tablet' });

    // switch to tablet view
    await page.setViewportSize({ width: 750, height: 1000 });

    // check that the 2nd photo has a margin-left of 0px
    // the desktop margin would typically be on its 3rd parent, except for React Native (4th)
    const locator = isRNSDK
      ? page.locator('img').nth(1).locator('..').locator('..').locator('..').locator('..')
      : page.locator('picture').nth(1).locator('..').locator('..').locator('..');

    await expect(locator).toHaveCSS('margin-left', '0px');
  });

  test('Should apply CSS nesting', async ({ page }) => {
    test.fail(
      excludeTestFor({
        // we don't support CSS nesting in RN.
        reactNative: true,
        // old React SDK should support CSS nesting, but it seems to not be implemented properly.
        oldReact: true,
      })
    );
    await page.goto('./css-nesting');

    const blueText = page.locator('text=blue');
    await expect(blueText).toHaveCSS('color', 'rgb(0, 0, 255)');

    const redText = page.locator('text=green');
    await expect(redText).toHaveCSS('color', 'rgb(65, 117, 5)');
  });
});
