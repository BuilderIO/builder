import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import {
  launchEmbedderAndWaitForSdk,
  sendContentUpdateMessage,
  sendPatchOrUpdateMessage,
} from '../helpers/visual-editor.js';

test.describe('LivePreviewBlogData Component', () => {
  test('should render the page without 404', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    const response = await page.goto('/live-preview');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should display blog details correctly', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/live-preview');
    await page.waitForLoadState('networkidle');

    const blogPreview = page.locator('.blog-data-preview');
    await expect(blogPreview).toBeVisible();

    //assert the blog details coming from builder data model
    await expect(blogPreview).toContainText('Blog Title: Welcome to Visual Copilot');
    await expect(blogPreview).toContainText('Authored by: Jane Doe');
    await expect(blogPreview).toContainText('Handle: jane_doe');
    await expect(blogPreview).toContainText('Published date: Wed Feb 12 2025');
  });

  test.describe('Live Preview blog data - Visual Editor', () => {
    test('enables live previewing and editing', async ({ page, basePort, sdk, packageName }) => {
      test.skip(
        packageName === 'nextjs-sdk-next-app' ||
          packageName === 'gen1-next14-pages' ||
          packageName === 'gen1-remix' ||
          !['react'].includes(packageName),
        'Skipping test: incompatible package or framework.'
      );

      // Launch the Visual Editor and wait for SDK
      await launchEmbedderAndWaitForSdk({ path: '/live-preview', basePort, page, sdk });
      await page.waitForLoadState('networkidle');

      const NEW_CONTENT = {
        data: {
          title: 'Welcome to Builder.io',
          author: 'John Doe',
          handle: 'john_doe',
          publishedDate: 'Tue Feb 11 2025',
        },
      };

      await sendPatchOrUpdateMessage({
        page,
        content: NEW_CONTENT,
        model: 'blog-data',
        sdk,
        updateFn: content => content,
        path: '/live-preview',
      });

      await expect(
        page.frameLocator('iframe').getByText(`Blog Title: ${NEW_CONTENT.data.title}`)
      ).toBeVisible();
      await expect(
        page.frameLocator('iframe').getByText(`Authored by: ${NEW_CONTENT.data.author}`)
      ).toBeVisible();
      await expect(
        page.frameLocator('iframe').getByText(`Handle: ${NEW_CONTENT.data.handle}`)
      ).toBeVisible();
      await expect(
        page.frameLocator('iframe').getByText(`Published date: ${NEW_CONTENT.data.publishedDate}`)
      ).toBeVisible();
    });
  });
});
