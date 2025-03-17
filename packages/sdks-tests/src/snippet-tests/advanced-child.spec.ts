import { expect } from '@playwright/test';
import { test, testClickAndVerifyVisibility } from '../helpers/index.js';

test.describe('Advanced child sub components', () => {
  test('Display two buttons with label Tab 1 and Tab 2', async ({ page, packageName }) => {
    test.skip(
      !['react', 'angular-16', 'angular-16-ssr', 'gen1-remix', 'gen1-react', 'hydrogen', 'qwik-city'].includes(
        packageName
      )
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

      !['react', 'angular-16', 'angular-16-ssr', 'gen1-remix', 'gen1-react', 'hydrogen', 'qwik-city'].includes(
        packageName
      )
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
});
