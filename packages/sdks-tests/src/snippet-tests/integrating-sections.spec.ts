import { expect } from '@playwright/test';
import { findTextInPage, test } from '../helpers/index.js';

test.describe('Integrating Sections', () => {
  test('loads announcement bar at `/announcements`', async ({ page }) => {
    await page.goto('/announcements');

    await findTextInPage({ page, text: 'This is an announcement banner' });
  });

  test('loads announcement bar at `/announcements/hello`', async ({ page }) => {
    await page.goto('/announcements/hello');

    await findTextInPage({ page, text: 'This is an announcement banner' });
  });

  test('does not load announcement bar at `/announcements/foo`', async ({ page }) => {
    await page.goto('/announcements/foo');

    await expect(page.locator('div')).not.toHaveText('This is an announcement banner');
    await findTextInPage({ page, text: 'Announcement Bar not Found' });
  });
});
