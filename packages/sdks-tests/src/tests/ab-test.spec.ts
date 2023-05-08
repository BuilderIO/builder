import { targetContext } from './context.js';
import { findTextInPage, test } from './helpers.js';

test.describe(targetContext.name, () => {
  test.describe('A/B tests', () => {
    test('Render w/ SSR', async ({ page }) => {
      await page.goto('/ab-test');
      await findTextInPage({ page, text: 'default' });
    });
  });
});
