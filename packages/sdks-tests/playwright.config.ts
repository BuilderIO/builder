import { z } from 'zod';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { EMBEDDER_PORT } from './src/helpers/context.js';
import { SDK_MAP, serverNames } from './src/helpers/sdk.js';

const getDirName = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return __dirname;
  } catch (error) {
    return '.';
  }
};

const things = serverNames.map((packageName, i) => {
  const isReactNative = packageName === 'react-native';
  const port = 1111 + i;
  const portFlag = isReactNative ? `-l ${port}` : `--port=${port}`;

  return {
    port,
    packageName,
    portFlag,
  };
});

const TestTypeEnum = z.enum(['e2e', 'snippet']);
const testType = TestTypeEnum.parse(process.env.TEST_TYPE);

/**
 * used to run the dev command when testing locally
 */
const IS_DEV_MODE = process.env.TEST_ENV === 'dev';

export default defineConfig({
  testDir: getDirName() + `/src/${testType}-tests`,
  // testMatch: '**/*.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Allow retrying snippet tests because they're not deterministic */
  retries: testType === 'snippet' ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [[process.env.CI ? 'github' : 'list'], ['html']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
  },

  expect: {
    /**
     * Increase the default timeout for snippet tests because they're not deterministic.
     */
    timeout: testType === 'snippet' ? 30000 : 5000,
  },

  /* Configure projects for major browsers */
  projects: things.map(({ packageName, port }) => ({
    name: packageName,
    use: {
      ...devices['Desktop Chrome'],
      baseURL: `http://localhost:${port}`,
      basePort: port,
      /**
       * This provides the package and SDK names to the test as variables to check which exact server the test is running.
       */
      packageName,
      sdk: SDK_MAP[packageName],
    },
  })),

  webServer: things
    .map(({ packageName, port, portFlag }) => ({
      command: `PORT=${port} yarn workspace @${testType}/${packageName} ${IS_DEV_MODE ? 'dev' : 'serve'} ${portFlag}`,
      port,
      reuseExistingServer: false,
      ...(packageName === 'react-native' ? { timeout: 120 * 1000 } : {}),
    }))
    .concat([
      {
        command: `PORT=${EMBEDDER_PORT} yarn workspace @sdk/tests run-embedder`,
        port: EMBEDDER_PORT,
        reuseExistingServer: false,
      },
    ]),
});
