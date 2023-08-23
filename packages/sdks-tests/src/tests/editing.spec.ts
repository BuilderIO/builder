import { test } from './helpers.js';
import { CONTENT as HOMEPAGE } from '../specs/homepage.js';
import { CONTENT as COLUMNS } from '../specs/columns.js';
import traverse from 'traverse';
import type { BuilderBlock, BuilderContent } from '../specs/types.js';
import { EMBEDDER_PORT } from './context.js';
import { expect, type Page } from '@playwright/test';

const checkIsElement = (x: any): x is BuilderBlock => x['@type'] === '@builder.io/sdk:Element';

const EMBEDDED_SERVER_URL = `http://localhost:${EMBEDDER_PORT}`;
const getEmbeddedServerURL = (path: string, port: number) =>
  EMBEDDED_SERVER_URL + path + '?port=' + port;

const sendContentUpdateMessage = async (page: Page, newContent: BuilderContent) => {
  await page.evaluate(msgData => {
    document.querySelector('iframe')?.contentWindow?.postMessage(
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
      packageName === 'qwik-city' ||
        packageName === 'react-native' ||
        packageName === 'next-app-dir' ||
        packageName === 'vue3' ||
        packageName === 'vue2' ||
        packageName === 'sveltekit' ||
        packageName === 'nuxt3'
    );

    await page.goto(getEmbeddedServerURL('/', basePort));

    const NEW_TEXT = 'completely-new-text';
    const newContent = { ...HOMEPAGE };

    traverse(newContent).forEach(function (x) {
      if (!checkIsElement(x)) return;

      if (x.component?.name === 'Text') {
        x.component.options.text = NEW_TEXT;
        this.stop();
      }
    });

    if (newContent.data.blocks[0].children?.[0].component?.options.text) {
      newContent.data.blocks[0].children[0].component.options.text = NEW_TEXT;
    }

    await sendContentUpdateMessage(page, newContent);

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

    await page.goto(getEmbeddedServerURL('/columns', basePort));

    const NEW_TEXT = 'completely-new-text';
    const newContent = { ...COLUMNS };

    // update first text block in first column.
    traverse(newContent).forEach(function (x) {
      if (!checkIsElement(x)) return;

      if (x.component?.name === 'Columns') {
        traverse(x).forEach(function (y) {
          if (!checkIsElement(y)) return;

          if (y.component?.name === 'Text') {
            y.component.options.text = NEW_TEXT;
            this.stop();
          }
        });
        this.stop();
      }
    });

    await expect(page.frameLocator('iframe').getByText(NEW_TEXT)).not.toBeVisible();
    await sendContentUpdateMessage(page, newContent);

    await expect(page.frameLocator('iframe').getByText(NEW_TEXT)).toBeVisible();
  });
});
