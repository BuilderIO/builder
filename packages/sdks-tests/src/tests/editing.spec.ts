import { BUILDER_TEXT_SELECTOR, test } from './helpers.js';
import { CONTENT as HOMEPAGE } from '../specs/homepage.js';
import { CONTENT as COLUMNS } from '../specs/columns.js';
import traverse from 'traverse';
import type { BuilderBlock } from '../specs/types.js';
import { EMBEDDER_PORT } from './context.js';

const checkIsElement = (x: any): x is BuilderBlock => x['@type'] === '@builder.io/sdk:Element';

const EMBEDDED_SERVER_URL = `http://localhost:${EMBEDDER_PORT}`;
const getEmbeddedServerURL = (path: string) => EMBEDDED_SERVER_URL + path;

test.describe.only('Visual Editing', () => {
  test('correctly updates Text block', async ({ page }) => {
    await page.goto(getEmbeddedServerURL('/'));

    const NEW_TEXT = 'completely new text.';
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

    await page.evaluate(msgData => {
      document.querySelector('iframe')?.contentWindow?.postMessage(
        {
          type: 'builder.contentUpdate',
          data: {
            id: msgData.id,
            data: msgData.data,
          },
        },
        '*'
      );
    }, newContent);

    const locator = page.locator(BUILDER_TEXT_SELECTOR);

    await locator.getByText(NEW_TEXT, { exact: true });
  });
  test('correctly updates Text block in a Column block', async ({ page }) => {
    await page.goto(getEmbeddedServerURL('/columns'));

    const NEW_TEXT = 'completely new text.';
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

    await page.evaluate(msgData => {
      document.querySelector('iframe')?.contentWindow?.postMessage(
        {
          type: 'builder.contentUpdate',
          data: {
            id: msgData.id,
            data: msgData.data,
          },
        },
        '*'
      );
    }, newContent);

    const locator = page.locator(BUILDER_TEXT_SELECTOR);

    await locator.getByText(NEW_TEXT, { exact: true });
  });
});
