export const CUSTOM_CODE_NONCE = {
  ownerId: 'ad30f9a246614faaa6a03374f83554c9',
  lastUpdateBy: null,
  createdDate: 1724074628985,
  id: '91a14f0d1cb54098806ad13772226620',
  '@version': 4,
  name: 'custom-code-nonce',
  modelId: '17c6065109ef4062ba083f5741f4ee6a',
  published: 'draft',
  meta: {
    kind: 'page',
    lastPreviewUrl:
      'http://localhost:5173/custom-code-nonce?builder.space=ad30f9a246614faaa6a03374f83554c9&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=91a14f0d1cb54098806ad13772226620&builder.overrides.91a14f0d1cb54098806ad13772226620=91a14f0d1cb54098806ad13772226620&builder.overrides.page:/custom-code-nonce=91a14f0d1cb54098806ad13772226620&builder.options.locale=Default',
    hasLinks: false,
  },
  priority: -606,
  query: [
    {
      '@type': '@builder.io/core:Query',
      property: 'urlPath',
      operator: 'is',
      value: '/custom-code-nonce',
    },
  ],
  data: {
    title: 'custom-code-nonce',
    themeId: false,
    inputs: [],
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-fc580e306ce2493b990fa354439baaef',
        component: {
          name: 'Custom Code',
          options: {
            code: "<h1>Nonce is attached</h1>\n\n<script src=\"something\"></script>\n\n<script>\n  const h1El = document.querySelector('h1');\n\n  h1El.innerText += '!';\n</script>\n\n<style>\n  h1 {\n    color: red;\n  }\n</style>\n",
            scriptsClientOnly: false,
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
  metrics: {
    clicks: 0,
    impressions: 0,
  },
  variations: {},
  lastUpdated: 1724078090425,
  testRatio: 1,
  createdBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  lastUpdatedBy: 'RuGeCLr9ryVt1xRazFYc72uWwIK2',
  folders: [],
};
