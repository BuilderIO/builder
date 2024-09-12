import { expect } from '@playwright/test';
import { findTextInPage, test } from '../helpers/index.js';

test.describe('Integrating Sections', () => {
  test('loads announcement bar at `/announcements/hello`', async ({ page }) => {
    await page.goto('/announcements/hello');

    await findTextInPage({ page, text: 'This is an announcement banner' });
    await findTextInPage({ page, text: 'The rest of your page goes here' });
  });

  test('does not load announcement bar at `/announcements/foo`', async ({ page }) => {
    await page.goto('/announcements/foo');

    await expect(page.locator('body')).not.toHaveText('This is an announcement banner');

    await findTextInPage({ page, text: 'The rest of your page goes here' });
  });

  test('rest of the content is always present', async ({ page }) => {
    const routes = ['/announcements/hello', '/announcements/foo'];

    for (const route of routes) {
      await page.goto(route);
      await findTextInPage({ page, text: 'The rest of your page goes here' });
    }
  });
});
