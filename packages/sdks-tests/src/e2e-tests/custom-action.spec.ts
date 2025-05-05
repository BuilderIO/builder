import { test, excludeGen2 } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';


const CUSTOM_ACTION_LOADED_MESSAGE =
  'BUILDER_EVENT: builder.registerAction';

test.describe('Custom actions', () => {
  test('correctly captures registering of custom action',  async ({
    page,
    basePort,
    sdk,
  }) => {
    test.skip(excludeGen2(sdk));
    
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
