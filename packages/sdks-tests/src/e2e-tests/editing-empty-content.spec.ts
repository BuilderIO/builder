import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk, sendContentUpdateMessage } from '../helpers/visual-editor.js';
import { CONTENT } from '../specs/text-block.js';

test.describe('Editing empty content', () => {
  /**
   * We are ignoring hydration warnings here because this occurs in a specific scenario where we are either editing or previewing
   * and `content` provided is `null`. In this case, the `div` for `EnableEditor` is only attached on the client.
   */
  test.use({ ignoreHydrationErrors: true });

  test('should be able to edit when content prop is not provided', async ({
    page,
    sdk,
    basePort,
    packageName,
  }) => {
    test.skip(packageName !== 'nuxt');

    await launchEmbedderAndWaitForSdk({
      // special page added only in nuxt e2e that doesn't pass `content`
      path: '/preview-and-edit-content-empty',
      page,
      sdk,
      basePort,
    });

    await sendContentUpdateMessage({
      page,
      newContent: CONTENT,
      model: 'page',
    });

    await expect(page.frameLocator('iframe').getByText('Start of text box.')).toBeVisible();
  });
});
