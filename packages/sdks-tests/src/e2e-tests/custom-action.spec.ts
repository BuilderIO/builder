import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

const CUSTOM_ACTION_LOADED_MESSAGE = 'BUILDER_EVENT: builder.registerAction';

test.describe.only('Custom actions', () => {
  test('correctly captures registering of custom action', async ({ page, basePort, sdk }) => {

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
