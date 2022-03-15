# Builder.io Elasticpath PCM plugin

Easily connect your Elasticpath catalog to your Builder.io content!

## Installation

Go to [builder.io/account/organization](https://builder.io/account/organization) and type `@builder.io/plugin-elasticpath-pcm` in the input, then hit save, a prompt will ask you for your client ID, and Client Secret.

![Installation screenshot](https://cdn.builder.io/api/v1/image/assets%2F6d39f4449e2b4e6792a793bb8c1d9615%2F18a7201313914cccae7f0311a1a614ae)

You will now see three new field types (for [model](https://builder.io/c/docs/guides/getting-started-with-models) fields, [symbol](https://builder.io/c/docs/guides/symbols) inputs, [custom components](https://builder.io/c/docs/custom-react-components) fields), and [custom targeting attributes](https://www.builder.io/c/docs/guides/targeting-and-scheduling#custom-targeting) that can be used in three different contexts:

### Custom targeting

Custom targeting in Builder.io allow users to target content by a multitude of attributes, and in this plugin you'll be able to add specific content to elasticpath products, for this you'll need first to set the target attributes on the host site, either by setting the `userAttributes` if you're rendering client side:

```ts
builder.setUserAttributes({
  product: currentProduct.id,
});
```

Or by passing it as a query param to the [content API](https://www.builder.io/c/docs/query-api#:~:text=userAttributes) call, or in [graqhql query](https://www.builder.io/c/docs/graphql-api#:~:text=with%20targeting) for e.g in Gatsby or nextjs.

- `ElasticpathPCMProduct` when used as a custom targeting type, it'll target contexts where the field is set to the product ID, you'll need to set the product ID on the host environment, using one of the methods above. Alternatively, if you want to target by product handle (slug) use the `ElasticpathPCMProductHandle` type in your custom targeting attributes.

- `ElasticpathPCMProductPreview` is to be used as a custom field on component models, this will allow you to have templated editing url on your component model relevant to the Elasticpath product being previewed, for example you can set the url in your model to:
  `https://www.mystore.com/product/${previewResource.handle}`, add a custom field of type `Elasticpath PCM Product Preview` to the model, now when you create a new entry, the handle will be added dynamically to the preview url based on the preview product, it is recommended to add a default value to the `Elasticpath Product Preview` custom field, so users will land at a specific product page when developing a template component.

### Symbol Inputs

Using the field types `ElasticpathPCMProduct` and `ElasticpathPCMHeirarchy` as inputs, the UIs will prompt to search for products and collections. When consumed by APIs, SDKs, or in the Builder.io UIs, the value will be resolved automatically the in the form of a Builder.io `Request` object

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

Try creating a custom [model](https://builder.io/c/docs/guides/getting-started-with-models), [component](https://builder.io/c/docs/custom-react-components), or [symbol](https://builder.io/c/docs/guides/symbols) using any of the Elasticpath PCM field types, and edit away!

<img src="https://i.imgur.com/uVOLn7A.gif" alt="Seeing your plugin in the editor example gif">

