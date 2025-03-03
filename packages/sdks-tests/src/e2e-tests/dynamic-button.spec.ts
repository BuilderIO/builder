import { expect } from '@playwright/test';
import { checkIsRN, test } from '../helpers/index.js';
import {
  cloneContent,
  launchEmbedderAndWaitForSdk,
  sendContentUpdateMessage,
} from '../helpers/visual-editor.js';
import { DYNAMIC_BUTTON } from '../specs/dynamic-button.js';

test.describe('Dynamic Button', () => {
  test('should render a button', async ({ page, sdk, basePort }) => {

    await launchEmbedderAndWaitForSdk({
      path: '/dynamic-button',
      basePort,
      page,
      sdk,
    });

    const buttonLocator = checkIsRN(sdk) ? page.frameLocator('iframe').locator('button') : page
    .frameLocator('iframe')
    .locator('[builder-id="builder-b53d1cc2bcbb481b869207fdd97ee1db"]');
    
    await expect(buttonLocator).toHaveText('Click me!');
    const newContent = cloneContent(DYNAMIC_BUTTON);

    //simulating typing in the link field
    newContent.data.blocks[0].component.options.link = '#';
    await sendContentUpdateMessage({
      page,
      newContent,
      model: 'page',
    });

    newContent.data.blocks[0].component.options.link = '#g';
    await sendContentUpdateMessage({
      page,
      newContent,
      model: 'page',
    });

    newContent.data.blocks[0].component.options.link = '#go';
    await sendContentUpdateMessage({
      page,
      newContent,
      model: 'page',
    });

    const updatedButtonLocator = checkIsRN(sdk) ? page.frameLocator('iframe').locator('a') : page
      .frameLocator('iframe')
      .locator('[builder-id="builder-b53d1cc2bcbb481b869207fdd97ee1db"]');

    await expect(updatedButtonLocator).toBeVisible();
    
    await expect(updatedButtonLocator).toHaveAttribute('href', '#go');
  });
});
