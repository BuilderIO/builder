import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('TargetedPageSetAttributes Component', () => {
  test.beforeEach(async ({ context, packageName }) => {
    test.skip(!['gen1-react', 'react'].includes(packageName));
    await context.clearCookies();
    const page = await context.newPage();
    await page.goto('/targeted-page-set-attributes');
  });

  test('should render the No Targets page if there is no targeting', async ({ page }) => {
    await page.goto('/targeted-page-set-attributes');
    expect(await page.locator('h2').innerText()).toContain('No Targets');
  });

  test('should render the Recent Shopper page when attributes are set', async ({ page }) => {
    await page.goto('/targeted-page-set-attributes?target=set-attributes');
    expect(await page.locator('h2').innerText()).toContain('Recent Shopper');
  });
});
