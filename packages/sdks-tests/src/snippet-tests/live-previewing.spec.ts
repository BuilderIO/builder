import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk, sendPatchOrUpdateMessage } from '../helpers/visual-editor.js';

test.describe('LivePreviewBlogData Component', () => {
  test('should render the page without 404', async ({ page, packageName }) => {
    test.skip(!['react', 'vue', 'nuxt'].includes(packageName));

    const response = await page.goto('/live-preview');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should display blog details correctly', async ({ page, packageName }) => {
    test.skip(!['react', 'vue', 'nuxt'].includes(packageName));

    await page.goto('/live-preview');

    const blogPreview = page.locator('.blog-data-preview');
    await expect(blogPreview).toBeVisible();

    //assert the blog details coming from builder data model
    await expect(blogPreview).toContainText('Blog Title: Welcome to Builder.io');
    await expect(blogPreview).toContainText('Authored by: John Doe');
    await expect(blogPreview).toContainText('Handle: john_doe');
  });

  test.describe('Live Preview blog data - Visual Editor', () => {
    test('enables live previewing and editing', async ({ page, basePort, sdk, packageName }) => {
      test.skip(
        packageName === 'nextjs-sdk-next-app' ||
          packageName === 'gen1-next14-pages' ||
          packageName === 'gen1-remix' ||
          !['react', 'vue', 'nuxt'].includes(packageName),
        'Skipping test: incompatible package or framework.'
      );

      await launchEmbedderAndWaitForSdk({ path: '/live-preview', basePort, page, sdk });

      const INITIAL_CONTENT = {
        data: {
          title: 'Welcome to Builder.io',
          author: 'John Doe',
          handle: 'john_doe',
        },
      };
      await expect(
        page.frameLocator('iframe').getByText(`Blog Title: ${INITIAL_CONTENT.data.title}`)
      ).toBeVisible();
      await expect(
        page.frameLocator('iframe').getByText(`Authored by: ${INITIAL_CONTENT.data.author}`)
      ).toBeVisible();
      await expect(
        page.frameLocator('iframe').getByText(`Handle: ${INITIAL_CONTENT.data.handle}`)
      ).toBeVisible();

      const UPDATED_CONTENT = {
        data: {
          title: 'Welcome to Visual Editor',
          author: 'Jane Doe',
          handle: 'jane_doe',
        },
      };

      await sendPatchOrUpdateMessage({
        page,
        content: UPDATED_CONTENT,
        model: 'blog-data',
        sdk,
        updateFn: content => content,
        path: '/live-preview',
      });

      await expect(
        page.frameLocator('iframe').getByText(`Blog Title: ${UPDATED_CONTENT.data.title}`)
      ).toBeVisible();
      await expect(
        page.frameLocator('iframe').getByText(`Authored by: ${UPDATED_CONTENT.data.author}`)
      ).toBeVisible();
      await expect(
        page.frameLocator('iframe').getByText(`Handle: ${UPDATED_CONTENT.data.handle}`)
      ).toBeVisible();
    });
  });
});
