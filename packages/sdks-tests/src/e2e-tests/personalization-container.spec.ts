import type { Browser } from '@playwright/test';
import { expect } from '@playwright/test';
import { isSSRFramework, test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';
import type { Sdk } from '../helpers/sdk.js';

const SELECTOR = 'div[builder-content-id]';
const SDKS_SUPPORTING_PERSONALIZATION = ['react', 'vue', 'svelte'] as Sdk[];

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
    packageName,
    sdk,
  }: Pick<
    Parameters<Parameters<typeof test>[2]>[0],
    'page' | 'baseURL' | 'browser' | 'packageName' | 'sdk'
  >,
  { userAttributes }: { userAttributes: Record<string, string> }
) => {
  // gen1-remix started failing on this test for an unknown reason.
  test.skip(packageName === 'gen1-remix');
  test.skip(!SDKS_SUPPORTING_PERSONALIZATION.includes(sdk));

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

  test('setClientUserAttributes and builder.setUserAttributes sets cookie and renders variant after the first render', async ({
    page,
    packageName,
  }) => {
    // here we are checking specifically for winning variant content by setting the user attributes
    test.skip(!['react-sdk-next-15-app', 'gen1-next15-app'].includes(packageName));
    await page.goto('/variant-containers');

    // content 1
    await expect(page.getByText('My tablet content')).toBeVisible();
    await expect(page.getByText('My mobile content updated')).not.toBeVisible();
    await expect(page.getByText('My default content')).not.toBeVisible();

    // content 2 - this has no targeting set, so the first variant should be the winning variant
    await expect(page.getByText('Tablet content 2')).toBeVisible();
  });

  test('only default variants are ssred on the server', async ({ browser, packageName, sdk }) => {
    test.skip(!isSSRFramework(packageName));
    test.skip(!SDKS_SUPPORTING_PERSONALIZATION.includes(sdk));
    // Cannot read properties of null (reading 'useContext')
    test.skip(packageName === 'gen1-remix');

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });

    const page = await context.newPage();

    await page.goto('/variant-containers');

    await expect(page.getByText('My default content')).toBeVisible();
    await expect(page.getByText('Default content 2')).toBeVisible();
  });

  test('root style attribute is correctly set', async ({ page, sdk, packageName }) => {
    test.skip(!SDKS_SUPPORTING_PERSONALIZATION.includes(sdk));
    // Cannot read properties of null (reading 'useContext')
    test.skip(packageName === 'gen1-remix');

    await page.goto('/variant-containers');

    const secondPersonalizationContainer = page
      .locator('.builder-personalization-container')
      .nth(1);
    await expect(secondPersonalizationContainer).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  });

  test.describe('visual editing', () => {
    test('correctly shows the variant that is being currently edited', async ({
      page,
      sdk,
      basePort,
      packageName,
    }) => {
      test.skip(!SDKS_SUPPORTING_PERSONALIZATION.includes(sdk));
      // Cannot read properties of null (reading 'useContext')
      test.skip(packageName === 'gen1-remix');

      const paths = [
        '/variant-containers-with-previewing-index-0',
        '/variant-containers-with-previewing-index-1',
        '/variant-containers-with-previewing-index-undefined',
      ];

      const expectedTexts = [
        'My tablet content',
        'My mobile content updated',
        'My default content',
      ];

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        await launchEmbedderAndWaitForSdk({
          path,
          page,
          sdk,
          basePort,
        });

        await expect(page.frameLocator('iframe').getByText(expectedTexts[i])).toBeVisible();
      }
    });
  });
});
