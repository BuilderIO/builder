import type { Browser } from '@playwright/test';
import { expect } from '@playwright/test';
import { checkIsGen1React, checkIsRN, test } from '../helpers/index.js';
import {
  cloneContent,
  launchEmbedderAndWaitForSdk,
  sendContentUpdateMessage,
} from '../helpers/visual-editor.js';
import { CONTENT as AB_TEST_CONTENT } from '../specs/ab-test.js';

const SELECTOR = 'div[builder-content-id]';

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
    storageState: {
      cookies: cookies.map(cookie => {
        const newCookie = {
          name: cookie.name,
          value: cookie.value,
          // this is valid but types seem to be mismatched.
          url: baseURL,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        return newCookie;
      }),
      origins: [],
    },
  });
  return context;
};

const initializeAbTest = async (
  {
    page: _page,
    baseURL,
    packageName,
    browser,
  }: Pick<
    Parameters<Parameters<typeof test>[2]>[0],
    'page' | 'baseURL' | 'packageName' | 'browser'
  >,
  { cookieName, cookieValue }: { cookieName: string; cookieValue: string }
) => {
  if (!baseURL) throw new Error('Missing baseURL');

  // RN can't have SSR, we don't support/export it.
  test.skip(packageName === 'react-native-74' || packageName === 'react-native-76-fabric');

  /**
   * This test is flaky on `nextjs-sdk-next-app` and `qwik-city`. Most likely because it is the very first test that runs.
   */
  test.slow(packageName === 'nextjs-sdk-next-app' || packageName === 'qwik-city');

  const context = await createContextWithCookies({
    baseURL,
    browser,
    cookies: [{ name: cookieName, value: cookieValue }],
  });

  const page = await context.newPage();

  return { page };
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

    for (let i = 1; i <= TRIES; i++) {
      test(`#${i}/${TRIES}: Render default w/ SSR`, async ({
        page: _page,
        baseURL,
        packageName,
        browser,
      }) => {
        const { page } = await initializeAbTest(
          {
            page: _page,
            baseURL,
            packageName,
            browser,
          },
          {
            cookieName: COOKIE_NAME,
            cookieValue: CONTENT_ID,
          }
        );

        let trackCalls = 0;

        await page.route('**/track**', async route => {
          const url = route.request().url();
          if (url.includes('cdn.builder.io/api/v1/track')) {
            trackCalls += 1;
            const payload = route.request().postDataJSON();
            if (payload.events[0].data.variationId) {
              throw new Error(
                'Unexpected variationId in track request payload for default variant'
              );
            }
            if (payload.events[0].data.contentId !== CONTENT_ID) {
              throw new Error('ContentId does not match expected default contentId');
            }
          }
          await route.continue();
        });

        await page.goto('/ab-test', { waitUntil: 'networkidle' });

        expect(trackCalls).toBe(1);

        await expect(page.getByText(TEXTS.DEFAULT_CONTENT).locator('visible=true')).toBeVisible();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.VARIANT_1 })).toBeHidden();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.VARIANT_2 })).toBeHidden();
      });

      test(`#${i}/${TRIES}: Render variant w/ SSR`, async ({
        page: _page,
        baseURL,
        packageName,
        browser,
      }) => {
        const { page } = await initializeAbTest(
          {
            page: _page,
            baseURL,
            packageName,
            browser,
          },
          {
            cookieName: COOKIE_NAME,
            cookieValue: VARIANT_ID,
          }
        );
        let trackCalls = 0;
        await page.route('**/track**', async route => {
          const url = route.request().url();
          if (url.includes('cdn.builder.io/api/v1/track')) {
            trackCalls += 1;
            const payload = route.request().postDataJSON();
            if (!payload.events || payload.events[0].data.variationId !== VARIANT_ID) {
              throw new Error('Missing variationId in track request payload');
            }
          }
          await route.continue();
        });

        await page.goto('/ab-test', { waitUntil: 'networkidle' });

        expect(trackCalls).toBe(1);

        await expect(page.getByText(TEXTS.VARIANT_1).locator('visible=true')).toBeVisible();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.DEFAULT_CONTENT })).toBeHidden();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.VARIANT_2 })).toBeHidden();
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
      }) => {
        const { page } = await initializeAbTest(
          {
            page: _page,
            baseURL,
            packageName,
            browser,
          },
          {
            cookieName: COOKIE_NAME,
            cookieValue: CONTENT_ID,
          }
        );
        await page.goto('/symbol-ab-test');

        await expect(page.getByText(TEXTS.DEFAULT_CONTENT).locator('visible=true')).toBeVisible();
        await expect(
          page.locator(SELECTOR + '[builder-model="symbol"]', { hasText: TEXTS.VARIANT_1 })
        ).toBeHidden();
        await expect(
          page.locator(SELECTOR + '[builder-model="symbol"]', { hasText: TEXTS.VARIANT_2 })
        ).toBeHidden();
      });

      test(`#${i}/${TRIES}: Render variant w/ SSR`, async ({
        page: _page,
        baseURL,
        packageName,
        browser,
      }) => {
        const { page } = await initializeAbTest(
          {
            page: _page,
            baseURL,
            packageName,
            browser,
          },
          {
            cookieName: COOKIE_NAME,
            cookieValue: VARIANT_1_ID,
          }
        );

        await page.goto('/symbol-ab-test');

        await expect(page.getByText(TEXTS.VARIANT_1).locator('visible=true')).toBeVisible();
        await expect(
          page.locator(SELECTOR + '[builder-model="symbol"]', { hasText: TEXTS.DEFAULT_CONTENT })
        ).toBeHidden();
        await expect(
          page.locator(SELECTOR + '[builder-model="symbol"]', { hasText: TEXTS.VARIANT_2 })
        ).toBeHidden();
      });
    }
  });

  test.describe('visual editing', () => {
    test('should render the correct variant when toggling the variant', async ({
      page: _page,
      baseURL,
      sdk,
      basePort,
      browser,
      packageName,
    }) => {
      test.skip(checkIsGen1React(sdk) || checkIsRN(sdk) || packageName === 'nextjs-sdk-next-app');

      const CONTENT_ID = '691abdd7105c4cf7b9609995fc1fb56c';
      const COOKIE_NAME = `builder.tests.${CONTENT_ID}` as const;
      const TEXTS = {
        DEFAULT_CONTENT: 'This is the default variation!',
        VARIANT_1: 'This is variation 1',
      };

      if (!baseURL) throw new Error('Missing baseURL');

      // sets the page to render the default content
      const context = await createContextWithCookies({
        baseURL,
        browser,
        cookies: [{ name: COOKIE_NAME, value: CONTENT_ID }],
      });

      const page = await context.newPage();

      await launchEmbedderAndWaitForSdk({
        page,
        basePort,
        path: '/ab-test',
        sdk,
      });

      await page
        .frameLocator('iframe')
        .getByText(TEXTS.DEFAULT_CONTENT)
        .waitFor({ state: 'visible' });

      const newContent = cloneContent(
        AB_TEST_CONTENT.variations['661775df8c2c41d6afc0aa1b5fd1dd61']
      );

      // when we toggle, it sends a contentUpdate message with the correct variant content
      await sendContentUpdateMessage({
        newContent,
        page,
        model: 'page',
      });

      await page
        .frameLocator('iframe')
        .getByText(TEXTS.DEFAULT_CONTENT)
        .waitFor({ state: 'hidden' });

      const variant1s = await page
        .frameLocator('iframe')
        .getByText(TEXTS.VARIANT_1)
        .elementHandles();

      let visibleVariant1 = null;
      for (const variant1 of variant1s) {
        if (await variant1.isVisible()) {
          visibleVariant1 = variant1;
          break;
        }
      }

      expect(visibleVariant1).not.toBeNull();
    });
  });
});
