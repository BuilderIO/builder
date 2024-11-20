import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Div with Hero class, and text', () => {
  test('should render the page without 404', async ({ page, packageName }) => {
    test.skip(!['react', 'angular', 'angular-ssr', 'gen1-remix'].includes(packageName));

    const response = await page.goto('/custom-child');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should verify builder-block with specific text', async ({ page, packageName }) => {
    test.skip(!['react', 'angular', 'angular-ssr'].includes(packageName));

    await page.goto('/custom-child');

    const builderBlock = page.locator('div.builder-block').first();
    await expect(builderBlock).toBeVisible();

    const childDivs = builderBlock.locator('div');

    const inlineStyledDiv = childDivs.nth(0);
    await expect(inlineStyledDiv).toBeVisible();

    const inlineText = await inlineStyledDiv.textContent();
    expect(inlineText?.trim()).toBe("This is your component's text");

    const builderTextDiv = childDivs.nth(1);
    await expect(builderTextDiv).toBeVisible();

    const builderText = await builderTextDiv.textContent();
    expect(builderText?.trim()).toBe('This is Builder text');
  });

  test('should verify builder-block with specific text in gen1-remix', async ({
    page,
    packageName,
  }) => {
    test.skip(!['gen1-remix'].includes(packageName));

    await page.goto('/custom-child');
    await page.waitForLoadState('networkidle');

    const builderBlock = page.locator('div.builder-block').first();
    await expect(builderBlock).toBeVisible();

    const column1Text = page.locator("text=This is your component's text");
    await expect(column1Text).toBeVisible();

    const column2Text = page.locator('text=This is Builder text');
    await expect(column2Text).toBeVisible();
  });
});
