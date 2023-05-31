export const CONTENT = {
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  folders: [],
  data: {
    inputs: [],
    themeId: false,
    title: 'a-b-test-basic',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-5215ea54178e4bad81513e236f096de1',
        component: {
          name: 'Text',
          options: {
            text: '<span style="display: block;" class="builder-paragraph">hello world default</span>',
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
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-d9e162caee974577874cfede1c4f81cb',
        meta: { previousId: 'builder-fea3981e1a654e69be0e1a0e2a8fc7b5' },
        component: {
          name: 'Columns',
          options: {
            columns: [
              {
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    id: 'builder-441a2ca2a60e436fbdfa65dda4b219cf',
                    meta: { previousId: 'builder-ca1f2ca48bc34e669359dd5b4ec3cbc3' },
                    component: {
                      name: 'Text',
                      options: {
                        text: '<span style="display: block;" class="builder-paragraph">Below is a reactive state value (incrementing number, with default value 0):</span>',
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
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    bindings: {
                      'component.options.text': 'state.reactiveValue',
                      'meta.bindingActions.component.options.text':
                        'var _virtual_index=state.reactiveValue;return _virtual_index',
                    },
                    id: 'builder-1fb7bb68674d4796bbf922e5cc6bd018',
                    meta: {
                      bindingActions: {
                        component: {
                          options: {
                            text: [
                              {
                                '@type': '@builder.io/core:Action',
                                action: '@builder.io:customCode',
                                options: {
                                  code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.reactiveValue',
                                },
                              },
                            ],
                          },
                        },
                      },
                      previousId: 'builder-aee5e7f645f549caab81d4bac5d34ff0',
                    },
                    component: { name: 'Text', options: { text: 'Enter some text...' } },
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
                blocks: [
                  {
                    '@type': '@builder.io/sdk:Element',
                    '@version': 2,
                    actions: { click: 'state.reactiveValue+=1' },
                    id: 'builder-7e7dc0bd939f4086945fd8d276d9fb92',
                    meta: {
                      eventActions: {
                        click: [
                          {
                            '@type': '@builder.io/core:Action',
                            action: '@builder.io:customCode',
                            options: {
                              code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\n\nstate.reactiveValue += 1\n',
                            },
                          },
                        ],
                      },
                      previousId: 'builder-6c1363b4fef6457b8a6d4380896293cf',
                    },
                    component: {
                      name: 'Core:Button',
                      options: { text: 'Increment Number', openLinkInNewTab: false },
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
                        backgroundColor: 'black',
                        color: 'white',
                        borderRadius: '4px',
                        textAlign: 'center',
                        cursor: 'pointer',
                      },
                    },
                  },
                ],
              },
            ],
            space: 20,
            stackColumnsAt: 'tablet',
            reverseColumnsWhenStacked: false,
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
      {
        id: 'builder-pixel-zz83h092uth',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
          'aria-hidden': 'true',
          alt: '',
          role: 'presentation',
          width: '0',
          height: '0',
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
    url: '/a-b-test-basic-s',
    state: {
      deviceSize: 'large',
      location: { pathname: '/a-b-test-basic-s', path: ['a-b-test-basic-s'], query: {} },
    },
  },
  modelId: '240a12053d674735ac2a384dcdc561b5',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/a-b-test-basic-s',
      operator: 'is',
    },
  ],
  published: 'published',
  firstPublished: 1674501897729,
  testRatio: 0.5,
  lastUpdated: 1684954393489,
  createdDate: 1674501839198,
  createdBy: '4FFFg0MNRJT0z0nW4uUizDHfHJV2',
  meta: {
    kind: 'page',
    hasLinks: false,
  },
  variations: {
    d50b5d04edf640f195a7c42ebdb159b2: {
      testRatio: 0.5,
      createdDate: 1674501850607,
      data: {
        themeId: false,
        title: 'a-b-test-basic',
        blocks: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-c4533f51068b4e55b68fc6a15259b42c',
            meta: { previousId: 'builder-5215ea54178e4bad81513e236f096de1' },
            component: {
              name: 'Text',
              options: {
                text: '<span style="display: block;" class="builder-paragraph">hello world variation 1</span>',
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
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-87bb5d8bdd2645b7b084ef146c851cab',
            meta: { previousId: 'builder-fea3981e1a654e69be0e1a0e2a8fc7b5' },
            component: {
              name: 'Columns',
              options: {
                columns: [
                  {
                    blocks: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        id: 'builder-10c567719dff4743a75bc5db991b52d8',
                        meta: { previousId: 'builder-ca1f2ca48bc34e669359dd5b4ec3cbc3' },
                        component: {
                          name: 'Text',
                          options: {
                            text: '<span style="display: block;" class="builder-paragraph">Below is a reactive state value (incrementing number, with default value 0):</span>',
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
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        bindings: {
                          'component.options.text': 'state.reactiveValue',
                          'meta.bindingActions.component.options.text':
                            'var _virtual_index=state.reactiveValue;return _virtual_index',
                        },
                        id: 'builder-c879182feb694efc92f09f81bac92844',
                        meta: {
                          bindingActions: {
                            component: {
                              options: {
                                text: [
                                  {
                                    '@type': '@builder.io/core:Action',
                                    action: '@builder.io:customCode',
                                    options: {
                                      code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\nstate.reactiveValue',
                                    },
                                  },
                                ],
                              },
                            },
                          },
                          previousId: 'builder-aee5e7f645f549caab81d4bac5d34ff0',
                        },
                        component: { name: 'Text', options: { text: 'Enter some text...' } },
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
                    blocks: [
                      {
                        '@type': '@builder.io/sdk:Element',
                        '@version': 2,
                        actions: { click: 'state.reactiveValue+=1' },
                        id: 'builder-870bd1a8c40f471ca3674c3227a4981c',
                        meta: {
                          eventActions: {
                            click: [
                              {
                                '@type': '@builder.io/core:Action',
                                action: '@builder.io:customCode',
                                options: {
                                  code: '/**\n * Global objects available in custom action code:\n *\n * state - builder state object - learn about state https://www.builder.io/c/docs/guides/state-and-actions\n * context - builder context object - learn about context https://github.com/BuilderIO/builder/tree/main/packages/react#passing-data-and-functions-down\n * event - HTML Event - https://developer.mozilla.org/en-US/docs/Web/API/Event\n *\n * Learn more: https://www.builder.io/c/docs/guides/custom-code\n *\n */\n\nstate.reactiveValue += 1\n',
                                },
                              },
                            ],
                          },
                          previousId: 'builder-6c1363b4fef6457b8a6d4380896293cf',
                        },
                        component: {
                          name: 'Core:Button',
                          options: { text: 'Increment Number', openLinkInNewTab: false },
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
                            backgroundColor: 'black',
                            color: 'white',
                            borderRadius: '4px',
                            textAlign: 'center',
                            cursor: 'pointer',
                          },
                        },
                      },
                    ],
                  },
                ],
                space: 20,
                stackColumnsAt: 'tablet',
                reverseColumnsWhenStacked: false,
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
      meta: {},
      name: 'Variation 0',
      id: 'd50b5d04edf640f195a7c42ebdb159b2',
    },
  },
  name: 'a-b-test-basic',
  id: '1d326d78efb04ce38467dd8f5160fab6',
  rev: 'fvzbnpofys',
};
