# Builder.io KiboCommerce plugin

Easily connect your KiboCommerce catalog to your Builder.io content!

## Installation

Go to [builder.io/account/organization](https://builder.io/account/organization) and type `@builder.io/plugin-kibocommerce` in the input, then hit save, a prompt will ask you for your Api host, Auth host, Shared Secret and Client id.


![Installation screenshot](https://cdn.builder.io/api/v1/image/assets%2F32bc5af0a8224075a04bc9cf795f2919%2F68f946f789704944a9f9e0deef0f17ef)

![Credentials screenshot](https://cdn.builder.io/api/v1/image/assets%2F32bc5af0a8224075a04bc9cf795f2919%2F7596c62263ba4bd5b347e417ffe89805)



You will now see a few new field types (for [model](https://builder.io/c/docs/guides/getting-started-with-models) fields, [symbol](https://builder.io/c/docs/guides/symbols) inputs, [custom components](https://builder.io/c/docs/custom-react-components) fields), and [custom targeting attributes](https://www.builder.io/c/docs/guides/targeting-and-scheduling#custom-targeting) that can be used in three different contexts:

![Custom targeting attributes](https://cdn.builder.io/api/v1/image/assets%2F32bc5af0a8224075a04bc9cf795f2919%2Fa7e2ddad264f424f92de7774e6d7552e)

### Custom targeting

Custom targeting in Builder.io allow users to target content by a multitude of attributes, and in this plugin you'll be able to add specific content to KiboCommerce products, for this you'll need first to set the target attributes on the host site, either by setting the `userAttributes` if you're rendering client side:

```ts
builder.setUserAttributes({
  product: currentProduct.id,
});
```

Or by passing it as a query param to the [content API](https://www.builder.io/c/docs/query-api#:~:text=userAttributes) call, or in [graqhql query](https://www.builder.io/c/docs/graphql-api#:~:text=with%20targeting) for e.g in Gatsby or nextjs.

- `Kibo commerce product` when used as a custom targeting type, it'll target contexts where the field is set to the product code, you'll need to set the product code on the host environment, using one of the methods above.

- `Kibo commerce product preview` is to be used as a custom field on component models, this will allow you to have templated editing url on your component model relevant to the KiboCommeerce product being previewed, for example you can set the url in your model to:
  `https://www.mystore.com/product/${previewResource.handle}`, add a custom field of type `Kibo commerce product preview` to the model, now when you create a new entry, the handle will be added dynamically to the preview url based on the preview product, it is recommended to add a default value to the `Kibo commerce product preview` custom field, so users will land at a specific product page when developing a template component.

### Symbol Inputs

Using the field types `Kibo commerce product` and `Kibo commerce category` as inputs, the UIs will prompt to search for products and collections. When consumed by APIs, SDKs, or in the Builder.io UIs, the value will be resolved automatically the in the form of a Builder.io `Request` object

```js
{
  "yourFieldName": {
    "@type": "@builder.io/core:Request",
    "request": {
      "url": "..."
    },
    "data": {
      // Response data from the API request, e.g.:
      "product": {
        /* ... */
      }
    }
  }
}
```

### Seeing the plugin in action

Try creating a custom [model](https://builder.io/c/docs/guides/getting-started-with-models), [component](https://builder.io/c/docs/custom-react-components), or [symbol](https://builder.io/c/docs/guides/symbols) using any of the KiboCommerce field types, and edit away!


[![Custom Targeting Page](https://j.gifs.com/6Wx3rO.gif)](https://cdn.builder.io/o/assets%2F1fa6810c36c54e87bfe1a6cc0f0be906%2Fe84e09f8c7ea4fdea63c7b329c756c4e%2Fcompressed?apiKey=1fa6810c36c54e87bfe1a6cc0f0be906&token=e84e09f8c7ea4fdea63c7b329c756c4e&alt=media)

