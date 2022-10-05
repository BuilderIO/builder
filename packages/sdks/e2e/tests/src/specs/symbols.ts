export const CONTENT = {
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  createdDate: 1647464399394,
  data: {
    inputs: [],
    title: 'Symbols',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-58e03f0713d842f59be31f54943e08f0',
        component: {
          name: 'Text',
          options: {
            text: '<p>Below are 2 symbols. The second one has a custom description prop provided</p>',
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
        id: 'builder-4b12841b42ef468f886ee871abf39f2e',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              data: {
                description: 'default description',
                image:
                  'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2',
              },
              model: 'symbol',
              entry: '29ab534d62c4406c8500e1cbfa609537',
              content: {
                createdDate: 1647468296291,
                screenshot:
                  'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F72d2ff7ac19549d798b830b2c9d9f3c4',
                createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
                variations: {},
                name: 'photo card symbol',
                published: 'published',
                firstPublished: 1647468296291,
                testRatio: 1,
                data: {
                  inputs: [
                    {
                      autoFocus: false,
                      simpleTextOnly: false,
                      broadcast: false,
                      copyOnAdd: true,
                      helperText: '',
                      '@type': '@builder.io/core:Field',
                      hidden: false,
                      subFields: [],
                      defaultValue: 'default description',
                      hideFromUI: false,
                      noPhotoPicker: false,
                      model: '',
                      hideFromFieldsEditor: false,
                      mandatory: false,
                      permissionsRequiredToEdit: '',
                      showIf: '',
                      onChange: '',
                      type: 'text',
                      required: false,
                      bubble: false,
                      advanced: false,
                      disallowRemove: false,
                      showTemplatePicker: true,
                      name: 'description',
                    },
                    {
                      autoFocus: false,
                      mandatory: false,
                      '@type': '@builder.io/core:Field',
                      permissionsRequiredToEdit: '',
                      showIf: '',
                      simpleTextOnly: false,
                      helperText: '',
                      noPhotoPicker: false,
                      showTemplatePicker: true,
                      hideFromUI: false,
                      advanced: false,
                      hideFromFieldsEditor: false,
                      model: '',
                      bubble: false,
                      name: 'image',
                      onChange: '',
                      disallowRemove: false,
                      allowedFileTypes: ['jpeg', 'png'],
                      required: false,
                      subFields: [],
                      type: 'file',
                      hidden: false,
                      copyOnAdd: true,
                      defaultValue:
                        'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2',
                      broadcast: false,
                    },
                  ],
                  blocks: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      id: 'builder-88afc6082bfb4afc84d72341ccf01695',
                      component: {
                        name: 'Columns',
                        options: {
                          space: 30,
                          columns: [
                            {
                              blocks: [
                                {
                                  '@type': '@builder.io/sdk:Element',
                                  '@version': 2,
                                  bindings: {
                                    'component.options.image':
                                      'var _virtual_index=state.image;return _virtual_index',
                                  },
                                  id: 'builder-e61a203fbd034b58891e810206375885',
                                  component: {
                                    name: 'Image',
                                    options: {
                                      image:
                                        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d?width=998',
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                      lazy: true,
                                      fitContent: true,
                                      aspectRatio: 0.7041,
                                      sizes:
                                        '(max-width: 638px) 100vw, (max-width: 998px) 100vw, 42vw',
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
                                      width: '100%',
                                      minHeight: '20px',
                                      minWidth: '20px',
                                      overflow: 'hidden',
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
                                  id: 'builder-1b129f91c871409bb7c5e2f0967afa77',
                                  children: [
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      id: 'builder-5d336f09104c406d824482054c0bf58b',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Title of image</p>',
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
                                      id: 'builder-b81cb922c844445a83e03913503c9273',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Description of image: </p>',
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
                                      bindings: {
                                        'component.options.text':
                                          'var _virtual_index=state.description;return _virtual_index',
                                      },
                                      id: 'builder-d17f8e8a551b44c59c21e7cc0b5a500f',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: 'Enter some text...',
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
                                      id: 'builder-2463cce4794646c78fb1ad4e42909e25',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Author of image</p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          position: 'relative',
                                          flexShrink: '0',
                                          boxSizing: 'border-box',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          textAlign: 'center',
                                          marginTop: 'auto',
                                        },
                                      },
                                    },
                                  ],
                                  responsiveStyles: {
                                    large: {
                                      display: 'flex',
                                      flexDirection: 'column',
                                      position: 'relative',
                                      flexShrink: '0',
                                      boxSizing: 'border-box',
                                      marginTop: '20px',
                                      height: 'auto',
                                      flexGrow: '1',
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                          stackColumnsAt: 'tablet',
                        },
                      },
                    },
                    {
                      id: 'builder-pixel-fkkbe267km9',
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'img',
                      properties: {
                        src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
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
                  state: {
                    deviceSize: 'large',
                    location: { path: '', query: {} },
                  },
                },
                id: '29ab534d62c4406c8500e1cbfa609537',
                query: [],
                lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
                modelId: 'd661dd1d06ce43ddbe3c2fe35597e545',
                meta: {
                  hasLinks: false,
                  lastPreviewUrl:
                    'https://preview.builder.codes?model=symbol&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=symbol&builder.noCache=true&__builder_editing__=true&builder.overrides.symbol=29ab534d62c4406c8500e1cbfa609537&builder.overrides.29ab534d62c4406c8500e1cbfa609537=29ab534d62c4406c8500e1cbfa609537',
                  kind: 'component',
                  needsHydration: false,
                },
                lastUpdated: 1660657202161,
                rev: '84qvbzx8fvf',
              },
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
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        layerName: 'photo card symbol',
        id: 'builder-9f3d979aacac4320a8a86f86a387b4fc',
        component: {
          name: 'Symbol',
          options: {
            symbol: {
              data: {
                description: 'special test description',
                image:
                  'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F4bce19c3d8f040b3a95e91000a98283e',
              },
              model: 'symbol',
              entry: '29ab534d62c4406c8500e1cbfa609537',
              content: {
                createdDate: 1647468296291,
                screenshot:
                  'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F72d2ff7ac19549d798b830b2c9d9f3c4',
                createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
                variations: {},
                name: 'photo card symbol',
                published: 'published',
                firstPublished: 1647468296291,
                testRatio: 1,
                data: {
                  inputs: [
                    {
                      autoFocus: false,
                      simpleTextOnly: false,
                      broadcast: false,
                      copyOnAdd: true,
                      helperText: '',
                      '@type': '@builder.io/core:Field',
                      hidden: false,
                      subFields: [],
                      defaultValue: 'default description',
                      hideFromUI: false,
                      noPhotoPicker: false,
                      model: '',
                      hideFromFieldsEditor: false,
                      mandatory: false,
                      permissionsRequiredToEdit: '',
                      showIf: '',
                      onChange: '',
                      type: 'text',
                      required: false,
                      bubble: false,
                      advanced: false,
                      disallowRemove: false,
                      showTemplatePicker: true,
                      name: 'description',
                    },
                    {
                      autoFocus: false,
                      mandatory: false,
                      '@type': '@builder.io/core:Field',
                      permissionsRequiredToEdit: '',
                      showIf: '',
                      simpleTextOnly: false,
                      helperText: '',
                      noPhotoPicker: false,
                      showTemplatePicker: true,
                      hideFromUI: false,
                      advanced: false,
                      hideFromFieldsEditor: false,
                      model: '',
                      bubble: false,
                      name: 'image',
                      onChange: '',
                      disallowRemove: false,
                      allowedFileTypes: ['jpeg', 'png'],
                      required: false,
                      subFields: [],
                      type: 'file',
                      hidden: false,
                      copyOnAdd: true,
                      defaultValue:
                        'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2',
                      broadcast: false,
                    },
                  ],
                  blocks: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      id: 'builder-88afc6082bfb4afc84d72341ccf01695',
                      component: {
                        name: 'Columns',
                        options: {
                          space: 30,
                          columns: [
                            {
                              blocks: [
                                {
                                  '@type': '@builder.io/sdk:Element',
                                  '@version': 2,
                                  bindings: {
                                    'component.options.image':
                                      'var _virtual_index=state.image;return _virtual_index',
                                  },
                                  id: 'builder-e61a203fbd034b58891e810206375885',
                                  component: {
                                    name: 'Image',
                                    options: {
                                      image:
                                        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d?width=998',
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                      lazy: true,
                                      fitContent: true,
                                      aspectRatio: 0.7041,
                                      sizes:
                                        '(max-width: 638px) 100vw, (max-width: 998px) 100vw, 42vw',
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
                                      width: '100%',
                                      minHeight: '20px',
                                      minWidth: '20px',
                                      overflow: 'hidden',
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
                                  id: 'builder-1b129f91c871409bb7c5e2f0967afa77',
                                  children: [
                                    {
                                      '@type': '@builder.io/sdk:Element',
                                      '@version': 2,
                                      id: 'builder-5d336f09104c406d824482054c0bf58b',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Title of image</p>',
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
                                      id: 'builder-b81cb922c844445a83e03913503c9273',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Description of image: </p>',
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
                                      bindings: {
                                        'component.options.text':
                                          'var _virtual_index=state.description;return _virtual_index',
                                      },
                                      id: 'builder-d17f8e8a551b44c59c21e7cc0b5a500f',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: 'Enter some text...',
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
                                      id: 'builder-2463cce4794646c78fb1ad4e42909e25',
                                      component: {
                                        name: 'Text',
                                        options: {
                                          text: '<p>Author of image</p>',
                                        },
                                      },
                                      responsiveStyles: {
                                        large: {
                                          display: 'flex',
                                          flexDirection: 'column',
                                          position: 'relative',
                                          flexShrink: '0',
                                          boxSizing: 'border-box',
                                          lineHeight: 'normal',
                                          height: 'auto',
                                          textAlign: 'center',
                                          marginTop: 'auto',
                                        },
                                      },
                                    },
                                  ],
                                  responsiveStyles: {
                                    large: {
                                      display: 'flex',
                                      flexDirection: 'column',
                                      position: 'relative',
                                      flexShrink: '0',
                                      boxSizing: 'border-box',
                                      marginTop: '20px',
                                      height: 'auto',
                                      flexGrow: '1',
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                          stackColumnsAt: 'tablet',
                        },
                      },
                    },
                    {
                      id: 'builder-pixel-fkkbe267km9',
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'img',
                      properties: {
                        src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
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
                  state: {
                    deviceSize: 'large',
                    location: { path: '', query: {} },
                  },
                },
                id: '29ab534d62c4406c8500e1cbfa609537',
                query: [],
                lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
                modelId: 'd661dd1d06ce43ddbe3c2fe35597e545',
                meta: {
                  hasLinks: false,
                  lastPreviewUrl:
                    'https://preview.builder.codes?model=symbol&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=symbol&builder.noCache=true&__builder_editing__=true&builder.overrides.symbol=29ab534d62c4406c8500e1cbfa609537&builder.overrides.29ab534d62c4406c8500e1cbfa609537=29ab534d62c4406c8500e1cbfa609537',
                  kind: 'component',
                  needsHydration: false,
                },
                lastUpdated: 1660657202161,
                rev: '84qvbzx8fvf',
              },
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
          },
        },
      },
      {
        id: 'builder-pixel-ltvdupwjhm',
        '@type': '@builder.io/sdk:Element',
        tagName: 'img',
        properties: {
          src: 'https://cdn.builder.io/api/v1/pixel?apiKey=f1a790f8c3204b3b8c5c1795aeac4660',
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
    url: '/symbols',
    state: {
      deviceSize: 'large',
      location: { pathname: '/symbols', path: ['symbols'], query: {} },
    },
  },
  id: '2a23baae19a64031b8dd17e8fd8adc47',
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  meta: {
    hasLinks: false,
    kind: 'page',
    lastPreviewUrl:
      'https://preview.builder.codes?model=page&previewing=truehttp://localhost:3000/symbols&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=2a23baae19a64031b8dd17e8fd8adc47&builder.overrides.2a23baae19a64031b8dd17e8fd8adc47=2a23baae19a64031b8dd17e8fd8adc47&builder.overrides.page:/=2a23baae19a64031b8dd17e8fd8adc47',
    needsHydration: true,
  },
  modelId: '240a12053d674735ac2a384dcdc561b5',
  name: 'Symbols',
  published: 'published',
  query: [
    {
      '@type': '@builder.io/core:Query',
      operator: 'is',
      property: 'urlPath',
      value: '/symbols',
    },
  ],
  testRatio: 1,
  variations: {},
  lastUpdated: 1660661567598,
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2Fb4c208dab77d489386f78e8cf43f5feb',
  firstPublished: 1649431689632,
  rev: 'q440q0er5p',
};
