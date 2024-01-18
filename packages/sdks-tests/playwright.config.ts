import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { EMBEDDER_PORT, targetContext } from './src/tests/context.js';
import type { PackageName, Sdk } from './src/tests/sdk.js';
import { sdk } from './src/tests/sdk.js';

const getDirName = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return __dirname;
  } catch (error) {
    return '.';
  }
};

const WEB_SERVERS: Record<Exclude<Sdk, 'all' | 'allNew'>, PackageName[]> = {
  reactNative: ['react-native'],
  solid: ['solid', 'solid-start'],
  qwik: ['qwik-city'],
  react: [
    'next-pages-dir',
    'react',
    // TO-DO: Fix this when https://github.com/vercel/next.js/issues/60491 is
    // fixed.
    // 'next-app-dir-client'
  ],
  vue: ['vue', 'nuxt'],
  svelte: ['svelte', 'sveltekit'],
  rsc: ['next-app-dir'],
  oldReact: ['gen1-react', 'gen1-next', 'gen1-remix'],
};

targetContext.name = sdk;

const packagesToRun =
  sdk === 'all'
    ? Object.values(WEB_SERVERS).flat()
    : sdk === 'allNew'
    ? Object.entries(WEB_SERVERS)
        .filter(([k]) => k !== 'oldReact')
        .map(([, v]) => v)
        .flat()
    : WEB_SERVERS[sdk];

const things = packagesToRun.map((packageName, i) => {
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
       * This provides the package name to the test as a variable to check which exact server the test is running.
       */
      packageName,
    },
  })),

  webServer: things
    .map(({ packageName, port, portFlag }) => {
      const webServers = {
        command: `PORT=${port} yarn workspace @e2e/${packageName} serve ${portFlag}`,
        port,
        reuseExistingServer: false,
        ...(packageName === 'react-native' ? { timeout: 120 * 1000 } : {}),
      };

      return webServers;
    })
    .concat([
      {
        command: `PORT=${EMBEDDER_PORT} yarn workspace @e2e/tests run-embedder`,
        port: EMBEDDER_PORT,
        reuseExistingServer: false,
      },
    ]),
});
