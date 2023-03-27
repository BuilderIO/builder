import { test as base, expect } from '@playwright/test';
import type { Page, TestInfo, Locator, BrowserContext } from '@playwright/test';
import type { PackageName, Sdk } from './sdk';
import { sdk } from './sdk.js';

type TestOptions = {
  packageName: PackageName | 'DEFAULT';
};

// https://github.com/microsoft/playwright/issues/14854#issuecomment-1155667859
async function screenshotOnFailure({ page }: { page: Page }, testInfo: TestInfo) {
  if (testInfo.status !== testInfo.expectedStatus) {
    // Get a unique place for the screenshot.
    const screenshotPath = testInfo.outputPath(`failure.png`);
    // Add it to the report.
    testInfo.attachments.push({
      name: 'screenshot',
      path: screenshotPath,
      contentType: 'image/png',
    });
    // Take the screenshot itself.
    await page.screenshot({ path: screenshotPath, timeout: 5000 });
  }
}

export const test = base.extend<TestOptions>({
  // this is provided by `playwright.config.ts`
  packageName: ['DEFAULT', { option: true }],
});
test.afterEach(screenshotOnFailure);

export const findTextInPage = async ({ page, text }: { page: Page; text: string }) => {
  await page.locator(`text=${text}`).waitFor();
};

export const isRNSDK = sdk === 'reactNative';

/**
 * Useful tool to skip tests when features aren't implemented in a specific output yet.
 * We use the negative tense, so that the default behavior is to run the test, unless specifically omitted.
 *
 */
export const excludeTestFor = (sdks: { [X in Sdk]?: boolean }) => {
  return sdks[sdk] ? test.skip : test;
};

/**
 * reactive state only works in:
 * - Vue
 * - React
 * - old React
 *
 * so we skip the other environments.
 */
export const reactiveStateTest = excludeTestFor({
  qwik: true,
  reactNative: true,
  rsc: true,
  svelte: true,
  solid: true,
});

/**
 * We exclude some new tests from old React until we fix them.
 */
export const testExcludeOldReact = excludeTestFor({
  oldReact: true,
});

export const excludeReactNative = excludeTestFor({
  reactNative: true,
});

export const getElementStyleValue = async ({
  locator,
  cssProperty,
}: {
  locator: Locator;
  cssProperty: string;
}) => {
  return locator.evaluate((e, cssProperty) => {
    return getComputedStyle(e).getPropertyValue(cssProperty);
  }, cssProperty);
};

export const expectStyleForElement = async ({
  expectedValue,
  locator,
  cssProperty,
  checkVisibility = true,
}: {
  locator: Locator;
  cssProperty: string;
  expectedValue: string;
  checkVisibility?: boolean;
}) => {
  // we need to wait for the element to be visible, otherwise we might run the style check on a removed DOM node.
  if (checkVisibility) {
    await expect(locator).toBeVisible();
  }

  await expect(await getElementStyleValue({ locator, cssProperty })).toBe(expectedValue);
};

export type ExpectedStyles = Record<string, string>;

export const expectStylesForElement = async ({
  expected,
  locator,
  checkVisibility,
}: {
  locator: Locator;
  expected: ExpectedStyles;
  checkVisibility?: boolean;
}) => {
  for (const property of Object.keys(expected)) {
    await expectStyleForElement({
      cssProperty: property,
      locator,
      expectedValue: expected[property],
      checkVisibility,
    });
  }
};

export const getBuilderSessionIdCookie = async ({ context }: { context: BrowserContext }) => {
  const cookies = await context.cookies();
  const builderSessionCookie = cookies.find(cookie => cookie.name === 'builderSessionId');
  return builderSessionCookie;
};
