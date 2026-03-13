import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Div with Hero class, and text', () => {
  test('should render the page without 404', async ({ page, packageName }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'gen1-next15-app',
        'angular-19-ssr',
        'gen1-next14-pages',
        'nextjs-sdk-next-app',
      ].includes(packageName)
    );

    const response = await page.goto('/custom-child');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should verify builder-block with specific text', async ({ page, packageName }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'gen1-next15-app',
        'angular-19-ssr',
        'gen1-next14-pages',
        'nextjs-sdk-next-app',
      ].includes(packageName)
    );

    await page.goto('/custom-child');

    await page.waitForLoadState('networkidle');
    const builderBlock = page.locator('div.builder-block').first();
    await expect(builderBlock).toBeVisible();

    const componentText = page.locator('text=This is text from your component');
    await expect(componentText).toBeVisible();
  });
});
