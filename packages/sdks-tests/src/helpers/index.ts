import type {
  BrowserContext,
  Locator,
  Page,
  PlaywrightTestArgs,
  PlaywrightWorkerArgs,
  TestInfo,
} from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import type { ServerName, Sdk } from './sdk.js';
import { fileURLToPath } from 'url';
import path from 'path';

type TestOptions = {
  packageName: ServerName;
  sdk: Sdk;
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

const test = base.extend<TestOptions>({
  // this is provided by `playwright.config.ts`
  packageName: ['DEFAULT' as any, { option: true }],
  sdk: ['DEFAULT' as any, { option: true }],
  basePort: [0, { option: true }],
  page: async ({ context, page, packageName, sdk }, use) => {
    if (packageName === ('DEFAULT' as any)) {
      throw new Error('packageName is required');
    }
    if (sdk === ('DEFAULT' as any)) {
      throw new Error('sdk is required');
    }

    context.on('weberror', err => {
      console.error(err.error());
      throw new Error('Failing test due to error in browser: ' + err.error());
    });
    page.on('pageerror', err => {
      console.error(err);
      throw new Error('Failing test due to error in browser: ' + err);
    });

    /**
     * temporarily disable hydration error checks for hydrogen until we fix them.
     */
    const shouldCheckForHydrationError = packageName !== 'hydrogen';

    if (shouldCheckForHydrationError) {
      context.on('console', msg => {
        const originalText = msg.text();
        if (checkIfIsHydrationErrorMessage(originalText)) {
          throw new Error('Hydration error detected: ' + originalText);
        }
      });

      page.on('console', msg => {
        const originalText = msg.text();
        if (checkIfIsHydrationErrorMessage(originalText)) {
          throw new Error('Hydration error detected: ' + originalText);
        }
      });
    }

    await use(page);
  },
});
test.afterEach(screenshotOnFailure);

export { test };

export const isSSRFramework = (packageName: ServerName | 'DEFAULT') => {
  // Easier to list non-ssr than other way around.
  const isNonSSR =
    packageName === 'solid' ||
    packageName === 'react' ||
    packageName === 'svelte' ||
    packageName === 'react-native' ||
    packageName === 'angular' ||
    packageName === 'gen1-react';
  return !isNonSSR;
};

export const findTextInPage = async ({ page, text }: { page: Page; text: string }) => {
  await expect(page.locator(`text=${text}`)).toBeVisible();
};

export const checkIsRN = (sdk: Sdk) => sdk === 'reactNative';
export const checkIsGen1React = (sdk: Sdk) => sdk === 'oldReact';

type SDK_EXCLUSION_DICT = {
  [X in Sdk]?: boolean;
};

/**
 * Useful tool to skip tests when features aren't implemented in a specific output yet.
 * We use the negative tense, so that the default behavior is to run the test, unless specifically omitted.
 *
 */
export const excludeTestFor = (sdks: SDK_EXCLUSION_DICT | Array<Sdk>, sdk: Sdk) => {
  const sdkIsExcluded = Array.isArray(sdks) ? sdks.includes(sdk) : sdks[sdk];
  return sdkIsExcluded || false;
};

/**
 * We exclude some new tests from old React until we fix them.
 */
export const excludeGen1 = (sdk: Sdk) => excludeTestFor({ oldReact: true }, sdk);

/**
 * We exclude some tests from SDKs which are not from old React.
 */
export const excludeGen2 = (sdk: Sdk) =>
  excludeTestFor(
    {
      qwik: true,
      react: true,
      reactNative: true,
      rsc: true,
      solid: true,
      svelte: true,
      vue: true,
      angular: true,
    },
    sdk
  );

export const excludeRn = (sdk: Sdk) => excludeTestFor({ reactNative: true }, sdk);

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
    text.includes('[vue warn]') && (text.includes('hydration') || text.includes('mismatch'));
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

export const getClassSelector = (className: string, sdk: Sdk) => {
  return checkIsRN(sdk) ? `[data-class*=${className}]` : `.${className}`;
};

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);
export const mockFolderPath = path.join(currentDirname, '..', 'mocks');
