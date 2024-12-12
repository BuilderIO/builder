export const HI_IN_TEXT = 'kuch text enter kijiye';
export const HI_IN_IMAGE =
  'https://cdn.builder.io/api/v1/file/assets%2Fad30f9a246614faaa6a03374f83554c9%2Fc3f40ad3bbe04a4f9be6090b2ccd914c';

export const LOCALIZATION = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1732859448768,
  id: '4fc825caf89e4cd9a21b5eb77db23677',
  '@version': 4,
  name: 'loc-test',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'published',
  meta: {
    hasLinks: false,
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:5173/loc-test?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers%2CeditContentPriority&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=4fc825caf89e4cd9a21b5eb77db23677&builder.overrides.4fc825caf89e4cd9a21b5eb77db23677=4fc825caf89e4cd9a21b5eb77db23677&builder.overrides.page:/loc-test=4fc825caf89e4cd9a21b5eb77db23677&builder.options.locale=Default',
  },
  priority: -790,
  stage: 'b3ee01559a244a078973f545ad475eba',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/loc-test',
    },
  ],
  data: {
    themeId: false,
    title: 'loc-test',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-3172de906dd644e18aed2a9cdc58a28c',
        meta: {
          'transformed.text': 'localized',
          localizedTextInputs: ['text'],
        },
        component: {
          name: 'Text',
          options: {
            text: {
              '@type': '@builder.io/core:LocalizedValue',
              Default: 'Enter some text...safsasf',
              'hi-IN': HI_IN_TEXT,
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
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-11db0c90558e493896f7a40dbae8cb95',
        meta: {
          'transformed.image': 'localized',
        },
        component: {
          name: 'Image',
          options: {
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            lazy: false,
            fitContent: true,
            aspectRatio: 0.989,
            lockAspectRatio: false,
            height: 91,
            width: 92,
            image: {
              '@type': '@builder.io/core:LocalizedValue',
              Default:
                'https://cdn.builder.io/api/v1/image/assets%2Fad30f9a246614faaa6a03374f83554c9%2Fac77a1342acb4a8f9ed907379339ba68',
              'hi-IN': HI_IN_IMAGE,
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
            width: '100%',
            minHeight: '20px',
            minWidth: '20px',
            overflow: 'hidden',
          },
        },
      },
    ],
  },
  metrics: {
    clicks: 0,
    impressions: 0,
  },
  variations: {},
  lastUpdated: 1732860716630,
  firstPublished: 1732859583516,
  testRatio: 1,
  screenshot:
    'https://cdn.builder.io/api/v1/image/assets%2Fad30f9a246614faaa6a03374f83554c9%2F02f1634f09ca43f6a0bf06c6e7490f07',
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};
