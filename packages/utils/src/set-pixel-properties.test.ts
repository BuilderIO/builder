import { BuilderContent } from '@builder.io/sdk';
import { setPixelProperties } from './set-pixel-properties';

test('Set Alt on pixel properties', async () => {
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          id: 'builder-pixel-test',
          '@type': '@builder.io/sdk:Element',
          tagName: 'img',
          properties: {
            role: 'presentation',
            'aria-hidden': 'true',
            src: `https://cdn.builder.io/api/v1/pixel?apiKey=`,
          },
          responsiveStyles: {
            large: {
              height: '0',
              width: '0',
              display: 'inline-block',
              opacity: '0',
              overflow: 'hidden',
              pointerEvents: 'none',
            },
          },
        },
      ],
    },
  };
  setPixelProperties(content, { alt: 'Alt text' });
  expect(content.data?.blocks?.[0].properties?.alt).toBe('Alt text');
});

test('should not alter src on pixel properties', async () => {
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          id: 'builder-pixel-test',
          '@type': '@builder.io/sdk:Element',
          tagName: 'img',
          properties: {
            role: 'presentation',
            'aria-hidden': 'true',
            src: `https://cdn.builder.io/api/v1/pixel?apiKey=`,
          },
          responsiveStyles: {
            large: {
              height: '0',
              width: '0',
              display: 'inline-block',
              opacity: '0',
              overflow: 'hidden',
              pointerEvents: 'none',
            },
          },
        },
      ],
    },
  };
  setPixelProperties(content, { src: 'my source ... ' });
  expect(content.data?.blocks?.[0].properties?.src).toBe(
    `https://cdn.builder.io/api/v1/pixel?apiKey=`
  );
});
