import { expect } from '@playwright/test';
import { findTextInPage, test, verifyTabContent } from '../helpers/index.js';

test.describe('Adding a child block to custom component', () => {

  test('should render a div with red background, text "I am child text block!", and an image', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/custom-child');

    const redDiv = page.locator('div[style*="background-color: red"]').first();
    await expect(redDiv).toBeVisible();

    const textBlock = redDiv.locator('div.builder-text:has-text("I am child text block!")');
    await expect(textBlock).toBeVisible();

    const imageBlock = redDiv.locator('img');
    await expect(imageBlock).toBeVisible();

    const imageSrc = await imageBlock.getAttribute('src');
    expect(imageSrc).toBeTruthy();

    const imageLoaded = await imageBlock.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalHeight !== 0
    );
    expect(imageLoaded).toBe(true);
  });
});
