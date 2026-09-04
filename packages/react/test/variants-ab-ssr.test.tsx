jest.mock(
  'src/functions/extract-localized-values',
  () => ({ containsLocalizedValues: () => false, extractLocalizedValues: () => ({}) }),
  { virtual: true }
);

import React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { CookieJar } from 'tough-cookie';
import { BuilderComponent } from '../src/components/builder-component.component';
import { builder } from '@builder.io/sdk';

builder.init('abc123');

const CONTENT_ID = 'contentid1';
const VARIATION_ID = 'variationa1';

const textBlock = (text: string) => ({
  '@type': '@builder.io/sdk:Element' as const,
  id: 'blk-' + text,
  component: { name: 'Text', options: { text } },
});

const getContent = () => ({
  id: CONTENT_ID,
  name: 'test',
  data: { blocks: [textBlock('CONTROL')] },
  variations: {
    [VARIATION_ID]: {
      id: VARIATION_ID,
      name: 'Variation A',
      // Lower than the mocked Math.random (0.1234), so the random path never
      // picks this variation. Anything that selects it did so deliberately.
      testRatio: 0.05,
      data: { blocks: [textBlock('VARIATION_A')] },
    },
  },
});

const ssrHtml = () =>
  renderToString(<BuilderComponent model="page" content={getContent() as any} />);

/** Parses the SSR output in jsdom, which runs the inlined variants script as a browser would. */
const runInBrowser = (html: string, { url, cookie }: { url: string; cookie?: string }) => {
  const cookieJar = new CookieJar();
  if (cookie) {
    cookieJar.setCookieSync(cookie + '; Path=/', url);
  }
  const dom = new JSDOM('<html><body>' + html + '</body></html>', {
    url,
    cookieJar,
    runScripts: 'dangerously',
    // the inlined script runs inside this window, so it needs its own stub. 0.9999 is
    // above every testRatio below, so the random path always lands on the control.
    beforeParse(window) {
      window.Math.random = () => 0.9999;
    },
  });
  return dom.window.document.body.innerHTML;
};

const CONTROL_BLOCK = 'blk-CONTROL';
const VARIATION_BLOCK = 'blk-VARIATION_A';

describe('SSR a/b test variant selection', () => {
  test('inlined variants script is syntactically valid', () => {
    const script = ssrHtml().match(/<script id="variants-script-[^"]+">([\s\S]*?)<\/script>/);
    expect(script).toBeTruthy();
    expect(() => new Function(script![1])).not.toThrow();
  });

  test('builder.tests url param wins over the random assignment', () => {
    const text = runInBrowser(ssrHtml(), {
      url: `https://example.com/?builder.tests.${CONTENT_ID}=${VARIATION_ID}`,
    });
    expect(text).toContain(VARIATION_BLOCK);
    expect(text).not.toContain(CONTROL_BLOCK);
  });

  test('url param is ignored when it is not a known variation', () => {
    const text = runInBrowser(ssrHtml(), {
      url: `https://example.com/?builder.tests.${CONTENT_ID}=not-a-variation`,
    });
    expect(text).toContain(CONTROL_BLOCK);
    expect(text).not.toContain(VARIATION_BLOCK);
  });

  test('falls back to the cookie when no url param is present', () => {
    const text = runInBrowser(ssrHtml(), {
      url: 'https://example.com/',
      cookie: `builder.tests.${CONTENT_ID}=${VARIATION_ID}`,
    });
    expect(text).toContain(VARIATION_BLOCK);
    expect(text).not.toContain(CONTROL_BLOCK);
  });

  test('falls back to the random assignment with no url param and no cookie', () => {
    const text = runInBrowser(ssrHtml(), { url: 'https://example.com/' });
    expect(text).toContain(CONTROL_BLOCK);
    expect(text).not.toContain(VARIATION_BLOCK);
  });
});
