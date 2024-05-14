import { expect } from '@playwright/test';
import { test, __dirname, isRNSDK } from './helpers/index.js';
import fs from 'fs';
import path from 'path';

test.describe('Basic styles', () => {
  test.fail(isRNSDK);
  test('styles should be applied consistently across all SDKs (text and buttons)', async ({
    page,
    packageName,
  }) => {
    test.skip(packageName === 'react-native');
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
  }) => {
    const mockImgPath = path.join(__dirname, '..', '..', 'mocks', 'placeholder-img.png');
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

    const builderBox = await page
      .locator('[builder-id="builder-258a89336ec44f37a38a146e698a858a"]')
      .elementHandle();

    if (!builderBox) {
      throw new Error('Builder box not found');
    }

    const children = await builderBox.$$('div[builder-id]');

    expect(children.length).toBe(3);

    const firstChild = children[0];
    const secondChild = children[1];
    const thirdChild = children[2];

    const firstChildRight = await firstChild.evaluate(el => el.getBoundingClientRect().right);
    const secondChildLeft = await secondChild.evaluate(el => el.getBoundingClientRect().left);
    const secondChildRight = await secondChild.evaluate(el => el.getBoundingClientRect().right);
    const thirdChildLeft = await thirdChild.evaluate(el => el.getBoundingClientRect().left);

    expect(firstChildRight).toBeLessThanOrEqual(secondChildLeft);
    expect(secondChildRight).toBeLessThanOrEqual(thirdChildLeft);
  });
});
