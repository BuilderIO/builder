import { expect } from '@playwright/test';
import { checkIfIsHydrationErrorMessage, findTextInPage, test } from './helpers.js';

test.describe('Hydration', () => {
  /**
   * The only way to guarantee that hydration has completed is to interact with a page.
   * This is why we click on a link, and then are able to look at the console logs.
   *
   */
  test('No mismatch', async ({ page }) => {
    const msgs: string[] = [];
    page.on('console', msg => {
      const originalText = msg.text();
      checkIfIsHydrationErrorMessage(originalText) && msgs.push(originalText);
    });

    await page.goto('/');

    const links = page.locator('a');

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    await columnsLink.click();
    await findTextInPage({ page, text: 'Stack at tablet' });

    await expect(msgs).toHaveLength(0);
  });
});
