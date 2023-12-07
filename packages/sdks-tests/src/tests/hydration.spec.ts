import { expect } from '@playwright/test';
import { checkIfIsHydrationErrorMessage, findTextInPage, test } from './helpers.js';

/**
 * The only way to guarantee that hydration has completed is to interact with a page.
 * This is why, for all these tests, we click on a link,
 * and only then are we able to look at the console logs.
 */
test.describe('Hydration', () => {
  test('No mismatch on regular content', async ({ page }) => {
    const msgs: string[] = [];
    page.on('console', msg => {
      const originalText = msg.text();
      if (checkIfIsHydrationErrorMessage(originalText)) msgs.push(originalText);
    });
    page.on('pageerror', webError => {
      const originalText = webError.message;
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
    page.on('pageerror', webError => {
      const originalText = webError.message;
      if (checkIfIsHydrationErrorMessage(originalText)) msgs.push(originalText);
    });

    await page.goto('/ab-test-interactive');
    await page.locator('a').locator('visible=true').first().click();
    await findTextInPage({ page, text: 'Stack at tablet' });

    await expect(msgs).toHaveLength(0);
  });
});
