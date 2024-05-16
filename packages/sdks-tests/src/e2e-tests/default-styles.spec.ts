import { expect } from '@playwright/test';
import { excludeGen1, test } from '../helpers/index.js';

// is a subset - if this selector is there then others would've also been added
const DEFAULT_STYLES = `.builder-button {
  all: unset;
}
`;

test.describe('Default styles', () => {
  test('default styles should be present only once and not inside nested content', async ({
    page,
    packageName,
    sdk,
  }) => {
    // dont have .builder-button class
    test.skip(excludeGen1(sdk));
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
