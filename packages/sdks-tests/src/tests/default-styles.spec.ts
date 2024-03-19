import { expect } from '@playwright/test';
import { EXCLUDE_GEN_1, test } from './helpers.js';

// is a subset - if this selector is there then others would've also been added
const DEFAULT_STYLES = `.builder-button {
  all: unset;
}
`;

test.describe('Default styles', () => {
  test('default styles should be present only once and not inside nested content', async ({
    page,
    packageName,
  }) => {
    // dont have .builder-button class
    test.skip(EXCLUDE_GEN_1);
    test.fail(packageName === 'react-native');
    await page.goto('/default-styles');

    const allStyleTags = await page.evaluate(() => {
      const styleElements = Array.from(document.querySelectorAll('style'));
      return styleElements.map(style => style.textContent);
    });

    let count = 0;

    for (const style of allStyleTags) {
      if (style?.includes(DEFAULT_STYLES)) {
        count++;
      }
    }

    expect(count).toBe(1);
  });

  test('button should have default styles', async ({ page, packageName }) => {
    test.fail(packageName === 'react-native');

    await page.goto('/default-styles');
    const button = page.locator('text=Click me!');

    const buttonPaddingTop = await button?.evaluate(
      element => getComputedStyle(element).paddingTop
    );
    const buttonPaddingRight = await button?.evaluate(
      element => getComputedStyle(element).paddingRight
    );
    const buttonPaddingBottom = await button?.evaluate(
      element => getComputedStyle(element).paddingBottom
    );
    const buttonPaddingLeft = await button?.evaluate(
      element => getComputedStyle(element).paddingLeft
    );

    expect(buttonPaddingTop).toBe('15px');
    expect(buttonPaddingRight).toBe('25px');
    expect(buttonPaddingBottom).toBe('15px');
    expect(buttonPaddingLeft).toBe('25px');
  });
});
