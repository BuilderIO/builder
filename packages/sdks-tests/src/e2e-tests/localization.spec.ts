import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import { HI_IN_IMAGE, HI_IN_TEXT } from '../specs/localization.js';

const LOCALE_WARNING =
  '[Builder.io] In order to use localized fields in Builder, you must pass a locale prop to the BuilderComponent';

test.describe('Localization', () => {
  test('locale is passed from the prop', async ({ page }) => {
    await page.goto('/localization-locale-passed');
    const text = page.locator(`text=${HI_IN_TEXT}`);
    const src = await page.locator('.builder-image')?.getAttribute('src');
    await expect(text).toBeVisible();
    expect(src).toBe(HI_IN_IMAGE);
  });

  test('locale is not passed from the prop', async ({ page }) => {
    await page.goto('/localization-locale-not-passed');

    await page.waitForEvent('console', event => {
      return event.args().some(arg => arg.toString().includes(LOCALE_WARNING));
    });
  });
});
