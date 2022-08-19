import { BuilderContent } from '@builder.io/sdk';
import { applyTranslation, getTranslateableFields } from './translation-helpers';

test('getTranslateableFields from content to match snapshot', async () => {
  const content: BuilderContent = {
    data: {
      title: {
        '@type': '@builder.io/core:LocalizedValue',
        'en-US': 'Hello',
        Default: 'Test',
      },
      blocks: [
        {
          meta: {
            instructions: 'This is a mobile only element',
          },
          id: 'block-id',
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Text',
            options: {
              text: 'test',
            },
          },
        },
      ],
    },
  };
  const result = getTranslateableFields(
    content,
    'en-US',
    'Visit https://builder.io/fiddle/... for more details'
  );
  expect(result).toMatchSnapshot();
});

test('applyTranslation from content to match snapshot', async () => {
  const content: BuilderContent = {
    data: {
      title: {
        '@type': '@builder.io/core:LocalizedValue',
        'en-US': 'Hello',
        Default: 'Test',
      },
      blocks: [
        {
          id: 'block-id',
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Text',
            options: {
              text: 'test',
            },
          },
        },
      ],
    },
  };

  const translations = {
    'metadata.title': { value: 'salut' },
    'blocks.block-id#text': { value: 'block-id' },
  };

  const result = applyTranslation(content, translations, 'fr-FR');
  expect(result).toMatchSnapshot();
});
