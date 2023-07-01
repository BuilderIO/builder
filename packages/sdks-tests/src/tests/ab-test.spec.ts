import type { Browser, BrowserContext } from '@playwright/test';
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
  context,
}: {
  browser: Browser;
  baseURL: string;
  cookies: { name: string; value: string }[];
  context: BrowserContext;
}) => {
  if (isRNSDK) {
    await context.addInitScript(
      items => {
        items.map(({ name, value }) => {
          window.localStorage.setItem(name, value);
        });
      },
      cookies.map(({ name, value }) => ({
        name: `builderio.${name}`,
        value: JSON.stringify({
          rawData: { value },
          // add long expiry
          expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10,
        }),
      }))
    );
    return context;
  }
  return await browser.newContext({
    storageState: {
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
};

// Forbid retries as A/B tests are not deterministic, and we don't want to give any leeway to flakiness.
test.describe.configure({ retries: 0 });

test.describe('A/B tests', () => {
  const TRIES = 10;

  // Manually run tests 10 times to ensure we don't have any flakiness.
  for (let i = 1; i <= TRIES; i++) {
    test(`#${i}/${TRIES}: Render default w/ SSR`, async ({
      page: _page,
      baseURL,
      packageName,
      browser,
      context: _context,
    }) => {
      if (!baseURL) {
        throw new Error('Missing baseURL');
      }

      // SSR A/B tests do not seem to work on old NextJS. Likely a config issue.
      if (packageName === 'e2e-old-nextjs') {
        test.skip();
      }

      // React Native is slow for this particular test. Increasing timeout helps.
      if (packageName === 'e2e-react-native') {
        test.slow();
      }

      const context = await createContextWithCookies({
        baseURL,
        browser,
        cookies: [{ name: COOKIE_NAME, value: CONTENT_ID }],
        context: _context,
      });

      let page = _page;
      if (!isRNSDK) {
        page = await context.newPage();
      }

      await page.goto('/ab-test');

      await findTextInPage({ page, text: 'hello world default' });
      await expect(page.locator(SELECTOR, { hasText: 'hello world variation 1' })).toBeHidden();
    });

    test(`#${i}/${TRIES}: Render variant w/ SSR`, async ({
      browser,
      baseURL,
      packageName,
      context: _context,
      page: _page,
    }) => {
      if (!baseURL) {
        throw new Error('Missing baseURL');
      }

      // SSR A/B tests do not seem to work on old NextJS. Likely a config issue.
      if (packageName === 'e2e-old-nextjs') {
        test.skip();
      }

      // React Native is slow for this particular test. Increasing timeout helps.
      if (packageName === 'e2e-react-native') {
        test.slow();
      }

      const context = await createContextWithCookies({
        baseURL,
        browser,
        cookies: [{ name: COOKIE_NAME, value: VARIANT_ID }],
        context: _context,
      });

      let page = _page;
      if (!isRNSDK) {
        page = await context.newPage();
      }

      await page.goto('/ab-test');

      await findTextInPage({ page, text: 'hello world variation 1' });
      await expect(page.locator(SELECTOR, { hasText: 'hello world default' })).toBeHidden();
    });
  }
});
