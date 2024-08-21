import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe.only('React Native Styles', () => {
  test('Strict Style Mode ignores styles', async ({ page, sdk }) => {
    test.skip(sdk !== 'reactNative', 'This is an RN SDK specific test');
    await page.goto('/react-native-strict-style-mode');

    const textHtmlElRoot = page.locator('[data-testid="html"]');
    const textWrapper = page.locator('div').filter({ has: textHtmlElRoot });

    // non-ignored style
    await expect(textWrapper).toHaveCSS('borderColor', 'rgba(80, 227, 194, 1)');

    // ignored style
    await expect(textWrapper).toHaveCSS('borderRadius', '0px');
  });

  test('Strict Style Mode ignores styles', async ({ page, sdk }) => {
    test.skip(sdk !== 'reactNative', 'This is an RN SDK specific test');
    await page.goto('/react-native-strict-style-mode-disabled');

    const textHtmlElRoot = page.locator('[data-testid="html"]');
    const textWrapper = page.locator('div').filter({ has: textHtmlElRoot });

    // non-ignored style
    await expect(textWrapper).toHaveCSS('borderColor', 'rgba(80, 227, 194, 1)');

    // style that would be ignored by `isStrictStyleMode` prop
    await expect(textWrapper).toHaveCSS('borderRadius', '50%');
  });
});
