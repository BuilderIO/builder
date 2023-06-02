import { defineConfig, devices } from '@playwright/test';
import { targetContext } from './src/tests/context.js';
import path from 'path';
import { fileURLToPath } from 'url';
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
  reactNative: ['e2e-react-native'],
  solid: ['e2e-solidjs', 'e2e-solid-start'],
  qwik: [
    // 'e2e-qwik',

    'e2e-qwik-city',
  ],
  react: ['e2e-nextjs-react', 'e2e-react', 'e2e-nextjs-app-dir-react'],
  vue: ['e2e-vue2', 'e2e-vue3', 'e2e-vue-nuxt3', 'e2e-vue-nuxt2'],
  svelte: ['e2e-svelte', 'e2e-sveltekit'],
  rsc: [],
  oldReact: ['e2e-old-react', 'e2e-old-nextjs', 'e2e-old-react-remix'],
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
  const isReactNative = packageName === 'e2e-react-native';
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
  /* Retry on CI only */
  retries: 2,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

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
      /**
       * This provides the package name to the test as a variable to check which exact server the test is running.
       */
      packageName,
    },
  })),

  webServer: things.map(({ packageName, port, portFlag }) => {
    const server = {
      command: `PORT=${port} yarn workspace @builder.io/${packageName} run serve ${portFlag}`,
      port,
      reuseExistingServer: false,
    };
    return server;
  }),
});
