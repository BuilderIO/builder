import type {
  BrowserContext,
  Locator,
  Page,
  PlaywrightTestArgs,
  PlaywrightWorkerArgs,
  TestInfo,
} from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { SDK_LOADED_MSG } from './context.js';
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

type SDK_EXCLUSION_DICT = {
  [X in Sdk]?: boolean;
};

/**
 * Useful tool to skip tests when features aren't implemented in a specific output yet.
 * We use the negative tense, so that the default behavior is to run the test, unless specifically omitted.
 *
 */
export const excludeTestFor = (sdks: SDK_EXCLUSION_DICT) => {
  return sdks[sdk] || false;
};

/**
 * We exclude some new tests from old React until we fix them.
 */
export const EXCLUDE_GEN_1 = excludeTestFor({
  oldReact: true,
});

/**
 * We exclude some tests from SDKs which are not from old React.
 */
export const EXCLUDE_GEN_2 = excludeTestFor({
  qwik: true,
  react: true,
  reactNative: true,
  rsc: true,
  solid: true,
  svelte: true,
  vue2: true,
  vue3: true,
});

export const EXCLUDE_RN = excludeTestFor({
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

export const checkIfIsHydrationErrorMessage = (_text: string) => {
  const text = _text.toLowerCase();
  const isVueHydrationMismatch =
    text.includes('[vue warn]') || text.includes('hydration') || text.includes('mismatch');
  const isReactHydrationMismatch =
    text.includes('did not expect server') ||
    text.includes('content does not match') ||
    text.includes('did not match') ||
    text.includes('hydration') ||
    text.includes('mismatch') ||
    text.includes('minified react error #');

  const filterHydrationmismatchMessages = isVueHydrationMismatch || isReactHydrationMismatch;
  return filterHydrationmismatchMessages;
};

export async function checkConsoleForHydrationErrors(context: BrowserContext) {
  console.log('Checking console for hydration errors');

  await context.addInitScript(() => {
    console.log('Adding init script', window, window.addEventListener);

    window.addEventListener('message', event => {
      console.log('MESSAGE: ', event.data);

      if (event.data.type === 'builder.sdkInfo') {
        console.log(SDK_LOADED_MSG);
      }
    });
  });

  const msgs: string[] = [];
  context.on('console', msg => {
    console.log('CONSOLE LOG: ', msg.text());

    const originalText = msg.text();

    if (checkIfIsHydrationErrorMessage(originalText)) {
      console.log('BAD CONSOLE DETECTED: ', originalText);
      msgs.push(originalText);
      // throw new Error(
      //   'TEST FAILED: Hydration mismatch detected in console logs. Error: ' + originalText
      // );
    }
  });

  const msgPromise = context.waitForEvent('console', msg => {
    const newLocal = msg.text();
    console.log('CONSOLE LOG: ', newLocal);
    if (checkIfIsHydrationErrorMessage(newLocal)) {
      console.log('BAD CONSOLE DETECTED: ', newLocal);
      throw new Error(
        'TEST FAILED: Hydration mismatch detected in console logs. Error: ' + newLocal
      );
    }
    return newLocal === SDK_LOADED_MSG;
  });

  return msgPromise;
}
