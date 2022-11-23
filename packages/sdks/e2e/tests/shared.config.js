import { devices } from '@playwright/test';
import { targetContext } from './src/tests/context.js';
import path from 'path';
import { fileURLToPath } from 'url';

const getDirName = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return __dirname;
  } catch (error) {
    return '.';
  }
};

/**
 * @typedef {import('@playwright/test').PlaywrightTestConfig}
 * See https://playwright.dev/docs/test-configuration.
 * @param {string} packageName
 * @param {number} port
 * @return {PlaywrightTestConfig}
 */
export function configFor(packageName, port) {
  targetContext.name = packageName;

  const isReactNative = packageName.includes('react-native');
  const portFlag = isReactNative ? '' : `--port=${port}`;

  return {
    testDir: getDirName() + '/src/tests',
    /* Maximum time one test can run for. */
    timeout: 30 * 1000,
    expect: {
      /**
       * Maximum time expect() should wait for the condition to be met.
       * For example in `await expect(locator).toHaveText();`
       */
      timeout: 5000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: 2,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
      /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
      actionTimeout: 0,
      /* Base URL to use in actions like `await page.goto('/')`. */
      // baseURL: 'http://localhost:3000',

      /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
      trace: 'on-first-retry',

      baseURL: `http://localhost:${port}`,
    },

    /* Configure projects for major browsers */
    projects: [
      {
        name: 'chromium',
        use: {
          ...devices['Desktop Chrome'],
        },
      },

      // Turn on more browser in the future, at the cost of longer CI waits.

      // {
      //   name: 'firefox',
      //   use: {
      //     ...devices['Desktop Firefox'],
      //   },
      // },

      // {
      //   name: 'webkit',
      //   use: {
      //     ...devices['Desktop Safari'],
      //   },
      // },

      /* Test against mobile viewports. */
      // {
      //   name: 'Mobile Chrome',
      //   use: {
      //     ...devices['Pixel 5'],
      //   },
      // },
      // {
      //   name: 'Mobile Safari',
      //   use: {
      //     ...devices['iPhone 12'],
      //   },
      // },

      /* Test against branded browsers. */
      // {
      //   name: 'Microsoft Edge',
      //   use: {
      //     channel: 'msedge',
      //   },
      // },
      // {
      //   name: 'Google Chrome',
      //   use: {
      //     channel: 'chrome',
      //   },
      // },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',

    // This is set up for E2E testing of the compiled output; it might be useful
    // also to test against "run dev" for a faster development cycle.

    webServer: {
      command: `yarn workspace @builder.io/${packageName} run serve ${portFlag}`,
      port,
      reuseExistingServer: false,
    },
  };
}
