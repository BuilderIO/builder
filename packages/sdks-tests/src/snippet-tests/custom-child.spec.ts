import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Div with Hero class, background, and text', () => {
  test('should render the page without 404', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    const response = await page.goto('/custom-child');
    expect(response?.status()).toBeLessThan(400);
  });

  test('contain a div with class "Hero', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/custom-child');

    const hero = page.locator('.Hero');
    await hero.waitFor();
    await expect(hero).toBeVisible();
  });

  test('contain a div under the div with Hero with background color', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/custom-child');

    const hero = page.locator('.Hero');
    await hero.waitFor();
    await expect(hero).toBeVisible();

    const backgroundDiv = hero.locator('div').first();
    await backgroundDiv.waitFor();
    await expect(backgroundDiv).toBeVisible();

    const backgroundColor = await backgroundDiv.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(backgroundColor).toBeTruthy();
  });

  test('Display the Hero text', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/custom-child');

    const hero = page.locator('.Hero');
    await hero.waitFor();
    await expect(hero).toBeVisible();

    const textDiv = hero.locator('div.builder-text:has-text("Im a Builder Hero Text")').first();

    await expect(textDiv).toBeVisible();

    const text = await textDiv.textContent();
    expect(text?.trim()).toBe('Im a Builder Hero Text');
  });
});
