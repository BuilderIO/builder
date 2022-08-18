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
        {
          '@type': '@builder.io/sdk:Element',
          'id': 'builder-15cd8202b8a3423d9fce69d71ee63510',
          'component': {
            'name': 'Heading',
            'options': {
              'title': {
                '@type': '@builder.io/core:LocalizedValue',
                'Default': 'I am a heading!'
              }
            }
          }
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
        {
          '@type': '@builder.io/sdk:Element',
          'id': 'builder-15cd8202b8a3423d9fce69d71ee63510',
          'component': {
            'name': 'Heading',
            'options': {
              'title': {
                '@type': '@builder.io/core:LocalizedValue',
                'Default': 'I am a heading!'
              }
            }
          }
        },
      ],
    },
  };

  const translations = {
    'metadata.title': { value: 'salut' },
    'blocks.block-id#text': { value: 'translated block-id' },
    'blocks.builder-15cd8202b8a3423d9fce69d71ee63510#component#options#title': { value: 'translated title' },
  };

  const result = applyTranslation(content, translations, 'fr-FR');
  expect(result).toMatchSnapshot();
});
