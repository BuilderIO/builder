import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import { HI_IN_IMAGE, HI_IN_TEXT } from '../specs/localization.js';

const LOCALE_WARNING =
  '[Builder.io] In order to use localized fields in Builder, you must pass a locale prop to the BuilderComponent';

test.describe('Localization', () => {
  test('locale is passed from the prop', async ({ page, packageName }) => {
    await page.goto('/localization-locale-passed');
    const text = page.locator(`text=${HI_IN_TEXT}`);
    const image =
      packageName === 'react-native' ? page.locator('img').first() : page.locator('.builder-image');
    await expect(text).toBeVisible();
    await expect(image).toHaveAttribute('src', HI_IN_IMAGE);
  });

  test('locale is not passed from the prop', async ({ page }) => {
    const msgPromise = page.waitForEvent('console', msg => msg.text().includes(LOCALE_WARNING));

    await page.goto('/localization-locale-not-passed');

    await msgPromise;
  });

  test('subfields to resolve to correct localized value when locale is passed', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react', 'gen1-react'].includes(packageName));
    await page.goto('/localization-subfields');

    const text1 = page.locator('text=namaste');
    const text2 = page.locator('text=duniya');

    await expect(text1).toBeVisible();
    await expect(text2).toBeVisible();
  });
});
