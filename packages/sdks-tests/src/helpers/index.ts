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
  ignoreHydrationErrors: boolean;
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

const isIgnorableError = (error: Error) => {
  return error.message.includes(
    /**
     * This error started appearing recently across all frameworks.
     * It is most likely some playwright browser issue and not something we can fix in our code.
     */
    "Failed to execute 'observe' on 'PressureObserver': Access to the feature \"compute pressure\" is disallowed by permissions policy"
  );
};

const test = base.extend<TestOptions>({
  // this is provided by `playwright.config.ts`
  packageName: ['DEFAULT' as any, { option: true }],
  sdk: ['DEFAULT' as any, { option: true }],
  basePort: [0, { option: true }],
  ignoreHydrationErrors: [false, { option: true }],
  page: async ({ context, page, packageName, sdk, ignoreHydrationErrors }, use) => {
    if (packageName === ('DEFAULT' as any)) {
      throw new Error('`packageName` is required but was not provided.');
    }
    if (sdk === ('DEFAULT' as any)) {
      throw new Error('`sdk` is required but was not provided.');
    }

    context.on('weberror', err => {
      if (isIgnorableError(err.error())) return;

      console.error(err.error());
      throw new Error('Test failed due to error thrown in browser: ' + err.error());
    });
    page.on('pageerror', err => {
      if (isIgnorableError(err)) return;

      console.error(err);
      throw new Error('Test failed due to error thrown in browser: ' + err);
    });

    /**
     * temporarily disable hydration error checks for hydrogen until we fix them.
     */
    const shouldCheckForHydrationError = packageName !== 'hydrogen' && !ignoreHydrationErrors;

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
    if (sdk === 'angular') {
      page.on('console', msg => {
        const originalText = msg.text();
        if (originalText.includes('NG0303')) {
          throw new Error('Angular input not annotated error detected: ' + originalText);
        }
      });
    } else if (sdk === 'vue') {
      page.on('console', msg => {
        const originalText = msg.text();
        if (originalText.toLowerCase().includes('[vue warn]:')) {
          throw new Error('Vue warning detected: ' + originalText);
        }
      });
      context.on('console', msg => {
        const originalText = msg.text();
        if (originalText.toLowerCase().includes('[vue warn]:')) {
          throw new Error('Vue warning detected: ' + originalText);
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
    packageName === 'react-native-74' ||
    packageName === 'react-native-76-fabric' ||
    packageName === 'gen1-react';
  return !isNonSSR;
};

export const findTextInPage = async ({ page, text }: { page: Page; text: string }) => {
  await expect(page.locator(`text=${text}`)).toBeVisible();
};

export const verifyTabContent = async (
  page: Page,
  tabButtonText: string,
  expectedVisibleContent: string,
  expectedHiddenContent: string
): Promise<void> => {
  await page.click(`button:has-text("${tabButtonText}")`);

  const visibleContent = page.locator(`[builder-path="${expectedVisibleContent}"]`);
  await expect(visibleContent).toBeVisible();

  const hiddenContent = page.locator(`[builder-path="${expectedHiddenContent}"]`);
  await expect(hiddenContent).not.toBeVisible();
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

export async function testClickAndVerifyVisibility(
  page: Page,
  buttonText: string,
  contentText: string
) {
  await page.click(`button:has-text("${buttonText}")`);
  const content = await page.waitForSelector(`div:has-text("${contentText}")`, {
    state: 'visible',
  });
  return content.isVisible();
}

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

export const mapSdkName = (sdk: string): string => {
  return sdk === 'oldReact' ? 'react' : sdk;
};

export const getSdkGeneration = (sdk: string): string => {
  return sdk === 'oldReact' ? '1' : '2';
};
