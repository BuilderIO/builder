# Builder.io BigCommerce plugin

The BigCommerce plugin helps you connect your BigCommerce catalog to your Builder.io content.

## Setting up the plugin for use in Builder

For detailed instructions, visit the official documentation, [Setting Up the BigCommerce Plugin](https://www.builder.io/c/docs/plugins-ecom-bigcommerce). 

## Developing the plugin 

If you're already familiar with the BigCommerce plugin and want to contribute to its development, follow the instructions in this section.

### Installing

```bash
git clone https://github.com/BuilderIO/builder.git
cd plugins/bigcommerce
npm install
```

### Running

```bash
npm start
```

### Adding the plugin in Builder.io

Go to [builder.io/account/organization](https://builder.io/account/organization) and add the localhost URL to the plugin from the plugin settings (`http://localhost:1268/plugin.system.js?pluginId=@builder.io/plugin-bigcommerce`)

**NOTE:** Loading `http://` content on an `https://` website will give you a warning. Be sure to click the shield in the top right of your browser and choose "load unsafe scripts" to allow the HTTP content on Builder's HTTPS site when developing locally

<img alt="Load unsafe script example" src="https://i.stack.imgur.com/uSaLL.png">

Now as you develop you can restart Builder to get the latest version of your plugin.

To uninstall your plugin, remove it in the [Plugins section of Builder](https://builder.io/app/integrations).

### Using the plugin

Try creating a custom [model](https://builder.io/c/docs/guides/getting-started-with-models), [component](https://builder.io/c/docs/custom-react-components), or [symbol](https://builder.io/c/docs/guides/symbols) using a Bigcommerce field, and edit away!

<img src="https://i.imgur.com/uVOLn7A.gif" alt="Seeing your plugin in the editor example gif">

### Frameworks

Builder.io uses [React](https://github.com/facebook/react) and [Material UI](https://github.com/mui-org/material-ui) for the UI, and [Emotion](https://github.com/emotion-js/emotion) for styling.

Using these frameworks in Builder plugins ensures a better experience and performance.
