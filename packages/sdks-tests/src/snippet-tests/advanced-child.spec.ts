import { expect } from '@playwright/test';
import { findTextInPage, test, testClickAndVerifyVisibility } from '../helpers/index.js';

test.describe('Advanced child sub components', () => {
  test('Display two buttons with label Tab 1 and Tab 2', async ({ page, packageName }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'angular-19-ssr',
        'gen1-next14-pages',
        'gen1-next15-app',
        'nextjs-sdk-next-app',
      ].includes(packageName)
    );

    await page.goto('/advanced-child');

    await page.waitForSelector('button');

    const buttons = await page.$$('button');

    expect(buttons.length).toBeGreaterThan(0);

    const buttonTexts = await Promise.all(
      buttons.map(async button => {
        const text = await button.textContent();
        return text?.trim();
      })
    );

    expect(buttonTexts).toContain('Tab 1');
    expect(buttonTexts).toContain('Tab 2');
  });

  test('Display content for the clicked tab and hide the other', async ({ page, packageName }) => {
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

    await page.goto('/advanced-child');

    await page.waitForSelector('button:has-text("Tab 1")');
    await page.waitForSelector('button:has-text("Tab 2")');

    const Tab1ContentVisible = await testClickAndVerifyVisibility(page, 'Tab 1', 'Tab 1 Content');
    expect(Tab1ContentVisible).toBe(true);
    expect(await page.locator('div').filter({ hasText: 'Tab 2 content' }).isVisible()).toBeFalsy();

    const Tab2ContentVisible = await testClickAndVerifyVisibility(page, 'Tab 2', 'Tab 2 content');
    expect(Tab2ContentVisible).toBe(true);
    expect(await page.locator('div').filter({ hasText: 'Tab 1 Content' }).isVisible()).toBeFalsy();
  });

  test('Advanced child components work in preview mode with isPreviewing', async ({
    page,
    packageName,
  }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'angular-19-ssr',
        'gen1-next14-pages',
        'gen1-next15-app',
        'nextjs-sdk-next-app',
      ].includes(packageName)
    );

    await page.goto(
      '/advanced-child?builder.space=ee9f13b4981e489a9a1209887695ef2b&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=91744fcdc9f04bb8884a5f4c9feb0dc1&builder.overrides.91744fcdc9f04bb8884a5f4c9feb0dc1=91744fcdc9f04bb8884a5f4c9feb0dc1&builder.overrides.page:/advanced-child=91744fcdc9f04bb8884a5f4c9feb0dc1'
    );

    await page.waitForLoadState('networkidle');

    await findTextInPage({ page, text: 'advanced child draft' });
  });
});
