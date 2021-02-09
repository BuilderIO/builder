import { BuilderElement } from '@builder.io/sdk'

const block = (options: Partial<BuilderElement>) =>
  ({
    ...options,
    // All builder blocks need this @type property set
    '@type': '@builder.io/sdk:Element',
  } as BuilderElement)

const examplePageTemplate = {
  name: 'New page',
  published: 'published' as 'published',
  query: [{ property: 'urlPath', operator: 'is', value: '/' }],
  data: {
    blocks: [
      block({
        component: {
          name: 'Text',
          options: {
            text: 'Hello!',
          },
        },
      }),
      block({
        responsiveStyles: {
          large: {
            marginTop: '20px',
          },
        },
        component: {
          name: 'Text',
          options: {
            text: 'Hello!',
          },
        },
      }),
    ],
  },
}

export const pageTemplates = {
  'page type a': {
    page: examplePageTemplate,
  },
  'page type b': {
    page: examplePageTemplate,
  },
}
