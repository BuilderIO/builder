import { expect } from '@playwright/test';
import { findTextInPage, test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk, sendContentUpdateMessage } from '../helpers/visual-editor.js';

test.describe('Integrating Pages', () => {
  test.describe('Live', () => {
    test('loads homepage', async ({ page }) => {
      await page.goto('/');

      await findTextInPage({ page, text: 'Welcome to the homepage.' });
    });

    test('loads columns', async ({ page }) => {
      await page.goto('/columns');

      await findTextInPage({ page, text: 'This is the first column' });
    });
    test('loads homepage and navigates to columns', async ({ page }) => {
      await page.goto('/');

      const links = page.locator('a');

      const columnsLink = await links.filter({
        hasText: 'Columns',
      });

      await columnsLink.click();
      await findTextInPage({ page, text: 'This is the first column' });
    });
  });
  test.describe('Drafts', () => {
    test('loads homepage draft', async ({ page }) => {
      await page.goto(
        '/?builder.space=ee9f13b4981e489a9a1209887695ef2b&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=1fe45b6889284af180391da829de40a3&builder.overrides.1fe45b6889284af180391da829de40a3=1fe45b6889284af180391da829de40a3'
      );
      await expect(page.locator('body')).not.toContainText('This is the homepage.');
      await findTextInPage({ page, text: 'This is a draft.' });
    });
    test('loads draft of unpublished content', async ({ page }) => {
      await page.goto(
        '/unpublished-page?builder.space=ee9f13b4981e489a9a1209887695ef2b&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=cd1a5f025da445dfb5311494381758d5&builder.overrides.cd1a5f025da445dfb5311494381758d5=cd1a5f025da445dfb5311494381758d5&builder.overrides.page:/unpublished-page=cd1a5f025da445dfb5311494381758d5'
      );
      await findTextInPage({ page, text: 'this is a draft of an unpublished page.' });
    });
  });
  test.describe('Visual Editor', () => {
    test('enables editing', async ({ page, basePort }) => {
      await launchEmbedderAndWaitForSdk({ path: '/', basePort, page });
    });

    test('updates homepage', async ({ page, basePort, packageName }) => {
      test.skip(
        packageName === 'nextjs-sdk-next-app',
        'Nextjs SDK does not support standard page editing.'
      );

      await launchEmbedderAndWaitForSdk({ path: '/', basePort, page });

      const NEW_TEXT = 'This is a new homepage.';
      const NEW_CONTENT = {
        data: {
          themeId: false,
          title: 'editing-test',
          blocks: [
            {
              '@type': '@builder.io/sdk:Element',
              '@version': 2,
              id: 'builder-008e90aac9c84d049b78a09c8e0eff29',
              component: {
                name: 'Text',
                options: { text: NEW_TEXT },
              },
              responsiveStyles: {
                large: {
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  flexShrink: '0',
                  boxSizing: 'border-box',
                  marginTop: '20px',
                  lineHeight: 'normal',
                  height: 'auto',
                },
              },
            },
          ],
        },
      };

      await sendContentUpdateMessage({ page, newContent: NEW_CONTENT, model: 'page' });
      await expect(page.frameLocator('iframe').getByText(NEW_TEXT)).toBeVisible();
    });
  });
});
