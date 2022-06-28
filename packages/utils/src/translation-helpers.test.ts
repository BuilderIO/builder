import { BuilderContent } from '@builder.io/sdk';
import { appLyTranslation, getTranslateableFields } from './translation-helpers';

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
  const result = getTranslateableFields(content, 'en-US');
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
    metadata: {
      title: 'salut',
    },
    blocks: {
      'block-id#text': 'block-id',
    },
  };

  const result = appLyTranslation(content, translations, 'fr-FR');
  expect(result).toMatchSnapshot();
});
