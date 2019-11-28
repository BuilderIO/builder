# Cloudinary support for Builder.io

See [here](src/CloudinaryImageEditor.tsx) for the React component that powers this plugin

<img src="https://imgur.com/vpNzMud.gif" alt="Plugin example">

## Status

Builder plugins are in beta. If you run into any issues or have questions please
contact steve@builder.io for help

## Developing this plugin

### Install

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/cloudinary
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
builder.plugins.replace([
  'http://localhost:1268/builder-plugin-cloudinary.system.js'
])
// Saves for all in your organization and reloads the browser
builder.savePlugins().then(() => location.reload())
```

**NOTE:** Loading http:// content on an https:// website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the http content on Builder's https site when devloping locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

Now as you develop you can restart Builder to see the latest version of your plugin.

To uninstall your plugin run

```js
// Removes all plugins
builder.plugins.replace([])
// Saves for all in your organization and reloads the browser
builder.savePlugins.then(() => location.reload())
```

### Seeing your plugin in action

Set your component to use the CloudinaryImageEditor plugin type (see below)

```javascript
export const Image = withBuilder(CloudinaryImageComponent, {
  name: 'Image',
  inputs: [{ name: 'image', type: 'cloudinaryImageEditor' }]
})
```

then you can leverage this plugin to access your cloudinary image content using the official Cloudinary Media Library widget.

Just add a component with a `cloudinaryImageEditor` editor type and open it's options to see your cloudinary editor in action!

The Cloudinary Image editor contains 2 buttons:

- `SET CREDENTIALS`: This brings up a dialog to set your cloudinary credentials (`API key` and `Cloud name`). In order to work, you need to have SSO enabled and be previously logged in (current version does not support other authentication approach).

- `CHOOSE IMAGE`: Once your credentials are set (you only need to do this once) a new dialog will appear with the a Cloudinary media library browser. Select your asset and click `INSERT` button to insert the image to your page. Only one selection at a time is supported.

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures best possible experience and performance.

### Publishing

Publishing can be done through any hosting service. We recommend using NPM + Unpkg.
To publish this specific plugin send a pull request to this repo and then we will publish a new version.
You can also publish to your own NPM or a hosting service.

To load a plugin from NPM

```js
builder.plugins.replace(['@builder.io/plugin-cloudinary'])
```

#### Advanced

You can load a plugin from a specific version

```js
builder.plugins.replace(['@builder.io/plugin-cloudinary@1.0.0'])
```

Or from a URL

```js
builder.plugins.replace(['https://something.com/foo'])
```

## Contributors

Created by [@JacoboGallardo](https://github.com/jacobogallardo)!
