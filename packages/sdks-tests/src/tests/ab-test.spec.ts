import { targetContext } from './context.js';
import { expect } from '@playwright/test';
import { findTextInPage, test } from './helpers.js';

const CONTENT_ID = '1d326d78efb04ce38467dd8f5160fab6';
const VARIANT_ID = 'd50b5d04edf640f195a7c42ebdb159b2';

test.describe(targetContext.name, () => {
  test.describe('A/B tests', () => {
    test('Render default w/ SSR', async ({ page, context, baseURL }) => {
      await context.addCookies([
        {
          name: `builder.tests.${CONTENT_ID}`,
          value: CONTENT_ID,
          url: new URL(baseURL || 'http://localhost:3000').toString() + 'ab-test',
        },
      ]);
      await page.goto('/ab-test');

      const k = await page.evaluate(() => {
        return document.cookie.split(';');
      });

      await expect(page.locator('body')).not.toContainText('hello world variation 1');
      await findTextInPage({ page, text: 'default' });
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

      const k = await page.evaluate(() => {
        return document.cookie.split(';');
      });

      await expect(page.locator('body')).not.toContainText('default');
      await findTextInPage({ page, text: 'hello world variation 1' });
    });
  });
});
