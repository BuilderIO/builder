export const HOVER_ANIMATION = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1712557080846,
  id: 'acb83ec528444ca3b6fd0c74fed2e347',
  '@version': 4,
  name: 'kadak',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'published',
  meta: {
    hasLinks: false,
    lastPreviewUrl:
      'http://localhost:3001/kadak?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=acb83ec528444ca3b6fd0c74fed2e347&builder.overrides.acb83ec528444ca3b6fd0c74fed2e347=acb83ec528444ca3b6fd0c74fed2e347&builder.overrides.page:/kadak=acb83ec528444ca3b6fd0c74fed2e347&builder.options.locale=Default',
    kind: 'page',
  },
  priority: -416,
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/kadak',
    },
  ],
  data: {
    themeId: false,
    subtitle: {
      '@type': '@builder.io/core:LocalizedValue',
    },
    title: 'kadak',
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-6479a1b0df5e43f9badb0b084ec15dcd',
        animations: [
          {
            trigger: 'hover',
            animation: 'custom',
            steps: [
              {
                id: 'ffdeb45ce6424fb3be450698d12f20cc',
                isStartState: false,
                styles: {},
                delay: 0,
              },
              {
                id: 'a78c02c116bc4e01bae5678b5dc14b90',
                isStartState: false,
                styles: {
                  backgroundColor: 'rgba(149, 79, 79, 1)',
                },
                delay: 0,
              },
            ],
            delay: 0,
            duration: 0.5,
            easing: 'cubic-bezier(.37,.01,0,.98)',
            repeat: false,
            thresholdPercent: 0,
          },
        ],
        component: {
          name: 'Core:Button',
          options: {
            text: 'Click me!',
            openLinkInNewTab: false,
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
  metrics: {
    clicks: 0,
    impressions: 0,
  },
  variations: {},
  lastUpdated: 1712557161128,
  firstPublished: 1712557161109,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};
