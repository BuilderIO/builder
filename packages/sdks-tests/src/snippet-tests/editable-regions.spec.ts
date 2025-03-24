import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Editable regions in custom components', () => {
  test('should render a div with two columns with builder-path attr', async ({
    page,
    packageName,
  }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'gen1-next15-app',
        'angular-19-ssr',
        'gen1-next14-pages',
      ].includes(packageName)
    );

    await page.goto('/editable-region');
    await page.waitForLoadState('networkidle');

    const divs = await page.$$('div[builder-path]');

    const count = divs.length;

    expect(count).toBe(2);
  });

  test('should render a div with two columns with placeholder text', async ({
    page,
    packageName,
  }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'gen1-next15-app',
        'angular-19-ssr',
        'gen1-next14-pages',
      ].includes(packageName)
    );

    await page.goto('/editable-region');

    const twoColumns = page.locator('div.builder-block').first();
    await expect(twoColumns).toBeVisible();

    const columnTexts = await twoColumns.textContent();
    expect(columnTexts).toContain('column 1 text');
    expect(columnTexts).toContain('column 2 text');
  });
});
