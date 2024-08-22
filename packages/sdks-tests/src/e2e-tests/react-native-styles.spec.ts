import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('React Native - Strict Styles', () => {
  test('enabled', async ({ page, sdk }) => {
    test.skip(sdk !== 'reactNative', 'This is an RN SDK specific test');
    await page.goto('/react-native-strict-style-mode');

    const textWrapper = page.locator('div [data-testid="html"]').locator('..');

    // non-ignored style
    await expect(textWrapper).toHaveCSS('border-color', 'rgb(80, 227, 194)');

    // ignored style
    await expect(textWrapper).toHaveCSS('border-radius', '0px');
  });

  test('disabled', async ({ page, sdk }) => {
    test.skip(sdk !== 'reactNative', 'This is an RN SDK specific test');
    await page.goto('/react-native-strict-style-mode-disabled');

    const textWrapper = page.locator('div [data-testid="html"]').locator('..');

    // non-ignored style
    await expect(textWrapper).toHaveCSS('border-color', 'rgb(80, 227, 194)');

    // style that would be ignored by `strictStyleMode` prop
    await expect(textWrapper).toHaveCSS('border-radius', '50%');
  });
});
