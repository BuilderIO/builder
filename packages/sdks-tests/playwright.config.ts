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
  const port = isReactNative ? 19006 : 1111 + i;
  const portFlag = isReactNative ? '' : `--port=${port}`;

  return {
    port,
    packageName,
    portFlag,
  };
});

export default defineConfig({
  testDir: getDirName() + '/src/tests',
  // testMatch: '**/*.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [[process.env.CI ? 'github' : 'list'], ['html']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
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
      command: `PORT=${port} yarn workspace @e2e/${packageName} serve ${portFlag}`,
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
