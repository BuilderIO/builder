import { expect } from '@playwright/test';
import { excludeGen1, excludeTestFor, test } from '../helpers/index.js';

test.describe.only('Blocks className', () => {
  test('call proxy API only once - in page', async ({ page, sdk }) => {
    test.skip(excludeGen1(sdk));
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

    await page.goto('/blocks-class-name', { waitUntil: 'networkidle' });
    const countOfBuilderBlocksWithClassName = await page
      .locator('.builder-blocks.test-class-name')
      .count();
    expect(countOfBuilderBlocksWithClassName).toBe(1);
  });
});
