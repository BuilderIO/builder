# Builder.io Salesforce Commerce Api plugin

Easily connect your SalesForce B2C Commerce API to your Builder.io content!

## Setup Salesforce Commerce API Access
Read through this [get started guide](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/setting-up-api-access.html) to make sure you have your *Shopper Login and API Access Service (SLAS)* client setup ready.


## Installation

On any builder space, go to the [integrations tab](https://builder.io/app/integrations) and find the Salesforce B2C Commerce API integration
![screenshot](https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F395a09d16129469d862851d23a56522c) and click `enable`,
Following, you'll be prompted to enter the following data:
* Client ID
* Organization ID
* Proxy Address
* Short Code
* Site ID

And optionally:
* Einstein API Client ID.
* Einstein Site ID.


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
  }
})
```

Or by passing it as a query param to the [content API](https://www.builder.io/c/docs/query-api#:~:text=userAttributes) call, or in [graqhql query](https://www.builder.io/c/docs/graphql-api#:~:text=with%20targeting) for e.g in Gatsby or nextjs.

- `SfCommerceProduct` when used as a custom targeting type, it'll target contexts where the field is set to the product ID, you'll need to set the product ID on the host environment, using one of the methods above.

- `SfCommerceProductsList` when used as a custom targeting type, it'll target contexts where the field is set to the a list of product Ids, you'll need to set the list of product Ids on the host environment, using one of the methods above.

- `SfCommerceCategory` can be used as custom targeting attribute to target specific category by ID, you'll need to set the category ID on the host environment, using one of the methods above.

- `SfCommerceCategoriesList` when used as a custom targeting type, it'll target contexts where the field is set to the a list of category Ids, you'll need to set the list of category Ids on the host environment, using one of the methods above.


### Seeing the plugin in action

Try creating a custom [model](https://builder.io/c/docs/guides/getting-started-with-models), [component](https://builder.io/c/docs/custom-react-components), or [symbol](https://builder.io/c/docs/guides/symbols) using any of the SFCC field types, and edit away!


