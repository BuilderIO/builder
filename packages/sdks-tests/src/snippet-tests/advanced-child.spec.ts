import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Advanced child sub components', () => {
  test('Display two buttons with label Tab 1 and Tab 2', async ({ page, packageName }) => {
    test.skip(!['react', 'angular', 'angular-ssr', 'gen1-remix'].includes(packageName));

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
    test.skip(!['react', 'angular', 'angular-ssr', 'gen1-remix'].includes(packageName));

    await page.goto('/advanced-child');

    await page.waitForSelector('button:has-text("Tab 1")');
    await page.waitForSelector('button:has-text("Tab 2")');

    await page.click('button:has-text("Tab 1")');

    const tab1Content = await page.waitForSelector('div:has-text("Tab 1 Content")', {
      state: 'visible',
    });
    expect(await tab1Content.isVisible()).toBe(true);

    const tab2ContentHidden = await page.$('div:has-text("Tab 2 content")');
    expect((await tab2ContentHidden?.isVisible()) ?? false).toBe(false);

    await page.click('button:has-text("Tab 2")');
    const tab2Content = await page.waitForSelector('div:has-text("Tab 2 content")', {
      state: 'visible',
    });
    expect(await tab2Content.isVisible()).toBe(true);

    const tab1ContentHidden = await page.$('div:has-text("Tab 1 Content")');
    expect((await tab1ContentHidden?.isVisible()) ?? false).toBe(false);
  });
});
