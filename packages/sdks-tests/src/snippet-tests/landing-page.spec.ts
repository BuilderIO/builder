import { findTextInPage, test } from '../helpers/index.js';

test.describe('Landing Page for Angular', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(!['angular-17-ssr'].includes(packageName));
    // Navigate to the product editorial page
    await page.goto('/landing-page-integrating-pages');
  });

  test('loads landing-page', async ({ page }) => {
    await findTextInPage({ page, text: 'Landing page' });
  });
});
