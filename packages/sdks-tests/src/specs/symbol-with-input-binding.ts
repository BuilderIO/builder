export const CONTENT = {
  lastUpdatedBy: 'fS1jDahB5XQuu42YDYnFrvE2GNE3',
  folders: [],
  data: {
    httpRequests: {},
    inputs: [],
    localized: 'this is the default',
    themeId: false,
    description: '',
    title: 'environments-data',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-8702197cb63c4070abf8bc27a28c6340',
        component: {
          name: 'Symbol',
          options: {
            dataOnly: false,
            inheritState: false,
            renderToLiquid: false,
            symbol: {
              model: 'page',
              entry: '389f9b036a4b4a31a43c1f3fc818a8ed',
              data: { text: 'hello' },
              content: {
                lastUpdatedBy: 'fS1jDahB5XQuu42YDYnFrvE2GNE3',
                folders: [],
                data: {
                  inputs: [
                    {
                      broadcast: false,
                      hideFromUI: false,
                      onChange: '',
                      hidden: false,
                      advanced: false,
                      '@type': '@builder.io/core:Field',
                      hideFromFieldsEditor: false,
                      autoFocus: false,
                      type: 'text',
                      subFields: [],
                      helperText: '',
                      mandatory: false,
                      required: false,
                      permissionsRequiredToEdit: '',
                      showIf: '',
                      copyOnAdd: true,
                      bubble: false,
                      showTemplatePicker: true,
                      name: 'text',
                      disallowRemove: false,
                      simpleTextOnly: false,
                      model: '',
                      noPhotoPicker: false,
                      supportsAiGeneration: false,
                    },
                  ],
                  localized: 'this is the default',
                  themeId: false,
                  description: '',
                  title: 'whatever the name is',
                  blocks: [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      bindings: {
                        'component.options.text':
                          'var _virtual_index=state.text;return _virtual_index',
                      },
                      id: 'builder-188fb13925d14cba87d8557e0c24a20f',
                      animations: [
                        {
                          trigger: 'hover',
                          animation: 'custom',
                          steps: [
                            {
                              id: '83077374d15543149e5bf24293547c15',
                              isStartState: false,
                              styles: {},
                              delay: 0,
                            },
                            {
                              id: '3470222f40844d239c9afd7586f0641c',
                              isStartState: false,
                              styles: { color: 'rgba(255, 0, 0, 1)', fontSize: '24px' },
                              delay: 0,
                            },
                          ],
                          delay: 0,
                          duration: 0.1,
                          easing: 'cubic-bezier(.37,.01,0,.98)',
                          repeat: false,
                          thresholdPercent: 0,
                        },
                      ],
                      component: {
                        name: 'Text',
                        options: { text: '<p>This is some text</p>' },
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
                      actions: {
                        mouseEnter: 'state.hoverImg=!state.hoverImg',
                        mouseLeave: 'state.hoverImg=!state.hoverImg',
                      },
                      id: 'builder-ead0a1691a6449ecbea65d57cdfc0ecd',
                      meta: {
                        eventActions: {
                          mouseEnter: [
                            {
                              '@type': '@builder.io/core:Action',
                              action: '@builder.io:toggleState',
                              options: { name: 'hoverImg' },
                            },
                          ],
                          mouseLeave: [
                            {
                              '@type': '@builder.io/core:Action',
                              action: '@builder.io:toggleState',
                              options: { name: 'hoverImg' },
                            },
                          ],
                        },
                      },
                      children: [
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          bindings: {
                            show: 'var _virtual_index=state.hoverImg;return _virtual_index',
                          },
                          id: 'builder-b2c147d1c1f54c55ac476b834c71e01b',
                          component: {
                            name: 'Image',
                            options: {
                              image:
                                'https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=1984',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              lazy: false,
                              fitContent: true,
                              aspectRatio: 0.666,
                              lockAspectRatio: false,
                              sizes: '(max-width: 638px) 98vw, (max-width: 998px) 99vw, 142vw',
                              height: 1253,
                              width: 1880,
                              srcset:
                                'https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=1984 1984w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=622 622w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861?width=982 982w',
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
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          bindings: {
                            hide: 'var _virtual_index=state.hoverImg;return _virtual_index',
                          },
                          id: 'builder-3055bd5b075447109325bf67d43fba79',
                          component: {
                            name: 'Image',
                            options: {
                              image:
                                'https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=1984',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              lazy: false,
                              fitContent: true,
                              aspectRatio: 0.665,
                              lockAspectRatio: false,
                              sizes: '(max-width: 638px) 98vw, (max-width: 998px) 99vw, 142vw',
                              height: 1251,
                              width: 1880,
                              srcset:
                                'https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=1984 1984w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=622 622w, https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F4ee30440533d4018874701cbe50953eb?width=982 982w',
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
                      id: 'builder-8b93924faaf446b6b3dbdd62c0607bf0',
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
                    {
                      id: 'builder-pixel-yoahmkyiue',
                      '@type': '@builder.io/sdk:Element',
                      tagName: 'img',
                      properties: {
                        src: 'https://cdn.builder.io/api/v1/pixel?apiKey=e37b966ec695434bb21e97442a4a9f46',
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
                  url: '/whatever-the-name-is',
                  state: { deviceSize: 'large', location: { path: '', query: {} } },
                },
                modelId: '1e7cc98882d740a7a32f35238b4e64b3',
                endDate: null,
                query: [
                  {
                    '@type': '@builder.io/core:Query',
                    property: 'urlPath',
                    value: '/whatever-the-name-is',
                    operator: 'is',
                  },
                ],
                published: 'published',
                firstPublished: 1681337402694,
                testRatio: 1,
                lastUpdated: 1681511912794,
                createdDate: 1681337249104,
                createdBy: 'fS1jDahB5XQuu42YDYnFrvE2GNE3',
                meta: {
                  kind: 'page',
                  lastPreviewUrl:
                    'http://localhost:3000/whatever-the-name-is?builder.space=e37b966ec695434bb21e97442a4a9f46&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=389f9b036a4b4a31a43c1f3fc818a8ed&builder.overrides.389f9b036a4b4a31a43c1f3fc818a8ed=389f9b036a4b4a31a43c1f3fc818a8ed&builder.overrides.page:/whatever-the-name-is=389f9b036a4b4a31a43c1f3fc818a8ed&builder.options.locale=Default',
                  hasLinks: false,
                  shopifyDomain: 'timtester2.myshopify.com',
                },
                variations: {},
                name: 'whatever the name is',
                id: '389f9b036a4b4a31a43c1f3fc818a8ed',
                startDate: null,
                rev: 'c5jgx5wugtd',
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
            marginTop: '20px',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-6e939e890c674a3b8562dcad05bbe806',
        component: {
          name: 'Image',
          options: {
            image:
              'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=1984',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            lazy: false,
            fitContent: true,
            aspectRatio: 0.7041,
            lockAspectRatio: false,
            srcset:
              'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=1984 1984w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=622 622w, https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=982 982w',
            sizes: '(max-width: 638px) 98vw, (max-width: 998px) 99vw, 142vw',
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
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-d5f491f5f19d463b8613732c8689dcd6',
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
    url: '/environments-data',
    state: {
      deviceSize: 'large',
      location: { path: '', query: {} },
      article2: {
        data: {
          thumbnail:
            'https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F99ff50334758440bb4f0451e036957b3',
          articleSlug: 'ivf-to-motherhood',
          articleText:
            'lorem ipsum "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"',
          description: 'Real Mom Jen shares her journey',
          section: 'motherhood',
          heroImage:
            'https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F99ff50334758440bb4f0451e036957b3',
          title: 'IVF to Motherhood',
          blurb: 'Blurb Real Mom Jen shares her journey ',
        },
      },
      article: {
        data: {
          articleSlug: 'article-test-example',
          author: { '@type': '@builder.io/core:Reference', model: '', id: '' },
          isPublic: true,
          description: {
            'en-US': '',
            '@type': '@builder.io/core:LocalizedValue',
            'es-US': 'US Spanish default',
          },
          heroImage:
            'https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F8640a13fa6724ca99bf1c44f089b4861',
          section: 'testing',
          title: 'whatever article here',
          blurb: 'this is a test artcilesdf',
          tags: { '@type': '@builder.io/core:Reference', model: '', id: '' },
        },
      },
    },
  },
  modelId: '1e7cc98882d740a7a32f35238b4e64b3',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/environments-data',
      operator: 'is',
    },
  ],
  published: 'published',
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Fe37b966ec695434bb21e97442a4a9f46%2F3115d7c746cf4a40bed149c6aa52491c',
  firstPublished: 1681331871521,
  testRatio: 1,
  lastUpdated: 1681331918540,
  createdDate: 1681331866449,
  createdBy: 'fS1jDahB5XQuu42YDYnFrvE2GNE3',
  meta: {
    lastPreviewUrl:
      'http://localhost:3000/environments-data?builder.space=e37b966ec695434bb21e97442a4a9f46&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=a7129adcc34f4871926e7423066c892c&builder.overrides.a7129adcc34f4871926e7423066c892c=a7129adcc34f4871926e7423066c892c&builder.overrides.page:/environments-data=a7129adcc34f4871926e7423066c892c',
    kind: 'page',
    hasLinks: false,
    shopifyDomain: 'timtester2.myshopify.com',
    dataSources: [
      {
        resourceId: '2f9f2caa4e6241ef85cfcfb846868bf2',
        dataPluginName: 'Builder.io',
        propertyName: 'article',
        options: {
          single: false,
          orderType: 'descending',
          entry: '88c8bc95685b47ec86bf5407c3b8f63e',
          query: [],
          limit: 10,
          orderBy: 'priority',
          omit: 'data.blocks',
        },
        resourceName: 'Article',
      },
      {
        resourceId: '2f9f2caa4e6241ef85cfcfb846868bf2',
        dataPluginName: 'Builder.io',
        propertyName: 'article2',
        options: {
          single: false,
          entry: 'b69e1d4ba5f449c49a35abc5d42f8ff1',
          orderType: 'descending',
          query: [],
          limit: 10,
          orderBy: 'priority',
          omit: 'data.blocks',
        },
        resourceName: 'Article',
      },
    ],
  },
  variations: {},
  name: 'environments-data',
  id: 'a7129adcc34f4871926e7423066c892c',
  rev: 'qeh87bdy35',
};
