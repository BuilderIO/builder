export const CONTENT = {
  published: 'published',
  lastUpdated: 1675114980555,
  data: {
    inputs: [],
    title: 'css-nesting',
    themeId: false,
    cssCode:
      "/*\n* Custom CSS styles\n*\n* Global by default, but use `&` to scope to just this content, e.g.\n*\n*   & .foo {\n*     color: 'red'\n*   }\n*/\n\n& > div > div > div > .builder-text {\n  color: rgb(0, 0, 255)\n}\n& > div > div > div > div > .builder-text {\n  color: rgb(65, 117, 5)\n}\n",
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-ba3e098ad86a40849e6ba05c39006c7d',
        children: [
          {
            '@type': '@builder.io/sdk:Element',
            '@version': 2,
            id: 'builder-662f9e44c7ac4aeb847ccfb0ac9d6556',
            component: {
              name: 'Text',
              options: {
                text: '<span style="display: block;" class="builder-paragraph">text inside 1 box in blue</span>',
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
            id: 'builder-b73ae99a1bbc4a60b0d1bfe7f52aecff',
            children: [
              {
                '@type': '@builder.io/sdk:Element',
                '@version': 2,
                id: 'builder-6abd9355da9d4609a919669a887ba1a5',
                class: 'foo',
                component: {
                  name: 'Text',
                  options: {
                    text: '<span style="display: block;" class="builder-paragraph">text inside 2 boxes in green</span>',
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
            responsiveStyles: {
              large: {
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                flexShrink: '0',
                boxSizing: 'border-box',
                marginTop: '20px',
                height: 'auto',
                paddingBottom: '30px',
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
            paddingBottom: '30px',
          },
        },
      },
    ],
    url: '/css-nesting',
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  name: 'css-nesting',
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  modelId: '240a12053d674735ac2a384dcdc561b5',
  variations: {},
  folders: [],
  id: '7ad0d0df067144b6aa2d57ec9fc551fe',
  query: [
    {
      value: '/css-nesting',
      property: 'urlPath',
      '@type': '@builder.io/core:Query',
      operator: 'is',
    },
  ],
  testRatio: 1,
  createdDate: 1675112184880,
  firstPublished: 1675114980553,
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  meta: {
    hasLinks: false,
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:3000/?model=page&previewing=true&apiKey=f1a790f8c3204b3b8c5c1795aeac4660&builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=7ad0d0df067144b6aa2d57ec9fc551fe&builder.overrides.7ad0d0df067144b6aa2d57ec9fc551fe=7ad0d0df067144b6aa2d57ec9fc551fe&builder.overrides.page:/=7ad0d0df067144b6aa2d57ec9fc551fe',
    needsHydration: false,
  },
  rev: 'dgd7r0lslau',
};
