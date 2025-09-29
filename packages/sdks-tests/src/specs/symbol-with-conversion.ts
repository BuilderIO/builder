import type { BuilderContent } from './types.js';

export const CONVERSION_SYMBOL_CONTENT = {
  createdDate: Date.now(),
  createdBy: 'test-user',
  variations: {},
  name: 'conversion tracking symbol',
  published: 'published',
  firstPublished: Date.now(),
  testRatio: 1,
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-conversion-symbol-button',
        actions: {
          click: 'console.log(builder);builder.trackConversion();\n',
        },
        code: {
          actions: {
            click: 'console.log(builder);builder.trackConversion();\n',
          },
        },
        component: {
          name: 'Core:Button',
          options: {
            text: 'Track Symbol Conversion',
            openLinkInNewTab: false,
          },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
            appearance: 'none',
            paddingTop: '15px',
            paddingBottom: '15px',
            paddingLeft: '25px',
            paddingRight: '25px',
            backgroundColor: 'blue',
            color: 'white',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: 'pointer',
          },
        },
      },
    ],
  },
  id: 'conversion-symbol-id',
  rev: 'test-rev',
} as const;

export const CONTENT_WITH_SYMBOL: BuilderContent = {
  id: 'test-content-id',
  data: {
    title: 'Symbol Conversion Test',
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-text-header',
        component: {
          name: 'Text',
          options: {
            text: '<h1>Symbol Conversion Tracking Test</h1>',
          },
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
            textAlign: 'center',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-symbol-with-conversion',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              model: 'symbol',
              entry: 'conversion-symbol-id',
            },
          },
        },
        responsiveStyles: {
          large: {
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            flexShrink: '0',
            boxSizing: 'border-box',
            marginTop: '20px',
          },
        },
      },
    ],
  },
  meta: {
    hasLinks: false,
    kind: 'page',
  },
};
