import { expect } from '@playwright/test';
import { test, checkIsRN, mockFolderPath } from '../helpers/index.js';
import fs from 'fs';
import path from 'path';

test.describe('Basic styles', () => {
  test('styles should be applied consistently across all SDKs (text and buttons)', async ({
    page,
    sdk,
    packageName,
  }) => {
    test.fail(checkIsRN(sdk));
    test.fail(packageName === 'hydrogen');
    await page.goto('/basic-styles');

    const button = page.getByRole('button', { name: 'Click Me!' });

    const buttonWidth = await button.evaluate(el => el.getBoundingClientRect().width);
    expect(buttonWidth).toBe(1264);

    const centeredAlignedText = page.locator('text=Centered aligned');
    const leftAlignedText = page.locator('text=Left aligned');
    const rightAlignedText = page.locator('text=Right aligned');

    expect(await centeredAlignedText.evaluate(el => getComputedStyle(el).color)).toBe(
      'rgb(0, 255, 16)'
    );
    expect(
      await centeredAlignedText.evaluate(el => el.getBoundingClientRect().left)
    ).toBeGreaterThan(580);

    expect(await leftAlignedText.evaluate(el => getComputedStyle(el).color)).toBe('rgb(255, 0, 0)');
    expect(await leftAlignedText.evaluate(el => el.getBoundingClientRect().left)).toBeLessThan(10);

    expect(await rightAlignedText.evaluate(el => getComputedStyle(el).color)).toBe(
      'rgb(0, 24, 255)'
    );
    expect(await rightAlignedText.evaluate(el => el.getBoundingClientRect().right)).toBeGreaterThan(
      1200
    );
  });

  test('Box with flex-direction row should have children aligned horizontally', async ({
    page,
    sdk,
  }) => {
    test.fail(checkIsRN(sdk));
    const mockImgPath = path.join(mockFolderPath, 'placeholder-img.png');
    const mockImgBuffer = fs.readFileSync(mockImgPath);

    await page.route('**/*', route => {
      const request = route.request();
      if (request.url().includes('cdn.builder.io/api/v1/image')) {
        return route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: mockImgBuffer,
        });
      } else {
        return route.continue();
      }
    });

    await page.goto('/basic-styles');

    const builderBoxChildren = page
      .locator('[builder-id="builder-258a89336ec44f37a38a146e698a858a"]')
      .locator('div[builder-id]');

    await expect(builderBoxChildren).toHaveCount(3);

    const firstChild = builderBoxChildren.nth(0);
    const secondChild = builderBoxChildren.nth(1);
    const thirdChild = builderBoxChildren.nth(2);

    const firstChildRight = await firstChild.evaluate(el => el.getBoundingClientRect().right);
    const secondChildLeft = await secondChild.evaluate(el => el.getBoundingClientRect().left);
    const secondChildRight = await secondChild.evaluate(el => el.getBoundingClientRect().right);
    const thirdChildLeft = await thirdChild.evaluate(el => el.getBoundingClientRect().left);

    expect(firstChildRight).toBeLessThanOrEqual(secondChildLeft);
    expect(secondChildRight).toBeLessThanOrEqual(thirdChildLeft);
  });
});
