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

export const campaignTemplates = {
  'campaign type a': {
    splashPage: examplePageTemplate,
    expiredPage: examplePageTemplate,
    mainPage: examplePageTemplate,
    additionalPages: [
      {
        ...examplePageTemplate,
        query: [{ property: 'urlPath', operator: 'is', value: '/about' }],
      },
    ],
  },
  'campaign type b': {
    splashPage: examplePageTemplate,
    expiredPage: examplePageTemplate,
    mainPage: examplePageTemplate,
    additionalPages: [
      {
        ...examplePageTemplate,
        query: [{ property: 'urlPath', operator: 'is', value: '/my-page' }],
      },
    ],
  },
}
