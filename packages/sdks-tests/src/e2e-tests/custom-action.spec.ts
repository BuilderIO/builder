import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

const CUSTOM_ACTION_LOADED_MESSAGE = 'BUILDER_EVENT: builder.registerAction';

test.describe('Custom actions', () => {
  test('correctly captures registering of custom action', async ({ page, basePort, packageName, sdk }) => {
    test.skip([
      'solid',
      'solid-start',
      'react-sdk-next-pages',
      'remix','react-sdk-next-14-app',
      'react-sdk-next-15-app',
      'nextjs-sdk-next-app',
      'vue',
      'svelte',
      'sveltekit'
    ].includes(packageName));

    const customActionMsgPromise = page.waitForEvent('console', msg =>
      msg.text().includes(CUSTOM_ACTION_LOADED_MESSAGE)
    );
    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/custom-action',
      sdk,
    });
    await customActionMsgPromise;
  });
});
