import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

const SDK_INJECTED_MESSAGE =
  'BUILDER_EVENT: builder.sdkInjected modelName: page apiKey: abcd';
    

test.describe('SDK', () => {
  test.only('should inject correct SDK data into iframe', async ({ page, basePort, sdk }) => {
    const msgPromise = page.waitForEvent('console',  msg =>
        msg.text().includes(SDK_INJECTED_MESSAGE)
    );

    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/editing',
      sdk,
    });
    await msgPromise;
  });
});
