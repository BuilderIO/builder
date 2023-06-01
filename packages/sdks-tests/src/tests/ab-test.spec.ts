import { expect } from '@playwright/test';
import { findTextInPage, test } from './helpers.js';

const CONTENT_ID = '1d326d78efb04ce38467dd8f5160fab6';
const VARIANT_ID = 'd50b5d04edf640f195a7c42ebdb159b2';

// Forbid retries as A/B tests are not deterministic, and we don't want to give any leeway to flakiness.
test.describe.configure({ retries: 0 });

test.describe('A/B tests', () => {
  test('Render default w/ SSR', async ({ page, context, baseURL }) => {
    await context.addCookies([
      {
        name: `builder.tests.${CONTENT_ID}`,
        value: CONTENT_ID,
        url: new URL(baseURL!).toString() + 'ab-test',
      },
    ]);
    await page.goto('/ab-test');

    await findTextInPage({ page, text: 'hello world default' });
    await expect(
      page.locator('div[builder-content-id]', { hasText: 'hello world variation 1' })
    ).toBeHidden();
  });

  test('Render variant w/ SSR', async ({ page, context, baseURL }) => {
    await context.addCookies([
      {
        name: `builder.tests.${CONTENT_ID}`,
        value: VARIANT_ID,
        url: new URL(baseURL || 'http://localhost:3000').toString() + '/ab-test',
      },
    ]);
    await page.goto('/ab-test');

    await findTextInPage({ page, text: 'hello world variation 1' });
    await expect(
      page.locator('div[builder-content-id]', { hasText: 'hello world default' })
    ).toBeHidden();
  });
});
