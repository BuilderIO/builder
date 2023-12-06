import { expect } from '@playwright/test';
import { checkIfIsHydrationErrorMessage, findTextInPage, test } from './helpers.js';

/**
 * The only way to guarantee that hydration has completed is to interact with a page.
 * This is why, for all these tests, we click on a link,
 * and only then are we able to look at the console logs.
 */
test.describe.only('Hydration', () => {
  test('No mismatch on regular content', async ({ page }) => {
    const msgs: string[] = [];
    page.on('console', msg => {
      const originalText = msg.text();
      if (checkIfIsHydrationErrorMessage(originalText)) msgs.push(originalText);
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

  test('No mismatch on A/B test content', async ({ page }) => {
    const msgs: string[] = [];
    page.on('console', msg => {
      const originalText = msg.text();
      if (checkIfIsHydrationErrorMessage(originalText)) msgs.push(originalText);
    });

    await page.goto('/');
    await page.locator('a').first().click();
    await findTextInPage({ page, text: 'Stack at tablet' });

    await expect(msgs).toHaveLength(0);
  });
});
