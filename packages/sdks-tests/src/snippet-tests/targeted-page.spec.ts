import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('TargetedPage Component', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(!['gen1-react', 'react'].includes(packageName));
    await page.goto('/targeted-page');
  });

  test('should render the Desktop page if there is no targeting', async ({ page }) => {
    await page.goto('/targeted-page');
    expect(await page.locator('h2').innerText()).toContain('Desktop');
  });

  test('should render the Desktop page with appropriate targeting', async ({ page }) => {
    await page.goto('/targeted-page?target=desktop');
    expect(await page.locator('h2').innerText()).toContain('Desktop');
  });

  test('should render the Mobile page with appropriate targeting', async ({ page }) => {
    await page.goto('/targeted-page?target=mobile');
    expect(await page.locator('h2').innerText()).toContain('Mobile');
  });

  test("should render the Men's Fashion page with appropriate targeting", async ({ page }) => {
    await page.goto('/targeted-page?target=mens-fashion');
    expect(await page.locator('h2').innerText()).toContain("Men's Fashion");
  });

  test('should render the Recent Shopper page with appropriate targeting included in array', async ({
    page,
  }) => {
    await page.goto('/targeted-page?target=multi-target');
    expect(await page.locator('h2').innerText()).toContain('Recent Shopper');
  });

  test('should render the Logged In page with appropriate boolean targeting', async ({ page }) => {
    await page.goto('/targeted-page?target=is-logged-in');
    expect(await page.locator('h2').innerText()).toContain('Logged');
  });
});
