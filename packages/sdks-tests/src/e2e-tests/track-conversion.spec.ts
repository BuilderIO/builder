import type { Browser } from '@playwright/test';
import { expect } from '@playwright/test';
import { excludeGen1, excludeRn, test } from '../helpers/index.js';
import { CONVERSION_SYMBOL_CONTENT } from '../specs/symbol-with-conversion.js';
import { CONVERSION_SECTION_CONTENT } from '../specs/section-with-conversion.js';

const COOKIE_NAME = 'builder.tests.test-content-id';
const CONTENT_ID = 'test-content-id';
const VARIANT_ID = 'test-variation-id';

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

test.describe('Track Conversion', () => {
  test.describe('Basic conversion tracking', () => {
    // clear cookies before each test
    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies();
      await page.reload();
    });

    test('should track basic conversion with amount', async ({
      page,
      sdk,
      baseURL,
      packageName,
      browser,
    }) => {
      test.skip(excludeGen1(sdk) || excludeRn(sdk));

      const { page: testPage } = await initializeAbTest(
        {
          page,
          baseURL,
          packageName,
          browser,
        },
        { cookieName: COOKIE_NAME, cookieValue: CONTENT_ID }
      );

      const trackingRequestPromise = testPage.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'conversion',
        { timeout: 10000 }
      );

      await testPage.goto('/track-conversion', { waitUntil: 'networkidle' });

      // Click the basic conversion button
      await testPage.click('text=Track conversion with amount');

      const trackingRequest = await trackingRequestPromise;
      const data = trackingRequest.postDataJSON();

      expect(data.events).toHaveLength(1);
      expect(data.events[0].type).toBe('conversion');
      expect(data.events[0].data.amount).toBe(100);
      expect(data.events[0].data.contentId).toBe('test-content-id');
    });

    test('should track basic conversion without amount', async ({
      page,
      sdk,
      baseURL,
      packageName,
      browser,
    }) => {
      test.skip(excludeGen1(sdk) || excludeRn(sdk));

      const { page: testPage } = await initializeAbTest(
        {
          page,
          baseURL,
          packageName,
          browser,
        },
        { cookieName: COOKIE_NAME, cookieValue: CONTENT_ID }
      );

      const trackingRequestPromise = testPage.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'conversion',
        { timeout: 10000 }
      );

      await testPage.goto('/track-conversion', { waitUntil: 'networkidle' });

      // Click the basic conversion button
      await testPage.click('text=Track conversion without amount');

      const trackingRequest = await trackingRequestPromise;
      const data = trackingRequest.postDataJSON();

      expect(data.events).toHaveLength(1);
      expect(data.events[0].type).toBe('conversion');
      expect(data.events[0].data.amount).toBe(undefined);
      expect(data.events[0].data.contentId).toBe('test-content-id');
    });

    test('should track conversion with all parameters', async ({
      page,
      sdk,
      baseURL,
      packageName,
      browser,
    }) => {
      test.skip(excludeGen1(sdk) || excludeRn(sdk));

      const { page: testPage } = await initializeAbTest(
        {
          page,
          baseURL,
          packageName,
          browser,
        },
        { cookieName: COOKIE_NAME, cookieValue: CONTENT_ID }
      );

      const trackingRequestPromise = testPage.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'conversion',
        { timeout: 10000 }
      );

      await testPage.goto('/track-conversion', { waitUntil: 'networkidle' });

      // Click the full parameters conversion button
      await testPage.click('text=Track Conversion with All Parameters');

      const trackingRequest = await trackingRequestPromise;
      const data = trackingRequest.postDataJSON();

      expect(data.events).toHaveLength(1);
      expect(data.events[0].type).toBe('conversion');
      expect(data.events[0].data.amount).toBe(100);
      expect(data.events[0].data.contentId).toBe('test-content-id');
      expect(data.events[0].data.variationId).toBe('test-variation-id');
      expect(data.events[0].data.meta).toEqual({
        product: 'premium-shoes',
      });
      expect(data.events[0].data.context).toEqual({
        userId: 'user-123',
      });
    });
  });

  test.describe('Conversion tracking with A/B tests', () => {
    test('should track conversion with variation ID from cookie', async ({
      page,
      browser,
      packageName,
      baseURL,
      sdk,
    }) => {
      test.skip(excludeGen1(sdk) || excludeRn(sdk));

      if (!baseURL) throw new Error('Missing baseURL');

      // Create context with A/B test cookie
      const { page: testPage } = await initializeAbTest(
        {
          page,
          baseURL,
          packageName,
          browser,
        },
        { cookieName: COOKIE_NAME, cookieValue: VARIANT_ID }
      );

      const trackingRequestPromise = testPage.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'conversion',
        { timeout: 10000 }
      );

      await testPage.goto('/track-conversion', { waitUntil: 'networkidle' });

      // Click the basic conversion button
      await testPage.click('text=Track Basic Conversion');

      const trackingRequest = await trackingRequestPromise;
      const data = trackingRequest.postDataJSON();

      expect(data.events).toHaveLength(1);
      expect(data.events[0].type).toBe('conversion');
      expect(data.events[0].data.amount).toBe(100);
      expect(data.events[0].data.contentId).toBe('test-content-id');
      expect(data.events[0].data.variationId).toBe(VARIANT_ID);

      await testPage.context().close();
    });

    test('should not set variationId when it equals contentId', async ({
      page,
      baseURL,
      sdk,
      packageName,
      browser,
    }) => {
      test.skip(excludeGen1(sdk) || excludeRn(sdk));

      const { page: testPage } = await initializeAbTest(
        {
          page,
          baseURL,
          packageName,
          browser,
        },
        { cookieName: COOKIE_NAME, cookieValue: CONTENT_ID }
      );

      const trackingRequestPromise = testPage.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'conversion',
        { timeout: 10000 }
      );

      await testPage.goto('/track-conversion', { waitUntil: 'networkidle' });

      // Click the basic conversion button
      await testPage.click('text=Track Basic Conversion');

      const trackingRequest = await trackingRequestPromise;
      const data = trackingRequest.postDataJSON();

      expect(data.events).toHaveLength(1);
      expect(data.events[0].type).toBe('conversion');
      expect(data.events[0].data.amount).toBe(100);
      expect(data.events[0].data.contentId).toBe('test-content-id');
      expect(data.events[0].data.variationId).toBeUndefined();
      expect(data.events[0].data.ownerId).toMatch(/abcd/);

      await testPage.context().close();
    });
  });

  test.describe('Symbol Conversion Tracking', () => {
    test('should track conversion from symbol', async ({
      page,
      sdk,
      packageName,
      baseURL,
      browser,
    }) => {
      test.skip(excludeGen1(sdk) || excludeRn(sdk));

      // Skip packages that fetch symbol content on the server
      const SSR_FETCHING_PACKAGES = ['nextjs-sdk-next-app', 'qwik-city'];
      test.fail(SSR_FETCHING_PACKAGES.includes(packageName));

      const { page: testPage } = await initializeAbTest(
        {
          page,
          baseURL,
          packageName,
          browser,
        },
        { cookieName: COOKIE_NAME, cookieValue: CONTENT_ID }
      );

      let symbolRequestCount = 0;

      await testPage.route(/.*cdn\.builder\.io\/api\/v3\/content\/symbol.*/, route => {
        symbolRequestCount++;
        return route.fulfill({
          status: 200,
          json: {
            results: [CONVERSION_SYMBOL_CONTENT],
          },
        });
      });

      const trackingRequestPromise = testPage.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'conversion',
        { timeout: 10000 }
      );

      await testPage.goto('/symbol-conversion', { waitUntil: 'networkidle' });

      await testPage.click('text=Track Symbol Conversion');

      const trackingRequest = await trackingRequestPromise;
      const data = trackingRequest.postDataJSON();

      expect(data.events).toHaveLength(1);
      expect(data.events[0].type).toBe('conversion');
      expect(data.events[0].data.amount).toBeUndefined();
      expect(data.events[0].data.contentId).toBe('test-content-id');
      expect(data.events[0].data.ownerId).toMatch(/abcd/);
      expect(data.events[0].data.sessionId).toMatch(/^[a-f0-9]{32}$/);
      expect(data.events[0].data.visitorId).toMatch(/^[a-f0-9]{32}$/);

      expect(symbolRequestCount).toBeGreaterThanOrEqual(1);

      await testPage.context().close();
    });

    test('should include correct headers when tracking from symbol', async ({
      page,
      sdk,
      packageName,
      baseURL,
      browser,
    }) => {
      test.skip(excludeGen1(sdk) || excludeRn(sdk));

      // Skip packages that fetch symbol content on the server
      const SSR_FETCHING_PACKAGES = ['nextjs-sdk-next-app', 'qwik-city'];
      test.fail(SSR_FETCHING_PACKAGES.includes(packageName));

      const { page: testPage } = await initializeAbTest(
        {
          page,
          baseURL,
          packageName,
          browser,
        },
        { cookieName: COOKIE_NAME, cookieValue: CONTENT_ID }
      );

      let symbolRequestCount = 0;
      await testPage.route(/.*cdn\.builder\.io\/api\/v3\/content\/symbol.*/, route => {
        symbolRequestCount++;
        return route.fulfill({
          status: 200,
          json: {
            results: [CONVERSION_SYMBOL_CONTENT],
          },
        });
      });

      const trackingRequestPromise = testPage.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'conversion',
        { timeout: 10000 }
      );

      await testPage.goto('/symbol-conversion', { waitUntil: 'networkidle' });

      // Click the symbol button
      await testPage.click('text=Track Symbol Conversion');

      const trackingRequest = await trackingRequestPromise;
      const headers = trackingRequest.headers();

      expect(headers['content-type']).toBe('application/json');
      expect(headers['x-builder-sdk']).toBeDefined();
      expect(headers['x-builder-sdk-gen']).toBeDefined();
      expect(headers['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/);

      expect(symbolRequestCount).toBeGreaterThanOrEqual(1);

      await testPage.context().close();
    });
  });

  test.describe('Section Conversion Tracking', () => {
    test('should track conversion from section button', async ({
      page,
      sdk,
      packageName,
      baseURL,
      browser,
    }) => {
      test.skip(excludeGen1(sdk) || excludeRn(sdk));

      const { page: testPage } = await initializeAbTest(
        {
          page,
          baseURL,
          packageName,
          browser,
        },
        { cookieName: COOKIE_NAME, cookieValue: CONTENT_ID }
      );

      let symbolRequestCount = 0;
      await testPage.route(
        /.*cdn\.builder\.io\/api\/v3\/content\/sample-section-model.*/,
        route => {
          symbolRequestCount++;
          return route.fulfill({
            status: 200,
            json: {
              results: [CONVERSION_SECTION_CONTENT],
            },
          });
        }
      );

      const trackingRequestPromise = testPage.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'conversion',
        { timeout: 10000 }
      );

      await testPage.goto('/section-conversion', { waitUntil: 'networkidle' });

      await testPage.pause();

      await testPage.click('text=Section Button');

      await testPage.pause();

      const trackingRequest = await trackingRequestPromise;
      const data = trackingRequest.postDataJSON();

      expect(data.events).toHaveLength(1);
      expect(data.events[0].type).toBe('conversion');
      expect(data.events[0].data.amount).toBeUndefined();
      expect(data.events[0].data.contentId).toBe('test-content-id');
      expect(data.events[0].data.ownerId).toMatch(/abcd/);
      expect(data.events[0].data.sessionId).toMatch(/^[a-f0-9]{32}$/);
      expect(data.events[0].data.visitorId).toMatch(/^[a-f0-9]{32}$/);

      expect(symbolRequestCount).toBeGreaterThanOrEqual(1);

      await testPage.context().close();
    });
  });
});
