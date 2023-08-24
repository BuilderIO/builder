import { test } from './helpers.js';
import { MODIFIED_HOMEPAGE } from '../specs/homepage.js';
import { MODIFIED_COLUMNS } from '../specs/columns.js';
import type { BuilderContent } from '../specs/types.js';
import { expect, type Page } from '@playwright/test';
import { NEW_TEXT } from '../specs/helpers.js';

const createContent = ({ path, port }: { path: string; port: number }) => {
  // `builder.frameEditing` enables visual editing
  const url = `http://localhost:${port}${path}?builder.frameEditing=true`;

  return `
<body style="margin:0px;padding:0px;overflow:hidden">
  <iframe
    src="${url}"
    frameborder="0"
    style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px"
    height="100%"
    width="100%">
  </iframe>
</body>`;
};

const sendContentUpdateMessage = async (page: Page, newContent: BuilderContent) => {
  await page.evaluate(msgData => {
    const contentWindow = document.querySelector('iframe')?.contentWindow;

    if (!contentWindow) throw new Error('Could not find iframe');

    console.log('sending message!');

    contentWindow.postMessage(
      {
        type: 'builder.contentUpdate',
        data: {
          key: 'page',
          data: {
            id: msgData.id,
            data: msgData.data,
          },
        },
      },
      '*'
    );
  }, newContent);
};

test.describe('Visual Editing', () => {
  test('correctly updates Text block', async ({ page, basePort, packageName }) => {
    if (packageName === 'gen1-next' || packageName === 'gen1-react' || packageName === 'gen1-remix')
      test.skip();

    // TO-DO: temporary while we fix the SDKs
    test.skip(
      packageName === 'react-native' ||
        packageName === 'next-app-dir' ||
        packageName === 'vue3' ||
        packageName === 'vue2' ||
        packageName === 'sveltekit' ||
        packageName === 'nuxt3'
    );

    await page.setContent(createContent({ path: '/', port: basePort }));

    /**
     * Make sure the homepage loaded inside the iframe
     */
    const links = page.frameLocator('iframe').locator('a');
    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });
    await expect(columnsLink).toHaveCount(1);

    await sendContentUpdateMessage(page, MODIFIED_HOMEPAGE);

    await page.frameLocator('iframe').getByText(NEW_TEXT).waitFor();
  });
  test('correctly updates Text block in a Column block', async ({
    page,
    basePort,
    packageName,
  }) => {
    if (packageName === 'gen1-next' || packageName === 'gen1-react' || packageName === 'gen1-remix')
      test.skip();

    // TO-DO: temporary while we fix the SDKs
    test.skip(
      packageName === 'qwik-city' ||
        packageName === 'react-native' ||
        packageName === 'next-app-dir' ||
        packageName === 'vue3' ||
        packageName === 'vue2' ||
        packageName === 'sveltekit' ||
        packageName === 'nuxt3'
    );

    await page.setContent(createContent({ path: '/columns', port: basePort }));
    await page.frameLocator('iframe').getByText('Stack at tablet');

    await sendContentUpdateMessage(page, MODIFIED_COLUMNS);

    await expect(page.frameLocator('iframe').getByText(NEW_TEXT)).toBeVisible();
  });
});
