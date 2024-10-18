import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

const checkSupportsDynamicLoading = (packageName: string) => {
  test.skip(packageName !== 'sveltekit');
};

test.describe('Dynamic loading of custom components', () => {
  test('LazyComponent only loads when requested', async ({ page, packageName }) => {
    checkSupportsDynamicLoading(packageName);
    await page.goto('/dynamic-loading');

    let lazyComponentRequested = false;

    page.on('request', request => {
      if (request.url().includes('LazyComponent')) {
        lazyComponentRequested = true;
      }
    });

    await page.waitForLoadState('networkidle');

    expect(lazyComponentRequested).toBe(false);

    const button = page.locator('text=Click me!');
    await button.click();

    expect(lazyComponentRequested).toBe(true);
  });

  test('NotLazyComponent loads immediately even if not requested', async ({
    page,
    packageName,
  }) => {
    checkSupportsDynamicLoading(packageName);
    await page.goto('/dynamic-loading');

    let notLazyComponentRequested = false;

    page.on('requestfinished', request => {
      void (async () => {
        if (request.resourceType() === 'document' || request.resourceType() === 'script') {
          const response = await request.response();
          const responseBody = await response?.text();

          if (responseBody?.includes('Not lazy component loaded')) {
            // its bundled and sent in the initial requests
            // even if we haven't clicked the button
            notLazyComponentRequested = true;
          }
        }
      })();
    });

    await page.waitForLoadState('networkidle');

    expect(notLazyComponentRequested).toBe(true);
  });
});

test.describe('Eager dynamic loading of custom components', () => {
  test('EagerLazyComponent loads immediately even if not requested', async ({
    page,
    packageName,
  }) => {
    checkSupportsDynamicLoading(packageName);
    await page.goto('/eager-dynamic-loading');

    let eagerLazyComponentRequested = false;
    let eagerLazyComponentRendered = false;

    page.on('request', request => {
      if (request.url().includes('LazyComponent')) {
        eagerLazyComponentRequested = true;
      }
    });

    page.on('requestfinished', request => {
      void (async () => {
        if (request.resourceType() === 'document' || request.resourceType() === 'script') {
          const response = await request.response();
          const responseBody = await response?.text();

          if (responseBody?.includes('lazy component loaded')) {
            // component is SSR'd
            eagerLazyComponentRendered = true;
          }
        }
      })();
    });

    await page.waitForLoadState('networkidle');

    expect(eagerLazyComponentRequested).toBe(true);
    expect(eagerLazyComponentRendered).toBe(true);

    const eagerLazyComponent = page.locator('text=lazy component loaded');
    await expect(eagerLazyComponent).toBeVisible();
  });
});
