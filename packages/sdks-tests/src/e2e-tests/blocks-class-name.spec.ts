import { expect } from '@playwright/test';
import { excludeGen1, test } from '../helpers/index.js';

test.describe('Blocks className', () => {
  test('should be present on element with class builder-blocks', async ({ page, sdk }) => {
    test.skip(excludeGen1(sdk));

    await page.goto('/blocks-class-name', { waitUntil: 'networkidle' });
    const countOfBuilderBlocksWithClassName = await page
      .locator('.builder-blocks.test-class-name')
      .count();
    expect(countOfBuilderBlocksWithClassName).toBe(1);
  });
});
