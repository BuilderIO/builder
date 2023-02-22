import { defineConfig, devices } from '@playwright/test';
import { targetContext } from './src/tests/context.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { sdk, Sdk } from './src/tests/sdk.js';

const getDirName = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return __dirname;
  } catch (error) {
    return '.';
  }
};

const WEB_SERVERS: Record<Sdk, string[]> = {
  reactNative: ['e2e-react-native'],
  solid: ['e2e-solidjs'],
  qwik: ['e2e-qwik', 'e2e-qwik-city'],
  react: ['e2e-nextjs-react', 'e2e-react'],
  vue: ['e2e-vue2', 'e2e-vue3'],
  svelte: ['e2e-svelte', 'e2e-sveltekit'],
  rsc: [],
  oldReact: ['e2e-old-react', 'e2e-old-nextjs'],
};

targetContext.name = sdk;

const isReactNative = sdk === 'reactNative';

const things = WEB_SERVERS[sdk].map((packageName, i) => {
  const port = isReactNative ? 19006 : 1234 + i;
  const portFlag = isReactNative ? '' : `--port=${port}`;

  return {
    port,
    packageName,
    portFlag,
  };
});

export default defineConfig({
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

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // screenshot: 'on',
  },

  /* Configure projects for major browsers */
  projects: things.map(({ packageName, port, portFlag }) => ({
    name: `Chromium - ${packageName}`,
    use: {
      ...devices['Desktop Chrome'],
      baseURL: `http://localhost:${port}`,
      /**
       * This provides the package name to the test as a variable to check which exact server the test is running.
       */
      packageName,
    },
  })),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  // This is set up for E2E testing of the compiled output; it might be useful
  // also to test against "run dev" for a faster development cycle.

  webServer: things.map(({ packageName, port, portFlag }) => {
    const server = {
      command: `yarn workspace @builder.io/${packageName} run serve ${portFlag}`,
      port,
      reuseExistingServer: false,
    };
    return server;
  }),
});
