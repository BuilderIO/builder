import type { Page } from '@playwright/test';
import { EMBEDDER_PORT, GEN1_SDK_LOADED_MSG, GEN2_SDK_LOADED_MSG } from './context.js';
import type { BuilderContent } from '../specs/types.js';
import type { Sdk } from './sdk.js';
import { PAGES } from '../specs/index.js';

const EMBEDDED_SERVER_URL = `http://localhost:${EMBEDDER_PORT}`;
const getEmbeddedServerURL = (path: string, port: number) =>
  EMBEDDED_SERVER_URL + path + '?port=' + port;

export const launchEmbedderAndWaitForSdk = async ({
  page,
  basePort,
  path,
  gotoOptions,
  sdk,
}: {
  page: Page;
  basePort: number;
  path: string;
  gotoOptions?: Parameters<Page['goto']>[1];
  sdk?: Sdk;
}) => {
  if (sdk === 'oldReact') {
    await page.route('https://cdn.builder.io/api/v3/content/**', async route => {
      const newLocal = PAGES[path as keyof typeof PAGES];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [newLocal] }),
      });
    });
  }

  const msgPromise = page.waitForEvent(
    'console',
    msg => msg.text().includes(GEN2_SDK_LOADED_MSG) || msg.text().includes(GEN1_SDK_LOADED_MSG)
  );
  await page.goto(getEmbeddedServerURL(path, basePort), gotoOptions);
  await msgPromise;
};

export const sendContentUpdateMessage = async ({
  page,
  newContent,
  model,
}: {
  page: Page;
  newContent: BuilderContent;
  model: string;
}) => {
  await page.evaluate(
    msgData => {
      const contentWindow = document.querySelector('iframe')?.contentWindow;
      if (!contentWindow) throw new Error('Could not find iframe');

      contentWindow.postMessage(
        {
          type: 'builder.contentUpdate',
          data: {
            key: msgData.model,
            data: {
              id: msgData.id,
              data: msgData.data,
            },
          },
        },
        '*'
      );
    },
    { ...newContent, model }
  );
};

type Patch = {
  op: 'replace' | 'add' | 'remove';
  path: string;
  value: string;
};

export const sendPatchUpdatesMessage = async ({
  page,
  patches,
  id,
}: {
  page: Page;
  patches: Patch[];
  id: string;
}) => {
  await page.evaluate(
    msgData => {
      const contentWindow = document.querySelector('iframe')?.contentWindow;
      if (!contentWindow) throw new Error('Could not find iframe');

      contentWindow.postMessage(
        {
          type: 'builder.patchUpdates',
          data: {
            data: {
              [msgData.id]: msgData.patches,
            },
          },
        },
        '*'
      );
    },
    { patches, id }
  );
};

export const sendUpdateTextMessage = async ({
  page,
  content,
  model,
  sdk,
  updateFn,
}: {
  page: Page;
  content: BuilderContent;
  model: string;
  sdk: Sdk;
  updateFn: (text: string) => string;
}) => {
  const path = '/data/blocks/0/component/options/columns/0/blocks/0/component/options/text';

  const pathParts = path.split('/').filter(Boolean);
  let target: any = content;
  for (let i = 0; i < pathParts.length - 1; i++) {
    target = target[pathParts[i]];
  }

  const lastKey = pathParts[pathParts.length - 1];
  const newText = updateFn(target[lastKey]);
  target[lastKey] = newText;

  if (sdk === 'oldReact') {
    await sendPatchUpdatesMessage({
      page,
      patches: [{ op: 'replace', path, value: newText }],
      id: content.id ?? '',
    });
  } else {
    await sendContentUpdateMessage({
      page,
      newContent: content,
      model,
    });
  }

  return content;
};
