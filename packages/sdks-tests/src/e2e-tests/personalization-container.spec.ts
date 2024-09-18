import type { Browser } from '@playwright/test';
import { expect } from '@playwright/test';
import { excludeGen2, test, excludeTestFor } from '../helpers/index.js';
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

const initializeUserAttributes = async (
  {
    page: _page,
    baseURL,
    browser,
    sdk,
    packageName,
  }: Pick<
    Parameters<Parameters<typeof test>[1]>[0],
    'page' | 'baseURL' | 'browser' | 'packageName' | 'sdk'
  >,
  { userAttributes }: { userAttributes: Record<string, string> }
) => {
  // gen1-next likely have a config issue with SSR
  test.skip(packageName === 'gen1-next');
  test.skip(excludeTestFor({ angular: true }, sdk));
  test.skip(excludeGen2(sdk));

  if (!baseURL) throw new Error('Missing baseURL');

  const context = await createContextWithCookies({
    baseURL,
    browser,
    cookies: [{ name: 'builder.userAttributes', value: JSON.stringify(userAttributes) }],
  });

  const page = await context.newPage();

  return { page };
};

test.describe('Personalization Container', () => {
  test.describe('entire page', () => {
    const TEXTS = {
      DEFAULT_CONTENT: 'Default',
      EXPERIMENT_A: 'Experiment A',
      EXPERIMENT_B: 'Experiment B',
      NON_PERSONALIZED: 'Non personalized',
    };
    const TRIES = 2;

    // Manually run tests 10 times to ensure we don't have any flakiness.
    for (let i = 1; i <= TRIES; i++) {
      test(`#${i}/${TRIES}: Render default w/ SSR`, async ({
        page: _page,
        baseURL,
        browser,
        packageName,
        sdk,
      }) => {
        const { page } = await initializeUserAttributes(
          {
            page: _page,
            baseURL,
            browser,
            sdk,
            packageName,
          },
          // empty should render default, non-personalized content
          {
            userAttributes: {},
          }
        );

        await page.goto('/personalization-container');

        await expect(page.getByText(TEXTS.DEFAULT_CONTENT).locator('visible=true')).toBeVisible();
        await expect(page.getByText(TEXTS.NON_PERSONALIZED).locator('visible=true')).toBeVisible();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.EXPERIMENT_A })).toBeHidden();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.EXPERIMENT_B })).toBeHidden();
      });

      test(`#${i}/${TRIES}: Render variant A w/ SSR`, async ({
        page: _page,
        baseURL,
        browser,
        sdk,
        packageName,
      }) => {
        const { page } = await initializeUserAttributes(
          {
            page: _page,
            baseURL,
            browser,
            sdk,
            packageName,
          },
          // empty should render default, non-personalized content
          {
            userAttributes: { experiment: 'A' },
          }
        );

        await page.goto('/personalization-container');

        await expect(page.getByText(TEXTS.EXPERIMENT_A).locator('visible=true')).toBeVisible();
        await expect(page.getByText(TEXTS.NON_PERSONALIZED).locator('visible=true')).toBeVisible();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.EXPERIMENT_B })).toBeHidden();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.DEFAULT_CONTENT })).toBeHidden();
      });

      test(`#${i}/${TRIES}: Render variant B w/ SSR`, async ({
        page: _page,
        baseURL,
        browser,
        sdk,
        packageName,
      }) => {
        const { page } = await initializeUserAttributes(
          {
            page: _page,
            baseURL,
            browser,
            sdk,
            packageName,
          },
          // empty should render default, non-personalized content
          {
            userAttributes: { experiment: 'B' },
          }
        );

        await page.goto('/personalization-container');

        await expect(page.getByText(TEXTS.EXPERIMENT_B).locator('visible=true')).toBeVisible();
        await expect(page.getByText(TEXTS.NON_PERSONALIZED).locator('visible=true')).toBeVisible();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.EXPERIMENT_A })).toBeHidden();
        await expect(page.locator(SELECTOR, { hasText: TEXTS.DEFAULT_CONTENT })).toBeHidden();
      });
    }
  });
});
