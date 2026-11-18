jest.mock(
  'src/functions/extract-localized-values',
  () => ({ containsLocalizedValues: () => false, extractLocalizedValues: () => ({}) }),
  { virtual: true }
);

import React from 'react';
import { renderToString } from 'react-dom/server';
import { CacheProvider } from '@emotion/core';
import createCache from '@emotion/cache';
import { JSDOM } from 'jsdom';
import { CookieJar } from 'tough-cookie';
import { BuilderComponent } from '../src/components/builder-component.component';
import { builder } from '@builder.io/sdk';

builder.init('abc123');

const CONTENT_ID = 'contentid1';
const VARIATION_A_ID = 'variationa1';
const VARIATION_B_ID = 'variationb1';

// The same styles in every variation, so Emotion gives them the same class name.
const sharedStyles = { position: 'relative', paddingTop: '40px' };

const block = (id: string, large: Record<string, string> = sharedStyles) => ({
  '@type': '@builder.io/sdk:Element' as const,
  id,
  responsiveStyles: { large },
});

const contentWithVariations = {
  id: CONTENT_ID,
  name: 'test',
  data: { blocks: [block('CONTROL')] },
  variations: {
    [VARIATION_A_ID]: {
      id: VARIATION_A_ID,
      name: 'Variation A',
      testRatio: 0.3,
      data: { blocks: [block('VARIATION_A')] },
    },
    [VARIATION_B_ID]: {
      id: VARIATION_B_ID,
      name: 'Variation B',
      testRatio: 0.3,
      data: { blocks: [block('VARIATION_B'), block('VARIATION_B_ONLY', { marginTop: '24px' })] },
    },
  },
};

// A shared cache, as when the content is nested in other Emotion-styled content such as a page
// that renders a symbol, so a style is only emitted the first time its class name is used.
const ssrHtml = (content: object) =>
  renderToString(
    <CacheProvider value={createCache()}>
      <BuilderComponent model="page" content={content as any} />
    </CacheProvider>
  );

/** Parses the SSR output in jsdom, which runs the inlined variants script as a browser would. */
const runInBrowser = (html: string, url: string) =>
  new JSDOM('<html><head></head><body>' + html + '</body></html>', {
    url,
    cookieJar: new CookieJar(),
    runScripts: 'dangerously',
    beforeParse(window) {
      // above every testRatio, so the random path always lands on the default variation
      window.Math.random = () => 0.9999;
    },
  }).window.document;

const getEmotionIds = (document: Document) =>
  Array.from(document.querySelectorAll('style[data-emotion-css]'))
    .map(style => style.getAttribute('data-emotion-css')!)
    .join(' ')
    .split(' ');

/** Emotion class names of rendered elements that have no matching style tag in the document. */
const getUnstyledClassNames = (document: Document) => {
  const styledIds = new Set(getEmotionIds(document));
  return Array.from(document.querySelectorAll('[class*="css-"]'))
    .map(element => element.className)
    .join(' ')
    .split(' ')
    .filter(className => className.startsWith('css-') && !styledIds.has(className.slice(4)));
};

describe('SSR a/b test variant styles', () => {
  test('default variation keeps its styles when the variation templates are removed', () => {
    const document = runInBrowser(ssrHtml(contentWithVariations), 'https://example.com/');
    expect(document.querySelector('template')).toBeNull();
    expect(document.querySelector('[builder-id="builder-CONTROL"]')).not.toBeNull();
    expect(getUnstyledClassNames(document)).toEqual([]);
  });

  test('winning variation keeps its styles when the other variations are removed', () => {
    const document = runInBrowser(
      ssrHtml(contentWithVariations),
      `https://example.com/?builder.tests.${CONTENT_ID}=${VARIATION_B_ID}`
    );
    expect(document.querySelector('[builder-id="builder-VARIATION_B_ONLY"]')).not.toBeNull();
    expect(document.querySelector('[builder-id="builder-VARIATION_A"]')).toBeNull();
    expect(document.querySelector('[builder-id="builder-CONTROL"]')).toBeNull();
    expect(getUnstyledClassNames(document)).toEqual([]);
  });

  test('content without variations emits each style once', () => {
    const html = ssrHtml({ id: CONTENT_ID, data: { blocks: [block('ONE'), block('TWO')] } });
    const ids = getEmotionIds(new JSDOM(html).window.document);
    expect(ids).toEqual(Array.from(new Set(ids)));
  });
});
