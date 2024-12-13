# Builder.io example plugin

See [here](src/plugin.tsx) for the React component that powers this plugin

## Status

Builder plugins are in beta. If you run into any issues or have questions please
contact help@builder.io for help

## Creating a new plugin from this example

### Install

```bash
git clone https://github.com/BuilderIO/builder.git
cp -r plugins/rich-text plugins/your-plugin-name
cd plugins/your-plugin-name
npm install
```

### Develop

```bash
npm start
```

### Add the plugin in Builder.io

From [Builder.io](https://builder.io) open the javascript console in your browser's dev tools and run.

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

### Seeing your plugin in action

In this plugin we replace the default "file" type editor with our Cloudinary file picker. So, to preview in Builder, just add a component with a file input (e.g. the built-in Image component), and open it's options to see your custom editor!

<img src="https://i.imgur.com/uVOLn7A.gif" alt="Seeing your plugin in the editor example gif">

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures best possible experience and performance.

### Publishing

We recommend sending us a pull request with your plugin so we can publish it on your behalf.

If required, you can also publish to your own NPM or a hosting service.

To load a plugin from NPM

```js
builder.plugins.replace(['@builder.io/plugin-example']);
```

#### Advanced

You can load a plugin from a specific version

```js
builder.plugins.replace(['@builder.io/plugin-example@1.0.0']);
```

Or from a URL

```js
builder.plugins.replace(['https://something.com/foo']);
```
