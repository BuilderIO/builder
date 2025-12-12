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
          meta: {
            instructions: 'Button with plain text',
          },
          id: 'button-plain-text-id',
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Core:Button',
            options: {
              text: 'Cute Baby',
              openLinkInNewTab: false,
            },
          },
        },
        {
          meta: {
            instructions: 'Button with pre-localized text',
          },
          id: 'button-localized-text-id',
          '@type': '@builder.io/sdk:Element',
          component: {
            name: 'Core:Button',
            options: {
              text: {
                '@type': localizedType,
                'en-US': 'Click Me!',
                Default: 'Click Here',
              },
              openLinkInNewTab: true,
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
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-068283319b1740b3aa8279c09c1dc957',
          meta: {
            'transformed.symbol.data.heroContent.cta.label': 'localized',
          },
          component: {
            name: 'Symbol',
            options: {
              symbol: {
                entry: '6a013dc290a548eb8e968c848ae5d5a2',
                model: 'symbol',
                ownerId: 'cfadfce0f3684576b7a6cca6599ce3be',
                data: {
                  heroContent: {
                    cta: {
                      link: 'content link',
                      label: {
                        '@type': localizedType,
                        Default: 'content label',
                        'en-GB': 'label for GB',
                        'en-US': 'label for US',
                        'hi-IN': 'label for India',
                      },
                      otherLabels: [
                        {
                          men: {
                            '@type': localizedType,
                            Default: 'content label men',
                            'en-GB': 'label for GB men',
                            'en-US': 'label for US men',
                          },
                          kids: {
                            '@type': localizedType,
                            Default: 'content label kids',
                            'en-GB': 'label for GB kids',
                            'en-US': 'label for US kids',
                          },
                        },
                        {
                          women: {
                            '@type': localizedType,
                            Default: 'content label women',
                            'en-GB': 'label for GB women',
                            'en-US': 'label for US women',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },

        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-5128283319b1740b3aa8279c09c1dc957',
          component: {
            name: 'Symbol',
            options: {
              symbol: {
                entry: '6a013dc290a548eb8e968c848ae5d5a2',
                model: 'symbol',
                ownerId: 'cfadfce0f3684576b7a6cca6599ce3be',
                data: {
                  children: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      id: 'builder-1fae3855fc1c441683f52c18d46e2601',
                      children: [
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          layerName: 'Intertitre',
                          id: 'builder-5f0b30f48b5a47a7ababc6526b65a17e',
                          meta: {
                            localizedTextInputs: ['children'],
                            previousId: 'builder-5f7863a185524c40ba854534de6c5d7f',
                            'transformed.children': 'localized',
                          },
                          component: {
                            name: 'Typography',
                            options: {
                              component: 'p',
                              color: 'black',
                              variant: 'heading-h4',
                              variantTablet: 'body-md',
                              variantMobile: 'heading-h5',
                              children: {
                                '@type': '@builder.io/core:LocalizedValue',
                                Default: '2. Properly configuring your gamepad',
                                fr: "Gardez vos fichiers privés et en sécurité grâce à Shadow Drive, notre solution de stockage dans le cloud conçue et hébergée en Europe.<br><strong> C'est désormais le drive sécurisé le moins cher du marché.",
                                de: 'Halte deine Dateien privat und sicher dank Shadow Drive, unserer in Europa hergestellten und gehosteten Cloud-Speicherlösung. <b>Jetzt die preiswerteste datenschutzorientierte Speicherlösung  auf dem Markt.</b>',
                              },
                              htmlTag: 'h2',
                            },
                          },
                          responsiveStyles: {
                            large: {
                              display: 'inline',
                            },
                          },
                        },
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          layerName: 'Intertitre',
                          id: 'builder-5ce42f734ffa429b8c5612cb2e340bd7',
                          meta: {
                            localizedTextInputs: ['children'],
                            previousId: 'builder-5f0b30f48b5a47a7ababc6526b65a17e',
                            'transformed.children': 'localized',
                          },
                          component: {
                            name: 'Typography',
                            options: {
                              component: 'p',
                              color: 'black',
                              variant: 'heading-h4',
                              variantTablet: 'body-md',
                              variantMobile: 'heading-h5',
                              children: {
                                '@type': '@builder.io/core:LocalizedValue',
                                Default: '3. Optimizing connectivity',
                                fr: "Gardez vos fichiers privés et en sécurité grâce à Shadow Drive, notre solution de stockage dans le cloud conçue et hébergée en Europe.<br><strong> C'est désormais le drive sécurisé le moins cher du marché.",
                                de: 'Halte deine Dateien privat und sicher dank Shadow Drive, unserer in Europa hergestellten und gehosteten Cloud-Speicherlösung. <b>Jetzt die preiswerteste datenschutzorientierte Speicherlösung  auf dem Markt.</b>',
                              },
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
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

test('getTranslateableFields from carousel content and custom component with subFields to match snapshot', async () => {
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-c4117a19e7e94354bcd73370ac266c18',
          component: {
            name: 'Builder:Carousel',
            options: {
              slides: [
                {
                  content: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      id: 'builder-0a10ae48b6314221bbb7d06d068d623d',
                      meta: {
                        'transformed.text': 'localized',
                        localizedTextInputs: ['text'],
                      },
                      component: {
                        name: 'Text',
                        options: {
                          text: {
                            '@type': '@builder.io/core:LocalizedValue',
                            Default: '<p>I am slide 1</p>',
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
                          lineHeight: 'normal',
                          height: 'auto',
                        },
                      },
                    },
                  ],
                },
                {
                  content: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      id: 'builder-06d3f6da74fb4054ad311afc1dda3675',
                      meta: {
                        'transformed.text': 'localized',
                        localizedTextInputs: ['text'],
                      },
                      component: {
                        name: 'Text',
                        options: {
                          text: {
                            '@type': '@builder.io/core:LocalizedValue',
                            Default: '<p>I am slide second</p>',
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
                          lineHeight: 'normal',
                          height: 'auto',
                        },
                      },
                    },
                  ],
                },
              ],
              hideDots: false,
              autoplay: false,
              autoplaySpeed: 5,
              prevButton: [
                {
                  '@type': '@builder.io/sdk:Element',
                  '@version': 2,
                  id: 'builder-04289f83df9542dabeb81b095e2711d0',
                  component: {
                    name: 'Image',
                    options: {
                      image:
                        'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Fdb2a9827561249aea3817b539aacdcdc',
                    },
                  },
                  responsiveStyles: {
                    large: {
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'stretch',
                      flexDirection: 'column',
                      height: '30px',
                    },
                  },
                },
              ],
              nextButton: [
                {
                  '@type': '@builder.io/sdk:Element',
                  '@version': 2,
                  id: 'builder-9ede08b361e24b40b7fa52e9211debab',
                  component: {
                    name: 'Image',
                    options: {
                      image:
                        'https://cdn.builder.io/api/v1/image/assets%2FagZ9n5CUKRfbL9t6CaJOyVSK4Es2%2Fd909a5b91650499c9e0524cc904eeb77',
                    },
                  },
                  responsiveStyles: {
                    large: {
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'stretch',
                      flexDirection: 'column',
                      height: '30px',
                    },
                  },
                },
              ],
              useChildrenForSlides: false,
              responsive: [
                {
                  width: 3000,
                  slidesToShow: 2,
                  slidesToScroll: 2,
                },
                {
                  width: 400,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              ],
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
              paddingLeft: '30px',
              paddingRight: '30px',
              paddingBottom: '30px',
            },
          },
        },
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-23e0618256ab40799ecf6504bc57fa1c',
          meta: {
            localizedTextInputs: ['title.text', 'listItems.0.field1', 'listItems.1.field1'],
            'transformed.title.text': 'localized',
          },
          component: {
            name: 'myFunComponent',
            options: {
              text: 'Hello, Builder!',
              title: {
                text: {
                  '@type': '@builder.io/core:LocalizedValue',
                  Default: '<p>custom component subField input</p>',
                },
              },
              listItems: [
                {
                  field1: {
                    '@type': '@builder.io/core:LocalizedValue',
                    Default: '<p>text 1 value</p>',
                  },
                  field2: 'field 2 value',
                },
                {
                  field1: {
                    '@type': '@builder.io/core:LocalizedValue',
                    Default: '<p>text 1.1 value</p>',
                  },
                  field2: 'field 2.1 value',
                },
              ],
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
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-068283319b1740b3aa8279c09c1dc957',
          meta: {
            'transformed.symbol.data.heroContent.cta.label': 'localized',
          },
          component: {
            name: 'Symbol',
            options: {
              symbol: {
                entry: '6a013dc290a548eb8e968c848ae5d5a2',
                model: 'symbol',
                ownerId: 'cfadfce0f3684576b7a6cca6599ce3be',
                data: {
                  heroContent: {
                    cta: {
                      link: 'content link',
                      label: {
                        '@type': localizedType,
                        Default: 'content label',
                        'en-GB': 'label for GB',
                        'en-US': 'label for US',
                        'hi-IN': 'label for India',
                      },
                      otherLabels: [
                        {
                          men: {
                            '@type': localizedType,
                            Default: 'content label men',
                            'en-GB': 'label for GB men',
                            'en-US': 'label for US men',
                          },
                          kids: {
                            '@type': localizedType,
                            Default: 'content label kids',
                            'en-GB': 'label for GB kids',
                            'en-US': 'label for US kids',
                          },
                        },
                        {
                          women: {
                            '@type': localizedType,
                            Default: 'content label women',
                            'en-GB': 'label for GB women',
                            'en-US': 'label for US women',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },

        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-5128283319b1740b3aa8279c09c1dc957',
          component: {
            name: 'Symbol',
            options: {
              symbol: {
                entry: '6a013dc290a548eb8e968c848ae5d5a2',
                model: 'symbol',
                ownerId: 'cfadfce0f3684576b7a6cca6599ce3be',
                data: {
                  children: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      id: 'builder-1fae3855fc1c441683f52c18d46e2601',
                      children: [
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          layerName: 'Intertitre',
                          id: 'builder-5f0b30f48b5a47a7ababc6526b65a17e',
                          meta: {
                            localizedTextInputs: ['children'],
                            previousId: 'builder-5f7863a185524c40ba854534de6c5d7f',
                            'transformed.children': 'localized',
                          },
                          component: {
                            name: 'Typography',
                            options: {
                              component: 'p',
                              color: 'black',
                              variant: 'heading-h4',
                              variantTablet: 'body-md',
                              variantMobile: 'heading-h5',
                              children: {
                                '@type': '@builder.io/core:LocalizedValue',
                                Default: '2. Properly configuring your gamepad',
                                fr: "Gardez vos fichiers privés et en sécurité grâce à Shadow Drive, notre solution de stockage dans le cloud conçue et hébergée en Europe.<br><strong> C'est désormais le drive sécurisé le moins cher du marché.",
                                de: 'Halte deine Dateien privat und sicher dank Shadow Drive, unserer in Europa hergestellten und gehosteten Cloud-Speicherlösung. <b>Jetzt die preiswerteste datenschutzorientierte Speicherlösung  auf dem Markt.</b>',
                              },
                              htmlTag: 'h2',
                            },
                          },
                          responsiveStyles: {
                            large: {
                              display: 'inline',
                            },
                          },
                        },
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          layerName: 'Intertitre',
                          id: 'builder-5ce42f734ffa429b8c5612cb2e340bd7',
                          meta: {
                            localizedTextInputs: ['children'],
                            previousId: 'builder-5f0b30f48b5a47a7ababc6526b65a17e',
                            'transformed.children': 'localized',
                          },
                          component: {
                            name: 'Typography',
                            options: {
                              component: 'p',
                              color: 'black',
                              variant: 'heading-h4',
                              variantTablet: 'body-md',
                              variantMobile: 'heading-h5',
                              children: {
                                '@type': '@builder.io/core:LocalizedValue',
                                Default: '3. Optimizing connectivity',
                                fr: "Gardez vos fichiers privés et en sécurité grâce à Shadow Drive, notre solution de stockage dans le cloud conçue et hébergée en Europe.<br><strong> C'est désormais le drive sécurisé le moins cher du marché.",
                                de: 'Halte deine Dateien privat und sicher dank Shadow Drive, unserer in Europa hergestellten und gehosteten Cloud-Speicherlösung. <b>Jetzt die preiswerteste datenschutzorientierte Speicherlösung  auf dem Markt.</b>',
                              },
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },

        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-23e0618256ab40799ecf6504bc57fa1c',
          meta: {
            localizedTextInputs: ['title.text', 'listItems.0.field1', 'listItems.1.field1'],
            'transformed.title.text': 'localized',
          },
          component: {
            name: 'myFunComponent',
            options: {
              text: 'Hello, Builder!',
              title: {
                text: {
                  '@type': '@builder.io/core:LocalizedValue',
                  Default: '<p>custom component subField input</p>',
                },
              },
              listItems: [
                {
                  field1: {
                    '@type': '@builder.io/core:LocalizedValue',
                    Default: '<p>text 1 value</p>',
                  },
                  field2: 'field 2 value',
                },
                {
                  field1: {
                    '@type': '@builder.io/core:LocalizedValue',
                    Default: '<p>text 1.1 value</p>',
                  },
                  field2: 'field 2.1 value',
                },
              ],
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
    'blocks.builder-068283319b1740b3aa8279c09c1dc957.symbolInput#heroContent.cta.label': {
      value: 'french label',
    },
    'blocks.builder-068283319b1740b3aa8279c09c1dc957.symbolInput#heroContent.cta.otherLabels[0].kids':
      {
        value: 'french label for kids',
      },
    'blocks.builder-068283319b1740b3aa8279c09c1dc957.symbolInput#heroContent.cta.otherLabels[0].men':
      {
        value: 'french label for men',
      },
    'blocks.builder-068283319b1740b3aa8279c09c1dc957.symbolInput#heroContent.cta.otherLabels[1].women':
      {
        value: 'french label for women',
      },
    'blocks.builder-5ce42f734ffa429b8c5612cb2e340bd7#children': {
      value: '3. french Optimizing connectivity',
    },
    'blocks.builder-5f0b30f48b5a47a7ababc6526b65a17e#children': {
      value: '2. french Properly configuring your gamepad',
    },
    'blocks.builder-23e0618256ab40799ecf6504bc57fa1c#title.text': {
      value: '<p>french - custom component subField input</p>',
    },
    'blocks.builder-23e0618256ab40799ecf6504bc57fa1c#listItems.0.field1': {
      value: '<p>french - text 1 value</p>',
    },
    'blocks.builder-23e0618256ab40799ecf6504bc57fa1c#listItems.1.field1': {
      value: '<p>french - text 1.1 value</p>',
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
    'blocks.builder-068283319b1740b3aa8279c09c1dc957.symbolInput#heroContent.cta.label': {
      value: 'german label',
    },
    'blocks.builder-068283319b1740b3aa8279c09c1dc957.symbolInput#heroContent.cta.otherLabels[0].kids':
      {
        value: 'german label for kids',
      },
    'blocks.builder-068283319b1740b3aa8279c09c1dc957.symbolInput#heroContent.cta.otherLabels[0].men':
      {
        value: 'german label for men',
      },
    'blocks.builder-068283319b1740b3aa8279c09c1dc957.symbolInput#heroContent.cta.otherLabels[1].women':
      {
        value: 'german label for women',
      },
    'blocks.builder-5ce42f734ffa429b8c5612cb2e340bd7#children': {
      value: '3. german Optimizing connectivity',
    },
    'blocks.builder-5f0b30f48b5a47a7ababc6526b65a17e#children': {
      value: '2. german Properly configuring your gamepad',
    },
    'blocks.builder-23e0618256ab40799ecf6504bc57fa1c#title.text': {
      value: '<p>german - custom component subField input</p>',
    },
    'blocks.builder-23e0618256ab40799ecf6504bc57fa1c#listItems.0.field1': {
      value: '<p>german - text 1 value</p>',
    },
    'blocks.builder-23e0618256ab40799ecf6504bc57fa1c#listItems.1.field1': {
      value: '<p>german - text 1.1 value</p>',
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
