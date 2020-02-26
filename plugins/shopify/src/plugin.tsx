import { Builder } from '@builder.io/sdk'

export * from './editors/ShopifyCollectionPicker'
export * from './editors/ShopifyProductPicker'

Builder.register('plugin' as any, {
  id: '@builder.io/plugin-shopify',
  name: 'Shopify',
  settings: [
    {
      name: 'apiKey',
      type: 'string',
      required: true,
      helperText:
        'Get your API key and password here: https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin'
    },
    {
      name: 'apiPassword',
      type: 'password',
      required: true,
      helperText:
        'https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin'
    }
  ]
} as any)
