import { expect } from '@playwright/test';
import { findTextInPage, test } from './helpers.js';

test.describe('Dynamic Content', () => {
  test('Data Bindings', async ({ page, packageName }) => {
    // Max call stack exceeded crash.
    test.fail(packageName === 'solid' || packageName === 'solid-start');

    await page.goto('/data-bindings');

    await expect(page.locator(`text="1234"`).first()).toBeVisible();
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

      await page.locator(`a[href="/static-url"]`).waitFor();
    });
    test('dynamic value', async ({ page }) => {
      await page.goto('/link-url');

      await page.locator(`a[href="/dynamic-url"]`).waitFor();
    });
  });
});
