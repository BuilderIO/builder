import { expect } from '@playwright/test';
import { excludeTestFor, findTextInPage, test } from './helpers/index.js';

test.describe('Dynamic Content', () => {
  test('Data Bindings', async ({ page }) => {
    test.skip(
      excludeTestFor({ angular: true }),
      'Data bindings are not working in Angular -- loads forever so skipping for now'
    );
    await page.goto('/data-bindings');

    await expect(page.locator(`text="1234"`).first()).toBeVisible({ timeout: 10000 });
    await findTextInPage({
      page,
      text: 'The Hot Wheels™ Legends Tour is Back',
    });
    await findTextInPage({
      page,
      text: 'Mattel Certified by Great Place to Work and Named to Fast Company’s List of 100 Best Workplaces for Innovators',
    });
  });

  test.describe('Link URL', () => {
    test('static value', async ({ page }) => {
      await page.goto('/link-url');

      await page.locator(`a[href="/static-url"]`).waitFor({ timeout: 10000 });
    });
    test('dynamic value', async ({ page }) => {
      await page.goto('/link-url');

      await page.locator(`a[href="/dynamic-url"]`).waitFor({ timeout: 10000 });
    });
  });
});
