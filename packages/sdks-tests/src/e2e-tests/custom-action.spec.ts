import { test,excludeGen2 } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';


const HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE =
  'BUILDER_EVENT: builder.registerAction';

test.describe('Custom actions', () => {
  test('correctly captures registering of custom action',  async ({
    page,
    basePort,
    packageName,
    sdk,
  }) => {
    test.skip(excludeGen2(sdk));
    test.skip(
      packageName !== 'gen1-react'
    );
    const customComponentMsgPromise = page.waitForEvent('console', msg =>{
      console.log('@@@@@ msg', msg);
      return msg.text().includes(HELLO_CUSTOM_COMPONENT_LOADED_MESSAGE)}
    );
    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/custom-action',
      sdk,
    });
    await customComponentMsgPromise;
  });
});
