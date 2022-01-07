# Builder.io Elasticpath plugin

Easily connect your Elasticpath catalog to your Builder.io content!

## Installation

Go to [builder.io/account/organization](https://builder.io/account/organization) and press on `@builder.io/plugin-elasticpath` in the list of plugins, then hit save, a prompt will ask you for your client ID.

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

- `Elasticpath Product` when used as a custom targeting type, it'll target contexts where the field is set to the product ID, you'll need to set the product ID on the host environment, using one of the methods above. Alternatively, if you want to target by product handle (slug) use the `Elasticpath Product Handle` type in your custom targeting attributes.

### Component model fields

Component models can be used to represent product or collection page templates for all or a specific set of products/collections, using one of the following fields, you'll make previewing the templates for any product or collection straight-forward:

- `Elasticpath Product Preview` is to be used as a custom field on component models, this will allow you to have templated editing url on your component model relevant to the Elasticpath product being previewed, for example you can set the url in your model to:
  `https://www.mystore.com/product/${previewProduct.handle}`, add a custom field of type `Elasticpath Product Preview` to the model, now when you create a new entry, the handle will be added dynamically to the preview url based on the preview product, it is recommended to add a default value to the `Elasticpath Product Preview` custom field, so users will land at a specific product page when developing a template component.

### Symbol Inputs

Using the field types `Elasticpath Product` and `Elasticpath Collection` as inputs, the UIs will prompt to search for products and collections. When consumed by APIs, SDKs, or in the Builder.io UIs, the value will be resolved automatically the in the form of a Builder.io `Request` object

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

## How to develop?

### Install

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/elasticpath
npm install
```

### Run

```bash
npm start
```

### Add the plugin in Builder.io

Go to [builder.io/account/organization](https://builder.io/account/organization) and add the localhost URL to the plugin from the plugin settings (`http://localhost:1268/plugin.system.js?pluginId=@builder.io/ecom-elasticpath`)

**NOTE:** Loading `http://` content on an `https://` website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the HTTP content on Builder's HTTPS site when developing locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

Now as you develop you can restart Builder to see the latest version of your plugin.

To uninstall your plugin,remove it in the plugins UI

### Seeing the plugin in action

Try creating a custom [model](https://builder.io/c/docs/guides/getting-started-with-models), [component](https://builder.io/c/docs/custom-react-components), or [symbol](https://builder.io/c/docs/guides/symbols) using an Elasticpath field, and edit away!

<img src="https://i.imgur.com/uVOLn7A.gif" alt="Seeing your plugin in the editor example gif">

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures a better experience and performance.
