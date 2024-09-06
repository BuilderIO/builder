import { expect } from '@playwright/test';
import { excludeGen2, excludeTestFor, test } from '../helpers/index.js';
import {
  launchEmbedderAndWaitForSdk,
  sendContentUpdateMessage,
  sendPatchUpdatesMessage,
} from '../helpers/visual-editor.js';
import { LARGE_REACTIVE_STATE_CONTENT } from '../specs/large-reactive-state.js';

test.describe('Large Reactive State', () => {
  test('renders entire page correctly', async ({ page, sdk }) => {
    test.skip(sdk === 'qwik', 'performance improvement not implemented yet');
    await page.goto('/large-reactive-state');

    await expect(page.getByText('0', { exact: true })).toBeVisible();
    await expect(page.getByText('Dummy text block 1000')).toBeVisible();
  });

  test('maintains reactivity with large state', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));
    test.skip(excludeGen2(sdk), 'performance improvement not implemented yet');

    await page.goto('/large-reactive-state');

    // Initial state
    await expect(page.getByText('0', { exact: true })).toBeVisible();

    // Increment multiple times
    for (let i = 1; i <= 5; i++) {
      await page.getByText('Increment Number').click();
      await expect(page.getByText(`${i}`, { exact: true })).toBeVisible();
    }
  });

  test('performance check for large state updates', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));
    test.skip(excludeGen2(sdk), 'performance improvement not implemented yet');

    await page.goto('/large-reactive-state');

    const startTime = Date.now();

    // Perform multiple state updates
    for (let i = 0; i < 10; i++) {
      await page.getByText('Increment Number').click();
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assuming a threshold of 1000ms for 10 updates
    expect(duration).toBeLessThan(2000);

    // Verify final state
    await expect(page.getByText('10', { exact: true })).toBeVisible();
  });

  test('stress test visual editor sending multiple updates', async ({
    page,
    sdk,
    basePort,
    packageName,
  }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));
    test.skip(
      packageName === 'gen1-next' || packageName === 'gen1-remix',
      'visual editing is only implemented for gen1 react-vite.'
    );
    test.skip(excludeGen2(sdk), 'performance improvement not implemented yet');

    await launchEmbedderAndWaitForSdk({
      path: '/large-reactive-state-editing',
      basePort,
      page,
      sdk,
    });

    const startTime = Date.now();
    const updatedContent = JSON.parse(JSON.stringify(LARGE_REACTIVE_STATE_CONTENT));

    const numUpdates = 10;

    for (let i = 0; i < numUpdates; i++) {
      const newText =
        updatedContent.data.blocks[0].component.options.columns[0].blocks[0].component.options.text.replace(
          'Below',
          'BelowX'
        );

      updatedContent.data.blocks[0].component.options.columns[0].blocks[0].component.options.text =
        newText;

      if (sdk === 'oldReact') {
        await sendPatchUpdatesMessage({
          page,
          patches: [
            {
              op: 'replace',
              path: '/data/blocks/0/component/options/columns/0/blocks/0/component/options/text',
              value: newText,
            },
          ],
          id: updatedContent.id,
        });
      } else {
        await sendContentUpdateMessage({
          page,
          newContent: updatedContent,
          model: 'page',
        });
      }
    }

    // Verify the final state
    await expect(
      page.frameLocator('iframe').getByText(`Below${'X'.repeat(numUpdates)}`)
    ).toBeVisible();

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(10000);
  });
});
