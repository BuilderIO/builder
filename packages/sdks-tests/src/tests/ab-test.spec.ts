import type { Browser, BrowserContext, ConsoleMessage } from '@playwright/test';
import { expect } from '@playwright/test';
import { findTextInPage, isRNSDK, test } from './helpers.js';
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

const filterHydrationmismatchMessages = (consoleMessage: ConsoleMessage) => {
  const text = consoleMessage.text().toLowerCase();

  const isVueHydrationMismatch =
    text.includes('[vue warn]') && text.includes('hydration') && text.includes('mismatch');

  return isVueHydrationMismatch;
};

const initializeAbTest = async (
  {
    page: _page,
    baseURL,
    packageName,
    browser,
    context: _context,
  }: Pick<
    Parameters<Parameters<typeof test>[1]>[0],
    'page' | 'baseURL' | 'packageName' | 'browser' | 'context'
  >,
  { cookieName, cookieValue }: { cookieName: string; cookieValue: string }
) => {
  if (!baseURL) throw new Error('Missing baseURL');

  // SSR A/B tests do not seem to work on old NextJS. Likely a config issue.
  if (packageName === 'gen1-next') test.skip();

  // TO-DO: fix this
  if (packageName === 'next-app-dir') test.skip();

  // React Native SDK needs some extra time to sort its feelings out.
  if (packageName === 'react-native') test.slow();

  const context = await createContextWithCookies({
    baseURL,
    browser,
    cookies: [{ name: cookieName, value: cookieValue }],
    context: _context,
  });

  const page = isRNSDK ? _page : await context.newPage();

  const msgs = [] as ConsoleMessage[];
  page.on('console', msg => {
    if (filterHydrationmismatchMessages(msg)) {
      msgs.push(msg);
    }
  });

  return { page, msgs };
};

test.describe('A/B tests', () => {
  test.describe('entire page', () => {
    const CONTENT_ID = '691abdd7105c4cf7b9609995fc1fb56c';
    const VARIANT_ID = '661775df8c2c41d6afc0aa1b5fd1dd61';

    const TEXTS = {
      DEFAULT_CONTENT: 'This is the default variation!',
      VARIANT_1: 'This is variation 1',
      VARIANT_2: 'text only in variation 2',
    };

    const COOKIE_NAME = `builder.tests.${CONTENT_ID}` as const;

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
        const { page, msgs } = await initializeAbTest(
          {
            page: _page,
            baseURL,
            packageName,
            browser,
            context: _context,
          },
          {
            cookieName: COOKIE_NAME,
            cookieValue: CONTENT_ID,
          }
        );

        await page.goto('/ab-test');

        await findTextInPage({ page, text: TEXTS.DEFAULT_CONTENT });
        await expect(page.locator(SELECTOR, { hasText: TEXTS.VARIANT_1 })).toBeHidden();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.VARIANT_2 })).toBeHidden();
        await expect(msgs).toEqual([]);
      });

      test(`#${i}/${TRIES}: Render variant w/ SSR`, async ({
        page: _page,
        baseURL,
        packageName,
        browser,
        context: _context,
      }) => {
        const { page, msgs } = await initializeAbTest(
          {
            page: _page,
            baseURL,
            packageName,
            browser,
            context: _context,
          },
          {
            cookieName: COOKIE_NAME,
            cookieValue: VARIANT_ID,
          }
        );

        await page.goto('/ab-test');

        await findTextInPage({ page, text: TEXTS.VARIANT_1 });
        await expect(page.locator(SELECTOR, { hasText: TEXTS.DEFAULT_CONTENT })).toBeHidden();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.VARIANT_2 })).toBeHidden();
        await expect(msgs).toEqual([]);
      });
    }
  });
  test.describe('nested symbol', () => {
    const CONTENT_ID = 'd5580c8ba90443638ed240723abf67f0';
    const VARIANT_1_ID = 'f7c6d013fa844a75aefe0f629723fb3b';

    const TEXTS = {
      DEFAULT_CONTENT: 'symbol default variation',
      VARIANT_1: 'symbol variation 1',
      VARIANT_2: 'symbol: variation 2',
    };

    const COOKIE_NAME = `builder.tests.${CONTENT_ID}` as const;

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
        if (packageName === 'react-native') test.skip();

        const { page, msgs } = await initializeAbTest(
          {
            page: _page,
            baseURL,
            packageName,
            browser,
            context: _context,
          },
          {
            cookieName: COOKIE_NAME,
            cookieValue: CONTENT_ID,
          }
        );
        await page.goto('/symbol-ab-test');

        await findTextInPage({ page, text: TEXTS.DEFAULT_CONTENT });
        await expect(
          page.locator(SELECTOR + '[builder-model="symbol"]', { hasText: TEXTS.VARIANT_1 })
        ).toBeHidden();
        await expect(
          page.locator(SELECTOR + '[builder-model="symbol"]', { hasText: TEXTS.VARIANT_2 })
        ).toBeHidden();
        await expect(msgs).toEqual([]);
      });

      test(`#${i}/${TRIES}: Render variant w/ SSR`, async ({
        page: _page,
        baseURL,
        packageName,
        browser,
        context: _context,
      }) => {
        if (packageName === 'react-native') test.skip();

        const { page, msgs } = await initializeAbTest(
          {
            page: _page,
            baseURL,
            packageName,
            browser,
            context: _context,
          },
          {
            cookieName: COOKIE_NAME,
            cookieValue: VARIANT_1_ID,
          }
        );

        await page.goto('/symbol-ab-test');

        await findTextInPage({ page, text: TEXTS.VARIANT_1 });
        await expect(
          page.locator(SELECTOR + '[builder-model="symbol"]', { hasText: TEXTS.DEFAULT_CONTENT })
        ).toBeHidden();
        await expect(
          page.locator(SELECTOR + '[builder-model="symbol"]', { hasText: TEXTS.VARIANT_2 })
        ).toBeHidden();
        await expect(msgs).toEqual([]);
      });
    }
  });
});
