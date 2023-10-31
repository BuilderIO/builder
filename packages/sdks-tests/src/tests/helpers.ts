import { test as base, expect } from '@playwright/test';
import type {
  Page,
  TestInfo,
  Locator,
  BrowserContext,
  PlaywrightTestArgs,
  PlaywrightWorkerArgs,
} from '@playwright/test';
import type { PackageName, Sdk } from './sdk.js';
import { sdk } from './sdk.js';

type TestOptions = {
  packageName: PackageName | 'DEFAULT';
  basePort: number;
};

// https://github.com/microsoft/playwright/issues/14854#issuecomment-1155667859
async function screenshotOnFailure(
  { page }: PlaywrightTestArgs & PlaywrightWorkerArgs,
  testInfo: TestInfo
) {
  if (testInfo.status !== testInfo.expectedStatus && !process.env.CI) {
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
  basePort: [0, { option: true }],
});
test.afterEach(screenshotOnFailure);

export const isSSRFramework = (packageName: PackageName | 'DEFAULT') => {
  // Easier to list non-ssr than other way around.
  const isNonSSR =
    packageName === 'solid' ||
    packageName === 'react' ||
    packageName === 'vue2' ||
    packageName === 'svelte' ||
    packageName === 'react-native' ||
    packageName === 'gen1-react';
  return !isNonSSR;
};

export const findTextInPage = async ({ page, text }: { page: Page; text: string }) => {
  await page.locator(`text=${text}`).waitFor();
};

export const isRNSDK = sdk === 'reactNative';
export const isOldReactSDK = sdk === 'oldReact';

/**
 * Useful tool to skip tests when features aren't implemented in a specific output yet.
 * We use the negative tense, so that the default behavior is to run the test, unless specifically omitted.
 *
 */
export const excludeTestFor = (sdks: { [X in Sdk]?: boolean }) => {
  return sdks[sdk] ? test.skip : test;
};

/**
 * reactive state works in:
 * - Vue
 * - React
 * - old React
 * - Qwik
 * - Svelte
 *
 * so we skip the other environments.
 */
export const reactiveStateTest = excludeTestFor({
  reactNative: true,
  rsc: true,
  solid: true,
});

/**
 * We exclude some new tests from old React until we fix them.
 */
export const testExcludeOldReact = excludeTestFor({
  oldReact: true,
});

/**
 * We exclude some tests from SDKs which are not from old React.
 */
export const testOnlyOldReact = excludeTestFor({
  qwik: true,
  react: true,
  reactNative: true,
  rsc: true,
  solid: true,
  svelte: true,
  vue2: true,
  vue3: true,
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

export type ExpectedStyles = Record<string, string>;

export const expectStylesForElement = async ({
  expected,
  locator,
}: {
  locator: Locator;
  expected: ExpectedStyles;
}) => {
  for (const property of Object.keys(expected)) {
    await expect(locator).toHaveCSS(property, expected[property]);
  }
};

export const getBuilderSessionIdCookie = async ({ context }: { context: BrowserContext }) => {
  const cookies = await context.cookies();
  const builderSessionCookie = cookies.find(cookie => cookie.name === 'builderSessionId');
  return builderSessionCookie;
};
