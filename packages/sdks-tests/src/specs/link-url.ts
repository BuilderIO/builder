export const CONTENT = {
  lastUpdatedBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  folders: [],
  data: {
    inputs: [],
    themeId: false,
    title: 'link-url',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        tagName: 'a',
        id: 'builder-d76507862649430f8b26abe5187492e2',
        properties: { href: '/static-url' },
        linkUrl: '/static-url',
        component: {
          name: 'Text',
          options: {
            text: '<span style="display: block;" class="builder-paragraph">static url</span>',
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
            pointerEvents: 'auto',
            cursor: 'pointer',
          },
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        bindings: { href: 'var _virtual_index="/dynamic-url";return _virtual_index' },
        tagName: 'a',
        id: 'builder-07d107e354c44096a5101b2f3a09a458',
        component: {
          name: 'Text',
          options: {
            text: '<span style="display: block;" class="builder-paragraph">Dynamic URL</span>',
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
            cursor: 'pointer',
            pointerEvents: 'auto',
          },
        },
      },
    ],
    url: '/link-url',
    state: { deviceSize: 'large', location: { path: '', query: {} } },
  },
  modelId: '240a12053d674735ac2a384dcdc561b5',
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      value: '/link-url',
      operator: 'is',
    },
  ],
  published: 'published',
  firstPublished: 1682442349809,
  testRatio: 1,
  lastUpdated: 1682538658564,
  createdDate: 1682441658988,
  createdBy: 'OcOewqA7uqVVlVfqY453F8vgcc33',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'https://svelte-vite-example.vercel.app/link-url?builder.space=f1a790f8c3204b3b8c5c1795aeac4660&builder.cachebust=true&builder.preview=page&builder.noCache=true&__builder_editing__=true&builder.overrides.page=9491791938664a6ca6e5126ad9288cd5&builder.overrides.9491791938664a6ca6e5126ad9288cd5=9491791938664a6ca6e5126ad9288cd5&builder.overrides.page:/link-url=9491791938664a6ca6e5126ad9288cd5',
    hasLinks: true,
  },
  variations: {},
  name: 'link-url',
  id: '9491791938664a6ca6e5126ad9288cd5',
  rev: 'b43pab22lz',
};
