import { expect } from '@playwright/test';
import { EXCLUDE_GEN_1, excludeTestFor, test } from './helpers/index.js';

// is a subset - if this selector is there then others would've also been added
const DEFAULT_STYLES = `.builder-button {
  all: unset;
}
`;

test.describe('Default styles', () => {
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
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
      element => getComputedStyle(element).paddingTop,
      null,
      { timeout: 10000 }
    );
    const buttonPaddingRight = await button?.evaluate(
      element => getComputedStyle(element).paddingRight,
      null,
      { timeout: 10000 }
    );
    const buttonPaddingBottom = await button?.evaluate(
      element => getComputedStyle(element).paddingBottom,
      null,
      { timeout: 10000 }
    );
    const buttonPaddingLeft = await button?.evaluate(
      element => getComputedStyle(element).paddingLeft,
      null,
      { timeout: 10000 }
    );

    expect(buttonPaddingTop).toBe('15px');
    expect(buttonPaddingRight).toBe('25px');
    expect(buttonPaddingBottom).toBe('15px');
    expect(buttonPaddingLeft).toBe('25px');
  });
});
