import { Builder } from '@builder.io/react'

export * from './editors/ShopifyCollectionPicker'
export * from './editors/ShopifyProductPicker'

Builder.register(
  'plugin' as any,
  {
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
          'Get your API key and password here: https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin'
      },
      {
        name: 'storeDomain',
        type: 'text',
        helperText: 'your-store.myshopify.com',
        required: true,
      }
    ]
  } as any
)
