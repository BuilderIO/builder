import { BuilderContent } from '@builder.io/sdk';
import { applyTranslation, getTranslateableFields, localizedType } from './translation-helpers';

test('getTranslateableFields from content to match snapshot', async () => {
  const content: BuilderContent = {
    data: {
      title: {
        '@type': localizedType,
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
          id: 'builder-custom-component-id',
          meta: {
            localizedTextInputs: ['heading'],
          },
          component: {
            name: 'Heading',
            options: {
              heading: {
                '@type': localizedType,
                'en-US': 'en-us headings!',
                Default: 'default heading!',
              },
              imageFile: {
                '@type': localizedType,
                Default: 'www.example.com/img.png',
              },
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
        '@type': localizedType,
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
          id: 'builder-custom-component-id',
          meta: {
            localizedTextInputs: ['heading'],
          },
          component: {
            name: 'Heading',
            options: {
              heading: {
                '@type': localizedType,
                'en-US': 'en-us headings!',
                Default: 'I am a heading!',
              },
            },
          },
        },
      ],
    },
  };

  const frenchTranslations = {
    'metadata.title': { value: 'salut' },
    'blocks.block-id#text': { value: 'fench translated text' },
    'blocks.builder-custom-component-id#heading': {
      value: 'french translated heading',
    },
  };
  const germanTranslations = {
    'metadata.title': { value: 'hallo' },
    'blocks.block-id#text': { value: 'german translatated' },
    'blocks.builder-custom-component-id#heading': {
      value: '&quot;german heading&quot;',
    },
  };

  let result = applyTranslation(content, frenchTranslations, 'fr-FR');
  result = applyTranslation(result, germanTranslations, 'de');
  expect(result).toMatchSnapshot();
});
