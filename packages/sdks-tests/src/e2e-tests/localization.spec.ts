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
      packageName === 'react-native-74' || packageName === 'react-native-76-fabric'
        ? page.locator('img').first()
        : page.locator('.builder-image');
    await expect(text).toBeVisible();
    await expect(image).toHaveAttribute('src', HI_IN_IMAGE);
  });

  test('locale is not passed from the prop', async ({ page, sdk, packageName }) => {
    test.skip(sdk === 'solid', 'No errors are logged in preview mode for solid');
    test.skip(
      sdk === 'qwik' ||
        sdk === 'rsc' ||
        sdk === 'vue' ||
        packageName === 'sveltekit' ||
        packageName === 'react-sdk-next-pages',
      'Errors are only logged in the terminal not on browser'
    );

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

  test.only('localized bindings are processed correctly', async ({ page }) => {
    await page.goto('/localized-bindings');
    const text1 = page.locator('text=hi-IN title');
    await expect(text1).toBeVisible();
  });
});
