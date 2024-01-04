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
      seo: {
        '@type': localizedType,
        'en-US': {
          menuItems: [
            {
              menuName: 'en menu name',
            },
          ],
          name: 'en name in subfield',
        },
        Default: {
          name: 'default name in subfield',
        },
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
          meta: {
            instructions: 'This is a mobile only element',
          },
          id: 'block-pre-localized-element',
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Text',
            options: {
              text: {
                '@type': localizedType,
                'en-US': 'en-us text!',
                Default: 'default text!',
              },
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

test('getTranslateableFields from plain data model content to match snapshot', async () => {
  const content: BuilderContent = {
    data: {
      title: {
        '@type': localizedType,
        'en-US': 'Hello',
        Default: 'Test',
      },
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
      seo: {
        '@type': localizedType,
        'en-US': {
          menuItems: [
            {
              menuName: 'en menu name',
            },
          ],
          name: 'en name in subfield',
        },
        Default: {
          name: 'default name in subfield',
        },
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
            localizedTextInputs: ['heading', 'subtitle'],
          },
          component: {
            name: 'Heading',
            options: {
              heading: {
                '@type': localizedType,
                'en-US': 'en-us headings!',
                Default: 'I am a heading!',
              },
              subtitle: {
                '@type': localizedType,
                'en-US': 'en-us subtitle!',
                Default: 'I am a subtitle!',
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
    'metadata.seo': {
      value: {
        name: 'french name in subfield',
      },
    },
    'blocks.builder-custom-component-id#subtitle': {
      value: 'french translated subtitle',
    },
  };
  const germanTranslations = {
    'metadata.title': { value: 'hallo' },
    'blocks.block-id#text': { value: 'german translatated' },
    'blocks.builder-custom-component-id#heading': {
      value: '&quot;german heading&quot;',
    },
    'metadata.seo': {
      value: {
        name: 'german name in subfield',
      },
    },
    'blocks.builder-custom-component-id#subtitle': {
      value: 'german translated subtitle',
    },
  };

  let result = applyTranslation(content, frenchTranslations, 'fr-FR');
  result = applyTranslation(result, germanTranslations, 'de');
  expect(result).toMatchSnapshot();
});

test('applyTranslation from plain data model content to match snapshot', async () => {
  const content: BuilderContent = {
    data: {
      title: {
        '@type': localizedType,
        'en-US': 'Hello',
        Default: 'Test',
      },
    },
  };

  const frenchTranslations = {
    'metadata.title': { value: 'salut' },
    'blocks.block-id#text': { value: 'fench translated text' },
    'blocks.builder-custom-component-id#heading': {
      value: 'french translated heading',
    },
    'blocks.builder-custom-component-id#subtitle': {
      value: 'french translated subtitle',
    },
  };
  const germanTranslations = {
    'metadata.title': { value: 'hallo' },
    'blocks.block-id#text': { value: 'german translatated' },
    'blocks.builder-custom-component-id#heading': {
      value: '&quot;german heading&quot;',
    },
    'blocks.builder-custom-component-id#subtitle': {
      value: 'german translated subtitle',
    },
  };

  let result = applyTranslation(content, frenchTranslations, 'fr-FR');
  result = applyTranslation(result, germanTranslations, 'de');
  expect(result).toMatchSnapshot();
});
