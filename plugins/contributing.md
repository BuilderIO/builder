# Contributing Plugins to builder.io
Builder.io plugins are JavaScript bundles that run side by side with Builder’s code, with access to a list of supplied objects, most important of which is the `appState` which gives the developer a way to interact with the app through a defined interface:

```tsx
import appState from "@builder.io/app-context"
```

The appState interface is documented in the helper library:

```bash
npm install --save-dev @builder.io/app-context
```
# Where to Start

The easiest way to start is to pick a starting point from the list of plugin types below based on the use case

## E-commerce custom editors plugins

With e-commerce plugins, users can search and link selected products and categories from their E-Commerce backend to structured data entries, sections, and pages built within the visual editor. This allows teams to easily enrich content for selected products and build landing pages or custom sections with elements linked directly to their E-Commerce backend, for e.g product cards, product galleries, add to cart buttons, list of product recommendations, and much more.

Resources:
1. [Utility library that makes connecting backends easier](https://github.com/BuilderIO/builder/tree/main/packages/plugin-tools)
2. [Forum post details how to use the utils library](https://forum.builder.io/t/how-to-build-a-custom-editor-plugin-for-my-ecommerce-backend-with-builder-io/519)
3. Good starting point and/or a reference implementation [https://github.com/BuilderIO/builder/tree/main/plugins/shopify](https://github.com/BuilderIO/builder/tree/main/plugins/shopify)

## Data Connector plugins

Data connector plugins are a way to enrich the data available in the editor sections and pages from external sources, once linked a data source users will be able to pick and choose entries or query that source and bind to the results of those queries directly in builder.
Resources:
1. [Utility library that makes connecting backends easier](https://github.com/BuilderIO/builder/tree/main/packages/plugin-tools)
2. [Reference implementation: Contentful data connector](https://www.builder.io/blog/builder-contentful)

## Action shortcut plugins

Action shortcuts in Builder are a great way to simplify some of the tasks that would otherwise require developer involvement, using action shortcuts a user can trigger tracking events, set up conditional values, or set specific values on state without having to write code.

For example in the screenshot below, the action `Track Event with Google Analytics` comes from a plugin that defines what this action does for the bounded element: for example when the button is clicked , send event `addToCart` to Google Analytics.
        pick action     |  configure action parameters
:-------------------------:|:-------------------------:
![picking an actino from the list](https://user-images.githubusercontent.com/5093430/162526704-0baec86b-06bd-4a97-8aa4-2233e7c6a5b7.png) | ![action parameters](https://user-images.githubusercontent.com/5093430/162527958-266881c3-ec82-4208-a804-d60b64e12c82.png)

Resources:
A good starting point here is : [https://github.com/BuilderIO/builder/tree/main/plugins/example-action-plugin](https://github.com/BuilderIO/builder/tree/main/plugins/example-action-plugin) 

## Generic Custom Editor plugin
Custom editor plugins allow you to register custom field types for your Builder model custom fields and inputs for your custom components, custom targeting or symbols.
To create a custom editor, you will need to build a react component that takes a value prop and an onChange prop. Then within your custom editor component you simply call the passed in onChange function when the value is updated (example). The value you set can be any type serializable to JSON (e.g. string, number, null, array, object, etc) and be as deeply nested as you need.
Resources:
1. [Builder plugins doc](https://www.builder.io/c/docs/extending/plugins)
2. [Rich Text editor example](https://github.com/BuilderIO/builder/tree/main/plugins/rich-text)

## None of the above
See this [doc for more info](https://www.builder.io/c/docs/extending/plugins)


# Local Development workflow
When you have any of the examples running locally, you'd want to tell Builder.io to load the plugin code from localhost, to do so:
sign in to [Builder](https://builder.io) open the javascript console in your browser's dev tools and run.

```js
// Adds the plugin
builder.plugins.replace(['http://localhost:1268/plugin.system.js']);
// Saves for all in your organization and reloads the browser
builder.savePlugins().then(() => location.reload());
```

**NOTE:** Loading http:// content on an https:// website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the http content on Builder's https site when devloping locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

Now as you develop you can restart Builder to see the latest version of your plugin.

To uninstall your plugin run

```js
// Removes all plugins
builder.plugins.replace([]);
// Saves for all in your organization and reloads the browser
builder.savePlugins().then(() => location.reload());
```
