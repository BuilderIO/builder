# Builder.io Virto Commerce plugin

Easily connect your Virto Commerce catalog to your Builder.io content!

## Installation

Go to [builder.io/account/organization](https://builder.io/account/organization) and type `@builder.io/plugin-virtocommerce`, then hit save.

![Installation screenshot](https://cdn.builder.io/api/v1/image/assets%2F6d39f4449e2b4e6792a793bb8c1d9615%2F18a7201313914cccae7f0311a1a614ae)

The page will reload, asking you to enter in your Virto Commerce credentials: 

* **virtoCommerceUrl** (<span style="color:red">Required</span>) - Path to your Virto Commerce Storefront or Backend. The plugin uses GraphQL endpoint. Ex: https://vcst-demo-storefront.paas.govirto.com/
* **storeId** (<span style="color:red">Required</span>) - The code of the your store. You can find it in Virto Commerce Backend, Stores section. Ex: B2B-store.
* **login** (Optional) - Your user name. If empty, you will request the data as anonymous.
* **password** (Optional) - Your password. 
* **locale** (Optional) - Prefered locale of your store; otherwise default store locale will be used. Ex: en-US.

You will now see new field types (for [model](https://builder.io/c/docs/guides/getting-started-with-models) fields, [symbol](https://builder.io/c/docs/guides/symbols) inputs, [custom components](https://builder.io/c/docs/custom-react-components) fields), and [custom targeting attributes](https://www.builder.io/c/docs/guides/targeting-and-scheduling#custom-targeting) that can be used in three different contexts:

### Custom targeting

Custom targeting in Builder.io allow users to target content by a multitude of attributes, and in this plugin you'll be able to add specific content to Virto Commerce products, for this you'll need first to set the target attributes on the host site, either by setting the `userAttributes` if you're rendering client side:

```ts
builder.setUserAttributes({
  product: currentProduct.id,
});
```

Or by passing it as a query param to the [content API](https://www.builder.io/c/docs/query-api#:~:text=userAttributes) call, or in [graqhql query](https://www.builder.io/c/docs/graphql-api#:~:text=with%20targeting) for e.g in Gatsby or nextjs.

- `Virto Commerce Product` when used as a custom targeting type, it'll target contexts where the field is set to the product ID, you'll need to set the product ID on the host environment, using one of the methods above. Alternatively, if you want to target by product handle use the `Virto Commerce Product Handle` type in your custom targeting attributes.

- `Virto Commerce Category` can be used as custom targeting attribute to target specific category by ID, you'll need to set the category ID on the host environment, using one of the methods above. Alternatively, if you want to target by product handle use the `Virto Commerce Category Handle` type in your custom targeting attributes.

### Component model fields

Component models can be used to represent product or collection page templates for all or a specific set of products/collections, using one of the following fields, you'll make previewing the templates for any product or collection straight-forward:

Component models can be used to represent product or category page templates for all or a specific set of products/categorys, using one of the following fields, you'll make previewing the templates for any product or category straight-forward:

- `Virto Commerce Product Preview` is to be used as a custom field on component models, this will allow you to have templated editing url on your component model relevant to the Virto Commerce product being previewed, for example you can set the url in your model to:
  `https://www.mystore.com/product/${previewProduct.handle}`, add a custom field of type `Virto Commerce Product Preview` to the model, now when you create a new entry, the handle will be added dynamically to the preview url based on the preview product, it is recommended to add a default value to the `Virto Commerce Product Preview` custom field, so users will land at a specific product page when developing a template component.

- `Virto Commerce Category Preview` is to be used as a custom field on component models, this will allow you to have templated editing url on your component model relevant to the Virto Commerce category being previewed, for example you can set the url in your model to:
  `https://www.mystore.com/category/${previewCategory.handle}`, add a custom field of type `Virto Commerce Category Preview`, now when you create a new entry, the handle will be added dynamically to the preview url based on the preview product, it is recommended to add a default value to the `Virto Commerce Category Preview` custom field, so users will land at a specific category page when developing a template component.

### Symbol Inputs

Using the field types `Virto Commerce Product` and `Virto Commerce Collection` as inputs, the UIs will prompt to search for products and collections. When consumed by APIs, SDKs, or in the Builder.io UIs, the value will be resolved automatically the in the form of a Builder.io `Request` object

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

## CORS
CORS is off by default for security purposes in Virto Commerce. Adjust environment configuration by adding these response headers:

* Access-Control-Allow-Origin: *
* Access-Control-Allow-Headers: Content-Type
* Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
* Access-Control-Allow-Credentials: true

## How to develop?

### Install

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/virtocommerce
npm install
```

### Run

```bash
npm start
```

### Add the plugin in Builder.io

Go to [builder.io/account/organization](https://builder.io/account/organization) and add the localhost URL to the plugin from the plugin settings (`http://localhost:1268/plugin.system.js?pluginId=@builder.io/plugin-virtocommerce`)

**NOTE:** Loading `http://` content on an `https://` website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the HTTP content on Builder's HTTPS site when developing locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

Now as you develop you can restart Builder to see the latest version of your plugin.

To uninstall your plugin,remove it in the plugins UI

### Seeing the plugin in action

Try creating a custom [model](https://builder.io/c/docs/guides/getting-started-with-models), [component](https://builder.io/c/docs/custom-react-components), or [symbol](https://builder.io/c/docs/guides/symbols) using an Virto Commerce field, and edit away!

![Configure VirtoCommerce plugin](https://github.com/VirtoCommerce/builder-io/assets/330693/12caeca0-eb50-4a3a-a6a9-c9a3c9b11f8c)

![Seeing your plugin in the editor example gif](https://github.com/VirtoCommerce/builder-io/assets/330693/ef13e355-d197-4e72-bbc3-f3dd0ebb1413)

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures a better experience and performance.
