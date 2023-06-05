import { expect } from '@playwright/test';
import { findTextInPage, isRNSDK, test } from './helpers.js';

const CONTENT_ID = '1d326d78efb04ce38467dd8f5160fab6';
const VARIANT_ID = 'd50b5d04edf640f195a7c42ebdb159b2';

const COOKIE_NAME = `${isRNSDK ? 'builderio.' : ''}builder.tests.${CONTENT_ID}`;
const SELECTOR = isRNSDK ? 'div[data-builder-content-id]' : 'div[builder-content-id]';

// Forbid retries as A/B tests are not deterministic, and we don't want to give any leeway to flakiness.
test.describe.configure({ retries: 0 });

test.describe('A/B tests', () => {
  const TRIES = 10;
  // loop 10 times to check for flakiness
  Array.from({ length: TRIES }).forEach((_, i) => {
    test(`#${i}/${TRIES}: Render default w/ SSR`, async ({ page, context, baseURL }) => {
      await context.addCookies([
        {
          name: COOKIE_NAME,
          value: CONTENT_ID,
          url: baseURL,
        },
      ]);

      await page.goto('/ab-test');

      await findTextInPage({ page, text: 'hello world default' });
      await expect(page.locator(SELECTOR, { hasText: 'hello world variation 1' })).toBeHidden();
    });

    test(`#${i}/${TRIES}: Render variant w/ SSR`, async ({ page, context, baseURL }) => {
      await context.addCookies([
        {
          name: COOKIE_NAME,
          value: VARIANT_ID,
          url: baseURL,
        },
      ]);

      await page.goto('/ab-test');

      await findTextInPage({ page, text: 'hello world variation 1' });
      await expect(page.locator(SELECTOR, { hasText: 'hello world default' })).toBeHidden();
    });
  });
});
