# Builder.io Salesforce Commerce Api plugin

Easily connect your SalesForce B2C Commerce API to your Builder.io content!

## Setup Salesforce Commerce API Access

Read through this [get started guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html) to make sure you have your _Shopper Login and API Access Service (SLAS)_ client setup ready.

## Installation

On any builder space, go to the [integrations tab](https://builder.io/app/integrations) and find the Salesforce B2C Commerce API integration
![screenshot](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F395a09d16129469d862851d23a56522c) and click `enable`,
Following, you'll be prompted to enter the following data:

- Client ID
- Organization ID
- Proxy Address
- Short Code
- Site ID

And optionally:

- Einstein API Client ID.
- Einstein Site ID.

**If you're using Salesforce's Composable Storefront kit it should be the same configuration you find at your config/default.js file**
![Config screenshot](https://cdn.builder.io/api/v1/image/assets%2F1fa6810c36c54e87bfe1a6cc0f0be906%2Fa1e74597f82e46d390fd0b328c19bf78)

Then enter it in your Builder's space integration configuration options:
![Credentials screenshot](https://cdn.builder.io/api/v1/image/assets%2Fd1ed12c3338144da8dd6b63b35d14c30%2F92cfc4b9885d41eaa4d5c23b00ebeace)

After putting the required info, hit the connect button. You will now see a few new field types (for [model](https://builder.io/c/docs/guides/getting-started-with-models) fields, [symbol](https://builder.io/c/docs/guides/symbols) inputs, [custom components](https://builder.io/c/docs/custom-react-components) fields), and [custom targeting attributes](https://www.builder.io/c/docs/guides/targeting-and-scheduling#custom-targeting) that can be used in three different contexts:

![Custom targeting attributes](https://cdn.builder.io/api/v1/image/assets%2Fd1ed12c3338144da8dd6b63b35d14c30%2F761dc7267e3b45198c460dfe6b0cec8e)

### Custom targeting

Custom targeting in Builder.io allow users to target content by a multitude of attributes, and in this plugin you'll be able to add specific content from SFCC products, for this you'll need first to set the target attributes on the host site, either by setting the `userAttributes` if you're rendering client side:

```ts
// example for fetching content specific for a product in a product details page
const productFooterContent = await builder.get('product-footer', {
  userAttributes: {
    product: product.productId,
  },
});
```

Or by passing it as a query param to the [content API](https://www.builder.io/c/docs/query-api#:~:text=userAttributes) call, or in [graqhql query](https://www.builder.io/c/docs/graphql-api#:~:text=with%20targeting) for e.g in Gatsby or nextjs.

### Custom Components and input types

Once you install the plugin, you will also be able to use the SFCC types as inputs for your components, such as:

- `SFCommerceProduct` when used as an input type, you will be able to search and select a specific Product to provide to your component and consume the product data however you want from inside the component.

- `SFCommerceCategory` when used as an input type, you will be able to search and select a specific category of products to provide to your component, as example you can fetch products from a specific category from inside your component.

- `SFCommerceProductsList` when used as an input type, it enables users to select multiple products to provide to your component. As an example you can select multiple products and display them on a grid.

- `SFCommerceCategoriesList` when used as an input type enables users to select multiple categories to provide to your component.

#### Example of a Custom Component with SFCommerceProduct input type:

Example of a custom component called 'ProductBox' that receives a SFCommerceProduct as input:

```JSX
import React from 'react'
import {Builder} from '@builder.io/react'
import ProductBox from './ProductBox' // this is your component with it's logic

Builder.registerComponent(ProductBox, {
    name: 'ProductBox',
    image: 'https://unpkg.com/css.gg@2.0.0/icons/svg/box.svg',
    inputs: [
        {
            name: 'productRef',
            friendlyName: 'Product',
            type: 'SFCommerceProduct',
            required: true
        }
    ]
})
```

To see more details about the usage of this component see [here](https://github.com/BuilderIO/sfcc-composable-storefront-starter/tree/main/app/components/blocks/product-box).

To understanding more about custom components also see [this article](https://www.builder.io/c/docs/custom-components-setup).

### Fetch Content and References

On our [docs](https://www.builder.io/c/docs/query-api), you can check more about how to fetch content from [builder.io](https://builder.io) and also see how the option `includeRefs=true` works, fecthing any specific content from a given reference, such as a chosen SFCommerceProduct in the example above to support server side rendering.

### Auto-resolving the Product/Categories data

In an effort to support SSR and making sure all the input data are available at the time of render, Builder’s support the resolving of the inputs for your custom components, for example if you have a product box with input of `SFCommerceProduct` you can get the json value of that product by passsing includeRefs: true when you fetch the content json:

```JSX
const page = await builder.get('page', {
  url: '...',
  options: {
    includeRefs: true
  }
})
```

Also passing the same option to the rendering component to auto-resolve while editing:

```JSX
<BuilderComponent model="page" options={{ includeRefs: true}} content={page} />
```

For more information on the available options check our [Content API documentation](https://www.builder.io/c/docs/query-api).

### Seeing the plugin in action

Try creating a custom [model](https://builder.io/c/docs/guides/getting-started-with-models), [component](https://builder.io/c/docs/custom-react-components), or [symbol](https://builder.io/c/docs/guides/symbols) using any of the SFCC field types, and edit away!
