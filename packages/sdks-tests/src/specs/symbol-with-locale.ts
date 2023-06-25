export const CONTENT_WITH_LOCALE_SYMBOL = {
  'lastUpdatedBy': 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
  'folders': [],
  'data': {
    'inputs': [],
    'themeId': false,
    'title': 'Custom comp locale',
    'blocks': [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        'id': 'builder-658e890718d14ed4b3d7ad3048e485a7',
        'meta': { 'transformed.text': 'localized', 'localizedTextInputs': ['text'] },
        'component': {
          'name': 'Text',
          'options': {
            'text': {
              '@type': '@builder.io/core:LocalizedValue',
              'Default': '<p>Main page default text</p>',
              'fr-FR': '<p>main page fr-FR</p>',
              'en-US': '<p>Main page en-US DEFAULT</p>',
              'sv-FI': '<p>main page sv-FI text</p>',
              'en-AU': '<p>Main page en-AU text</p>'
            }
          }
        },
        'responsiveStyles': {
          'large': {
            'display': 'flex',
            'flexDirection': 'column',
            'position': 'relative',
            'flexShrink': '0',
            'boxSizing': 'border-box',
            'marginTop': '20px',
            'lineHeight': 'normal',
            'height': 'auto'
          }
        }
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        'layerName': 'test symbol',
        'id': 'builder-91c44d725c7a4efab00f8f30045fddc1',
        'component': {
          'name': 'Symbol',
          'options': {
            'symbol': {
              'data': {},
              'model': 'symbol',
              'entry': '4060347d0b0f4bd6958c77dcef01330c',
              'content': {
                'lastUpdatedBy': 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
                'folders': [],
                'data': {
                  'inputs': [],
                  'blocks': [
                    {
                      '@type': '@builder.io/sdk:Element',
                      '@version': 2,
                      'id': 'builder-8bcf820e97494c70a2b86c031aeebb35',
                      'children': [
                        {
                          '@type': '@builder.io/sdk:Element',
                          '@version': 2,
                          'id': 'builder-cad1345fdc67423396cc2d91a0973ef7',
                          'meta': { 'transformed.text': 'localized', 'localizedTextInputs': ['text'] },
                          'component': {
                            'name': 'Text',
                            'options': {
                              'text': {
                                '@type': '@builder.io/core:LocalizedValue',
                                'Default': 'Enter some text...',
                                'fr-FR': '<p>fr=Symbol</p>',
                                'en-US': '<p>en-US text</p>',
                                'sv-FI': '<p>sv-FI symbol text</p>',
                                'en-AU': '<p>en-AU symbol text</p>'
                              }
                            }
                          },
                          'responsiveStyles': {
                            'large': {
                              'display': 'flex',
                              'flexDirection': 'column',
                              'position': 'relative',
                              'flexShrink': '0',
                              'boxSizing': 'border-box',
                              'marginTop': '20px',
                              'lineHeight': 'normal',
                              'height': 'auto'
                            }
                          }
                        }
                      ],
                      'responsiveStyles': {
                        'large': {
                          'display': 'flex',
                          'flexDirection': 'column',
                          'position': 'relative',
                          'flexShrink': '0',
                          'boxSizing': 'border-box',
                          'marginTop': '20px',
                          'height': '200px',
                          'borderStyle': 'solid',
                          'borderWidth': '5px',
                          'borderColor': 'rgba(208, 2, 27, 1)',
                          'paddingLeft': '20px',
                          'paddingRight': '20px'
                        }
                      }
                    },
                    {
                      'id': 'builder-pixel-ae6v8fd7env',
                      '@type': '@builder.io/sdk:Element',
                      'tagName': 'img',
                      'properties': {
                        'src': 'https://cdn.builder.io/api/v1/pixel?apiKey=f0ded9b4e1a44260ab6286f916d2eed8',
                        'aria-hidden': 'true',
                        'alt': '',
                        'role': 'presentation',
                        'width': '0',
                        'height': '0'
                      },
                      'responsiveStyles': {
                        'large': {
                          'height': '0',
                          'width': '0',
                          'display': 'inline-block',
                          'opacity': '0',
                          'overflow': 'hidden',
                          'pointerEvents': 'none'
                        }
                      }
                    }
                  ], 'state': { 'deviceSize': 'large', 'location': { 'path': '', 'query': {} } }
                },
                'modelId': 'b1aae264eb8543acb067e0dc220f77fd',
                'query': [],
                'published': 'published',
                'screenshot': '',
                'firstPublished': 1671107577365,
                'testRatio': 1,
                'lastUpdated': 1687710175614,
                'createdDate': 1671107577365,
                'createdBy': 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
                'meta': {
                  'lastPreviewUrl': 'https://preview.builder.codes?model=symbol&previewing=true&apiKey=f0ded9b4e1a44260ab6286f916d2eed8&builder.space=f0ded9b4e1a44260ab6286f916d2eed8&builder.cachebust=true&builder.preview=symbol&builder.noCache=true&__builder_editing__=true&builder.overrides.symbol=4060347d0b0f4bd6958c77dcef01330c&builder.overrides.4060347d0b0f4bd6958c77dcef01330c=4060347d0b0f4bd6958c77dcef01330c&builder.options.locale=Default',
                  'kind': 'component',
                  'hasLinks': false
                },
                'variations': {},
                'name': 'test symbol',
                'id': '4060347d0b0f4bd6958c77dcef01330c',
                'rev': 'lp41yl52asf'
              }
            }, 'inheritState': true
          }
        },
        'responsiveStyles': {
          'large': {
            'display': 'flex',
            'flexDirection': 'column',
            'position': 'relative',
            'flexShrink': '0',
            'boxSizing': 'border-box'
          }
        }
      },
      {
        'id': 'builder-pixel-jnjxxlkpnyl',
        '@type': '@builder.io/sdk:Element',
        'tagName': 'img',
        'properties': {
          'src': 'https://cdn.builder.io/api/v1/pixel?apiKey=f0ded9b4e1a44260ab6286f916d2eed8',
          'aria-hidden': 'true',
          'alt': '',
          'role': 'presentation',
          'width': '0',
          'height': '0'
        },
        'responsiveStyles': {
          'large': {
            'height': '0',
            'width': '0',
            'display': 'inline-block',
            'opacity': '0',
            'overflow': 'hidden',
            'pointerEvents': 'none'
          }
        }
      }
    ],
    'url': '/custom-comp-locale',
    'state': { 'deviceSize': 'large', 'location': { 'path': '', 'query': {} } }
  },
  'modelId': '181f4975c91b494681e286a965f54c22',
  'query': [{
    '@type': '@builder.io/core:Query',
    'property': 'urlPath',
    'value': '/custom-comp-locale',
    'operator': 'is'
  }],
  'published': 'published',
  'firstPublished': 1686634551379,
  'testRatio': 1,
  'lastUpdated': 1687725171332,
  'createdDate': 1686586381469,
  'createdBy': 'b0272BAHcDTw8MCeDwLmdq7Uykp2',
  'meta': {
    'kind': 'page',
    'lastPreviewUrl': 'http://localhost:5173/custom-comp-locale?builder.space=f0ded9b4e1a44260ab6286f916d2eed8&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=8dca28d980f74c579fe770422058caac&builder.overrides.8dca28d980f74c579fe770422058caac=8dca28d980f74c579fe770422058caac&builder.overrides.page:/custom-comp-locale=8dca28d980f74c579fe770422058caac&builder.options.locale=Default',
    'hasLinks': false,
    'symbolsUsed': { '4060347d0b0f4bd6958c77dcef01330c': true }
  },
  'variations': {},
  'name': 'Custom comp locale',
  'id': '8dca28d980f74c579fe770422058caac',
  'rev': 'uxrp7e7mrun'
} as const;