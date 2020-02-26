# Builder.io Shopify plugin

Easily connect your Shopify data to your Builder.io content!

<img alt="Shopify data example" src="https://imgur.com/BhtUeqK.gif" >

## Installing

Go to [builder.io/account/organization](https://builder.io/account/organization) and add the plugin from the plugin settings (`@builder.io/plugin-shopify`)

You will now see two new field types (for [model](https://builder.io/c/docs/guides/getting-started-with-models) fields, [symbol](https://builder.io/c/docs/guides/symbols) inputs, and [component](https://builder.io/c/docs/custom-react-components) fields) - `Shopify Product` and `Shopify Collection`. When used, the UIs will prompt to search for products and collections. When consumed by APIs, SDKs, or in the Builder.io UIs, the value will the in the form of a Builder.io `Request` object

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

### Developing

#### Install

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/shopify
npm install
```

#### Run

```bash
npm start
```

### Add the plugin in Builder.io

From [Builder.io](https://builder.io) open the javascript console in your browser's dev tools and run.

Go to [builder.io/account/organization](https://builder.io/account/organization) and add the localhost URL to the plugin from the plugin settings (`http://localhost:1268/plugin.system.js?pluginId=@builder.io/shopify`)

**NOTE:** Loading http:// content on an https:// website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the http content on Builder's https site when devloping locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

Now as you develop you can restart Builder to see the latest version of your plugin.

To uninstall your plugin, just remove it in the plugins UI

### Seeing the plugin in action

Try creating a custom [model](https://builder.io/c/docs/guides/getting-started-with-models), [component](https://builder.io/c/docs/custom-react-components), or [symbol](https://builder.io/c/docs/guides/symbols) using a Shopify field, and edit away!

<img src="https://i.imgur.com/uVOLn7A.gif" alt="Seeing your plugin in the editor example gif">

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures best possible experience and performance.
