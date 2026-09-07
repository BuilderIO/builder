/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://example.com/?builder.tests.contentid1=variationa1"}
 */
jest.mock(
  'src/functions/extract-localized-values',
  () => ({ containsLocalizedValues: () => false, extractLocalizedValues: () => ({}) }),
  { virtual: true }
);

import React from 'react';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

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

const content: any = {
  id: CONTENT_ID,
  name: 'test',
  data: { blocks: [textBlock('CONTROL')] },
  variations: {
    [VARIATION_ID]: {
      id: VARIATION_ID,
      name: 'Variation A',
      // Below the mocked Math.random (0.1234), so the random path never picks it.
      testRatio: 0.05,
      data: { blocks: [textBlock('VARIATION_A')] },
    },
  },
};

test('browser render honours the builder.tests url param when the cookie is unavailable', () => {
  document.cookie = 'builder.tests.' + CONTENT_ID + '=; Max-Age=0; path=/';
  expect(document.cookie).not.toContain(VARIATION_ID);

  const { renderToString } = require('react-dom/server');
  const html = renderToString(<BuilderComponent model="page" content={content} />);

  // Must match what the inlined script put in the DOM before hydration.
  expect(html).toContain('blk-VARIATION_A');
  expect(html).not.toContain('blk-CONTROL');
});
