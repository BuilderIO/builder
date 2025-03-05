import { expect } from '@playwright/test';
import { checkIsRN, test } from '../helpers/index.js';
import {
  cloneContent,
  launchEmbedderAndWaitForSdk,
  sendPatchOrUpdateMessage,
} from '../helpers/visual-editor.js';
import { DYNAMIC_BUTTON } from '../specs/dynamic-button.js';

test.describe('Dynamic Button', () => {
  test('should render a button', async ({ page, sdk, basePort, packageName }) => {
    test.fail(sdk === 'svelte' || sdk === 'oldReact', 'Not showing the href attribute in Svelte');
    test.skip(
      packageName === 'nextjs-sdk-next-app' ||
        packageName === 'gen1-next14-pages' ||
        packageName === 'gen1-next15-app' ||
        packageName === 'gen1-remix'
    );
    await launchEmbedderAndWaitForSdk({
      path: '/dynamic-button',
      basePort,
      page,
      sdk,
    });

    const buttonLocator = checkIsRN(sdk)
      ? page.frameLocator('iframe').locator('button')
      : page
          .frameLocator('iframe')
          .locator('[builder-id="builder-b53d1cc2bcbb481b869207fdd97ee1db"]');

    await expect(buttonLocator).toHaveText('Click me!');
    const newContent = cloneContent(DYNAMIC_BUTTON);

    // simulating typing in the link field
    await sendPatchOrUpdateMessage({
      page,
      content: cloneContent(DYNAMIC_BUTTON),
      model: 'page',
      sdk,
      updateFn: () => '#',
      path: '/data/blocks/0/component/options/link',
    });

    await sendPatchOrUpdateMessage({
      page,
      content: newContent,
      model: 'page',
      sdk,
      updateFn: () => '#g',
      path: '/data/blocks/0/component/options/link',
    });

    await sendPatchOrUpdateMessage({
      page,
      content: newContent,
      model: 'page',
      sdk,
      updateFn: () => '#go',
      path: '/data/blocks/0/component/options/link',
    });

    const updatedButtonLocator = checkIsRN(sdk)
      ? page.frameLocator('iframe').locator('a')
      : page
          .frameLocator('iframe')
          .locator('[builder-id="builder-b53d1cc2bcbb481b869207fdd97ee1db"]');

    await expect(updatedButtonLocator).toBeVisible();

    await expect(updatedButtonLocator).toHaveAttribute('href', '#go');
  });
});
