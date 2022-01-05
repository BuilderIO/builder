import { BuilderElement } from '@builder.io/sdk'

export const examplePageTemplate = {
  name: 'New page',
  query: [{ property: 'urlPath', operator: 'is', value: '/' }],
  data: {
    blocks: [
      // Optionally specify blocks JSON to pre-populate content with templates
    ],
  },
}
