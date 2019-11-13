# Cloudinary support for Builder.io

## Status

Builder plugins are in alpha. If you run into any issues or have questions please
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
appState.user.organization.value.loadPlugins.replace([
  'http://localhost:1268/builder-plugin-cloudinary.system.js'
]);
appState.user.organization.save().then(() => location.reload())
```

Now as you develop you can restart Builder to see the latest version of your plugin.

To uninstall your plugin run

```js
appState.user.organization.value.loadPlugins.replace([])
```

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures best possible experience and performance.


### Publishing

Publishing can be done through any hosting service. We recommend using NPM + Unpkg.
To publish this specific plugin send a pull request to this repo and then we will publish a new version.
You can also publish to your own NPM or a hosting service.

To load a plugin from NPM

```js
appState.user.organization.value.loadPlugins.replace([
  '@builder.io/plugin-cloudinary'
])
```

#### Advanced

You can load a plugin from a specific version

```js
appState.user.organization.value.loadPlugins.replace([
  '@builder.io/plugin-cloudinary@1.0.0'
])
```

Or from a URL

```js
appState.user.organization.value.loadPlugins.replace([
  'https://something.com/foo'
])
```
