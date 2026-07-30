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

test('applyTranslation for symbol with localized array containing nested localized values', async () => {
  // This test covers the case where:
  // 1. uspList is itself a LocalizedValue (array-level localization)
  // 2. Each array item has nested LocalizedValue fields (headline, description)
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          '@type': '@builder.io/sdk:Element',
          '@version': 2,
          id: 'builder-b14878b45889498c862240c40ac6bddd',
          component: {
            name: 'Symbol',
            options: {
              symbol: {
                model: 'symbol',
                entry: '44c18d32c87f446ab5926a39efd35db4',
                data: {
                  uspList: {
                    '@type': localizedType,
                    Default: [
                      {
                        headline: {
                          '@type': localizedType,
                          Default: 'Accept card payments',
                        },
                        description: {
                          '@type': localizedType,
                          Default: 'Take contactless or Chip and PIN payments from all major cards.',
                        },
                        iconsrc: 'https://example.com/icon.svg',
                      },
                      {
                        headline: {
                          '@type': localizedType,
                          Default: 'Organise your items',
                        },
                        description: {
                          '@type': localizedType,
                          Default: 'Make stock management seamless with a detailed item catalogue.',
                        },
                        iconsrc: 'https://example.com/icon2.svg',
                      },
                    ],
                  },
                },
                ownerId: '970aa68ef5444888893ac22df7f024eb',
              },
            },
          },
        },
      ],
    },
  };

  const bulgarianTranslations = {
    'blocks.builder-b14878b45889498c862240c40ac6bddd.symbolInput#uspList[0].headline': {
      value: 'Приемане на картови плащания',
    },
    'blocks.builder-b14878b45889498c862240c40ac6bddd.symbolInput#uspList[0].description': {
      value: 'Приемайте Безконтактно или плащания с чип и ПИН от всички основни карти.',
    },
    'blocks.builder-b14878b45889498c862240c40ac6bddd.symbolInput#uspList[1].headline': {
      value: 'Организирайте вашите артикули',
    },
    'blocks.builder-b14878b45889498c862240c40ac6bddd.symbolInput#uspList[1].description': {
      value: 'Направете управлението на наличностите безпроблемно с подробен Каталог с артикули.',
    },
  };

  const result = applyTranslation(content, bulgarianTranslations, 'bg-BG');
  
  // Verify the translations were applied correctly
  const symbolData = result.data?.blocks?.[0]?.component?.options?.symbol?.data;
  
  // The translations should be applied to the Default array's items
  expect(symbolData.uspList.Default[0].headline['bg-BG']).toBe('Приемане на картови плащания');
  expect(symbolData.uspList.Default[0].description['bg-BG']).toBe(
    'Приемайте Безконтактно или плащания с чип и ПИН от всички основни карти.'
  );
  expect(symbolData.uspList.Default[1].headline['bg-BG']).toBe('Организирайте вашите артикули');
  expect(symbolData.uspList.Default[1].description['bg-BG']).toBe(
    'Направете управлението на наличностите безпроблемно с подробен Каталог с артикули.'
  );
  
  // Original Default values should still be preserved
  expect(symbolData.uspList.Default[0].headline.Default).toBe('Accept card payments');
  expect(symbolData.uspList.Default[1].headline.Default).toBe('Organise your items');
});

test('getTranslateableFields extracts nested string fields from a LocalizedValue array (FAQ scenario)', () => {
  const content: BuilderContent = {
    data: {
      title: {
        '@type': localizedType,
        'en-US': 'Excel Expert',
        Default: 'Excel Expert',
      },
      faqs: {
        // `items` is a LocalizedValue whose payload is an array of plain objects.
        // This is what Builder stores when you enable Localize on an array-type field.
        items: {
          '@type': localizedType,
          Default: [
            {
              question: 'What does an Excel expert actually do?',
              answer: 'An Excel expert is a data analyst who leverages advanced features of Microsoft Excel.',
            },
            {
              question: 'What tools does an Excel expert use?',
              answer: 'Excel experts use pivot tables, VLOOKUP, macros, and VBA scripting.',
            },
          ],
        },
      },
    },
  };

  const result = getTranslateableFields(content, 'en-US', '');

  // Top-level localized string field still works
  expect(result['metadata.title']).toEqual({ value: 'Excel Expert', instructions: '' });

  // Each nested string field inside the LocalizedValue array must be a separate entry
  expect(result['metadata.faqs#items#0#question']).toEqual({
    value: 'What does an Excel expert actually do?',
    instructions: '',
  });
  expect(result['metadata.faqs#items#0#answer']).toEqual({
    value: 'An Excel expert is a data analyst who leverages advanced features of Microsoft Excel.',
    instructions: '',
  });
  expect(result['metadata.faqs#items#1#question']).toEqual({
    value: 'What tools does an Excel expert use?',
    instructions: '',
  });
  expect(result['metadata.faqs#items#1#answer']).toEqual({
    value: 'Excel experts use pivot tables, VLOOKUP, macros, and VBA scripting.',
    instructions: '',
  });

  // The broken old key (whole array as value) must NOT exist
  expect(result['metadata.faqs#items']).toBeUndefined();
});

test('applyTranslation writes translated strings back into the correct locale slot for LocalizedValue array (FAQ scenario)', () => {
  const content: BuilderContent = {
    data: {
      title: {
        '@type': localizedType,
        'en-US': 'Excel Expert',
        Default: 'Excel Expert',
      },
      faqs: {
        items: {
          '@type': localizedType,
          Default: [
            {
              question: 'What does an Excel expert actually do?',
              answer: 'An Excel expert is a data analyst.',
            },
            {
              question: 'What tools does an Excel expert use?',
              answer: 'Excel experts use pivot tables and VLOOKUP.',
            },
          ],
        },
      },
    },
  };

  const germanTranslations = {
    'metadata.title': { value: 'Excel-Experte' },
    'metadata.faqs#items#0#question': { value: 'Was macht ein Excel-Experte eigentlich?' },
    'metadata.faqs#items#0#answer': { value: 'Ein Excel-Experte ist ein Datenanalyst.' },
    'metadata.faqs#items#1#question': { value: 'Welche Tools verwendet ein Excel-Experte?' },
    'metadata.faqs#items#1#answer': { value: 'Excel-Experten verwenden Pivot-Tabellen und VLOOKUP.' },
  };

  const result = applyTranslation(content, germanTranslations, 'de-DE');
  const data = result.data!;

  // Direct string LocalizedValue translation still works
  expect((data.title as any)['de-DE']).toBe('Excel-Experte');

  // The translated locale array must be set correctly
  const localizedItems = (data.faqs as any).items;
  expect(localizedItems['de-DE'][0].question).toBe('Was macht ein Excel-Experte eigentlich?');
  expect(localizedItems['de-DE'][0].answer).toBe('Ein Excel-Experte ist ein Datenanalyst.');
  expect(localizedItems['de-DE'][1].question).toBe('Welche Tools verwendet ein Excel-Experte?');
  expect(localizedItems['de-DE'][1].answer).toBe('Excel-Experten verwenden Pivot-Tabellen und VLOOKUP.');

  // Default values must be preserved untouched
  expect(localizedItems.Default[0].question).toBe('What does an Excel expert actually do?');
  expect(localizedItems.Default[1].question).toBe('What tools does an Excel expert use?');
});

test('applyTranslation preserves nested LocalizedValue structure when sub-fields are themselves LocalizedValues (double-localized scenario)', () => {
  // Scenario: `items` is a LocalizedValue whose Default array contains items where
  // `question` and `answer` are ALSO individually LocalizedValues.
  // The fix must NOT replace those nested LocalizedValue objects with plain strings.
  const content: BuilderContent = {
    data: {
      faqs: {
        items: {
          '@type': localizedType,
          Default: [
            {
              question: { '@type': localizedType, Default: 'Q1', 'en-US': 'Q1' },
              answer: { '@type': localizedType, Default: 'A1', 'en-US': 'A1' },
            },
          ],
        },
      },
    },
  };

  const germanTranslations = {
    'metadata.faqs#items#0#question': { value: 'German Q1' },
    'metadata.faqs#items#0#answer': { value: 'German A1' },
  };

  const result = applyTranslation(content, germanTranslations, 'de-DE');
  const localizedItems = (result.data!.faqs as any).items;

  // The locale-specific copy must preserve the nested LocalizedValue structure
  expect(localizedItems['de-DE'][0].question['@type']).toBe(localizedType);
  expect(localizedItems['de-DE'][0].question['de-DE']).toBe('German Q1');
  expect(localizedItems['de-DE'][0].question.Default).toBe('Q1');

  expect(localizedItems['de-DE'][0].answer['@type']).toBe(localizedType);
  expect(localizedItems['de-DE'][0].answer['de-DE']).toBe('German A1');
  expect(localizedItems['de-DE'][0].answer.Default).toBe('A1');

  // Default array must be completely untouched
  expect(localizedItems.Default[0].question['@type']).toBe(localizedType);
  expect(localizedItems.Default[0].question.Default).toBe('Q1');
  expect(localizedItems.Default[0].question['de-DE']).toBeUndefined();
});

test('applyTranslation uses sourceLocaleId as the base when it differs from Default', () => {
  // When sourceLocaleId array has more items / extra fields than Default,
  // the translated locale must be based on the sourceLocaleId structure,
  // not the (potentially stale) Default
  const content: BuilderContent = {
    data: {
      faqs: {
        items: {
          '@type': localizedType,
          Default: [
            { question: 'Default Q1', answer: 'Default A1' },
          ],
          'en-US': [
            { question: 'English Q1', answer: 'English A1' },
            { question: 'English Q2', answer: 'English A2' },  // extra item only in en-US
          ],
        },
      },
    },
  };

  const germanTranslations = {
    'metadata.faqs#items#0#question': { value: 'German Q1' },
    'metadata.faqs#items#0#answer': { value: 'German A1' },
    'metadata.faqs#items#1#question': { value: 'German Q2' },
    'metadata.faqs#items#1#answer': { value: 'German A2' },
  };

  const result = applyTranslation(content, germanTranslations, 'de-DE', 'en-US');
  const localizedItems = (result.data!.faqs as any).items;

  // Both items must be present (sourced from en-US, not the 1-item Default)
  expect(localizedItems['de-DE']).toHaveLength(2);
  expect(localizedItems['de-DE'][0].question).toBe('German Q1');
  expect(localizedItems['de-DE'][0].answer).toBe('German A1');
  expect(localizedItems['de-DE'][1].question).toBe('German Q2');
  expect(localizedItems['de-DE'][1].answer).toBe('German A2');

  // Default and en-US must be untouched
  expect(localizedItems.Default).toHaveLength(1);
  expect(localizedItems['en-US']).toHaveLength(2);
});

// Custom component with `localized: true` on both the list input and its subFields:
// a LocalizedValue wrapping items that mix localized subfields with plain ones.
const productGridContent = (): BuilderContent => ({
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-productgrid',
        meta: {
          localizedTextInputs: ['products'],
        },
        component: {
          name: 'ProductGrid',
          options: {
            products: {
              '@type': localizedType,
              Default: [
                {
                  currency: 'USD',
                  rating: 4.9,
                  ratingCount: 10,
                  imageSrc: 'https://cdn.builder.io/api/v1/image/watch.png',
                  id: { '@type': localizedType, Default: 'prod-001' },
                  title: { '@type': localizedType, Default: 'Smart Fitness Watch new' },
                  description: { '@type': localizedType, Default: 'Water-resistant smartwatch' },
                },
                {
                  currency: 'USD',
                  rating: 5,
                  ratingCount: 40,
                  imageSrc: 'https://cdn.builder.io/api/v1/image/headphones.png',
                  id: { '@type': localizedType, Default: 'prod-002' },
                  title: { '@type': localizedType, Default: 'Wireless Headphones' },
                  description: { '@type': localizedType, Default: 'Premium over-ear headphones' },
                },
              ],
            },
          },
        },
      },
    ],
  },
});

test('getTranslateableFields extracts localized subfields of a localized list input on a custom component', () => {
  const result = getTranslateableFields(productGridContent(), 'en-US', 'instructions');

  expect(result).toEqual({
    'blocks.builder-productgrid#products#0#id': {
      value: 'prod-001',
      instructions: 'instructions',
    },
    'blocks.builder-productgrid#products#0#title': {
      value: 'Smart Fitness Watch new',
      instructions: 'instructions',
    },
    'blocks.builder-productgrid#products#0#description': {
      value: 'Water-resistant smartwatch',
      instructions: 'instructions',
    },
    'blocks.builder-productgrid#products#1#id': {
      value: 'prod-002',
      instructions: 'instructions',
    },
    'blocks.builder-productgrid#products#1#title': {
      value: 'Wireless Headphones',
      instructions: 'instructions',
    },
    'blocks.builder-productgrid#products#1#description': {
      value: 'Premium over-ear headphones',
      instructions: 'instructions',
    },
  });
});

test('getTranslateableFields does not send non-localized siblings of a localized list input', () => {
  const result = getTranslateableFields(productGridContent(), 'en-US', 'instructions');
  const values = Object.values(result).map(entry => entry.value);

  expect(values).not.toContain('USD');
  expect(values).not.toContain('https://cdn.builder.io/api/v1/image/watch.png');
  expect(Object.keys(result).some(key => key.includes('currency'))).toBe(false);
  expect(Object.keys(result).some(key => key.includes('imageSrc'))).toBe(false);
  expect(Object.keys(result).some(key => key.includes('rating'))).toBe(false);
});

test('applyTranslation writes localized list subfields back into the target locale', () => {
  const content = productGridContent();
  const translation = {
    'blocks.builder-productgrid#products#0#id': { value: 'prod-001' },
    'blocks.builder-productgrid#products#0#title': { value: 'Intelligente Fitnessuhr' },
    'blocks.builder-productgrid#products#0#description': { value: 'Wasserfeste Smartwatch' },
    'blocks.builder-productgrid#products#1#id': { value: 'prod-002' },
    'blocks.builder-productgrid#products#1#title': { value: 'Kabellose Kopfhörer' },
    'blocks.builder-productgrid#products#1#description': { value: 'Premium Over-Ear-Kopfhörer' },
  };

  const result = applyTranslation(content, translation, 'de-DE', 'en-US');
  const products = (result.data!.blocks as any)[0].component.options.products;

  // Nested LocalizedValue structure is preserved, with the locale added alongside Default
  expect(products['de-DE'][0].title).toEqual({
    '@type': localizedType,
    Default: 'Smart Fitness Watch new',
    'de-DE': 'Intelligente Fitnessuhr',
  });
  expect(products['de-DE'][1].description).toEqual({
    '@type': localizedType,
    Default: 'Premium over-ear headphones',
    'de-DE': 'Premium Over-Ear-Kopfhörer',
  });

  // Non-localized siblings are carried over untouched
  expect(products['de-DE'][0].currency).toBe('USD');
  expect(products['de-DE'][0].rating).toBe(4.9);

  // The source payload is not mutated
  expect(products.Default[0].title).toEqual({
    '@type': localizedType,
    Default: 'Smart Fitness Watch new',
  });

  expect((result.data!.blocks as any)[0].meta.translated).toBe(true);
});

const flatObjectResponse = () => ({
  'blocks.builder-productgrid#products': {
    value: (productGridContent().data!.blocks as any)[0].component.options.products.Default as any,
  },
});

test('applyTranslation ignores a flat object response when the provider echoes the payload', () => {
  const content = productGridContent();

  const result = applyTranslation(content, flatObjectResponse(), 'de-DE', 'en-US', {
    providerEchoesSourcePayload: true,
  });
  const products = (result.data!.blocks as any)[0].component.options.products;

  expect(products['de-DE']).toBeUndefined();
  expect((result.data!.blocks as any)[0].meta.translated).toBeUndefined();
});

test('applyTranslation writes a flat object response from a provider that translates it', () => {
  const content = productGridContent();

  const result = applyTranslation(content, flatObjectResponse(), 'de-DE', 'en-US');
  const products = (result.data!.blocks as any)[0].component.options.products;

  expect(products['de-DE']).toHaveLength(2);
  expect((result.data!.blocks as any)[0].meta.translated).toBe(true);
});

test('applyTranslation keeps source text on nested leaves that received no translation', () => {
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          '@type': '@builder.io/sdk:Element',
          id: 'builder-partial',
          meta: { localizedTextInputs: ['items'] },
          component: {
            name: 'PartialList',
            options: {
              items: {
                '@type': localizedType,
                Default: [
                  {
                    title: { '@type': localizedType, Default: 'Translated title' },
                    badge: { '@type': localizedType, Default: '' },
                    note: { '@type': localizedType, Default: 'Untranslated note' },
                  },
                ],
              },
            },
          },
        },
      ],
    },
  };

  const result = applyTranslation(
    content,
    { 'blocks.builder-partial#items#0#title': { value: 'Übersetzter Titel' } },
    'de-DE',
    'en-US'
  );
  const item = (result.data!.blocks as any)[0].component.options.items['de-DE'][0];

  expect(item.title['de-DE']).toBe('Übersetzter Titel');
  // Untranslated leaves keep a locale key, so the SDK does not resolve them to undefined
  expect(item.note['de-DE']).toBe('Untranslated note');
  expect(item.badge['de-DE']).toBe('');
});

// A localized subfield whose payload is an object of plain strings, rather than a string.
const objectPayloadContent = (): BuilderContent => ({
  data: {
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        id: 'builder-objectpayload',
        meta: { localizedTextInputs: ['cards'] },
        component: {
          name: 'CardList',
          options: {
            cards: {
              '@type': localizedType,
              Default: [
                {
                  sku: 'SKU-1',
                  details: {
                    '@type': localizedType,
                    Default: { heading: 'Card heading', body: 'Card body' },
                  },
                },
              ],
            },
          },
        },
      },
    ],
  },
});

test('getTranslateableFields extracts plain strings inside a localized object-valued subfield', () => {
  const result = getTranslateableFields(objectPayloadContent(), 'en-US', 'instructions');

  expect(result).toEqual({
    'blocks.builder-objectpayload#cards#0#details#heading': {
      value: 'Card heading',
      instructions: 'instructions',
    },
    'blocks.builder-objectpayload#cards#0#details#body': {
      value: 'Card body',
      instructions: 'instructions',
    },
  });

  // `sku` sits outside the localized subfield, so it is still not sent
  expect(Object.keys(result).some(key => key.includes('sku'))).toBe(false);
});

test('applyTranslation writes into the locale branch of a localized object-valued subfield', () => {
  const translation = {
    'blocks.builder-objectpayload#cards#0#details#heading': { value: 'Karten-Überschrift' },
    'blocks.builder-objectpayload#cards#0#details#body': { value: 'Kartentext' },
  };

  const result = applyTranslation(objectPayloadContent(), translation, 'de-DE', 'en-US');
  const cards = (result.data!.blocks as any)[0].component.options.cards;
  const details = cards['de-DE'][0].details;

  // Translation lands inside the nested LocalizedValue's locale branch...
  expect(details['de-DE']).toEqual({ heading: 'Karten-Überschrift', body: 'Kartentext' });
  // ...not as stray keys on the wrapper itself
  expect(details.heading).toBeUndefined();
  expect(details.body).toBeUndefined();
  // ...and the source payload is preserved
  expect(details.Default).toEqual({ heading: 'Card heading', body: 'Card body' });
});

test('getTranslateableFields honours deeper localized markers over unmarked siblings', () => {
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          '@type': '@builder.io/sdk:Element',
          id: 'builder-mixed',
          meta: { localizedTextInputs: ['details'] },
          component: {
            name: 'Mixed',
            options: {
              details: {
                '@type': localizedType,
                Default: {
                  heading: 'Unmarked heading',
                  sub: { '@type': localizedType, Default: 'Marked sub' },
                },
              },
            },
          },
        },
      ],
    },
  };

  const result = getTranslateableFields(content, 'en-US', 'instructions');

  // Own markers win, as unmarked siblings do at the top level; `heading` is omitted.
  expect(result).toEqual({
    'blocks.builder-mixed#details#sub': { value: 'Marked sub', instructions: 'instructions' },
  });
});

test('getTranslateableFields falls back to string leaves when a localized list has no localized subfields', () => {
  const content: BuilderContent = {
    data: {
      blocks: [
        {
          '@type': '@builder.io/sdk:Element',
          id: 'builder-plainlist',
          meta: { localizedTextInputs: ['items'] },
          component: {
            name: 'PlainList',
            options: {
              items: {
                '@type': localizedType,
                Default: [{ label: 'First label' }, { label: 'Second label' }],
              },
            },
          },
        },
      ],
    },
  };

  const result = getTranslateableFields(content, 'en-US', 'instructions');

  expect(result).toEqual({
    'blocks.builder-plainlist#items#0#label': {
      value: 'First label',
      instructions: 'instructions',
    },
    'blocks.builder-plainlist#items#1#label': {
      value: 'Second label',
      instructions: 'instructions',
    },
  });
});
