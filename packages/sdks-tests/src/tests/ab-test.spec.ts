import type { Browser } from '@playwright/test';
import { expect } from '@playwright/test';
import { findTextInPage, isRNSDK, test } from './helpers.js';

const CONTENT_ID = '1d326d78efb04ce38467dd8f5160fab6';
const VARIANT_ID = 'd50b5d04edf640f195a7c42ebdb159b2';

const COOKIE_NAME = `builder.tests.${CONTENT_ID}`;
const SELECTOR = isRNSDK ? 'div[data-builder-content-id]' : 'div[builder-content-id]';

const createContextWithCookies = async ({
  cookies,
  baseURL,
  browser,
}: {
  browser: Browser;
  baseURL: string;
  cookies: { name: string; value: string }[];
}) => {
  const context = await browser.newContext({
    storageState: isRNSDK
      ? {
          origins: [
            {
              origin: new URL(baseURL).origin,
              localStorage: cookies.map(({ name, value }) => ({
                name: `builderio.${name}`,
                value: JSON.stringify({
                  rawData: { value },
                  // add long expiry
                  expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10,
                }),
              })),
            },
          ],
          cookies: [],
        }
      : {
          cookies: cookies.map(cookie => {
            const newCookie = {
              name: cookie.name,
              value: cookie.value,
              // this is valid but types seem to be mismatched.
              url: baseURL,
            } as any;
            return newCookie;
          }),
          origins: [],
        },
  });

  return context;
};

// Forbid retries as A/B tests are not deterministic, and we don't want to give any leeway to flakiness.
test.describe.configure({ retries: 0 });

test.describe('A/B tests', () => {
  const TRIES = 10;
  // loop 10 times to check for flakiness
  Array.from({ length: TRIES }).forEach((_, i) => {
    test(`#${i}/${TRIES}: Render default w/ SSR`, async ({ baseURL, packageName, browser }) => {
      if (!baseURL) {
        throw new Error('Missing baseURL');
      }

      // SSR A/B tests do not seem to work on old NextJS. Likely a config issue.
      if (packageName === 'e2e-old-nextjs') {
        test.skip();
      }

      const context = await createContextWithCookies({
        baseURL,
        browser,
        cookies: [{ name: COOKIE_NAME, value: CONTENT_ID }],
      });

      const page = await context.newPage();

      await page.goto('/ab-test');

      await findTextInPage({ page, text: 'hello world default' });
      await expect(page.locator(SELECTOR, { hasText: 'hello world variation 1' })).toBeHidden();
    });

    test(`#${i}/${TRIES}: Render variant w/ SSR`, async ({ browser, baseURL, packageName }) => {
      if (!baseURL) {
        throw new Error('Missing baseURL');
      }

      // SSR A/B tests do not seem to work on old NextJS. Likely a config issue.
      if (packageName === 'e2e-old-nextjs') {
        test.skip();
      }

      const context = await createContextWithCookies({
        baseURL,
        browser,
        cookies: [{ name: COOKIE_NAME, value: VARIANT_ID }],
      });

      const page = await context.newPage();

      await page.goto('/ab-test');

      await findTextInPage({ page, text: 'hello world variation 1' });
      await expect(page.locator(SELECTOR, { hasText: 'hello world default' })).toBeHidden();
    });
  });
});
